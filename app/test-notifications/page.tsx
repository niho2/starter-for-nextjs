"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Send } from "lucide-react";

export default function NotificationTestPage() {
  const [title, setTitle] = useState("Test Notification");
  const [body, setBody] = useState(
    "This is a test notification from your friend system!"
  );

  const sendTestNotification = () => {
    // Send browser notification
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, {
              body,
              icon: "/favicon.ico",
              badge: "/favicon.ico",
            });
          }
        });
      }
    }

    // Trigger custom event for in-app notification
    window.dispatchEvent(
      new CustomEvent("friendNotification", {
        detail: {
          title,
          body,
          sender: "Test User",
        },
      })
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Notification Test
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Test the push notification functionality
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Test Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Notification Body</Label>
                <Input
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter notification message"
                />
              </div>

              <Button onClick={sendTestNotification} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send Test Notification
              </Button>

              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>This will:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Show a browser notification (if permissions are granted)
                  </li>
                  <li>
                    Display an in-app notification in the top-right corner
                  </li>
                  <li>
                    Demonstrate how notifications work in your friend system
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button asChild variant="outline">
              <a href="/account">← Back to Account</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
