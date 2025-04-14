"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ShieldAlert,
  Users,
  Package,
  FileText,
  BarChart3,
  LogOut,
  Settings,
  AlertTriangle,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { addAdminLog } from "@/services/admin-service";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "admin" && user.role !== "manager"))
    ) {
      router.push("/admin/login");
    } else if (user && (user.role === "admin" || user.role === "manager")) {
      addAdminLog({
        userId: user.id,
        userName: user.name,
        action: "login",
        details: "Вход в административную панель",
        ip: "127.0.0.1",
      });
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      setIsSessionExpired(false);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    const interval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      if (inactiveTime > 30 * 60 * 1000) {
        setIsSessionExpired(true);
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
      }
    }, 60 * 1000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      clearInterval(interval);
    };
  }, [lastActivity, router]);

  const handleLogout = async () => {
    if (user) {
      await addAdminLog({
        userId: user.id,
        userName: user.name,
        action: "logout",
        details: "Выход из административной панели",
        ip: "127.0.0.1",
      });
    }

    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  if (
    isLoading ||
    !user ||
    (user.role !== "admin" && user.role !== "manager") ||
    isSessionExpired
  ) {
    return null;
  }

  const navItems = [
    {
      title: "Обзор",
      href: "/admin",
      icon: ShieldAlert,
      access: ["admin", "manager"],
    },
    {
      title: "Пользователи",
      href: "/admin/users",
      icon: Users,
      access: ["admin", "manager"],
    },
    {
      title: "Материалы",
      href: "/admin/materials",
      icon: Package,
      access: ["admin", "manager"],
    },
    {
      title: "Заявки",
      href: "/admin/applications",
      icon: FileText,
      access: ["admin", "manager"],
    },
    {
      title: "Отчеты",
      href: "/admin/reports",
      icon: BarChart3,
      access: ["admin", "manager"],
    },
    {
      title: "Настройки системы",
      href: "/admin/system-settings",
      icon: Settings,
      access: ["admin"],
    },
    {
      title: "Безопасность",
      href: "/admin/security",
      icon: Lock,
      access: ["admin"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.access.includes(user.role)
  );

  const currentPageItem = navItems.find((item) => pathname === item.href);
  const hasAccessToCurrentPage = currentPageItem
    ? currentPageItem.access.includes(user.role)
    : true;

  if (!hasAccessToCurrentPage) {
    router.push("/admin");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={`sticky top-0 z-10 border-b ${
          user.role === "admin" ? "bg-background" : "bg-muted/30"
        }`}
      >
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <ShieldAlert
              className={`h-6 w-6 ${
                user.role === "admin" ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <h1 className="text-xl font-bold">
              Административная панель
              <Badge
                variant={user.role === "admin" ? "destructive" : "secondary"}
                className="ml-2"
              >
                {user.role === "admin" ? "Администратор" : "Менеджер"}
              </Badge>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {user.name} (
              {user.role === "admin" ? "Администратор" : "Менеджер"})
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block">
          <nav className="h-full py-6 pr-6 lg:py-8">
            <div className="space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                  {item.access.includes("admin") &&
                    !item.access.includes("manager") && (
                      <div
                        className="relative ml-auto"
                        title="Только для администраторов"
                      >
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      </div>
                    )}
                </Link>
              ))}
            </div>
            <Separator className="my-6" />
            <div className="space-y-1">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Вернуться на сайт
              </Link>
            </div>
          </nav>
        </aside>
        <main className="flex w-full flex-col overflow-hidden py-6">
          {user.role === "manager" &&
            pathname.includes("/admin/system-settings") && (
              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" aria-hidden="true" />
                  <p className="font-medium">Ограниченный доступ</p>
                </div>
                <p className="mt-2 text-sm">
                  Некоторые функции доступны только администраторам. Обратитесь
                  к администратору системы, если вам требуется доступ к этим
                  функциям.
                </p>
              </div>
            )}
          {children}
        </main>
      </div>
    </div>
  );
}
