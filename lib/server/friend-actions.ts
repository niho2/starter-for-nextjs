"use server";

import {
  createAdminClient,
  createSessionClient,
  getLoggedInUser,
} from "./appwrite";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DATABASE_ID = "main-database";
const USERS_COLLECTION_ID = "users";
const FRIENDSHIPS_COLLECTION_ID = "friendships";
const NOTIFICATIONS_COLLECTION_ID = "notifications";
const DRINKS_COLLECTION_ID = "drinks";

export async function initializeUser() {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createAdminClient();

    // Check if user profile already exists
    try {
      const existingUser = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal("appwrite_user_id", user.$id)]
      );

      if (existingUser.total === 0) {
        // Create user profile
        await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          ID.unique(),
          {
            appwrite_user_id: user.$id,
            username: user.name || user.email.split("@")[0],
            email: user.email,
            push_notifications_enabled: true,
          }
        );
      }
    } catch (error) {
      console.error("Error initializing user:", error);
    }
  } catch (error) {
    console.error("Error in initializeUser:", error);
  }
}

export async function searchUsers(searchTerm: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createSessionClient();

    try {
      // Try fulltext search first
      const results = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [
          Query.search("username", searchTerm),
          Query.notEqual("appwrite_user_id", user.$id),
          Query.limit(10),
        ]
      );

      return { success: true, users: results.documents };
    } catch (searchError) {
      // Fallback to partial match if fulltext search fails
      console.log("Fulltext search failed, trying fallback:", searchError);

      const results = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [
          Query.startsWith("username", searchTerm),
          Query.notEqual("appwrite_user_id", user.$id),
          Query.limit(10),
        ]
      );

      return { success: true, users: results.documents };
    }
  } catch (error) {
    console.error("Error searching users:", error);
    return { success: false, error: "Failed to search users" };
  }
}

export async function sendFriendRequest(targetUserId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createAdminClient();

    // Get current user's profile
    const currentUserProfile = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("appwrite_user_id", user.$id)]
    );

    if (currentUserProfile.total === 0) {
      throw new Error("User profile not found");
    }

    // Check if friendship already exists (check both directions)
    const existingFriendship1 = await databases.listDocuments(
      DATABASE_ID,
      FRIENDSHIPS_COLLECTION_ID,
      [Query.equal("user1_id", user.$id), Query.equal("user2_id", targetUserId)]
    );

    const existingFriendship2 = await databases.listDocuments(
      DATABASE_ID,
      FRIENDSHIPS_COLLECTION_ID,
      [Query.equal("user1_id", targetUserId), Query.equal("user2_id", user.$id)]
    );

    if (existingFriendship1.total > 0 || existingFriendship2.total > 0) {
      return { success: false, error: "Friendship already exists" };
    }

    // Create friend request
    await databases.createDocument(
      DATABASE_ID,
      FRIENDSHIPS_COLLECTION_ID,
      ID.unique(),
      {
        user1_id: user.$id,
        user2_id: targetUserId,
        status: "pending",
        created_at: new Date().toISOString(),
      }
    );

    revalidatePath("/account");
    return { success: true, message: "Friend request sent successfully" };
  } catch (error) {
    console.error("Error sending friend request:", error);
    return { success: false, error: "Failed to send friend request" };
  }
}

export async function respondToFriendRequest(
  friendshipId: string,
  response: "accepted" | "declined"
) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createAdminClient();

    // Update friendship status
    await databases.updateDocument(
      DATABASE_ID,
      FRIENDSHIPS_COLLECTION_ID,
      friendshipId,
      {
        status: response,
      }
    );

    revalidatePath("/account");
    return { success: true, message: `Friend request ${response}` };
  } catch (error) {
    console.error("Error responding to friend request:", error);
    return { success: false, error: "Failed to respond to friend request" };
  }
}

export async function getFriends() {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createSessionClient();

    // Get accepted friendships (check both directions)
    const friendships1 = await databases.listDocuments(
      DATABASE_ID,
      FRIENDSHIPS_COLLECTION_ID,
      [Query.equal("user1_id", user.$id), Query.equal("status", "accepted")]
    );

    const friendships2 = await databases.listDocuments(
      DATABASE_ID,
      FRIENDSHIPS_COLLECTION_ID,
      [Query.equal("user2_id", user.$id), Query.equal("status", "accepted")]
    );

    // Combine results and get friend user IDs
    const allFriendships = [
      ...friendships1.documents,
      ...friendships2.documents,
    ];
    const friendUserIds = allFriendships.map((friendship) =>
      friendship.user1_id === user.$id
        ? friendship.user2_id
        : friendship.user1_id
    );

    if (friendUserIds.length === 0) {
      return { success: true, friends: [] };
    }

    // Get friend profiles
    const friends = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("appwrite_user_id", friendUserIds)]
    );

    return { success: true, friends: friends.documents };
  } catch (error) {
    console.error("Error getting friends:", error);
    return { success: false, error: "Failed to get friends" };
  }
}

export async function getPendingFriendRequests() {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createSessionClient();

    // Get pending friend requests where user is the recipient
    const pendingRequests = await databases.listDocuments(
      DATABASE_ID,
      FRIENDSHIPS_COLLECTION_ID,
      [Query.equal("user2_id", user.$id), Query.equal("status", "pending")]
    );

    // Get sender profiles
    if (pendingRequests.total === 0) {
      return { success: true, requests: [] };
    }

    const senderIds = pendingRequests.documents.map((req) => req.user1_id);
    const senders = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("appwrite_user_id", senderIds)]
    );

    const requestsWithSenders = pendingRequests.documents.map((request) => {
      const sender = senders.documents.find(
        (s) => s.appwrite_user_id === request.user1_id
      );
      return { ...request, sender };
    });

    return { success: true, requests: requestsWithSenders };
  } catch (error) {
    console.error("Error getting pending friend requests:", error);
    return { success: false, error: "Failed to get pending friend requests" };
  }
}

export async function sendNotificationToFriends(title: string, body: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createAdminClient();

    // Get friends
    const friendsResult = await getFriends();
    if (
      !friendsResult.success ||
      !friendsResult.friends ||
      friendsResult.friends.length === 0
    ) {
      return { success: false, error: "No friends to notify" };
    }

    // Get user profile for sender info
    const userProfile = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("appwrite_user_id", user.$id)]
    );

    const senderName =
      userProfile.documents[0]?.name || user.name || user.email;

    // Create notification documents for each friend with notifications enabled
    const friendsWithNotifications = friendsResult.friends.filter(
      (friend) => friend.push_notifications_enabled
    );

    if (friendsWithNotifications.length === 0) {
      return { success: false, error: "No friends have notifications enabled" };
    }

    // Create notification documents - these will trigger real-time updates
    const notificationPromises = friendsWithNotifications.map(
      async (friend) => {
        try {
          return await databases.createDocument(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION_ID,
            ID.unique(),
            {
              recipient_id: friend.appwrite_user_id,
              sender_id: user.$id,
              sender_name: senderName,
              title: title,
              body: body,
              type: "friend_notification",
              read: false,
              created_at: new Date().toISOString(),
            }
          );
        } catch (error) {
          console.error(
            `Failed to create notification for ${friend.appwrite_user_id}:`,
            error
          );
          return null;
        }
      }
    );

    const results = await Promise.all(notificationPromises);
    const successCount = results.filter(Boolean).length;

    // For immediate feedback, also try to send browser notifications if possible
    // This is a fallback mechanism for testing
    try {
      const { messaging } = await createAdminClient();

      // Attempt to send push notifications as well (if configured)
      await messaging.createPush(
        ID.unique(),
        title,
        body,
        [], // topics
        friendsWithNotifications.map((f) => f.appwrite_user_id), // users
        [], // targets
        {
          sender: senderName,
          timestamp: new Date().toISOString(),
          type: "friend_notification",
        }, // data
        "view" // action
      );
    } catch (pushError) {
      console.log(
        "Push notification service not configured, using real-time only:",
        pushError instanceof Error ? pushError.message : String(pushError)
      );
    }

    return {
      success: true,
      message: `Notification sent to ${successCount} friends`,
      notified_count: successCount,
    };
  } catch (error) {
    console.error("Error sending notification to friends:", error);
    return { success: false, error: "Failed to send notification" };
  }
}

// Keep the old function name for backward compatibility
export const sendPushNotificationToFriends = sendNotificationToFriends;

export async function updateNotificationSettings(enabled: boolean) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createAdminClient();

    // Get user profile
    const userProfile = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("appwrite_user_id", user.$id)]
    );

    if (userProfile.total === 0) {
      throw new Error("User profile not found");
    }

    // Update notification settings
    await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userProfile.documents[0].$id,
      {
        push_notifications_enabled: enabled,
      }
    );

    revalidatePath("/account");
    return { success: true, message: "Notification settings updated" };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return { success: false, error: "Failed to update notification settings" };
  }
}

export async function getNotifications() {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createSessionClient();

    // Get notifications for the current user
    const notifications = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal("recipient_id", user.$id),
        Query.orderDesc("created_at"),
        Query.limit(50),
      ]
    );

    return { success: true, notifications: notifications.documents };
  } catch (error) {
    console.error("Error getting notifications:", error);
    return { success: false, error: "Failed to get notifications" };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createAdminClient();

    // Update notification as read
    await databases.updateDocument(
      DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      notificationId,
      {
        read: true,
      }
    );

    return { success: true, message: "Notification marked as read" };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

// Drink actions
export async function shareDrink(drinkName: string, drinkEmoji: string) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createAdminClient();

    // Get user profile for user name
    const userProfile = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("appwrite_user_id", user.$id)]
    );

    const userName = userProfile.documents[0]?.name || user.name || user.email;

    // Create drink record
    const drinkRecord = await databases.createDocument(
      DATABASE_ID,
      DRINKS_COLLECTION_ID,
      ID.unique(),
      {
        user_id: user.$id,
        user_name: userName,
        drink_name: drinkName,
        drink_emoji: drinkEmoji,
        created_at: new Date().toISOString(),
      }
    );

    // Send notification to all friends
    const result = await sendNotificationToFriends(
      `🍻 Prost!`,
      `${userName} trinkt gerade ${drinkEmoji} ${drinkName}!`
    );

    revalidatePath("/account");
    return {
      success: true,
      message: `Du trinkst ${drinkEmoji} ${drinkName}!`,
      drinkRecord,
      notificationResult: result,
    };
  } catch (error) {
    console.error("Error sharing drink:", error);
    return { success: false, error: "Failed to share drink" };
  }
}

export async function getDrinkHistory(limit: number = 50) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createSessionClient();

    // Get user's drink history
    const drinks = await databases.listDocuments(
      DATABASE_ID,
      DRINKS_COLLECTION_ID,
      [
        Query.equal("user_id", user.$id),
        Query.orderDesc("created_at"),
        Query.limit(limit),
      ]
    );

    return { success: true, drinks: drinks.documents };
  } catch (error) {
    console.error("Error getting drink history:", error);
    return { success: false, error: "Failed to get drink history" };
  }
}

export async function getAllDrinkHistory(limit: number = 100) {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("User not logged in");
    }

    const { databases } = await createSessionClient();

    // Get all drinks from friends (including own drinks)
    const friendsResult = await getFriends();
    if (!friendsResult.success || !friendsResult.friends) {
      return { success: true, drinks: [] };
    }

    // Include current user in the list
    const friendIds = [
      user.$id,
      ...friendsResult.friends.map((f) => f.appwrite_user_id),
    ];

    const drinks = await databases.listDocuments(
      DATABASE_ID,
      DRINKS_COLLECTION_ID,
      [
        Query.equal("user_id", friendIds),
        Query.orderDesc("created_at"),
        Query.limit(limit),
      ]
    );

    return { success: true, drinks: drinks.documents };
  } catch (error) {
    console.error("Error getting all drink history:", error);
    return { success: false, error: "Failed to get drink history" };
  }
}
