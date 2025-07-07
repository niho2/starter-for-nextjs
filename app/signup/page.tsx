import { getLoggedInUser } from "@/lib/server/appwrite";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SignUpPageProps {
  searchParams: Promise<{ error?: string; email?: string; name?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const user = await getLoggedInUser();
  if (user) redirect("/account");

  const { error, email, name } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Konto erstellen
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Oder{" "}
            <a
              href="/signin"
              className="font-medium text-primary hover:text-primary/80"
            >
              melden Sie sich mit Ihrem bestehenden Konto an
            </a>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrierung</CardTitle>
            <CardDescription>
              Erstellen Sie Ihr Konto, um zu beginnen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm error={error} defaultEmail={email} defaultName={name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
