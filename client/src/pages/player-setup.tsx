import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Play, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GolfLoader from "@/components/golf-loader";

export default function PlayerSetup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", "", ""]);
  const [showRulesDialog, setShowRulesDialog] = useState(false);

  // Get current pricing to determine weekend/weekday
  const { data: pricing } = useQuery({
    queryKey: ["/api/pricing"],
  });

  useEffect(() => {
    // Check if player is registered
    const currentPlayer = sessionStorage.getItem("currentPlayer");
    if (!currentPlayer) {
      navigate("/register");
      return;
    }

    // Update player names array when count changes
    const newNames = Array(selectedPlayerCount).fill("").map((_, i) => playerNames[i] || "");
    setPlayerNames(newNames);
  }, [selectedPlayerCount, navigate]);

  const createGameMutation = useMutation({
    mutationFn: (gameData: any) => apiRequest("POST", "/api/games", gameData),
    onSuccess: async (response) => {
      const game = await response.json();
      // Store game data and player names for gameplay
      sessionStorage.setItem("currentGame", JSON.stringify(game));
      sessionStorage.setItem("playerNames", JSON.stringify(playerNames.filter(name => name.trim())));
      // Store game start time for duration calculation
      sessionStorage.setItem("gameStartTime", new Date().toISOString());
      navigate(`/game/${game.id}`);
    },
    onError: () => {
      toast({
        title: "Game creation failed",
        description: "There was an error starting the game. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlayerCountSelect = (count: number) => {
    setSelectedPlayerCount(count);
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStartGame = () => {
    const filledNames = playerNames.filter(name => name.trim());
    
    if (filledNames.length !== selectedPlayerCount) {
      toast({
        title: "Missing player names",
        description: "Please enter names for all players before starting the game.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate names
    const uniqueNames = new Set(filledNames.map(name => name.trim().toLowerCase()));
    if (uniqueNames.size !== filledNames.length) {
      toast({
        title: "Duplicate player names",
        description: "Each player must have a unique name. Please update any duplicates.",
        variant: "destructive",
      });
      return;
    }

    // Show rules dialog instead of starting game directly
    setShowRulesDialog(true);
  };

  const handleProceedAfterRules = () => {
    const currentPlayer = JSON.parse(sessionStorage.getItem("currentPlayer") || "{}");
    const filledNames = playerNames.filter(name => name.trim());
    
    // Check if today is weekend (Saturday = 6, Sunday = 0)
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;

    setShowRulesDialog(false);
    createGameMutation.mutate({
      playerId: currentPlayer.id,
      playerNames: filledNames,
      playerCount: selectedPlayerCount,
      isWeekend,
    });
  };

  return (
    <div className="min-h-screen bg-golf-cream p-4">
      {createGameMutation.isPending && (
        <GolfLoader text="Starting game" size="lg" overlay={true} />
      )}
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">👥</div>
          <h2 className="text-2xl font-bold text-golf-dark">Player Setup</h2>
          <p className="text-golf-dark opacity-75">How many players today?</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-golf-dark mb-2">
            <span>Step 2 of 3</span>
            <span>67%</span>
          </div>
          <Progress value={67} className="h-2" />
        </div>
        
        {/* Player Count Selection */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-golf-dark mb-4">Number of Players</h3>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                <Button
                  key={num}
                  variant={selectedPlayerCount === num ? "default" : "outline"}
                  className={`py-3 font-bold transition-all duration-200 ${
                    selectedPlayerCount === num 
                      ? "bg-golf-green text-white hover:bg-golf-light" 
                      : "border-2 border-gray-200 hover:border-golf-green hover:bg-golf-green hover:text-white"
                  }`}
                  onClick={() => handlePlayerCountSelect(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Player Names */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-golf-dark mb-4">Player Names</h3>
            <div className="space-y-4">
              {Array.from({ length: selectedPlayerCount }, (_, i) => (
                <div key={i} className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-golf-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <Input
                    placeholder={`Player ${i + 1} name`}
                    value={playerNames[i] || ""}
                    onChange={(e) => handlePlayerNameChange(i, e.target.value)}
                    className="pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-golf-green"
                  />
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleStartGame}
              disabled={createGameMutation.isPending}
              className="w-full bg-golf-green hover:bg-golf-light text-white font-bold py-3 mt-6"
            >
              {createGameMutation.isPending ? "Starting Game..." : "Start Playing"}
              <Play className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rules Dialog */}
      <Dialog open={showRulesDialog} onOpenChange={setShowRulesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-golf-dark font-bold text-xl">HOW TO PLAY</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-golf-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  <span className="font-semibold text-golf-dark">Start from the mat/line</span>
                  <span className="text-gray-600"> → Place the ball at the starting spot for each hole.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-golf-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  <span className="font-semibold text-golf-dark">One hit at a time</span>
                  <span className="text-gray-600"> → Everyone takes turns hitting their ball with the putter.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-golf-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                <div>
                  <span className="font-semibold text-golf-dark">Count every stroke</span>
                  <span className="text-gray-600"> → Each hit counts as 1 point, even if the ball doesn't go far.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-golf-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                <div>
                  <span className="font-semibold text-golf-dark">Stay in bounds</span>
                  <span className="text-gray-600"> → If the ball goes out, put it back where it went out and add +1 point.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-golf-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">5</span>
                <div>
                  <span className="font-semibold text-golf-dark">Lowest score wins</span>
                  <span className="text-gray-600"> → After all holes, the person with the fewest strokes is the winner!</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleProceedAfterRules}
              className="w-full bg-golf-green hover:bg-golf-light text-white font-bold py-3"
              data-testid="button-proceed"
            >
              Got It - Let's Play!
              <Play className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
