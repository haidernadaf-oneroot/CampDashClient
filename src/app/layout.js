"use client";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Topbar from "@/components/Topbar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const isAuthenticated =
    typeof window !== "undefined"
      ? localStorage.getItem("isAuthenticated") === "true"
      : false;

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/auth") {
      router.push("/auth");
    }
  }, [isAuthenticated, pathname, router]);

  if (pathname === "/auth" || !isAuthenticated) {
    return (
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Markhetting</title>
        </head>
        <body className="antialiased bg-gray-100 overflow-hidden h-screen">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Markheting</title>
      </head>
      <body className="antialiased bg-gray-100 overflow-hidden h-screen">
        <div className="flex h-screen">
          <Sidebar className="fixed left-0 top-0 w-52 h-screen bg-green-800 shadow-lg z-50" />
          <div className="flex-1 flex flex-col ml-52">
            <Topbar className="fixed top-0 left-52 right-0 h-16 bg-white shadow-md z-40" />

            {/* Make only main scrollable */}
            <main className="flex-1 overflow-y-auto mt-16 p-4">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
