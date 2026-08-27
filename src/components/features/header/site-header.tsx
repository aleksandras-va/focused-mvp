import { Camera, Search } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const navigation = [
  { href: "/cameras", label: "Cameras" },
  { href: "/lenses", label: "Lenses" },
  { href: "/stores", label: "Stores" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Camera className="size-4" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Focused
          </span>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigation.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={<Link href={item.href} />}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search gear" className="w-56 pl-8" />
          </div>
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
            Sign in
          </Link>
          <Link href="/sell" className={buttonVariants()}>
            Sell gear
          </Link>
        </div>
      </div>
    </header>
  );
}
