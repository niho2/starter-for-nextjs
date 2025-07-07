"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { sendEmailVerificationAction } from "@/lib/server/auth-actions";

const initialState = {
  success: false,
  message: "",
};

export function EmailVerificationButton() {
  const [state, formAction, pending] = useActionState(
    sendEmailVerificationAction,
    initialState
  );

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <Button
          type="submit"
          size="sm"
          className="bg-amber-600 hover:bg-amber-700"
          disabled={pending}
        >
          <Mail className="mr-2 h-4 w-4" />
          {pending ? "Wird gesendet..." : "Verifizierungs-E-Mail senden"}
        </Button>
      </form>

      {/* Show feedback */}
      {state?.message && (
        <div
          className={`text-sm p-3 rounded-md ${
            state.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}
    </div>
  );
}
