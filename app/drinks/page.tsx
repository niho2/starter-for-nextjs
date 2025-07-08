import { getLoggedInUser } from "@/lib/server/appwrite";
import { redirect } from "next/navigation";
import DrinkSystem from "@/components/drink-system";
import { Navigation } from "@/components/navigation";

export default async function DrinksPage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/signin");

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Navigation />

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            🍻 Getränke-System
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Teile deine Getränke mit Freunden und sieh was andere trinken!
          </p>
        </div>

        <DrinkSystem currentUserId={user.$id} />
      </div>
    </div>
  );
}
