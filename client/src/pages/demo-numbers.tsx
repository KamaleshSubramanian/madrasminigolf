import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminSidebar from "@/components/admin-sidebar";
import { Phone, LogOut, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GolfLoader from "@/components/golf-loader";
import type { DemoPhoneNumber } from "@shared/schema";

export default function DemoNumbers() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [newPhoneNumber, setNewPhoneNumber] = useState("");

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

  const { data: demoNumbers, isLoading: numbersLoading } = useQuery<DemoPhoneNumber[]>({
    queryKey: ["/api/admin/demo-numbers"],
    enabled: !!user,
  });

  const addNumberMutation = useMutation({
    mutationFn: (phoneNumber: string) => 
      apiRequest("POST", "/api/admin/demo-numbers", { phoneNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/demo-numbers"] });
      setNewPhoneNumber("");
      toast({
        title: "Demo number added",
        description: "The phone number has been added to the demo list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add number",
        description: error.message || "There was an error adding the phone number.",
        variant: "destructive",
      });
    },
  });

  const removeNumberMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest("DELETE", `/api/admin/demo-numbers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/demo-numbers"] });
      toast({
        title: "Demo number removed",
        description: "The phone number has been removed from the demo list.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove number",
        description: "There was an error removing the phone number.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (error && !userLoading) {
      navigate("/admin");
    }
  }, [error, userLoading, navigate]);

  if (userLoading) {
    return <GolfLoader text="Loading admin panel" size="lg" overlay={true} />;
  }

  if (!user) {
    return null;
  }

  const handleAddNumber = () => {
    if (!newPhoneNumber.trim()) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    addNumberMutation.mutate(newPhoneNumber.trim());
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="md:ml-64 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 md:px-8 py-4 pt-16 md:pt-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Demo Phone Numbers</h1>
              <p className="text-sm md:text-base text-gray-600">Manage phone numbers used for demo games</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-golf-green self-start md:self-auto"
              size="sm"
              data-testid="button-logout-header"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Info Card */}
          <Card className="shadow-md mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">About Demo Phone Numbers</h3>
                  <p className="text-sm text-gray-600">
                    Games played by users registering with these phone numbers will be marked as demo games 
                    and will not appear in sales reports or analytics. This is useful for demonstrating the 
                    system to potential customers without affecting your actual sales data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add New Number */}
          <Card className="shadow-md mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Demo Phone Number</h3>
              <div className="flex gap-3">
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddNumber();
                    }
                  }}
                  disabled={addNumberMutation.isPending}
                  data-testid="input-phone-number"
                  className="flex-1"
                />
                <Button
                  onClick={handleAddNumber}
                  disabled={addNumberMutation.isPending || !newPhoneNumber.trim()}
                  data-testid="button-add-number"
                  className="bg-golf-green hover:bg-golf-green/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {addNumberMutation.isPending ? "Adding..." : "Add Number"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Numbers List */}
          <Card className="shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Current Demo Numbers ({demoNumbers?.length || 0})
              </h3>
              
              {numbersLoading ? (
                <div className="text-center py-8 text-gray-600">Loading demo numbers...</div>
              ) : !demoNumbers || demoNumbers.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <Phone className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No demo phone numbers configured yet.</p>
                  <p className="text-sm mt-1">Add a phone number above to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {demoNumbers.map((demoNumber) => (
                    <div
                      key={demoNumber.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      data-testid={`demo-number-${demoNumber.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <Phone className="h-4 w-4 text-golf-green" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{demoNumber.phoneNumber}</p>
                          <p className="text-sm text-gray-600">
                            Added {new Date(demoNumber.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeNumberMutation.mutate(demoNumber.id)}
                        disabled={removeNumberMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-remove-${demoNumber.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
