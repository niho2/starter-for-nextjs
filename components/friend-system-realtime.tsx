"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Bell,
  BellOff,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  searchUsers,
  sendFriendRequest,
  getFriends,
  getPendingFriendRequests,
  respondToFriendRequest,
  sendPushNotificationToFriends,
  updateNotificationSettings,
} from "@/lib/server/friend-actions";
import { useFriendRealtime } from "@/hooks/use-friend-realtime";
import { account, setClientSession } from "@/lib/client/appwrite";

interface User {
  $id: string;
  appwrite_user_id: string;
  username: string;
  email: string;
  push_notifications_enabled: boolean;
}

interface FriendRequest {
  $id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  created_at: string;
  sender: User;
}

export function FriendSystem() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Real-time callbacks
  const handleFriendshipUpdate = useCallback((friendship: any) => {
    console.log("Real-time friendship update:", friendship);
    setLastUpdateTime(new Date());

    // Show notification for real-time updates
    setMessage(
      `Real-time update: ${
        friendship.status === "accepted"
          ? "Friend request accepted!"
          : "Friend request status changed"
      }`
    );

    // Reload data to get fresh state
    loadData();

    // Clear message after 5 seconds
    setTimeout(() => setMessage(""), 5000);
  }, []);

  const handleUserUpdate = useCallback(
    (user: any) => {
      console.log("Real-time user update:", user);
      setLastUpdateTime(new Date());

      // Update notification settings if it's for the current user
      if (user.appwrite_user_id === currentUserId) {
        setNotificationsEnabled(user.push_notifications_enabled);
        setMessage("Real-time update: Your notification settings were updated");
        setTimeout(() => setMessage(""), 3000);
      }

      // Update friends list if any friend's data changed
      setFriends((prevFriends) =>
        prevFriends.map((friend) =>
          friend.appwrite_user_id === user.appwrite_user_id
            ? { ...friend, ...user }
            : friend
        )
      );
    },
    [currentUserId]
  );

  const handleRealtimeError = useCallback((error: Error) => {
    console.error("Real-time error:", error);
    setMessage(`Real-time connection error: ${error.message}`);
    setTimeout(() => setMessage(""), 5000);
  }, []);

  // Set up real-time subscriptions
  const { isSubscribed, resubscribe } = useFriendRealtime(currentUserId, {
    onFriendshipUpdate: handleFriendshipUpdate,
    onUserUpdate: handleUserUpdate,
    onError: handleRealtimeError,
  });

  // Get current user ID on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id);
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadData();
    }
  }, [currentUserId]);

  const loadData = async () => {
    try {
      const [friendsResult, requestsResult] = await Promise.all([
        getFriends(),
        getPendingFriendRequests(),
      ]);

      if (friendsResult.success && friendsResult.friends) {
        setFriends(friendsResult.friends as unknown as User[]);
      }

      if (requestsResult.success && requestsResult.requests) {
        setPendingRequests(
          requestsResult.requests as unknown as FriendRequest[]
        );
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const result = await searchUsers(searchTerm);
      if (result.success && result.users) {
        setSearchResults(result.users as unknown as User[]);
      } else {
        setMessage("No users found");
      }
    } catch (error) {
      setMessage("Error searching users");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    setLoading(true);
    try {
      const result = await sendFriendRequest(targetUserId);
      if (result.success) {
        setMessage(result.message || "Friend request sent");
        setSearchResults([]);
        setSearchTerm("");
      } else {
        setMessage(result.error || "Failed to send friend request");
      }
    } catch (error) {
      setMessage("Error sending friend request");
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (
    requestId: string,
    response: "accepted" | "declined"
  ) => {
    setLoading(true);
    try {
      const result = await respondToFriendRequest(requestId, response);
      if (result.success) {
        setMessage(result.message || `Friend request ${response}`);
        await loadData();
      } else {
        setMessage(result.error || "Failed to respond to friend request");
      }
    } catch (error) {
      setMessage("Error responding to friend request");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    setLoading(true);
    try {
      const result = await sendPushNotificationToFriends(
        "Hello from your friend!",
        "Your friend sent you a notification from the app!"
      );
      if (result.success) {
        setMessage(result.message || "Notification sent to friends");

        // Also show a local notification to simulate the experience
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Notification Sent!", {
            body: `Sent push notification to ${friends.length} friend(s)`,
            icon: "/favicon.ico",
          });
        }

        // Trigger custom event for in-app notification display
        window.dispatchEvent(
          new CustomEvent("friendNotification", {
            detail: {
              title: "Notification Sent!",
              body: `Your notification was sent to ${friends.length} friend(s)`,
              sender: "System",
            },
          })
        );
      } else {
        setMessage(result.error || "Failed to send notification");
      }
    } catch (error) {
      setMessage("Error sending notification");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    const newSetting = !notificationsEnabled;
    setLoading(true);
    try {
      const result = await updateNotificationSettings(newSetting);
      if (result.success) {
        setNotificationsEnabled(newSetting);
        setMessage(result.message || "Notification settings updated");
      } else {
        setMessage(result.error || "Failed to update settings");
      }
    } catch (error) {
      setMessage("Error updating notification settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Status Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isSubscribed ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Real-time connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Real-time disconnected
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Last update: {lastUpdateTime.toLocaleTimeString()}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={resubscribe}
                disabled={loading}
              >
                Reconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Display */}
      {message && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm p-3 rounded-md">
          {message}
          <button
            onClick={() => setMessage("")}
            className="ml-2 text-blue-900 dark:text-blue-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Push Notification Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
            {isSubscribed && (
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Enable push notifications</span>
            <Button
              variant={notificationsEnabled ? "default" : "outline"}
              size="sm"
              onClick={handleToggleNotifications}
              disabled={loading}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Enabled
                </>
              ) : (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Disabled
                </>
              )}
            </Button>
          </div>
          <Button
            onClick={handleSendNotification}
            disabled={loading || friends.length === 0}
            className="w-full"
          >
            <Bell className="mr-2 h-4 w-4" />
            Send Notification to Friends
          </Button>
          {friends.length === 0 && (
            <p className="text-sm text-gray-500">
              Add friends to send notifications
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.$id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleSendFriendRequest(user.appwrite_user_id)
                    }
                    disabled={loading}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Friend
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Friend Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Friend Requests
              <Badge variant="secondary">{pendingRequests.length}</Badge>
              {isSubscribed && (
                <Badge variant="outline" className="text-xs">
                  Live
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.$id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{request.sender.username}</p>
                  <p className="text-sm text-gray-500">
                    {request.sender.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleRespondToRequest(request.$id, "accepted")
                    }
                    disabled={loading}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleRespondToRequest(request.$id, "declined")
                    }
                    disabled={loading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends
            <Badge variant="secondary">{friends.length}</Badge>
            {isSubscribed && (
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No friends yet. Search for users above to add friends!
            </p>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend.$id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{friend.username}</p>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {friend.push_notifications_enabled ? (
                      <Badge variant="default">
                        <Bell className="mr-1 h-3 w-3" />
                        Notifications On
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <BellOff className="mr-1 h-3 w-3" />
                        Notifications Off
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
