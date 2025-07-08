"use client";

import { client } from "./appwrite";
import { Models } from "appwrite";

export interface RealtimeEvent {
  events: string[];
  channels: string[];
  timestamp: number;
  payload: any;
}

export type RealtimeCallback = (response: RealtimeEvent) => void;

/**
 * Real-time subscription service for Appwrite
 * Provides methods to subscribe to document changes in collections
 */
export class RealtimeService {
  private subscriptions: Map<string, () => void> = new Map();

  /**
   * Subscribe to all documents in a collection
   */
  subscribeToCollection(
    databaseId: string,
    collectionId: string,
    callback: RealtimeCallback
  ): string {
    const channel = `databases.${databaseId}.collections.${collectionId}.documents`;
    const subscriptionKey = `collection_${databaseId}_${collectionId}`;

    // If already subscribed, unsubscribe first
    this.unsubscribe(subscriptionKey);

    const unsubscribe = client.subscribe(channel, callback);
    this.subscriptions.set(subscriptionKey, unsubscribe);

    console.log(`Subscribed to collection changes: ${channel}`);
    return subscriptionKey;
  }

  /**
   * Subscribe to a specific document
   */
  subscribeToDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    callback: RealtimeCallback
  ): string {
    const channel = `databases.${databaseId}.collections.${collectionId}.documents.${documentId}`;
    const subscriptionKey = `document_${databaseId}_${collectionId}_${documentId}`;

    // If already subscribed, unsubscribe first
    this.unsubscribe(subscriptionKey);

    const unsubscribe = client.subscribe(channel, callback);
    this.subscriptions.set(subscriptionKey, unsubscribe);

    console.log(`Subscribed to document changes: ${channel}`);
    return subscriptionKey;
  }

  /**
   * Subscribe to multiple channels
   */
  subscribeToChannels(channels: string[], callback: RealtimeCallback): string {
    const subscriptionKey = `channels_${channels.join("_")}`;

    // If already subscribed, unsubscribe first
    this.unsubscribe(subscriptionKey);

    const unsubscribe = client.subscribe(channels, callback);
    this.subscriptions.set(subscriptionKey, unsubscribe);

    console.log(`Subscribed to channels: ${channels.join(", ")}`);
    return subscriptionKey;
  }

  /**
   * Subscribe to notifications for a specific user
   */
  subscribeToNotifications(userId: string, callback: RealtimeCallback): string {
    const databaseId = "main-database";
    const collectionId = "notifications";
    const channel = `databases.${databaseId}.collections.${collectionId}.documents`;
    const subscriptionKey = `notifications_${userId}`;

    // If already subscribed, unsubscribe first
    this.unsubscribe(subscriptionKey);

    // Create a filtered callback that only triggers for this user's notifications
    const filteredCallback: RealtimeCallback = (response) => {
      const payload = response.payload;
      if (payload && payload.recipient_id === userId) {
        callback(response);
      }
    };

    const unsubscribe = client.subscribe(channel, filteredCallback);
    this.subscriptions.set(subscriptionKey, unsubscribe);

    console.log(`Subscribed to notifications for user: ${userId}`);
    return subscriptionKey;
  }

  /**
   * Unsubscribe from a specific subscription
   */
  unsubscribe(subscriptionKey: string): void {
    const unsubscribe = this.subscriptions.get(subscriptionKey);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(subscriptionKey);
      console.log(`Unsubscribed from: ${subscriptionKey}`);
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((unsubscribe, key) => {
      unsubscribe();
      console.log(`Unsubscribed from: ${key}`);
    });
    this.subscriptions.clear();
  }

  /**
   * Get current subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get list of active subscription keys
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
