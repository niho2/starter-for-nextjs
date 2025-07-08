"use client";

import { useEffect, useCallback, useRef } from "react";
import { realtimeService, type RealtimeEvent } from "@/lib/client/realtime";

export interface FriendRealtimeCallbacks {
  onFriendshipUpdate?: (friendship: any) => void;
  onUserUpdate?: (user: any) => void;
  onNotificationReceived?: (notification: any) => void;
  onDrinkShared?: (drink: any) => void;
  onError?: (error: Error) => void;
}

export function useFriendRealtime(
  userId: string | null,
  callbacks: FriendRealtimeCallbacks = {}
) {
  const subscriptionsRef = useRef<string[]>([]);
  const {
    onFriendshipUpdate,
    onUserUpdate,
    onNotificationReceived,
    onDrinkShared,
    onError,
  } = callbacks;

  const handleRealtimeEvent = useCallback(
    (response: RealtimeEvent) => {
      try {
        console.log("Friend realtime event:", response);

        // Check if this is a friendship event
        const isFriendshipEvent = response.events.some((event) =>
          event.includes(
            "databases.main-database.collections.friendships.documents"
          )
        );

        // Check if this is a user event
        const isUserEvent = response.events.some((event) =>
          event.includes("databases.main-database.collections.users.documents")
        );

        // Check if this is a notification event
        const isNotificationEvent = response.events.some((event) =>
          event.includes(
            "databases.main-database.collections.notifications.documents"
          )
        );

        // Check if this is a drink event
        const isDrinkEvent = response.events.some((event) =>
          event.includes("databases.main-database.collections.drinks.documents")
        );

        if (isFriendshipEvent && onFriendshipUpdate) {
          onFriendshipUpdate(response.payload);
        }

        if (isUserEvent && onUserUpdate) {
          onUserUpdate(response.payload);
        }

        if (isNotificationEvent && onNotificationReceived) {
          onNotificationReceived(response.payload);
        }

        if (isDrinkEvent && onDrinkShared) {
          onDrinkShared(response.payload);
        }
      } catch (error) {
        console.error("Error handling realtime event:", error);

        // Check if it's a session/authentication error
        if (error instanceof Error && error.message.includes("missing scope")) {
          onError?.(
            new Error(
              "Authentication required for real-time features. Please refresh the page."
            )
          );
        } else {
          onError?.(error as Error);
        }
      }
    },
    [onFriendshipUpdate, onUserUpdate, onNotificationReceived, onError]
  );

  const subscribe = useCallback(() => {
    if (!userId) return;

    try {
      // Subscribe to friendship changes
      const friendshipSub = realtimeService.subscribeToCollection(
        "main-database",
        "friendships",
        handleRealtimeEvent
      );

      // Subscribe to user changes (for notification settings, status, etc.)
      const userSub = realtimeService.subscribeToCollection(
        "main-database",
        "users",
        handleRealtimeEvent
      );

      // Subscribe to notifications for this user
      const notificationSub = realtimeService.subscribeToNotifications(
        userId,
        handleRealtimeEvent
      );

      // Subscribe to drink sharing updates
      const drinkSub = realtimeService.subscribeToCollection(
        "main-database",
        "drinks",
        handleRealtimeEvent
      );

      subscriptionsRef.current = [
        friendshipSub,
        userSub,
        notificationSub,
        drinkSub,
      ];
      console.log("Friend realtime subscriptions established");
    } catch (error) {
      console.error("Error subscribing to realtime events:", error);

      // Check if it's an authentication error
      if (
        error instanceof Error &&
        (error.message.includes("missing scope") ||
          error.message.includes("guests"))
      ) {
        onError?.(
          new Error(
            "Authentication required for real-time features. Please refresh the page to reconnect."
          )
        );
      } else {
        onError?.(error as Error);
      }
    }
  }, [userId, handleRealtimeEvent, onError]);

  const unsubscribe = useCallback(() => {
    subscriptionsRef.current.forEach((subKey) => {
      realtimeService.unsubscribe(subKey);
    });
    subscriptionsRef.current = [];
    console.log("Friend realtime subscriptions cleaned up");
  }, []);

  // Set up subscriptions when userId changes
  useEffect(() => {
    if (userId) {
      subscribe();
    } else {
      unsubscribe();
    }

    return unsubscribe;
  }, [userId, subscribe, unsubscribe]);

  // Cleanup on unmount
  useEffect(() => {
    return unsubscribe;
  }, [unsubscribe]);

  return {
    isSubscribed: subscriptionsRef.current.length > 0,
    resubscribe: subscribe,
    unsubscribe,
    subscriptionCount: subscriptionsRef.current.length,
  };
}
