import webpush from "web-push";
import { AdminPushSubscription } from "../models/AdminPushSubscription.js";
import { PushSettings } from "../models/PushSettings.js";

let cachedVapidConfig = null;
let vapidConfigPromise = null;
let configuredPublicKey = "";

const getDefaultSubject = () => process.env.VAPID_SUBJECT || `mailto:${process.env.ADMIN_EMAIL || "admin@example.com"}`;

const getEnvVapidConfig = () => {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return null;

  return {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    subject: getDefaultSubject()
  };
};

export const getVapidConfig = async () => {
  const envConfig = getEnvVapidConfig();
  if (envConfig) return envConfig;
  if (cachedVapidConfig) return cachedVapidConfig;
  if (vapidConfigPromise) return vapidConfigPromise;

  vapidConfigPromise = (async () => {
    const existing = await PushSettings.findOne({ key: "default" }).lean();
    if (existing?.publicKey && existing?.privateKey) {
      cachedVapidConfig = {
        publicKey: existing.publicKey,
        privateKey: existing.privateKey,
        subject: existing.subject || getDefaultSubject()
      };
      return cachedVapidConfig;
    }

    const generated = webpush.generateVAPIDKeys();
    const created = await PushSettings.findOneAndUpdate(
      { key: "default" },
      {
        $setOnInsert: {
          key: "default",
          publicKey: generated.publicKey,
          privateKey: generated.privateKey,
          subject: getDefaultSubject()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    cachedVapidConfig = {
      publicKey: created.publicKey,
      privateKey: created.privateKey,
      subject: created.subject
    };
    return cachedVapidConfig;
  })().finally(() => {
    vapidConfigPromise = null;
  });

  return vapidConfigPromise;
};

export const getVapidPublicKey = async () => {
  const config = await getVapidConfig();
  return config.publicKey;
};

export const isPushConfigured = async () => {
  const config = await getVapidConfig();
  return Boolean(config.publicKey && config.privateKey);
};

const configureWebPush = async () => {
  const config = await getVapidConfig();
  if (!config?.publicKey || !config?.privateKey) return false;
  if (configuredPublicKey === config.publicKey) return true;

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  configuredPublicKey = config.publicKey;
  return true;
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
  const configured = await configureWebPush();
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
