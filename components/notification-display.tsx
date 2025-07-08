"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  sender?: string;
}

export function NotificationDisplay() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Listen for custom notification events
    const handleCustomNotification = (event: CustomEvent) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: event.detail.title,
        body: event.detail.body,
        timestamp: new Date().toISOString(),
        sender: event.detail.sender,
      };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]); // Keep only 5 most recent

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== newNotification.id)
        );
      }, 5000);
    };

    window.addEventListener(
      "friendNotification",
      handleCustomNotification as EventListener
    );

    return () => {
      window.removeEventListener(
        "friendNotification",
        handleCustomNotification as EventListener
      );
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                    {notification.title}
                  </h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {notification.body}
                </p>
                {notification.sender && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    From: {notification.sender}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.id)}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
