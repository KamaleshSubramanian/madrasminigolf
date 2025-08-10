import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Tag, 
  Users, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/sales", icon: TrendingUp, label: "Sales" },
    { path: "/admin/pricing", icon: Tag, label: "Pricing" },
    { path: "/admin/players", icon: Users, label: "Players" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 ${className}`}>
        <div className="p-6 border-b">
          <h1 className="text-xl text-golf-green font-bold">Madras Mini Golf</h1>
          <p className="text-sm text-gray-600">Admin Dashboard</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 transition-colors ${
                    isActive ? "text-gray-700 bg-golf-cream border-r-4 border-golf-green" : ""
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
