import webpush from "web-push";
import { AdminPushSubscription } from "../models/AdminPushSubscription.js";

let configured = false;

export const getVapidPublicKey = () => process.env.VAPID_PUBLIC_KEY || "";

export const isPushConfigured = () => Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

const configureWebPush = () => {
  if (configured || !isPushConfigured()) return;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || `mailto:${process.env.ADMIN_EMAIL || "admin@example.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  configured = true;
};

const getItemCount = (order) => order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

const buildOrderPayload = (order) =>
  JSON.stringify({
    title: "New order received",
    body: `${order.customerName} - BDT ${Number(order.subtotal || 0).toLocaleString("en-BD")} (${getItemCount(order)} items)`,
    icon: "/admin/assets/logo.jpg",
    badge: "/admin/assets/logo.jpg",
    tag: `order-${order._id}`,
    url: "/admin/orders",
    data: {
      orderId: String(order._id),
      url: "/admin/orders"
    }
  });

export const sendNewOrderPushNotification = async (order) => {
  configureWebPush();
  if (!configured) return { sent: 0, skipped: true };

  const subscriptions = await AdminPushSubscription.find({}).lean();
  if (!subscriptions.length) return { sent: 0, skipped: false };

  const payload = buildOrderPayload(order);
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys
          },
          payload
        );
        sent += 1;
      } catch (error) {
        const statusCode = error.statusCode || error.status;
        if (statusCode === 404 || statusCode === 410) {
          await AdminPushSubscription.deleteOne({ _id: subscription._id });
          return;
        }

        await AdminPushSubscription.updateOne(
          { _id: subscription._id },
          {
            failedAt: new Date(),
            lastError: error.message || "Push notification failed"
          }
        );
      }
    })
  );

  return { sent, skipped: false };
};
