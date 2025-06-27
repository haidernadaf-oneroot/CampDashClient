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
  BotIcon,
  AirplayIcon,
  Mic,
  UserRound,
  UserRoundSearch,
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
    { label: "Buyers", icon: UserCheck2, href: "/buyer" },
    { label: "All Leads", icon: UserRoundSearch, href: "/all_leads" },
    { label: "Daily_RTH", icon: ListTodo, href: "/Daily_RTH" },
    { label: "Manager", icon: BarChart2, href: "/Manager" },
    { label: "IVR", icon: PhoneCall, href: "/Pressed" },
    { label: "Waiting-List", icon: ShieldCheck, href: "/waiting" },
    { label: "tasks", icon: FileText, href: "/tasks" },
    { label: "Bot_Calls", icon: BotIcon, href: "/bot_calls" },
    { label: "Manage Taluka", icon: MapPinned, href: "/manage" },
    { label: "AiBot-Records", icon: Mic, href: "/aibots-records" },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen ${
        isCollapsed ? "w-16" : "w-52"
      } bg-purple-950 text-white shadow-xl border-r border-purple-700 transition-all duration-150 ease-in-out`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16  bg-gradient-to-r bg-purple-900 shadow-md">
        <Image
          src="/marKhet  Logo white.png"
          width={isCollapsed ? 41 : 150}
          height={20}
          alt="market logo"
          className="transition-all duration-150"
        />
        {/* <button
          onClick={toggleSidebar}
          className="p-2 rounded-full bg-purple-900 hover:bg-purple-950  transition-all duration-150"
        >
          <ChevronLeft
            size={20}
            className={`${isCollapsed ? "rotate-180" : ""} transition`}
          />
        </button> */}
      </div>
      {/* Navigation */}
      <nav className="mt-8 space-y-2 px-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center p-2 rounded-md transition-all duration-150 ease-in-out hover:scale-105 ${
              activeItem === item.href || pathname === item.href
                ? "bg-purple-900 text-white shadow-lg"
                : "text-green-100 hover:bg-purple-900"
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
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r bg-purple-900">
          <p className="text-sm font-medium">Markhet Dashboard</p>
          <p className="text-xs text-green-200">markhet.farm</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
