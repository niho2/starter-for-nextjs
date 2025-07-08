# Push Notifications & Friend System Implementation

## Overview

This implementation adds a complete push notification system and friend management functionality to your Next.js 15 project using Appwrite as the backend and Shadcn UI components.

## Features Implemented

### 🔔 Push Notifications

- **Appwrite Messaging Integration**: Uses Appwrite's messaging service to send push notifications
- **Browser Notifications**: Native browser notification support with permission handling
- **Service Worker**: Custom service worker (`/public/sw.js`) for handling push notifications
- **Real-time Notifications**: Send notifications to all friends with one click
- **Notification Settings**: Users can enable/disable push notifications

### 👥 Friend System

- **User Profiles**: Automatic user profile creation linked to Appwrite authentication
- **Friend Search**: Search for other users by username
- **Friend Requests**: Send, accept, and decline friend requests
- **Friend Management**: View all friends and their notification preferences
- **Status Tracking**: Track friendship status (pending, accepted, declined, blocked)

### 🗄️ Database Structure

Created in Appwrite using MCP server:

- **Database**: `main-database`
- **Collections**:
  - `users`: User profiles with notification preferences
  - `friendships`: Friend relationships and status

### 📱 UI Components

- **FriendSystem**: Main component for friend management (`/components/friend-system.tsx`)
- **NotificationDisplay**: In-app notification display (`/components/notification-display.tsx`)
- **PushNotificationProvider**: Handles browser notification permissions (`/components/push-notification-provider.tsx`)

### 🛠️ Server Actions

Located in `/lib/server/friend-actions.ts`:

- `initializeUser()`: Creates user profile on first login
- `searchUsers()`: Search for users by username
- `sendFriendRequest()`: Send friend requests
- `respondToFriendRequest()`: Accept/decline friend requests
- `getFriends()`: Retrieve user's friends
- `getPendingFriendRequests()`: Get incoming friend requests
- `sendPushNotificationToFriends()`: Send push notifications to all friends
- `updateNotificationSettings()`: Toggle notification preferences

### 📄 Pages Added

- `/app/account/page.tsx`: Enhanced with friend system integration
- `/app/messaging/page.tsx`: Overview of features and setup
- `/app/test-notifications/page.tsx`: Test push notification functionality

## Key Files Modified/Created

### Server-side

- `lib/server/appwrite.ts`: Added Databases and Messaging services
- `lib/server/friend-actions.ts`: Complete friend system and notification logic

### Client-side

- `lib/client/appwrite.ts`: Client-side Appwrite configuration
- `components/friend-system.tsx`: Main friend system UI
- `components/notification-display.tsx`: In-app notification display
- `components/push-notification-provider.tsx`: Browser notification setup

### Static Files

- `public/sw.js`: Service worker for push notification handling

### Database Schema

```
users collection:
- appwrite_user_id (string, unique)
- username (string, unique)
- email (string)
- push_notifications_enabled (boolean, default: true)

friendships collection:
- user1_id (string)
- user2_id (string)
- status (enum: pending, accepted, declined, blocked)
- created_at (datetime)
```

## How to Use

### 1. Initial Setup

- User profiles are automatically created when users first visit the account page
- Browser notification permissions are requested automatically

### 2. Adding Friends

1. Go to Account page
2. Use the "Find Friends" section to search by username
3. Click "Add Friend" to send a friend request

### 3. Managing Friend Requests

- Incoming friend requests appear in the "Friend Requests" section
- Accept or decline requests as needed

### 4. Sending Push Notifications

1. Ensure you have friends added
2. Click "Send Notification to Friends" button
3. All friends with notifications enabled will receive a push notification

### 5. Managing Notification Settings

- Toggle the "Enable push notifications" setting to control whether you receive notifications

## Testing

- Visit `/test-notifications` to test the notification system
- The test page allows you to send sample notifications to see how they appear

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Shadcn UI
- **Backend**: Appwrite (Database, Authentication, Messaging)
- **Notifications**: Browser Notification API, Service Workers
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Browser Support

- Push notifications work in modern browsers that support the Notification API
- Service worker registration for enhanced notification handling
- Graceful degradation for browsers without notification support

This implementation provides a complete foundation for real-time social features in your Next.js application, with server-side rendering support and a modern, responsive UI.
