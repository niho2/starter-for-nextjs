import { getLoggedInUser } from "@/lib/server/appwrite";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Crown, Users, ArrowLeft } from "lucide-react";

export default async function PremiumAreaPage() {
  const user = await getLoggedInUser();

  // Redirect if not logged in
  if (!user) redirect("/signin");

  // Redirect if email is not verified
  if (!user.emailVerification) {
    redirect(
      "/account?error=" +
        encodeURIComponent(
          "Sie müssen Ihre E-Mail-Adresse verifizieren, um auf diesen Bereich zuzugreifen"
        )
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              Verifizierter Bereich
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Exklusiver Zugang nur für verifizierte Benutzer
            </p>
            <Badge variant="default" className="mt-2">
              <Crown className="mr-1 h-3 w-3" />
              Verifiziert
            </Badge>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <a href="/account">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück zum Konto
                </a>
              </Button>
            </div>
          </div>

          {/* Welcome Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Willkommen, {user.name}!
              </CardTitle>
              <CardDescription>
                Sie haben Zugang zu diesem geschützten Bereich, da Ihre
                E-Mail-Adresse verifiziert ist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Verifizierter Status bestätigt
                  </span>
                </div>
                <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                  Ihre E-Mail-Adresse {user.email} wurde erfolgreich
                  verifiziert.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Premium Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Exklusive Features
                </CardTitle>
                <CardDescription>
                  Nur für verifizierte Benutzer verfügbar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Erweiterte Dashboard-Funktionen</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Premium Support-Zugang</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Exklusive Inhalte und Tutorials</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Beta-Features frühzeitig testen</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sicherheitsvorteile</CardTitle>
                <CardDescription>
                  Warum E-Mail-Verifizierung wichtig ist
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Bestätigung der Identität</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Schutz vor Missbrauch</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Crown className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Höhere Vertrauensstufe</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Content */}
          <Card>
            <CardHeader>
              <CardTitle>Demo-Inhalte</CardTitle>
              <CardDescription>
                Beispiele für Inhalte, die nur verifizierte Benutzer sehen
                können
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Erweiterte Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Detaillierte Statistiken und Auswertungen für Ihr Konto.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">API-Zugang</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vollständiger Zugang zu unserer REST-API mit erhöhten
                    Limits.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Premium Templates</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Zugang zu exklusiven Vorlagen und Design-Ressourcen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
