"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, User, Coffee, Users } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/account", label: "Account", icon: User },
    { href: "/drinks", label: "Getränke", icon: Coffee },
  ];

  // Don't show navigation on auth pages
  if (
    pathname.includes("/signin") ||
    pathname.includes("/signup") ||
    pathname.includes("/verify")
  ) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={item.href} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}
