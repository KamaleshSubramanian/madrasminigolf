import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GolfLoader from "@/components/golf-loader";

// Custom hole names
const HOLE_NAMES = {
  1: "Napier Straight",
  2: "Courtroom Chaos",
  3: "Lighthouse challenge",
  4: "Kollywood's Wlak of Fame",
  5: "The Helicopter",
  6: "Metro Split",
  7: "Traffic Jam"
};

export default function Gameplay() {
  const { gameId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [currentHole, setCurrentHole] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [scoresByHole, setScoresByHole] = useState<{ [hole: number]: { [playerName: string]: number } }>({});
  const [manualInputFocused, setManualInputFocused] = useState<{ [playerName: string]: boolean }>({});

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
    
    // Initialize or load scoresByHole from sessionStorage
    const storedScores = sessionStorage.getItem(`scoresByHole:${gameId}`);
    let initialScoresByHole: { [hole: number]: { [playerName: string]: number } } = {};
    
    if (storedScores) {
      initialScoresByHole = JSON.parse(storedScores);
    }
    
    // Ensure all holes and players are initialized
    for (let hole = 1; hole <= 7; hole++) {
      if (!initialScoresByHole[hole]) {
        initialScoresByHole[hole] = {};
      }
      names.forEach((name: string) => {
        if (initialScoresByHole[hole][name] === undefined) {
          initialScoresByHole[hole][name] = 0;
        }
      });
    }
    
    setScoresByHole(initialScoresByHole);
  }, [navigate, gameId]);

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
    setScoresByHole(prev => {
      const updated = {
        ...prev,
        [currentHole]: {
          ...prev[currentHole],
          [playerName]: strokes,
        }
      };
      // Persist to sessionStorage
      sessionStorage.setItem(`scoresByHole:${gameId}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleManualScore = (playerName: string, strokes: string) => {
    // Allow empty string to clear the field
    if (strokes === "") {
      setScoresByHole(prev => {
        const updated = {
          ...prev,
          [currentHole]: {
            ...prev[currentHole],
            [playerName]: 0,
          }
        };
        // Persist to sessionStorage
        sessionStorage.setItem(`scoresByHole:${gameId}`, JSON.stringify(updated));
        return updated;
      });
      return;
    }
    
    // Only allow numeric characters
    if (!/^\d+$/.test(strokes)) {
      return;
    }
    
    const strokeCount = parseInt(strokes);
    // Validate range 1-40 (allowing high stroke counts)
    if (strokeCount >= 1 && strokeCount <= 40) {
      setScoresByHole(prev => {
        const updated = {
          ...prev,
          [currentHole]: {
            ...prev[currentHole],
            [playerName]: strokeCount,
          }
        };
        // Persist to sessionStorage
        sessionStorage.setItem(`scoresByHole:${gameId}`, JSON.stringify(updated));
        return updated;
      });
    }
  };



  const calculateTotalScore = (playerName: string) => {
    // Calculate total from all completed holes
    let total = 0;
    for (let hole = 1; hole < currentHole; hole++) {
      if (scoresByHole[hole] && scoresByHole[hole][playerName] !== undefined) {
        total += scoresByHole[hole][playerName];
      }
    }
    return total;
  };
  
  const getCurrentHoleScore = (playerName: string) => {
    return scoresByHole[currentHole]?.[playerName] || 0;
  };

  const handleNextHole = () => {
    // Validate all players have scores (allow 0 for holes 5 and 7)
    const missingScores = playerNames.filter(name => {
      const score = getCurrentHoleScore(name);
      if (currentHole === 5 || currentHole === 7) {
        // For holes 5 and 7, allow 0 as a valid score
        return score === undefined || score === null;
      } else {
        // For other holes, require score > 0
        return !score || score === 0;
      }
    });
    
    if (missingScores.length > 0) {
      toast({
        title: "Missing scores",
        description: "Please enter scores for all players before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (currentHole === 7) {
      // Game completed - calculate final totals from scoresByHole
      const scoresData = playerNames.map(playerName => {
        let totalStrokes = 0;
        for (let hole = 1; hole <= 7; hole++) {
          if (scoresByHole[hole] && scoresByHole[hole][playerName] !== undefined) {
            totalStrokes += scoresByHole[hole][playerName];
          }
        }
        return {
          playerName,
          hole: 1, // Just using hole 1 as a placeholder since we only store total
          strokes: totalStrokes,
        };
      });

      // Store local completion time
      const completionTime = new Date().toISOString();
      sessionStorage.setItem('gameCompletionTime', completionTime);
      saveScoresMutation.mutate(scoresData);
    } else {
      // Move to next hole (scores are preserved in scoresByHole)
      setCurrentHole(prev => prev + 1);
      
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousHole = () => {
    if (currentHole > 1) {
      setCurrentHole(prev => prev - 1);
      
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!playerNames.length) {
    return <GolfLoader text="Loading game" size="lg" overlay={true} />;
  }

  return (
    <div className="min-h-screen bg-golf-cream p-4">
      {saveScoresMutation.isPending && (
        <GolfLoader text="Saving game scores" size="lg" overlay={true} />
      )}
      <div className="max-w-md mx-auto pt-8">
        {/* Header with Hole Info */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <div className="text-5xl mb-2">⛳</div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white animate-pulse">
              {currentHole}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-golf-dark bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            {HOLE_NAMES[currentHole as keyof typeof HOLE_NAMES]}
          </h2>
          <p className="text-golf-dark opacity-75">Enter scores for each player</p>
        </div>
        
        {/* Progress Indicators */}
        <div className="flex justify-center space-x-3 mb-8">
          {Array.from({ length: 7 }, (_, i) => i + 1).map(hole => (
            <div
              key={`hole-${hole}`}
              className={`relative flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                hole < currentHole
                  ? "w-8 h-8 rounded-full bg-golf-green text-white shadow-md"
                  : hole === currentHole
                  ? "w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg border-3 border-white transform scale-105 animate-pulse"
                  : "w-8 h-8 rounded-full bg-gray-300 text-gray-600"
              }`}
            >
              {hole === currentHole && (
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-75 blur-sm animate-pulse"></div>
              )}
              <span className="relative z-10 font-extrabold">
                {hole}
              </span>
              {hole < currentHole && (
                <div className="absolute -top-1 -right-1">
                  <Flag className="w-4 h-4 text-red-500 drop-shadow-sm" fill="currentColor" />
                </div>
              )}
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
                  <div className="grid grid-cols-6 gap-3 flex-1">
                    {(currentHole === 5 ? [-2, -1, 0, 1, 2, 3] : currentHole === 7 ? [-2, -1, 0, 1, 2, 3] : [1, 2, 3, 4, 5, 6]).map(strokes => (
                      <Button
                        key={`${playerName}-stroke-${strokes}`}
                        variant={getCurrentHoleScore(playerName) === strokes ? "default" : "outline"}
                        className={`py-3 font-bold transition-all duration-200 ${
                          getCurrentHoleScore(playerName) === strokes
                            ? "bg-golf-green text-white border-golf-green"
                            : "bg-gray-100 border-2 border-gray-200 hover:border-golf-green hover:bg-golf-green hover:text-white"
                        }`}
                        onClick={() => handleScoreSelect(playerName, strokes)}
                      >
                        {strokes}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Manual Input for 7+ */}
                  <div className="flex-shrink-0">
                    <Input
                      type="text"
                      className="w-20 h-10 text-center border-2 border-gray-200 focus:border-golf-green text-sm font-bold"
                      onChange={(e) => handleManualScore(playerName, e.target.value)}
                      value={manualInputFocused[playerName] ? (getCurrentHoleScore(playerName) || "").toString() : (getCurrentHoleScore(playerName) >= (currentHole === 5 ? 4 : currentHole === 7 ? 4 : 7) ? getCurrentHoleScore(playerName).toString() : "")}
                      placeholder={currentHole === 5 ? "4+" : currentHole === 7 ? "4+" : "7+"}
                      maxLength={2}
                      onFocus={() => {
                        setManualInputFocused(prev => ({ ...prev, [playerName]: true }));
                      }}
                      onBlur={() => {
                        setManualInputFocused(prev => ({ ...prev, [playerName]: false }));
                      }}
                    />
                  </div>
                </div>
                
                {/* Individual Player Total (from hole 2 onwards) */}
                {currentHole > 1 && (
                  <div className="bg-golf-green rounded-lg p-3 text-center shadow-md">
                    <div className="text-white font-bold text-lg">
                      Total: {calculateTotalScore(playerName)} strokes
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
