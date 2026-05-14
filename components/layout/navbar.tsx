import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { MenuSquare } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { routes } from "@/utils/routes";

export async function Navbar() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href={routes.home} className="flex items-center gap-3">
          <Logo />
          <div className="hidden sm:block">
            <p className="font-semibold tracking-tight">Smart Apply</p>
            <p className="text-xs text-muted-foreground">
              AI-first job workflow orchestration
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={item.href === routes.dashboard ? false : undefined}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {userId ? (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href={routes.dashboard} prefetch={false}>
                  Dashboard
                </Link>
              </Button>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-1 ring-border/70",
                  },
                }}
              />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href={routes.signIn}>Sign in</Link>
              </Button>
              <Button asChild>
                <Link href={routes.signUp}>Get started</Link>
              </Button>
            </>
          )}
          <div className="rounded-full border border-border/70 p-2 md:hidden">
            <MenuSquare className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
