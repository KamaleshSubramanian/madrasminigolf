import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Share, RotateCcw, Trophy, Medal, Award } from "lucide-react";
import { motion } from "framer-motion";

interface PlayerScore {
  name: string;
  totalScore: number;
  scores: { [hole: number]: number };
}

export default function Results() {
  const { gameId } = useParams();
  const [, navigate] = useLocation();
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);

  const { data: gameData, isLoading } = useQuery({
    queryKey: ["/api/games", gameId],
  });

  useEffect(() => {
    if (gameData) {
      // Calculate total scores for each player
      const scoresByPlayer: { [playerName: string]: { [hole: number]: number } } = {};
      
      gameData.scores.forEach((score: any) => {
        if (!scoresByPlayer[score.playerName]) {
          scoresByPlayer[score.playerName] = {};
        }
        scoresByPlayer[score.playerName][score.hole] = score.strokes;
      });

      const players: PlayerScore[] = Object.keys(scoresByPlayer).map(playerName => {
        const scores = scoresByPlayer[playerName];
        const totalScore = Object.values(scores).reduce((sum: number, strokes: number) => sum + strokes, 0);
        
        return {
          name: playerName,
          totalScore,
          scores,
        };
      });

      // Sort by total score (lowest first)
      players.sort((a, b) => a.totalScore - b.totalScore);
      setPlayerScores(players);
    }
  }, [gameData]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return index + 1;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Mini Golf Results",
        text: `I just played mini golf at Madras Mini Golf! Check out my scores!`,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Results link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-golf-cream flex items-center justify-center">
        <div>Loading results...</div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-golf-cream flex items-center justify-center">
        <div>Game not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-golf-cream p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold text-golf-dark">Game Complete!</h2>
          <p className="text-golf-dark opacity-75">Congratulations on a great game</p>
        </motion.div>
        
        {/* Final Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="shadow-lg mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-golf-dark mb-4 text-center">Final Scores</h3>
              
              {playerScores.map((player, index) => (
                <motion.div 
                  key={player.name}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 text-sm ${
                      index === 0 ? "bg-yellow-500 text-white" :
                      index === 1 ? "bg-gray-400 text-white" :
                      index === 2 ? "bg-amber-600 text-white" :
                      "bg-gray-300 text-gray-600"
                    }`}>
                      {getRankIcon(index)}
                    </div>
                    <span className="font-semibold text-golf-dark">{player.name}</span>
                  </div>
                  <span className="text-2xl font-bold text-golf-green">{player.totalScore}</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Game Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="shadow-lg mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-golf-dark mb-4">Game Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-golf-dark">Players:</span>
                  <span className="font-semibold">{gameData.playerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-golf-dark">Date:</span>
                  <span className="font-semibold">
                    {new Date(gameData.completedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-golf-dark">Time:</span>
                  <span className="font-semibold">
                    {new Date(gameData.completedAt).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit', 
                      hour12: true 
                    })}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-golf-dark font-semibold">Total Cost:</span>
                  <span className="font-bold text-xl text-golf-green">
                    ₹{parseFloat(gameData.totalCost).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Action Buttons */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Button 
            onClick={handleShare}
            className="w-full bg-golf-green hover:bg-golf-light text-white font-bold py-3"
          >
            <Share className="mr-2 h-4 w-4" />
            Share Results
          </Button>
          <Button 
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full border-2 border-golf-green text-golf-dark font-bold py-3 hover:bg-gray-50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
