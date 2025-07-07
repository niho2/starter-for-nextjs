import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithEmail } from "@/lib/server/auth-actions";
import { Mail, Lock, User } from "lucide-react";

interface SignUpFormProps {
  error?: string;
  defaultEmail?: string;
  defaultName?: string;
}

export function SignUpForm({
  error,
  defaultEmail,
  defaultName,
}: SignUpFormProps) {
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <form action={signUpWithEmail} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Vollständiger Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Max Mustermann"
            defaultValue={defaultName || ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-Mail-Adresse
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="ihre@email.de"
            defaultValue={defaultEmail || ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Passwort
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
          />
          <p className="text-xs text-muted-foreground">Mindestens 8 Zeichen</p>
        </div>

        <Button type="submit" className="w-full">
          Konto erstellen
        </Button>
      </form>
    </div>
  );
}
