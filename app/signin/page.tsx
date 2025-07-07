import { getLoggedInUser } from "@/lib/server/appwrite";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SignInPageProps {
  searchParams: Promise<{ error?: string; email?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error, email } = await searchParams;

  const user = await getLoggedInUser();

  // If user is logged in, redirect to account
  if (user) {
    redirect("/account");
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Bei Ihrem Konto anmelden
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Oder{" "}
            <a
              href="/signup"
              className="font-medium text-primary hover:text-primary/80"
            >
              erstellen Sie ein neues Konto
            </a>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Anmelden</CardTitle>
            <CardDescription>
              Geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein, um sich
              anzumelden.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm error={error} defaultEmail={email} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
