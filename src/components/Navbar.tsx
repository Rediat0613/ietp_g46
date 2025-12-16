"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Activity, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/" },
    { name: "History", href: "/history" },
    { name: "Settings", href: "/settings" },
  ];

  const isActive = (path: string) => pathname === path;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return { icon: "👑", label: "Admin", color: "text-yellow-600 dark:text-yellow-400" };
      case "technician":
        return { icon: "🔧", label: "Technician", color: "text-blue-600 dark:text-blue-400" };
      case "viewer":
        return { icon: "👁", label: "Viewer", color: "text-gray-600 dark:text-gray-400" };
      default:
        return { icon: "👤", label: "User", color: "text-gray-600 dark:text-gray-400" };
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Smart Lab</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className={`text-xs font-medium ${getRoleBadge(user.role).color}`}>
                          {getRoleBadge(user.role).icon} {getRoleBadge(user.role).label}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <span className={`text-xs font-medium ${getRoleBadge(user.role).color}`}>
                      {getRoleBadge(user.role).icon} {getRoleBadge(user.role).label}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 dark:text-red-400 mt-2"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <div className="space-y-2 px-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};