"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { adminLogin, verifyTwoFactorCode } from "@/services/auth-service";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [tempToken, setTempToken] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    code?: string;
  }>({});

  const { setAdminSession } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (adminToken) {
      router.push("/admin");
    }
  }, [router]);

  const validateLoginForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Некорректный email";
    }

    if (!password) {
      newErrors.password = "Пароль обязателен";
    } else if (password.length < 8) {
      newErrors.password = "Пароль должен содержать минимум 8 символов";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTwoFactorForm = () => {
    const newErrors: { code?: string } = {};

    if (!twoFactorCode) {
      newErrors.code = "Код подтверждения обязателен";
    } else if (twoFactorCode.length !== 6 || !/^\d+$/.test(twoFactorCode)) {
      newErrors.code = "Код должен состоять из 6 цифр";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) return;

    setIsLoading(true);

    try {
      const { tempToken, requireTwoFactor } = await adminLogin(email, password);

      if (requireTwoFactor) {
        setTempToken(tempToken);
        setStep("2fa");
        toast({
          title: "Требуется двухфакторная аутентификация",
          description: "Введите код подтверждения, отправленный на ваш email",
        });
      } else {
        setAdminSession(tempToken);
        router.push("/admin");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description:
          "Неверный email или пароль. Доступ разрешен только администраторам и менеджерам.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTwoFactorForm()) return;

    setIsLoading(true);

    try {
      const { token, success } = await verifyTwoFactorCode(
        tempToken,
        twoFactorCode
      );

      if (success) {
        setAdminSession(token);

        toast({
          title: "Успешный вход",
          description: "Вы успешно вошли в административную панель",
        });

        router.push("/admin");
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка проверки кода",
          description: "Введен неверный код подтверждения",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка проверки кода",
        description: "Произошла ошибка при проверке кода",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <ShieldAlert className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">
              Административный вход
            </CardTitle>
            <CardDescription className="text-center">
              {step === "login"
                ? "Доступ только для администраторов и менеджеров"
                : "Введите код подтверждения"}
            </CardDescription>
          </CardHeader>

          {step === "login" ? (
            <form onSubmit={handleLoginSubmit}>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
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
                    <p className="text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Вход..." : "Войти"}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleTwoFactorSubmit}>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Код подтверждения</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    disabled={isLoading}
                    maxLength={6}
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive">{errors.code}</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Для демонстрации используйте код:{" "}
                  <span className="font-bold">123456</span>
                </p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Проверка..." : "Подтвердить"}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  className="w-full"
                  onClick={() => setStep("login")}
                  disabled={isLoading}
                >
                  Назад
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <span className="text-primary font-medium">Демо-данные:</span>{" "}
          admin@ecomarket.ru / admin123
        </p>
      </div>
    </div>
  );
}
