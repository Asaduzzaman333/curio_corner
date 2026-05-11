import { api } from "./api.js";

const getServiceWorkerUrl = () => `${import.meta.env.BASE_URL}sw.js`;
const getServiceWorkerScope = () => import.meta.env.BASE_URL;
let enablePushPromise = null;

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export const getPushSupportStatus = () => {
  if (!("Notification" in window)) return "unsupported";
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";
  return window.Notification.permission;
};

export const registerAdminServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service worker is not supported in this browser.");
  }

  return navigator.serviceWorker.register(getServiceWorkerUrl(), { scope: getServiceWorkerScope() });
};

const runEnablePushNotifications = async () => {
  if (getPushSupportStatus() === "unsupported") {
    throw new Error("This browser does not support push notifications.");
  }

  const { data } = await api.get("/push/config");
  if (!data.enabled || !data.publicKey) {
    throw new Error("Push notifications are not configured on the server.");
  }

  const permission = await window.Notification.requestPermission();
  if (permission !== "granted") return { permission, subscribed: false };

  const registration = await registerAdminServiceWorker();
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey)
    });
  }

  await api.post("/push/subscriptions", { subscription: subscription.toJSON() });
  return { permission, subscribed: true };
};

export const enablePushNotifications = async () => {
  if (!enablePushPromise) {
    enablePushPromise = runEnablePushNotifications().finally(() => {
      enablePushPromise = null;
    });
  }

  return enablePushPromise;
};

export const disablePushNotifications = async () => {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration(getServiceWorkerScope());
  const subscription = await registration?.pushManager.getSubscription();

  if (subscription) {
    await api.delete("/push/subscriptions", { data: { endpoint: subscription.endpoint } });
    await subscription.unsubscribe();
  }
};
