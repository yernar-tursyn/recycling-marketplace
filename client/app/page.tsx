import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Recycle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Переработка вторсырья стала проще
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Наша платформа соединяет тех, кто хочет сдать вторсырье, с теми, кто готов его принять и
                    переработать.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/marketplace">
                    <Button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground">
                      Начать сейчас
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      variant="outline"
                      className="inline-flex h-10 items-center justify-center rounded-md border border-input px-8 text-sm font-medium"
                    >
                      Узнать больше
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="flex h-[350px] w-[350px] items-center justify-center rounded-full bg-muted">
                  <Recycle className="h-32 w-32 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Как это работает</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Простой процесс в три шага для сдачи или приема вторсырья
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-background p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <h3 className="text-xl font-bold">Регистрация</h3>
                <p className="text-muted-foreground">
                  Создайте аккаунт и укажите, хотите ли вы сдавать или принимать вторсырье
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-background p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  2
                </div>
                <h3 className="text-xl font-bold">Поиск</h3>
                <p className="text-muted-foreground">Найдите подходящие предложения или разместите свое объявление</p>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-background p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  3
                </div>
                <h3 className="text-xl font-bold">Сделка</h3>
                <p className="text-muted-foreground">Договоритесь о деталях и завершите сделку</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

