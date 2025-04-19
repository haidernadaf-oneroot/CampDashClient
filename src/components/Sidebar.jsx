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

  // ✅ Optimized state for instant UI updates
  const [activeItem, setActiveItem] = useState("/Farmer");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedItem = localStorage.getItem("activeSidebarItem") || "/Farmer";
      setActiveItem(savedItem);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeSidebarItem", activeItem);
    }
  }, [activeItem]);

  useEffect(() => {
    if (typeof window !== "undefined" && pathname === "/") {
      router.replace("/Farmer");
    }
  }, [pathname, router]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Reservation", icon: Calendar, href: "/reservation" },
    { label: "Crops", icon: Leaf, href: "/crops" },
    { label: "Farmers", icon: User2, href: "/Farmer" },
    { label: "Buyers", icon: UserCheck2, href: "/Buyer" },
    { label: "Tasks", icon: ListTodo, href: "/my-tasks" },
    { label: "Manager", icon: BarChart2, href: "/Manager" },
    { label: "Call Logs", icon: PhoneCall, href: "/call-logs" },
    { label: "Status", icon: ShieldCheck, href: "/status" },
    { label: "Requirement", icon: FileText, href: "/requirement" },
    { label: "Manage Taluka", icon: MapPinned, href: "/manage" },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen ${
        isCollapsed ? "w-16" : "w-52"
      } bg-green-800 text-white shadow-xl border-r border-green-700 transition-all duration-150 ease-in-out`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16  bg-gradient-to-r from-green-700 to-green-600 shadow-md">
        <Image
          src="/marKhet  Logo white.png"
          width={isCollapsed ? 40 : 150}
          height={20}
          alt="market logo"
          className="transition-all duration-150"
        />
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full bg-green-700 hover:bg-green-800  transition-all duration-150"
        >
          <ChevronLeft
            size={20}
            className={`${isCollapsed ? "rotate-180" : ""} transition`}
          />
        </button>
      </div>
      {/* Navigation */}
      <nav className="mt-8 space-y-2 px-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center p-2 rounded-md transition-all duration-150 ease-in-out hover:scale-105 ${
              activeItem === item.href || pathname === item.href
                ? "bg-green-600 text-white shadow-lg"
                : "text-green-100 hover:bg-green-700"
            }`}
            onClick={() => setActiveItem(item.href)}
          >
            <item.icon
              className={`${
                isCollapsed ? "w-6 h-6 mx-auto" : "w-5 h-5 mr-3"
              } transition-all duration-150`}
            />

            {!isCollapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r from-green-700 to-green-600">
          <p className="text-sm font-medium">Markhet Dashboard</p>
          <p className="text-xs text-green-200">markhet.farm</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
