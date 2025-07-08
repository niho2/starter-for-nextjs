import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

export const account = new Account(client);
export const databases = new Databases(client);

// Function to set session for client-side operations
export const setClientSession = async () => {
  try {
    // Get current session from server
    const response = await fetch("/api/session");
    if (response.ok) {
      const { session } = await response.json();
      if (session) {
        client.setSession(session);
        console.log("Client session set successfully");
        return true;
      }
    }
  } catch (error) {
    console.error("Failed to set client session:", error);
  }
  return false;
};

// Function to clear client session
export const clearClientSession = () => {
  try {
    client.setSession("");
    console.log("Client session cleared");
  } catch (error) {
    console.error("Failed to clear client session:", error);
  }
};

export { client };
