self.addEventListener("push", function (event) {
  const options = {
    body: event.data ? event.data.text() : "You have a new notification!",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "2",
    },
    actions: [
      {
        action: "explore",
        title: "Open App",
        icon: "/favicon.ico",
      },
      {
        action: "close",
        title: "Close notification",
        icon: "/favicon.ico",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("Friend Notification", options)
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "explore") {
    // Open the app
    event.waitUntil(clients.openWindow("/account"));
  } else if (event.action === "close") {
    // Just close the notification
    event.notification.close();
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/account"));
  }
});
