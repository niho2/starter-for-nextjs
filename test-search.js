require("dotenv").config({ path: ".env.local" });
const { Client, Databases, Query } = require("node-appwrite");

const client = new Client()
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function testSearch() {
  try {
    console.log("Testing fulltext search functionality...");

    // Test the fulltext search index
    const searchResults = await databases.listDocuments(
      "main-database",
      "users",
      [Query.search("username", "test"), Query.limit(5)]
    );

    console.log("Fulltext search results:", searchResults.total, "users found");

    // Test fallback search
    const fallbackResults = await databases.listDocuments(
      "main-database",
      "users",
      [Query.startsWith("username", "test"), Query.limit(5)]
    );

    console.log(
      "Fallback search results:",
      fallbackResults.total,
      "users found"
    );
    console.log("✅ Search functionality is working correctly!");
  } catch (error) {
    console.error("❌ Search test failed:", error);
  }
}

testSearch();
