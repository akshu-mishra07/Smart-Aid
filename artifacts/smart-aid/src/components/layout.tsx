import { Link, useLocation } from "wouter";
import { LanguageToggle } from "./language-toggle";
import { useLanguage } from "@/lib/language-context";
import { HeartHandshake, Menu, LogIn, LogOut, User } from "lucide-react";
import { useUser, useClerk, Show } from "@clerk/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const initials = user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" data-testid="btn-user-menu">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "Your Account"}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/documents" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            My Documents
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={() => signOut({ redirectUrl: `${basePath}/` })}
          data-testid="btn-sign-out"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [location] = useLocation();

  const links = [
    { href: "/eligibility", label: t("Check Eligibility", "पात्रता जांचें") },
    { href: "/schemes", label: t("Schemes", "योजनाएं") },
    { href: "/assistance", label: t("Assistance Centers", "सहायता केंद्र") },
    { href: "/jobs", label: t("Jobs", "नौकरियां") },
    { href: "/documents", label: t("Documents", "दस्तावेज़") },
    { href: "/about", label: t("About", "हमारे बारे में") },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 mr-6 text-primary" data-testid="link-home">
            <HeartHandshake className="h-6 w-6" />
            <span className="font-serif text-xl font-bold tracking-tight">
              Smart Aid
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`link-nav-${link.href.replace("/", "")}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end space-x-3">
            <LanguageToggle />
            <Link href="/admin" className="hidden sm:inline-flex" data-testid="link-admin">
              <Button variant="ghost" size="sm" className="text-muted-foreground">Admin</Button>
            </Link>

            <Show when="signed-in">
              <UserMenu />
            </Show>
            <Show when="signed-out">
              <Link href="/sign-in" data-testid="btn-sign-in">
                <Button size="sm" variant="outline" className="hidden sm:flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  {t("Sign In", "साइन इन")}
                </Button>
              </Link>
            </Show>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="sm:max-w-xs">
                <SheetHeader>
                  <SheetTitle className="text-left font-serif text-primary flex items-center gap-2">
                    <HeartHandshake className="h-5 w-5" /> Smart Aid
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        location === link.href ? "text-primary" : "text-muted-foreground"
                      }`}
                      data-testid={`link-mobile-nav-${link.href.replace("/", "")}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/admin"
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Admin
                  </Link>
                  <Show when="signed-out">
                    <Link href="/sign-in" className="text-lg font-medium text-primary">
                      {t("Sign In", "साइन इन")}
                    </Link>
                  </Show>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t bg-muted/30">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row max-w-7xl px-4 md:px-6">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with care for India's future.
            <span className="inline-block mx-2">|</span>
            {t("Need help? Call", "मदद चाहिए? कॉल करें")} <strong>1800-123-4567</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}
