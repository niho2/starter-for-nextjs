const { Client, Databases, ID, Query } = require("node-appwrite");

async function createNotificationsCollection() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const DATABASE_ID = "main-database";

  try {
    // Try to create notifications collection
    try {
      const collection = await databases.createCollection(
        DATABASE_ID,
        "notifications",
        "Notifications",
        [
          'read("user:")',
          'create("users")',
          'update("user:")',
          'delete("user:")',
        ]
      );
      console.log("✅ Notifications collection created:", collection.name);
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log(
          "⚠️ Notifications collection already exists, continuing with attributes..."
        );
      } else {
        throw error;
      }
    }

    // Create attributes
    const attributes = [
      { key: "recipient_id", type: "string", size: 50, required: true },
      { key: "sender_id", type: "string", size: 50, required: true },
      { key: "sender_name", type: "string", size: 100, required: true },
      { key: "title", type: "string", size: 200, required: true },
      { key: "body", type: "string", size: 500, required: true },
      { key: "type", type: "string", size: 50, required: true },
      { key: "read", type: "boolean", required: true },
      { key: "created_at", type: "datetime", required: true },
    ];

    for (const attr of attributes) {
      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(
            DATABASE_ID,
            "notifications",
            attr.key,
            attr.size,
            attr.required
          );
        } else if (attr.type === "boolean") {
          await databases.createBooleanAttribute(
            DATABASE_ID,
            "notifications",
            attr.key,
            attr.required
          );
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(
            DATABASE_ID,
            "notifications",
            attr.key,
            attr.required
          );
        }
        console.log("✅ Created attribute:", attr.key);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait between requests
      } catch (error) {
        console.log(
          "⚠️ Attribute",
          attr.key,
          "might already exist:",
          error.message
        );
      }
    }

    // Create indexes for efficient queries
    const indexes = [
      { key: "recipient_idx", attributes: ["recipient_id"], type: "key" },
      { key: "sender_idx", attributes: ["sender_id"], type: "key" },
      { key: "created_at_idx", attributes: ["created_at"], type: "key" },
      { key: "read_idx", attributes: ["read"], type: "key" },
    ];

    for (const index of indexes) {
      try {
        await databases.createIndex(
          DATABASE_ID,
          "notifications",
          index.key,
          index.type,
          index.attributes
        );
        console.log("✅ Created index:", index.key);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(
          "⚠️ Index",
          index.key,
          "might already exist:",
          error.message
        );
      }
    }

    console.log("🎉 Notifications collection setup complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createNotificationsCollection();
