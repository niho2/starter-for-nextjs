import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, Users, MessageSquare, TestTube } from "lucide-react";

export default function MessagingSetupPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Push Notifications & Friend System
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your app now supports push notifications and a complete friend
              system
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Send real-time notifications to your friends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓ Browser Support</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓ Service Worker</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓ Appwrite Messaging</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click the "Send Notification to Friends" button in your
                  account page to test push notifications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Friend System
                </CardTitle>
                <CardDescription>
                  Connect with other users and manage friendships
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓ Search Users</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓ Friend Requests</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓ Friend Management</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Search for users by username and send friend requests. Manage
                  your friendships in the account page.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Features Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <MessageSquare className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-medium mb-1">Real-time Notifications</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send push notifications to all your friends with one click
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Users className="h-8 w-8 text-green-500 mb-2" />
                  <h3 className="font-medium mb-1">Friend Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Search, add, and manage your friend connections
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Bell className="h-8 w-8 text-purple-500 mb-2" />
                  <h3 className="font-medium mb-1">Notification Settings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Control whether you receive push notifications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Badge variant="outline" className="min-w-fit">
                    1
                  </Badge>
                  <p className="text-sm">
                    Go to your <strong>Account</strong> page to access the
                    friend system
                  </p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="min-w-fit">
                    2
                  </Badge>
                  <p className="text-sm">
                    Use the search feature to find other users by username
                  </p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="min-w-fit">
                    3
                  </Badge>
                  <p className="text-sm">
                    Send friend requests and accept/decline incoming requests
                  </p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="min-w-fit">
                    4
                  </Badge>
                  <p className="text-sm">
                    Click "Send Notification to Friends" to send push
                    notifications to all your friends
                  </p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="min-w-fit">
                    5
                  </Badge>
                  <p className="text-sm">
                    Toggle notification settings to control whether you receive
                    notifications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <Button asChild>
              <a href="/test-notifications">
                <TestTube className="mr-2 h-4 w-4" />
                Test Notifications
              </a>
            </Button>
            <div>
              <Button asChild variant="outline">
                <a href="/account">← Back to Account</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
