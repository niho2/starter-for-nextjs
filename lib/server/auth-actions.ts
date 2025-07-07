"use server";

import { createAdminClient, createSessionClient } from "@/lib/server/appwrite";
import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    redirect(
      "/signup?error=" +
        encodeURIComponent("Alle Felder sind erforderlich") +
        "&email=" +
        encodeURIComponent(email || "") +
        "&name=" +
        encodeURIComponent(name || "")
    );
  }

  try {
    const { account } = await createAdminClient();

    await account.create(ID.unique(), email, password, name);
    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("my-custom-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    redirect("/account");
  } catch (error: any) {
    redirect(
      "/signup?error=" +
        encodeURIComponent(error.message || "Registrierung fehlgeschlagen") +
        "&email=" +
        encodeURIComponent(email) +
        "&name=" +
        encodeURIComponent(name)
    );
  }
}

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect(
      "/signin?error=" +
        encodeURIComponent("E-Mail und Passwort sind erforderlich") +
        "&email=" +
        encodeURIComponent(email || "")
    );
  }

  try {
    const { account } = await createAdminClient();

    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("my-custom-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    redirect("/account");
  } catch (error: any) {
    redirect(
      "/signin?error=" +
        encodeURIComponent(error.message || "Anmeldung fehlgeschlagen") +
        "&email=" +
        encodeURIComponent(email)
    );
  }
}

export async function signOut() {
  try {
    const { account } = await createSessionClient();

    (await cookies()).delete("my-custom-session");
    await account.deleteSession("current");

    redirect("/signin");
  } catch (error) {
    redirect("/signin");
  }
}

export async function sendEmailVerification() {
  try {
    const { account } = await createSessionClient();

    // Create verification email with redirect URL
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await account.createVerification(`${origin}/verify-email`);

    // Revalidate the account page to show updated data
    revalidatePath("/account");

    // Return success - will be handled by the form submission
    return {
      success: true,
      message:
        "Verifizierungs-E-Mail wurde erfolgreich gesendet! Prüfen Sie Ihr Postfach.",
    };
  } catch (error: any) {
    console.error("Error sending verification email:", error);

    // Check if it's a rate limit error or other specific error
    let errorMessage = "Fehler beim Senden der Verifizierungs-E-Mail";
    if (error.message) {
      if (error.message.includes("rate limit")) {
        errorMessage = "Zu viele Anfragen. Bitte warten Sie einen Moment.";
      } else if (error.message.includes("verification")) {
        errorMessage =
          "E-Mail bereits verifiziert oder Verifizierung bereits angefordert";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function sendEmailVerificationAction(
  prevState: any,
  _formData: FormData
) {
  try {
    const { account } = await createSessionClient();

    // Create verification email with redirect URL
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await account.createVerification(`${origin}/verify-email`);

    // Revalidate the account page to show updated data
    revalidatePath("/account");

    return {
      success: true,
      message:
        "Verifizierungs-E-Mail wurde erfolgreich gesendet! Prüfen Sie Ihr Postfach.",
    };
  } catch (error: any) {
    console.error("Error sending verification email:", error);

    // Check if it's a rate limit error or other specific error
    let errorMessage = "Fehler beim Senden der Verifizierungs-E-Mail";
    if (error.message) {
      if (error.message.includes("rate limit")) {
        errorMessage = "Zu viele Anfragen. Bitte warten Sie einen Moment.";
      } else if (error.message.includes("verification")) {
        errorMessage =
          "E-Mail bereits verifiziert oder Verifizierung bereits angefordert";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function verifyEmailDirectly(userId: string, secret: string) {
  try {
    // For email verification, we need to use a public client without session
    // This is because the verification can happen before the user is logged in
    const { Client, Account } = await import("node-appwrite");
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const account = new Account(client);

    // Complete email verification
    await account.updateVerification(userId, secret);

    return {
      success: true,
      message:
        "🎉 E-Mail wurde erfolgreich verifiziert! Sie haben jetzt Zugang zu allen Premium-Features.",
    };
  } catch (error: any) {
    console.error("Error verifying email:", error);

    // Provide more specific error messages
    let errorMessage = "Verifizierung fehlgeschlagen";
    if (error.message) {
      if (error.message.includes("expired")) {
        errorMessage =
          "Der Verifizierungslink ist abgelaufen. Bitte fordern Sie einen neuen an.";
      } else if (error.message.includes("invalid")) {
        errorMessage =
          "Ungültiger Verifizierungslink. Bitte prüfen Sie den Link.";
      } else if (error.message.includes("already")) {
        errorMessage = "E-Mail ist bereits verifiziert.";
      } else if (error.message.includes("scope")) {
        errorMessage =
          "Verifizierungslink kann nicht verarbeitet werden. Bitte versuchen Sie es erneut.";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}
