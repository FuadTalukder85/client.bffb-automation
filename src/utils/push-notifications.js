// client/src/utils/push-notifications.js
import api from "@/lib/api";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * URL safe base64 to uint8array
 */
function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    console.error("VAPID_PUBLIC_KEY is missing or undefined");
    return new Uint8Array();
  }
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    console.log("Service Worker registered with scope:", registration.scope);
    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
}

export async function subscribeUserToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if subscription already exists
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Refresh subscription on server just in case
      await saveSubscription(subscription);
      return subscription;
    }

    // Request permission first (required by some Chrome/Edge versions)
    const permission = await requestNotificationPermission();
    if (!permission) {
      console.warn("Notification permission was denied");
      return null;
    }

    // Subscribe to push notifications
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    };

    subscription = await registration.pushManager.subscribe(subscribeOptions);
    console.log("User is subscribed to push notifications");

    await saveSubscription(subscription);
    return subscription;
  } catch (error) {
    if (Notification.permission === "denied") {
      console.warn("Permission for notifications was denied");
    } else {
      console.error("Failed to subscribe the user:", error);
    }
    return null;
  }
}

async function saveSubscription(subscription) {
  try {
    await api.post("/subscriptions/save-subscription", {
      subscription: subscription.toJSON(),
    });
    console.log("Subscription saved to server");
  } catch (error) {
    console.error("Failed to save subscription to server:", error);
  }
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export async function getNotificationPermissionStatus() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}