import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

let activeUserState = {
  id: "user_demo_1",
  email: "demo@weather-ai.local",
  is_premium: false,
  plan: "free",
  status: "active",
  stripe_latest_session_id: "",
  updated_at: new Date().toISOString(),
};

let sseClients: Response[] = [];

function broadcastPaymentSuccess(payload: any) {
  sseClients.forEach((client) => {
    try {
      client.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
      // client disconnected
    }
  });
}

/**
 * POST /api/webhook
 * Listens for Stripe webhook events, specifically checkout.session.completed
 */
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log(`[Webhook] Event received: ${event?.type}`);

    if (event?.type === "checkout.session.completed") {
      const session = event.data?.object || {};
      const customerEmail =
        session.customer_details?.email || session.customer_email || "demo@weather-ai.local";
      const sessionId = session.id;

      console.log(`[Webhook] Payment confirmed for: ${customerEmail} (Session: ${sessionId})`);

      activeUserState.is_premium = true;
      activeUserState.plan = "pro";
      activeUserState.status = "active";
      activeUserState.stripe_latest_session_id = sessionId;
      activeUserState.email = customerEmail;
      activeUserState.updated_at = new Date().toISOString();

      if (process.env.DATABASE_URL) {
        try {
          const { db, usersTable, paymentsTable } = await import("@workspace/db");
          const { eq } = await import("drizzle-orm");

          const existing = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, customerEmail))
            .limit(1);

          if (existing.length > 0) {
            await db
              .update(usersTable)
              .set({
                isPremium: true,
                plan: "pro",
                status: "active",
                stripeLatestSessionId: sessionId,
                updatedAt: new Date(),
              })
              .where(eq(usersTable.email, customerEmail));
          } else {
            await db.insert(usersTable).values({
              email: customerEmail,
              name: session.customer_details?.name || "Subscriber",
              isPremium: true,
              plan: "pro",
              status: "active",
              stripeCustomerId: session.customer || null,
              stripeLatestSessionId: sessionId,
            });
          }

          await db.insert(paymentsTable).values({
            sessionId: sessionId,
            customerEmail: customerEmail,
            amountTotal: session.amount_total || 500,
            currency: session.currency || "usd",
            paymentStatus: session.payment_status || "paid",
            eventType: "checkout.session.completed",
          });
        } catch (dbErr) {
          console.warn("[Webhook] DB write skipped or errored:", dbErr);
        }
      }

      broadcastPaymentSuccess({
        type: "PAYMENT_SUCCESS",
        sessionId,
        email: customerEmail,
        is_premium: true,
        plan: "pro",
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        received: true,
        status: "success",
        message: "User upgraded to premium and UI notified",
        user: activeUserState,
      });
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("[Webhook Error]:", err);
    return res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/user-status
 */
router.get("/user-status", (_req: Request, res: Response) => {
  res.json({
    success: true,
    user: activeUserState,
  });
});

/**
 * GET /api/payment-stream
 */
router.get("/payment-stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders?.();

  sseClients.push(res);
  res.write(`data: ${JSON.stringify({ type: "CONNECTED" })}\n\n`);

  req.on("close", () => {
    sseClients = sseClients.filter((c) => c !== res);
  });
});

/**
 * POST /api/webhook/test
 */
router.post("/webhook/test", (_req: Request, res: Response) => {
  activeUserState.is_premium = true;
  activeUserState.plan = "pro";
  activeUserState.status = "active";
  activeUserState.stripe_latest_session_id = `cs_test_${Math.random().toString(36).substring(2, 9)}`;
  activeUserState.updated_at = new Date().toISOString();

  broadcastPaymentSuccess({
    type: "PAYMENT_SUCCESS",
    sessionId: activeUserState.stripe_latest_session_id,
    email: activeUserState.email,
    is_premium: true,
    plan: "pro",
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: "Mock payment confirmed. Premium active.",
    user: activeUserState,
  });
});

export default router;