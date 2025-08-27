import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertPlayerSchema } from "@shared/schema";
import { z } from "zod";
import { ArrowRight, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import GolfLoader from "@/components/golf-loader";

const registrationSchema = insertPlayerSchema.extend({
  email: z.string().optional(), // Override to make email optional
  consent: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Registration() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Function to save form data to sessionStorage
  const saveFormData = (data: Partial<RegistrationForm>) => {
    sessionStorage.setItem("registrationFormData", JSON.stringify(data));
  };

  // Function to load form data from sessionStorage
  const loadFormData = (): Partial<RegistrationForm> => {
    try {
      const saved = sessionStorage.getItem("registrationFormData");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      consent: false,
    },
  });

  // Clear form data and reset when component mounts (user clicks "Start Game")
  useEffect(() => {
    // Clear any saved form data to reset the form
    sessionStorage.removeItem("registrationFormData");
    // Reset form to empty state
    form.reset({
      name: "",
      contact: "",
      email: "",
      consent: false,
    });
  }, [form]);

  // Also check for updates when component becomes visible (user returns from terms)
  useEffect(() => {
    const handleFocus = () => {
      const savedData = loadFormData();
      if (savedData && typeof savedData.consent !== 'undefined') {
        form.setValue('consent', savedData.consent);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    // Also run when component mounts/becomes visible
    handleFocus();
    
    return () => window.removeEventListener('focus', handleFocus);
  }, [form]);

  // Save form data when values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      saveFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Save current form data before navigating
    saveFormData(form.getValues());
    navigate("/terms");
  };

  const registerMutation = useMutation({
    mutationFn: (data: Omit<RegistrationForm, "consent">) => 
      apiRequest("POST", "/api/players", data),
    onSuccess: async (response) => {
      const player = await response.json();
      // Store player data in sessionStorage for next steps
      sessionStorage.setItem("currentPlayer", JSON.stringify(player));
      navigate("/players");
    },
    onError: () => {
      toast({
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    const { consent, ...playerData } = data;
    // Clear saved form data on successful submission
    sessionStorage.removeItem("registrationFormData");
    registerMutation.mutate(playerData);
  };

  const handleCancel = () => {
    // Reset form data
    form.reset({
      name: "",
      contact: "",
      email: "",
      consent: false,
    });
    // Clear saved form data
    sessionStorage.removeItem("registrationFormData");
    // Navigate back to landing page
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-golf-cream p-4">
      {registerMutation.isPending && (
        <GolfLoader text="Registering player" size="lg" overlay={true} />
      )}
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📝</div>
          <h2 className="text-2xl font-bold text-golf-dark">Player Registration</h2>
          <p className="text-golf-dark opacity-75">Let's get to know you!</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-golf-dark mb-2">
            <span>Step 1 of 3</span>
            <span>33%</span>
          </div>
          <Progress value={33} className="h-2" />
        </div>
        
        {/* Registration Form */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-golf-dark font-medium">Full Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          className="border-2 border-gray-200 focus:border-golf-green"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-golf-dark font-medium">Contact Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+91 9876543210" 
                          className="border-2 border-gray-200 focus:border-golf-green"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-golf-dark font-medium">Email Address (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="your.email@example.com" 
                          className="border-2 border-gray-200 focus:border-golf-green"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-golf-dark">
                          I agree to the{" "}
                          <button 
                            type="button"
                            onClick={handleTermsClick}
                            className="text-golf-green underline hover:text-golf-light transition-colors inline-flex items-center gap-1"
                            data-testid="link-terms"
                          >
                            <FileText className="h-3 w-3" />
                            Terms & Conditions
                          </button>
                          {" "}and consent to receive updates about my game.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-golf-green hover:bg-golf-light text-white font-bold py-3"
                  disabled={registerMutation.isPending}
                  data-testid="button-continue"
                >
                  {registerMutation.isPending ? "Registering..." : "Continue to Player Setup"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button 
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  className="w-full border-2 border-gray-300 text-gray-600 font-medium py-3 hover:bg-gray-50 mt-3"
                  disabled={registerMutation.isPending}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
