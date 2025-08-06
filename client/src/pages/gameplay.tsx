import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ArrowRight, Flag, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Gameplay() {
  const { gameId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [currentHole, setCurrentHole] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [totalScores, setTotalScores] = useState<{ [playerName: string]: number }>({});
  const [holeScores, setHoleScores] = useState<{ [playerName: string]: number }>({});

  useEffect(() => {
    // Load player names and game data
    const storedNames = sessionStorage.getItem("playerNames");
    const currentGame = sessionStorage.getItem("currentGame");
    
    if (!storedNames || !currentGame) {
      navigate("/");
      return;
    }
    
    const names = JSON.parse(storedNames);
    setPlayerNames(names);
    
    // Initialize scores
    const initialTotalScores: { [playerName: string]: number } = {};
    const initialHoleScores: { [playerName: string]: number } = {};
    
    names.forEach((name: string) => {
      initialTotalScores[name] = 0;
      initialHoleScores[name] = 0;
    });
    
    setTotalScores(initialTotalScores);
    setHoleScores(initialHoleScores);
  }, [navigate]);

  const saveScoresMutation = useMutation({
    mutationFn: (scoresData: any[]) => apiRequest("POST", `/api/games/${gameId}/scores`, scoresData),
    onSuccess: () => {
      // Game completed, navigate to results
      navigate(`/results/${gameId}`);
    },
    onError: () => {
      toast({
        title: "Error saving scores",
        description: "There was an error saving the scores. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleScoreSelect = (playerName: string, strokes: number) => {
    setHoleScores(prev => ({
      ...prev,
      [playerName]: strokes,
    }));
  };

  const handleManualScore = (playerName: string, strokes: string) => {
    const strokeCount = parseInt(strokes);
    if (strokeCount >= 7 && strokeCount <= 20) {
      setHoleScores(prev => ({
        ...prev,
        [playerName]: strokeCount,
      }));
    }
  };

  const incrementScore = (playerName: string) => {
    const currentScore = holeScores[playerName] || 7;
    if (currentScore < 20) {
      setHoleScores(prev => ({
        ...prev,
        [playerName]: currentScore + 1,
      }));
    }
  };

  const decrementScore = (playerName: string) => {
    const currentScore = holeScores[playerName] || 8;
    if (currentScore > 7) {
      setHoleScores(prev => ({
        ...prev,
        [playerName]: currentScore - 1,
      }));
    }
  };

  const calculateTotalScore = (playerName: string) => {
    return totalScores[playerName] || 0;
  };

  const handleNextHole = () => {
    // Validate all players have scores
    const missingScores = playerNames.filter(name => !holeScores[name] || holeScores[name] === 0);
    
    if (missingScores.length > 0) {
      toast({
        title: "Missing scores",
        description: "Please enter scores for all players before continuing.",
        variant: "destructive",
      });
      return;
    }

    // Update total scores with current hole scores
    const updatedTotalScores = { ...totalScores };
    playerNames.forEach(playerName => {
      updatedTotalScores[playerName] += holeScores[playerName];
    });
    setTotalScores(updatedTotalScores);

    if (currentHole === 7) {
      // Game completed - save only total scores
      const scoresData = playerNames.map(playerName => ({
        playerName,
        hole: 1, // Just using hole 1 as a placeholder since we only store total
        strokes: updatedTotalScores[playerName],
      }));

      saveScoresMutation.mutate(scoresData);
    } else {
      // Move to next hole
      setCurrentHole(prev => prev + 1);
      // Reset hole scores for next hole
      const resetHoleScores: { [playerName: string]: number } = {};
      playerNames.forEach(name => {
        resetHoleScores[name] = 0;
      });
      setHoleScores(resetHoleScores);
    }
  };

  const handlePreviousHole = () => {
    if (currentHole > 1) {
      setCurrentHole(prev => prev - 1);
      // Reset hole scores for previous hole
      const resetHoleScores: { [playerName: string]: number } = {};
      playerNames.forEach(name => {
        resetHoleScores[name] = 0;
      });
      setHoleScores(resetHoleScores);
    }
  };

  if (!playerNames.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-golf-cream p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header with Hole Info */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">⛳</div>
          <h2 className="text-3xl font-bold text-golf-dark">Hole {currentHole}</h2>
          <p className="text-golf-dark opacity-75">Enter scores for each player</p>
        </div>
        
        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2 mb-8">
          {Array.from({ length: 7 }, (_, i) => i + 1).map(hole => (
            <div
              key={`hole-${hole}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                hole < currentHole
                  ? "bg-golf-green text-white"
                  : hole === currentHole
                  ? "bg-golf-light text-white border-2 border-golf-dark"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {hole}
            </div>
          ))}
        </div>
        


        {/* Player Scoring */}
        <div className="space-y-6">
          {playerNames.map((playerName, index) => (
            <Card key={`player-${index}-${playerName}`} className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-golf-green text-white rounded-full flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-golf-dark">{playerName}</h3>
                </div>
                
                {/* Score Buttons and Incrementer */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="grid grid-cols-6 gap-2 flex-1">
                    {[1, 2, 3, 4, 5, 6].map(strokes => (
                      <Button
                        key={`${playerName}-stroke-${strokes}`}
                        variant={holeScores[playerName] === strokes ? "default" : "outline"}
                        className={`py-3 font-bold transition-all duration-200 ${
                          holeScores[playerName] === strokes
                            ? "bg-golf-green text-white border-golf-green"
                            : "bg-gray-100 border-2 border-gray-200 hover:border-golf-green hover:bg-golf-green hover:text-white"
                        }`}
                        onClick={() => handleScoreSelect(playerName, strokes)}
                      >
                        {strokes}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Inline Incrementer for 7+ */}
                  <div className="flex items-center border-2 border-gray-200 rounded-md focus-within:border-golf-green">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => decrementScore(playerName)}
                      className="h-10 w-8 p-0 hover:bg-gray-100 rounded-r-none"
                      disabled={(holeScores[playerName] || 7) <= 7}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="7"
                      max="20"
                      className="w-12 h-10 text-center border-0 focus:ring-0 focus-visible:ring-0 rounded-none text-sm font-bold"
                      onChange={(e) => handleManualScore(playerName, e.target.value)}
                      value={holeScores[playerName] > 6 ? holeScores[playerName] : ""}
                      placeholder="7+"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => incrementScore(playerName)}
                      className="h-10 w-8 p-0 hover:bg-gray-100 rounded-l-none"
                      disabled={(holeScores[playerName] || 7) >= 20}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Individual Player Total (from hole 2 onwards) */}
                {currentHole > 1 && (
                  <div className="bg-golf-light/20 rounded-lg p-3 text-center">
                    <div className="text-sm text-golf-dark font-medium">Total Score</div>
                    <div className="text-2xl font-bold text-golf-green">
                      {calculateTotalScore(playerName)} strokes
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex space-x-4 mt-8">
          <Button
            onClick={handlePreviousHole}
            disabled={currentHole === 1}
            variant="outline"
            className="flex-1 font-bold py-3 border-2 border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Hole
          </Button>
          <Button
            onClick={handleNextHole}
            disabled={saveScoresMutation.isPending}
            className="flex-1 bg-golf-green hover:bg-golf-light text-white font-bold py-3"
          >
            {saveScoresMutation.isPending ? "Saving..." : currentHole === 7 ? "Finish Game" : "Next Hole"}
            {currentHole === 7 ? <Flag className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
