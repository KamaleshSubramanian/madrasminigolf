import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Tag, 
  Users, 
  Settings, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/logout"),
    onSuccess: () => {
      queryClient.clear();
      navigate("/admin");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin panel.",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    },
  });

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/sales", icon: TrendingUp, label: "Sales" },
    { path: "/admin/pricing", icon: Tag, label: "Pricing" },
    { path: "/admin/players", icon: Users, label: "Players" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className={`w-64 bg-white shadow-lg ${className}`}>
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
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-6 left-6">
        <Button
          variant="ghost"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex items-center text-gray-600 hover:text-golf-green"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
