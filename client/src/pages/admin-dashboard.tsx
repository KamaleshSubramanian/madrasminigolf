import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GolfLoader from "@/components/golf-loader";
import AdminSidebar from "@/components/admin-sidebar";
import { Gamepad2, IndianRupee, Users, Target, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDashboard() {
  const [, navigate] = useLocation();

  // Check authentication
  const { data: user, isLoading: userLoading, error } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
    enabled: !!user,
  });

  const { data: recentGames, isLoading: gamesLoading } = useQuery({
    queryKey: ["/api/admin/recent-games"],
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/logout"),
    onSuccess: () => {
      navigate("/admin");
    },
  });

  useEffect(() => {
    if (error && !userLoading) {
      navigate("/admin");
    }
  }, [error, userLoading, navigate]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <GolfLoader text="Loading dashboard" size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
            </div>
            <Button
              onClick={() => logoutMutation.mutate()}
              variant="outline"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Games</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {statsLoading ? "..." : (dashboardStats as any)?.todayGames || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Gamepad2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">
                  {(dashboardStats as any)?.gamesGrowth || "+0%"}
                </span>
                <span className="text-gray-600 ml-1">from yesterday</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {statsLoading ? "..." : (dashboardStats as any)?.todayRevenue || "₹0"}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <IndianRupee className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">
                  {(dashboardStats as any)?.revenueGrowth || "+0%"}
                </span>
                <span className="text-gray-600 ml-1">from yesterday</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Players</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {statsLoading ? "..." : (dashboardStats as any)?.totalPlayers || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">
                  +{(dashboardStats as any)?.totalPlayers || 0}
                </span>
                <span className="text-gray-600 ml-1">today</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Score</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {statsLoading ? "..." : "23.5"}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-red-600 font-medium">-0.8</span>
                <span className="text-gray-600 ml-1">improvement</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Games */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Games</h3>
            <div className="space-y-4">
              {gamesLoading ? (
                <div className="flex justify-center py-8">
                  <GolfLoader text="Loading recent games" size="sm" />
                </div>
              ) : recentGames && Array.isArray(recentGames) && recentGames.length > 0 ? (
                recentGames.map((game: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-golf-green text-white rounded-full flex items-center justify-center font-bold mr-3">
                        <span>{game.playerCount}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{game.leadPlayer}</p>
                        <p className="text-sm text-gray-600">{game.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-golf-green">{game.cost}</p>
                      <p className="text-sm text-gray-600">45 min</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-600">No games played today</div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
