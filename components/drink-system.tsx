"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  shareDrink,
  getDrinkHistory,
  getAllDrinkHistory,
} from "@/lib/server/friend-actions";
import { useFriendRealtime } from "@/hooks/use-friend-realtime";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface Drink {
  $id: string;
  user_id: string;
  user_name: string;
  drink_name: string;
  drink_emoji: string;
  created_at: string;
}

const AVAILABLE_DRINKS = [
  { name: "Bier", emoji: "🍺" },
  { name: "Aperol Spritz", emoji: "🍹" },
  { name: "Wein", emoji: "🍷" },
  { name: "Cocktail", emoji: "🍸" },
  { name: "Whiskey", emoji: "🥃" },
  { name: "Champagner", emoji: "🥂" },
  { name: "Kaffee", emoji: "☕" },
  { name: "Tee", emoji: "🍵" },
  { name: "Wasser", emoji: "💧" },
  { name: "Saft", emoji: "🧃" },
  { name: "Energy Drink", emoji: "⚡" },
  { name: "Smoothie", emoji: "🥤" },
];

interface DrinkSystemProps {
  currentUserId: string | null;
}

export default function DrinkSystem({ currentUserId }: DrinkSystemProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [myDrinks, setMyDrinks] = useState<Drink[]>([]);
  const [allDrinks, setAllDrinks] = useState<Drink[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Real-time callback for drink updates
  const handleDrinkShared = useCallback(
    (drink: any) => {
      console.log("Real-time drink shared:", drink);

      // Show in-app notification for friends' drinks
      if (drink.user_id !== currentUserId) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`🍻 ${drink.user_name} trinkt gerade!`, {
            body: `${drink.drink_emoji} ${drink.drink_name}`,
            icon: "/favicon.ico",
          });
        }
        setMessage(
          `🍻 ${drink.user_name} trinkt gerade ${drink.drink_emoji} ${drink.drink_name}!`
        );
        setTimeout(() => setMessage(""), 5000);
      }

      // Reload drink history to get latest data
      loadDrinkHistory();
    },
    [currentUserId]
  );

  // Set up real-time subscriptions
  useFriendRealtime(currentUserId, {
    onDrinkShared: handleDrinkShared,
  });

  const loadDrinkHistory = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const myResult = await getDrinkHistory(20);
      if (myResult.success && myResult.drinks) {
        setMyDrinks(myResult.drinks as unknown as Drink[]);
      }

      const allResult = await getAllDrinkHistory(50);
      if (allResult.success && allResult.drinks) {
        setAllDrinks(allResult.drinks as unknown as Drink[]);
      }
    } catch (error) {
      console.error("Error loading drink history:", error);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadDrinkHistory();
  }, [loadDrinkHistory]);

  const handleShareDrink = async (drinkName: string, drinkEmoji: string) => {
    setLoading(true);
    try {
      const result = await shareDrink(drinkName, drinkEmoji);
      if (result.success) {
        setMessage(result.message || `Du trinkst ${drinkEmoji} ${drinkName}!`);

        // Show browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Getränk geteilt!", {
            body: `Du trinkst gerade ${drinkEmoji} ${drinkName}`,
            icon: "/favicon.ico",
          });
        }

        // Reload history
        loadDrinkHistory();
      } else {
        setMessage(result.error || "Fehler beim Teilen des Getränks");
      }
    } catch (error) {
      console.error("Error sharing drink:", error);
      setMessage("Fehler beim Teilen des Getränks");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: de,
      });
    } catch {
      return "vor kurzem";
    }
  };

  if (!currentUserId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🍻 Getränke-System</CardTitle>
          <CardDescription>
            Melde dich an, um deine Getränke mit Freunden zu teilen!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🍻 Was trinkst du gerade?
          </CardTitle>
          <CardDescription>
            Teile dein aktuelles Getränk mit deinen Freunden und sieh was andere
            trinken!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-md">
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {AVAILABLE_DRINKS.map((drink) => (
              <Button
                key={drink.name}
                variant="outline"
                size="lg"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                onClick={() => handleShareDrink(drink.name, drink.emoji)}
                disabled={loading}
              >
                <span className="text-3xl">{drink.emoji}</span>
                <span className="text-sm font-medium">{drink.name}</span>
              </Button>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  📊 Meine Historie ({myDrinks.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Deine Getränke-Historie</DialogTitle>
                  <DialogDescription>
                    Die letzten 20 Getränke, die du geteilt hast
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {myDrinks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Noch keine Getränke geteilt
                    </p>
                  ) : (
                    myDrinks.map((drink) => (
                      <div
                        key={drink.$id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{drink.drink_emoji}</span>
                          <div>
                            <div className="font-medium">
                              {drink.drink_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatTime(drink.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAllHistory} onOpenChange={setShowAllHistory}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  🌍 Alle Freunde ({allDrinks.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Getränke-Feed</DialogTitle>
                  <DialogDescription>
                    Was trinken deine Freunde und du gerade?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {allDrinks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Noch keine Getränke-Aktivität
                    </p>
                  ) : (
                    allDrinks.map((drink) => (
                      <div
                        key={drink.$id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{drink.drink_emoji}</span>
                          <div>
                            <div className="font-medium">
                              {drink.drink_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {drink.user_id === currentUserId
                                ? "Du"
                                : drink.user_name}{" "}
                              • {formatTime(drink.created_at)}
                            </div>
                          </div>
                        </div>
                        {drink.user_id === currentUserId && (
                          <Badge variant="secondary">Du</Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Preview */}
      {allDrinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎉 Letzte Aktivität</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allDrinks.slice(0, 3).map((drink) => (
                <div
                  key={drink.$id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <span className="text-xl">{drink.drink_emoji}</span>
                  <div className="flex-1">
                    <div className="text-sm">
                      <strong>
                        {drink.user_id === currentUserId
                          ? "Du"
                          : drink.user_name}
                      </strong>{" "}
                      trinkst {drink.drink_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(drink.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
