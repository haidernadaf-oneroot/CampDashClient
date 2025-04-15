// src/app/layout.jsx
"use client";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Check authentication status
  const isAuthenticated = typeof window !== "undefined" ? localStorage.getItem("isAuthenticated") === "true" : false;

  // Redirect to /auth if not authenticated (except on /auth route)
  useEffect(() => {
    if (!isAuthenticated && pathname !== "/auth") {
      router.push("/auth");
    }
  }, [isAuthenticated, pathname, router]);

  // Render only children for /auth or unauthenticated users
  if (pathname === "/auth" || !isAuthenticated) {
    return (
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>My App</title>
        </head>
        <body className="antialiased bg-gray-100">{children}</body>
      </html>
    );
  }

  // Render full layout for authenticated users
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>
      <body className="antialiased bg-gray-100">
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar className="fixed left-0 top-0 w-52 h-screen bg-green-800 shadow-lg z-50" />
          <div className="flex-1 flex flex-col">
            <Topbar className="fixed top-0 left-52 right-0 h-16 bg-white shadow-md z-40" />
            <main className="flex-1 transition-all duration-300 ease-in-out ml-52 mt-16 p-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}