import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminSidebar from "@/components/admin-sidebar";
import { Calendar, CalendarDays, Save, RotateCcw, Calculator, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPricingSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import GolfLoader from "@/components/golf-loader";

const pricingFormSchema = insertPricingSchema.omit({ updatedBy: true });
type PricingForm = z.infer<typeof pricingFormSchema>;

export default function Pricing() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    fetch("/api/admin/logout", { method: "POST" })
      .then(() => {
        queryClient.clear();
        navigate("/admin");
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of the admin panel.",
        });
      })
      .catch(() => {
        toast({
          title: "Logout failed",
          description: "There was an error logging out.",
          variant: "destructive",
        });
      });
  };

  // Check authentication
  const { data: user, isLoading: userLoading, error } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  const { data: currentPricing, isLoading: pricingLoading } = useQuery({
    queryKey: ["/api/pricing"],
    enabled: !!user,
  });

  const { data: pricingHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/admin/pricing-history"],
    enabled: !!user,
  });

  const form = useForm<PricingForm>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      weekdayPrice: "60.00",
      weekendPrice: "80.00",
    },
  });

  useEffect(() => {
    if (error && !userLoading) {
      navigate("/admin");
    }
  }, [error, userLoading, navigate]);

  useEffect(() => {
    if (currentPricing && typeof currentPricing === 'object' && 'weekdayPrice' in currentPricing) {
      form.reset({
        weekdayPrice: (currentPricing as any).weekdayPrice,
        weekendPrice: (currentPricing as any).weekendPrice,
      });
    }
  }, [currentPricing, form]);

  const updatePricingMutation = useMutation({
    mutationFn: (data: PricingForm) => apiRequest("POST", "/api/admin/pricing", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing-history"] });
      toast({
        title: "Pricing updated successfully",
        description: "The new pricing has been saved and is now active.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update pricing",
        description: "There was an error updating the pricing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PricingForm) => {
    updatePricingMutation.mutate(data);
  };

  const handleReset = () => {
    if (currentPricing && typeof currentPricing === 'object' && 'weekdayPrice' in currentPricing) {
      form.reset({
        weekdayPrice: (currentPricing as any).weekdayPrice,
        weekendPrice: (currentPricing as any).weekendPrice,
      });
    }
  };

  if (userLoading) {
    return <GolfLoader text="Loading admin panel" size="lg" overlay={true} />;
  }

  if (!user) {
    return null;
  }

  // Calculate estimated revenue impact
  const weekdayPrice = parseFloat(form.watch("weekdayPrice") || "0");
  const weekendPrice = parseFloat(form.watch("weekendPrice") || "0");
  const avgGamesPerDay = 24; // Estimated
  const avgPlayersPerGame = 3; // Estimated
  const monthlyRevenue = ((weekdayPrice * 22) + (weekendPrice * 8)) * avgGamesPerDay * avgPlayersPerGame;
  const currentMonthlyRevenue = currentPricing && typeof currentPricing === 'object' && 'weekdayPrice' in currentPricing
    ? ((parseFloat((currentPricing as any).weekdayPrice) * 22) + (parseFloat((currentPricing as any).weekendPrice) * 8)) * avgGamesPerDay * avgPlayersPerGame
    : 0;
  const increaseImpact = monthlyRevenue - currentMonthlyRevenue;

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="ml-64 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pricing Management</h1>
            <p className="text-gray-600">Set and manage player pricing for different days</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-golf-green"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="p-8">
        
        {/* Current Pricing Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Weekday Pricing */}
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Weekday Pricing</h3>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-golf-green mb-2">
                  {pricingLoading ? "..." : `₹${currentPricing && typeof currentPricing === 'object' && 'weekdayPrice' in currentPricing ? (currentPricing as any).weekdayPrice : "60.00"}`}
                </div>
                <p className="text-gray-600">Per Player</p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Days:</strong> Monday - Friday</p>
                <p><strong>Last Updated:</strong> {
                  currentPricing && typeof currentPricing === 'object' && 'updatedAt' in currentPricing ? new Date((currentPricing as any).updatedAt).toLocaleDateString() : "Not set"
                }</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Weekend Pricing */}
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Weekend Pricing</h3>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CalendarDays className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-golf-green mb-2">
                  {pricingLoading ? "..." : `₹${currentPricing && typeof currentPricing === 'object' && 'weekendPrice' in currentPricing ? (currentPricing as any).weekendPrice : "80.00"}`}
                </div>
                <p className="text-gray-600">Per Player</p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Days:</strong> Saturday - Sunday</p>
                <p><strong>Last Updated:</strong> {
                  currentPricing && typeof currentPricing === 'object' && 'updatedAt' in currentPricing ? new Date((currentPricing as any).updatedAt).toLocaleDateString() : "Not set"
                }</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Pricing Update Form */}
        <Card className="shadow-md mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Update Pricing</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="weekdayPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                        Weekday Price (Per Player)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500">₹</span>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="60.00"
                            className="pl-8 pr-4 border-2 border-gray-200 focus:border-golf-green"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <p className="text-sm text-gray-600">Monday through Friday pricing</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weekendPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-orange-600" />
                        Weekend Price (Per Player)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500">₹</span>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="80.00"
                            className="pl-8 pr-4 border-2 border-gray-200 focus:border-golf-green"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <p className="text-sm text-gray-600">Saturday and Sunday pricing</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <Button 
                type="button"
                variant="outline"
                onClick={handleReset}
                className="px-6 py-2"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={updatePricingMutation.isPending}
                className="px-6 py-2 bg-golf-green text-white hover:bg-golf-light"
              >
                <Save className="mr-2 h-4 w-4" />
                {updatePricingMutation.isPending ? "Updating..." : "Update Pricing"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Pricing History */}
        <Card className="shadow-md mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Pricing History</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weekday Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weekend Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historyLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">
                        <div className="flex justify-center py-4">
                          <GolfLoader text="Loading history" size="sm" />
                        </div>
                      </td>
                    </tr>
                  ) : pricingHistory && Array.isArray(pricingHistory) && pricingHistory.length > 0 ? (
                    pricingHistory.map((entry: any, index: number) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(entry.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-golf-green">
                          ₹{entry.weekdayPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-golf-green">
                          ₹{entry.weekendPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Admin User
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            index === 0 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {index === 0 ? "Current" : "Previous"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No pricing history available</td>
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
