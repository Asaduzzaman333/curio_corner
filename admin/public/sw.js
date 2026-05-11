self.addEventListener("push", (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title || "Curio Corner Admin";
  const options = {
    body: payload.body || "You have a new notification.",
    icon: payload.icon || "/admin/assets/logo.jpg",
    badge: payload.badge || "/admin/assets/logo.jpg",
    tag: payload.tag || "curio-admin-notification",
    data: {
      url: payload.url || payload.data?.url || "/admin",
      ...(payload.data || {})
    },
    renotify: Boolean(payload.tag)
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || "/admin", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => client.url.startsWith(self.location.origin));
      if (existingClient) {
        existingClient.focus();
        return existingClient.navigate(targetUrl);
      }

      return self.clients.openWindow(targetUrl);
    })
  );
});
