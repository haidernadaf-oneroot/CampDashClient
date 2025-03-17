"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Leaf,
  User2,
  UserCheck2,
  ListTodo,
  BarChart2,
  PhoneCall,
  ShieldCheck,
  FileText,
  MapPinned,
  ChevronLeft,
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Ensure default page is "/Farmer"
  const [activeItem, setActiveItem] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeSidebarItem") || "/Farmer";
    }
    return "/Farmer";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeSidebarItem", activeItem);
    }
  }, [activeItem]);

  // ✅ Redirect to "/Farmer" on first load
  useEffect(() => {
    if (typeof window !== "undefined" && pathname === "/") {
      router.replace("/Farmer");
    }
  }, [pathname, router]);

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Reservation", icon: Calendar, href: "/reservation" },
    { label: "Crops", icon: Leaf, href: "/crops" },
    { label: "Farmers", icon: User2, href: "/Farmer" },
    { label: "Buyers", icon: UserCheck2, href: "/Buyer" },
    { label: "Tasks", icon: ListTodo, href: "/my-tasks" },
    { label: "Market Price", icon: BarChart2, href: "/Market" },
    { label: "Call Logs", icon: PhoneCall, href: "/call-logs" },
    { label: "Status", icon: ShieldCheck, href: "/status" },
    { label: "Requirement", icon: FileText, href: "/requirement" },
    { label: "Manage Taluka", icon: MapPinned, href: "/manage" },
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-52 bg-green-800 text-white shadow-xl border-r border-green-700">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-green-700 to-green-600 shadow-md">
        <Image
          src="/marKhet  Logo white.png"
          width={150}
          height={20}
          alt="market logo"
        />
        <button className="p-1 rounded-full bg-green-700 hover:bg-green-800">
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-8 space-y-2 px-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center p-2 rounded-md transition-transform duration-200 hover:scale-105 ${
              activeItem === item.href || pathname === item.href
                ? "bg-green-600 text-white shadow-lg"
                : "text-green-100 hover:bg-green-700"
            }`}
            onClick={() => setActiveItem(item.href)}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r from-green-700 to-green-600">
        <p className="text-sm font-medium">Markhet Dashboard</p>
        <p className="text-xs text-green-200">markhet.farm</p>
      </div>
    </aside>
  );
};

export default Sidebar;
