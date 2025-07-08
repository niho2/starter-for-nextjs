import { getLoggedInUser } from "@/lib/server/appwrite";
import { initializeUser } from "@/lib/server/friend-actions";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/server/auth-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  LogOut,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { EmailVerificationButton } from "@/components/auth/email-verification-button";
import { FriendSystem } from "@/components/friend-system";
import DrinkSystem from "@/components/drink-system";
import { Navigation } from "@/components/navigation";

interface AccountPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await getLoggedInUser();
  if (!user) redirect("/signin");

  // Initialize user profile for friend system
  await initializeUser();

  const { error, success } = await searchParams;

  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Navigation />
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Mein Konto
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Verwalten Sie Ihre Kontoinformationen und Freundschaften
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <a href="/messaging">
                  📱 Push Notifications & Friend System Overview
                </a>
              </Button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">
              {success}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Benutzerinformationen
              </CardTitle>
              <CardDescription>Ihre aktuellen Kontodaten</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">E-Mail:</span>
                </div>
                <span className="text-gray-900 dark:text-gray-100">
                  {user.email}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Name:</span>
                </div>
                <span className="text-gray-900 dark:text-gray-100">
                  {user.name}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Benutzer-ID:</span>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {user.$id}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Erstellt am:</span>
                </div>
                <span className="text-gray-900 dark:text-gray-100">
                  {new Date(user.$createdAt).toLocaleDateString("de-DE")}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">E-Mail verifiziert:</span>
                </div>
                <Badge
                  variant={user.emailVerification ? "default" : "destructive"}
                >
                  {user.emailVerification ? "Verifiziert" : "Nicht verifiziert"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kontoverwaltung</CardTitle>
              <CardDescription>Aktionen für Ihr Konto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Verification Section */}
              {!user.emailVerification && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-amber-800 dark:text-amber-200">
                      E-Mail-Verifizierung ausstehend
                    </span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    Verifizieren Sie Ihre E-Mail-Adresse, um auf alle Features
                    zuzugreifen.
                  </p>
                  <EmailVerificationButton />
                </div>
              )}

              {/* Verified Users Access */}
              {user.emailVerification && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      E-Mail verifiziert
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    Sie haben Zugang zu allen Premium-Features.
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <a href="/verified-area">
                      <Shield className="mr-2 h-4 w-4" />
                      Verifizierter Bereich besuchen
                    </a>
                  </Button>
                </div>
              )}

              {/* Logout */}
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Drink System */}
          <DrinkSystem currentUserId={user.$id} />

          {/* Friends and Push Notifications System */}
          <FriendSystem />
        </div>
      </div>
    </div>
  );
}
