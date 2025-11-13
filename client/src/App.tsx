import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import About from "@/pages/about";
import Landing from "@/pages/landing";
import Registration from "@/pages/registration";
import TermsAndConditions from "@/pages/terms-and-conditions";
import PlayerSetup from "@/pages/player-setup";
import Gameplay from "@/pages/gameplay";
import Results from "@/pages/results";
import ResultsShare from "@/pages/results-share";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import Sales from "@/pages/sales";
import Pricing from "@/pages/pricing";
import DemoNumbers from "@/pages/demo-numbers";

function Router() {
  return (
    <Switch>
      {/* Player Flow */}
      <Route path="/" component={Landing} />
      <Route path="/about" component={About} />
      <Route path="/register" component={Registration} />
      <Route path="/registration" component={Registration} />
      <Route path="/terms" component={TermsAndConditions} />
      <Route path="/players" component={PlayerSetup} />
      <Route path="/game/:gameId" component={Gameplay} />
      <Route path="/results/:gameId" component={Results} />
      <Route path="/results/share/:gameId" component={ResultsShare} />
      
      {/* Admin Flow */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/sales" component={Sales} />
      <Route path="/admin/pricing" component={Pricing} />
      <Route path="/admin/demo-numbers" component={DemoNumbers} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
