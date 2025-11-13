import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Tag, 
  Menu,
  X,
  LogOut,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const [location, navigate] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/sales", icon: TrendingUp, label: "Sales" },
    { path: "/admin/pricing", icon: Tag, label: "Pricing" },
    { path: "/admin/demo-numbers", icon: Phone, label: "Demo Numbers" },
  ];

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
      queryClient.removeQueries({ queryKey: ["/api/admin/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/recent-games"] });
      navigate("/admin");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
      queryClient.removeQueries({ queryKey: ["/api/admin/me"] });
      navigate("/admin");
    },
  });

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
        
        <nav className="mt-6 flex flex-col h-[calc(100vh-120px)]">
          <div className="flex-1">
            {menuItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer ${
                      isActive ? "text-gray-700 bg-golf-cream border-r-4 border-golf-green" : ""
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Logout Button - Visible on mobile, hidden on desktop */}
          <div className="md:hidden border-t border-gray-200 p-4">
            <Button
              onClick={() => {
                logoutMutation.mutate();
                setIsMobileOpen(false);
              }}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
              disabled={logoutMutation.isPending}
              size="sm"
              data-testid="button-logout-sidebar"
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
}
