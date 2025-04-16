"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { debugUsers } from "@/services/auth-service";

const handleDebug = () => {
  console.log("[Debug] Checking users in system");
  const users = debugUsers();
  console.log("[Debug] Available users:", users);
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Некорректный email";
    }

    if (!password) {
      newErrors.password = "Пароль обязателен";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Неверный email или пароль");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);

      toast({
        title: "Успешный вход",
        description: "Вы успешно вошли в систему",
      });

      // Просто редирект, сервер сам проверит токен при запросах
      router.push("/profile");
    } catch (error) {
      console.log("[Login Page] Login error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка при входе",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoAccount = (type: string) => {
    switch (type) {
      case "admin":
        setEmail("admin@ecomarket.ru");
        setPassword("admin123");
        break;
      case "manager":
        setEmail("manager@ecomarket.ru");
        setPassword("manager123");
        break;
      case "seller":
        setEmail("ivan@example.com");
        setPassword("password123");
        break;
      case "buyer":
        setEmail("anna@example.com");
        setPassword("password123");
        break;
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Вход</CardTitle>
            <CardDescription className="text-center">
              Введите свои данные для входа
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Скрыть пароль" : "Показать пароль"}
                    </span>
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="demo-accounts">
                  <AccordionTrigger className="text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Демо-аккаунты для тестирования
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        Выберите тип аккаунта для входа:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setDemoAccount("admin")}
                        >
                          Администратор
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setDemoAccount("manager")}
                        >
                          Менеджер
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setDemoAccount("seller")}
                        >
                          Продавец
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setDemoAccount("buyer")}
                        >
                          Покупатель
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Вход..." : "Войти"}
              </Button>
              <div className="mt-4 text-center text-sm">
                Нет аккаунта?{" "}
                <Link href="/auth/register" className="underline">
                  Зарегистрироваться
                </Link>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={handleDebug}
              >
                Проверить пользователей
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
