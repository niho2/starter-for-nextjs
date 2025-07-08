# Real-Time Friend System Implementation

This document describes the real-time functionality added to the friend system using Appwrite's real-time subscriptions.

## Overview

The friend system has been enhanced with real-time capabilities that provide live updates for:

- **Friend requests** - Instant notifications when you receive friend requests
- **Friend acceptances** - Real-time updates when someone accepts your friend request
- **Notification settings** - Live updates when friends change their notification preferences
- **User status changes** - Real-time updates to friend list data

## Architecture

### 1. Real-Time Service (`lib/client/realtime.ts`)

A singleton service that manages Appwrite real-time subscriptions:

```typescript
class RealtimeService {
  // Subscribe to collection changes
  subscribeToCollection(databaseId, collectionId, callback);

  // Subscribe to specific document changes
  subscribeToDocument(databaseId, collectionId, documentId, callback);

  // Subscribe to multiple channels
  subscribeToChannels(channels, callback);

  // Unsubscribe from subscriptions
  unsubscribe(subscriptionKey);
  unsubscribeAll();
}
```

### 2. Friend Real-Time Hook (`hooks/use-friend-realtime.ts`)

A React hook that provides friend-specific real-time functionality:

```typescript
const { isSubscribed, resubscribe } = useFriendRealtime(userId, {
  onFriendshipUpdate: (friendship) => {
    /* handle friendship changes */
  },
  onUserUpdate: (user) => {
    /* handle user data changes */
  },
  onError: (error) => {
    /* handle connection errors */
  },
});
```

### 3. Enhanced Friend System Component

The `FriendSystem` component now includes:

- **Real-time status indicator** - Shows connection status and last update time
- **Live badges** - Indicates which sections have real-time updates
- **Automatic data refresh** - Updates UI when real-time events occur
- **Connection management** - Ability to reconnect if connection is lost

## Features

### Connection Status

The UI displays the current real-time connection status:

- ✅ **Connected**: Green indicator with "Real-time connected"
- ❌ **Disconnected**: Red indicator with "Real-time disconnected"
- 🔄 **Reconnect button**: Manual reconnection option

### Live Updates

#### Friend Requests

- Receive instant notifications when someone sends you a friend request
- See real-time updates in the friend requests list
- Live badge indicator shows the section has real-time updates

#### Friend Acceptances

- Get notified immediately when someone accepts your friend request
- Friend list updates automatically without page refresh
- Both users see the update simultaneously

#### Notification Settings

- See live updates when friends change their notification preferences
- Your own notification settings update in real-time across browser tabs
- Friend list shows current notification status for each friend

### Real-Time Event Handling

The system listens to these Appwrite channels:

```typescript
// All friendship documents in the main database
"databases.main-database.collections.friendships.documents";

// All user documents in the main database
"databases.main-database.collections.users.documents";
```

### Event Types

#### Friendship Events

- `databases.main-database.collections.friendships.documents.*.create` - New friend request
- `databases.main-database.collections.friendships.documents.*.update` - Status change (accepted/declined)
- `databases.main-database.collections.friendships.documents.*.delete` - Friendship removed

#### User Events

- `databases.main-database.collections.users.documents.*.update` - User data updated (notification settings, profile changes)

## Usage

### Setting Up Real-Time

The real-time functionality is automatically enabled when:

1. User is authenticated (has a valid user ID)
2. Component mounts and calls `useFriendRealtime`
3. Subscriptions are established to friendship and user collections

### Real-Time Callbacks

```typescript
const handleFriendshipUpdate = useCallback((friendship: any) => {
  // Called when any friendship document changes
  console.log("Friendship updated:", friendship);

  // Show user notification
  setMessage(`Real-time update: Friend request ${friendship.status}!`);

  // Refresh data to get latest state
  loadData();
}, []);

const handleUserUpdate = useCallback(
  (user: any) => {
    // Called when any user document changes
    console.log("User updated:", user);

    // Update local state if it's current user
    if (user.appwrite_user_id === currentUserId) {
      setNotificationsEnabled(user.push_notifications_enabled);
    }

    // Update friends list with new data
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
```

### Connection Management

```typescript
// Check connection status
const { isSubscribed, resubscribe, unsubscribe } = useFriendRealtime(
  userId,
  callbacks
);

// Manually reconnect
const handleReconnect = () => {
  resubscribe();
};

// Clean up on unmount (automatic)
useEffect(() => {
  return unsubscribe;
}, [unsubscribe]);
```

## Benefits

### User Experience

- **Instant feedback** - See changes immediately without page refresh
- **Live collaboration** - Multiple users see updates simultaneously
- **Connection awareness** - Clear indication of real-time status
- **Automatic recovery** - Option to reconnect if connection is lost

### Technical Benefits

- **Efficient updates** - Only changed data is pushed, not full page reloads
- **Scalable** - Uses Appwrite's optimized real-time infrastructure
- **Reliable** - Built-in error handling and reconnection capabilities
- **Clean architecture** - Separation of concerns with service and hook layers

## Error Handling

The system includes comprehensive error handling:

```typescript
const handleRealtimeError = useCallback((error: Error) => {
  console.error("Real-time error:", error);
  setMessage(`Real-time connection error: ${error.message}`);

  // Auto-clear error message after 5 seconds
  setTimeout(() => setMessage(""), 5000);
}, []);
```

## Performance Considerations

- **Selective subscriptions** - Only subscribes to relevant collections
- **Efficient updates** - Uses React's useCallback for optimized re-renders
- **Cleanup** - Automatic unsubscription prevents memory leaks
- **Throttling** - UI updates are debounced to prevent excessive re-renders

## Testing the Real-Time Features

### Two-Browser Test

1. Open the app in two different browsers
2. Log in as different users in each browser
3. Send a friend request from one browser
4. See it appear instantly in the other browser
5. Accept the request and watch both browsers update

### Notification Settings Test

1. Change notification settings in one browser tab
2. Open another tab with the same user
3. See the settings update in real-time in both tabs

### Connection Status Test

1. Disconnect from internet
2. See connection status change to "disconnected"
3. Reconnect to internet
4. Use "Reconnect" button to restore real-time functionality

## Future Enhancements

Potential improvements for the real-time system:

- **Typing indicators** - Show when friends are actively using the app
- **Online status** - Display which friends are currently online
- **Message threading** - Real-time chat between friends
- **Activity feed** - Live stream of friend activities
- **Push notification integration** - Combine real-time updates with push notifications

## Troubleshooting

### Common Issues

**Real-time not connecting:**

- Check if user is properly authenticated
- Verify Appwrite project configuration
- Check browser console for errors

**Updates not appearing:**

- Ensure both users are in the same database
- Check if subscriptions are active (look for "Live" badges)
- Try using the "Reconnect" button

**Performance issues:**

- Check if too many subscriptions are active
- Look for memory leaks in browser dev tools
- Monitor network tab for excessive requests

### Debug Mode

Enable debug logging by adding to browser console:

```javascript
localStorage.setItem("debug", "friend-realtime");
```

This will show detailed real-time event logs in the console.
