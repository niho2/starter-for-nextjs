import { verifyEmailDirectly } from "@/lib/server/auth-actions";
import { getLoggedInUser } from "@/lib/server/appwrite";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VerifyEmailPageProps {
  searchParams: Promise<{ userId?: string; secret?: string; error?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { userId, secret, error } = await searchParams;

  // Check if user is logged in first
  const user = await getLoggedInUser();

  // If userId and secret are provided, attempt verification immediately
  if (userId && secret && !error) {
    const result = await verifyEmailDirectly(userId, secret);

    if (result.success) {
      // Always redirect to account with success, regardless of login status
      // If user is not logged in, they will be handled by the account page
      redirect("/account?success=" + encodeURIComponent(result.message));
    } else {
      redirect("/verify-email?error=" + encodeURIComponent(result.message));
    }
  }

  // If no verification parameters and user is not logged in, redirect to signin
  if (!user && !error) {
    redirect("/signin");
  }

  // If no parameters or there's an error, show the status page
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            E-Mail Verifizierung
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {userId && secret ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Verifizierung wird verarbeitet...
                </>
              ) : error ? (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  Verifizierung fehlgeschlagen
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Warten auf Verifizierungslink
                </>
              )}
            </CardTitle>
            <CardDescription>
              {userId && secret
                ? "Ihre E-Mail-Adresse wird gerade verifiziert."
                : error
                ? "Es gab ein Problem bei der E-Mail-Verifizierung."
                : "Klicken Sie auf den Link in Ihrer E-Mail, um die Verifizierung abzuschließen."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userId && secret ? (
              <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                  <span>
                    Verifizierung läuft... Sie werden automatisch
                    weitergeleitet.
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className="space-y-3">
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
                <div className="text-center">
                  <Button variant="link" asChild>
                    <Link href={user ? "/account" : "/signin"}>
                      {user ? "Zurück zum Konto" : "Zur Anmeldung"}
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-md">
                  Prüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den
                  Verifizierungslink.
                </div>
                <div className="text-center">
                  <Button variant="link" asChild>
                    <Link href={user ? "/account" : "/signin"}>
                      {user ? "Zurück zum Konto" : "Zur Anmeldung"}
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
