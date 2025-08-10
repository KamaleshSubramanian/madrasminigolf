import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GolfLoader from "@/components/golf-loader";
import AdminSidebar from "@/components/admin-sidebar";
import { Download, LogOut, TrendingUp, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiRequest } from "@/lib/queryClient";

export default function Sales() {
  const [, navigate] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // Check authentication
  const { data: user, isLoading: userLoading, error } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/admin/sales", selectedPeriod === "today" ? "day" : selectedPeriod],
    enabled: !!user,
  });

  const { data: hourlyData, isLoading: hourlyLoading } = useQuery({
    queryKey: ["/api/admin/hourly-sales"],
    enabled: !!user && selectedPeriod === "today",
  });

  const { data: weeklyData, isLoading: weeklyLoading } = useQuery({
    queryKey: ["/api/admin/weekly-sales"],
    enabled: !!user && selectedPeriod === "week",
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ["/api/admin/monthly-sales"],
    enabled: !!user && selectedPeriod === "month",
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/admin/transactions"],
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
    return <GolfLoader text="Loading sales data" size="lg" overlay={true} />;
  }

  if (!user) {
    return null;
  }

  const handleExport = () => {
    // Simple CSV export functionality
    if (transactions && Array.isArray(transactions)) {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Time,Player,Players,Cost,Type\n"
        + transactions.map((t: any) => 
            `${t.time},${t.player},${t.playerCount},${t.cost},${t.type}`
          ).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="md:ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-8 py-4 pt-16 md:pt-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Sales Analytics</h1>
              <p className="text-sm md:text-base text-gray-600">Track your revenue and game performance</p>
            </div>
            <Button
              onClick={() => logoutMutation.mutate()}
              variant="outline"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 self-start md:self-auto"
              disabled={logoutMutation.isPending}
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8">
        
        {/* Time Period Selector */}
        <Card className="shadow-md p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Select Time Period</h3>
            <div className="flex flex-wrap gap-2">
              {["today", "week", "month"].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  className={selectedPeriod === period ? "bg-golf-green text-white" : ""}
                  onClick={() => setSelectedPeriod(period as "today" | "week" | "month")}
                  size="sm"
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Sales Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedPeriod === "today" ? "Today's" : selectedPeriod === "week" ? "Weekly" : "Monthly"} Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Games:</span>
                  <span className="font-bold text-golf-green">
                    {salesLoading ? "..." : (salesData as any)?.totalGames || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Players:</span>
                  <span className="font-bold text-golf-green">
                    {salesLoading ? "..." : (salesData as any)?.totalPlayers || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-bold text-golf-green">
                    {salesLoading ? "..." : (salesData as any)?.totalRevenue || "₹0"}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-4">
                  <span className="text-gray-600">Avg per Game:</span>
                  <span className="font-bold text-gray-800">
                    {salesLoading ? "..." : (salesData as any)?.avgPerGame || "₹0"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Charts - Different for each period */}
          <Card className="shadow-md lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedPeriod === "today" ? "Hourly Revenue" : 
                   selectedPeriod === "week" ? "Daily Revenue (This Week)" : 
                   "Daily Revenue (This Month)"}
                </h3>
                <div className="flex space-x-1 bg-gray-100 rounded-md p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 ${chartType === "line" ? "bg-white shadow-sm" : ""}`}
                    onClick={() => setChartType("line")}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 ${chartType === "bar" ? "bg-white shadow-sm" : ""}`}
                    onClick={() => setChartType("bar")}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="h-64">
                {(selectedPeriod === "today" && hourlyLoading) || 
                 (selectedPeriod === "week" && weeklyLoading) || 
                 (selectedPeriod === "month" && monthlyLoading) ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <GolfLoader text="Loading chart data" size="md" />
                  </div>
                ) : (() => {
                  const currentData = selectedPeriod === "today" ? hourlyData : 
                                    selectedPeriod === "week" ? weeklyData : monthlyData;
                  
                  if (!currentData || !Array.isArray(currentData) || currentData.length === 0) {
                    return (
                      <div className="flex items-center justify-center w-full h-full text-gray-500">
                        No data available for {selectedPeriod}
                      </div>
                    );
                  }

                  // Transform data for chart
                  const chartData = currentData.map((data: any) => {
                    let revenue = 0;
                    if (selectedPeriod === "today") {
                      // For hourly data, revenue might include ₹ symbol
                      const revenueStr = data.revenue || "0";
                      revenue = parseFloat(revenueStr.toString().replace(/[₹,]/g, ''));
                    } else {
                      // For weekly/monthly data
                      revenue = parseFloat(data.revenue || "0");
                    }
                    
                    return {
                      name: selectedPeriod === "today" ? 
                        data.label || `${data.hour}:00` : // Use label from API for today
                        data.label || `Day ${data.day}`, // Date label for week/month
                      revenue: revenue,
                      displayRevenue: `₹${revenue.toLocaleString()}`
                    };
                  });
                  
                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "line" ? (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#6b7280"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="#6b7280"
                            fontSize={12}
                            tickFormatter={(value) => `₹${value}`}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`₹${value}`, 'Revenue']}
                            labelStyle={{ color: '#374151' }}
                            contentStyle={{ 
                              backgroundColor: '#f9fafb', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#16a34a" 
                            strokeWidth={2}
                            dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2, fill: '#ffffff' }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#6b7280"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="#6b7280"
                            fontSize={12}
                            tickFormatter={(value) => `₹${value}`}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`₹${value}`, 'Revenue']}
                            labelStyle={{ color: '#374151' }}
                            contentStyle={{ 
                              backgroundColor: '#f9fafb', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px'
                            }}
                          />
                          <Bar 
                            dataKey="revenue" 
                            fill="#16a34a"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Detailed Transaction List */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Today's Transactions</h3>
              <Button 
                onClick={handleExport}
                className="bg-golf-green text-white hover:bg-golf-light"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            
            {/* Transaction Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
                    </tr>
                  ) : transactions && Array.isArray(transactions) && transactions.length > 0 ? (
                    transactions.map((transaction: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.player}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.playerCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-golf-green">{transaction.cost}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.type === "Weekend" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No transactions today</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
