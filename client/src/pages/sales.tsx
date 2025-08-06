import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/admin-sidebar";
import { Download } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Sales() {
  const [, navigate] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month">("day");

  // Check authentication
  const { data: user, isLoading: userLoading, error } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/admin/sales", selectedPeriod],
    enabled: !!user,
  });

  const { data: hourlyData, isLoading: hourlyLoading } = useQuery({
    queryKey: ["/api/admin/hourly-sales"],
    enabled: !!user && selectedPeriod === "day",
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

  useEffect(() => {
    if (error && !userLoading) {
      navigate("/admin");
    }
  }, [error, userLoading, navigate]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
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
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Sales Analytics</h2>
          <p className="text-gray-600">Track your revenue and game performance</p>
        </div>
        
        {/* Time Period Selector */}
        <Card className="shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Select Time Period</h3>
            <div className="flex space-x-2">
              {["day", "week", "month"].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  className={selectedPeriod === period ? "bg-golf-green text-white" : ""}
                  onClick={() => setSelectedPeriod(period as "day" | "week" | "month")}
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
                {selectedPeriod === "day" ? "Today's" : selectedPeriod === "week" ? "Weekly" : "Monthly"} Summary
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedPeriod === "day" ? "Hourly Revenue" : 
                 selectedPeriod === "week" ? "Daily Revenue (This Week)" : 
                 "Daily Revenue (This Month)"}
              </h3>
              <div className="h-64">
                {(selectedPeriod === "day" && hourlyLoading) || 
                 (selectedPeriod === "week" && weeklyLoading) || 
                 (selectedPeriod === "month" && monthlyLoading) ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <div>Loading chart...</div>
                  </div>
                ) : (() => {
                  const currentData = selectedPeriod === "day" ? hourlyData : 
                                    selectedPeriod === "week" ? weeklyData : monthlyData;
                  
                  if (!currentData || !Array.isArray(currentData) || currentData.length === 0) {
                    return (
                      <div className="flex items-center justify-center w-full h-full text-gray-500">
                        No data available
                      </div>
                    );
                  }

                  // Transform data for line chart
                  const chartData = currentData.map((data: any) => ({
                    name: selectedPeriod === "day" ? 
                      `${data.hour}:00` : // Hour format for day
                      data.label || `Day ${data.day}`, // Date label for week/month
                    revenue: parseFloat(data.revenue || "0"),
                    displayRevenue: `₹${parseFloat(data.revenue || "0").toLocaleString()}`
                  }));
                  
                  return (
                    <ResponsiveContainer width="100%" height="100%">
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
  );
}
