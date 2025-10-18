import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { toast } from "sonner";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  total_score: number;
  exam_title: string;
  full_name: string;
  profile_picture_url: string | null;
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      // Get all completed attempts with scores
      const { data, error } = await supabase
        .from("exam_attempts")
        .select(`
          user_id,
          total_score,
          rank,
          exams!inner (
            title,
            status
          ),
          profiles!inner (
            full_name,
            profile_picture_url
          )
        `)
        .eq("status", "completed")
        .not("total_score", "is", null)
        .eq("exams.status", "results_announced") // Only show announced results
        .order("total_score", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error loading leaderboard:", error);
        toast.error("Failed to load leaderboard");
        return;
      }

      // Calculate ranks properly with tie handling
      let currentRank = 1;
      let previousScore: number | null = null;
      let skipCount = 0;

      const formattedData = (data || []).map((entry: any, index: number) => {
        const score = entry.total_score;
        
        // Handle ties - same score gets same rank
        if (previousScore !== null && score === previousScore) {
          skipCount++;
        } else {
          currentRank += skipCount;
          skipCount = 1;
          previousScore = score;
        }

        // Use stored rank if available, otherwise use calculated rank
        const rank = entry.rank || currentRank;

        return {
          rank: rank,
          user_id: entry.user_id,
          total_score: entry.total_score,
          exam_title: entry.exams?.title || "Unknown Exam",
          full_name: entry.profiles?.full_name || "Unknown User",
          profile_picture_url: entry.profiles?.profile_picture_url,
        };
      });

      setEntries(formattedData);
    } catch (error) {
      console.error("Error in loadLeaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-50 to-yellow-100 border-yellow-200";
    if (rank === 2) return "from-gray-50 to-gray-100 border-gray-200";
    if (rank === 3) return "from-orange-50 to-orange-100 border-orange-200";
    return "bg-background border-border";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading leaderboard...</p>
          <p className="text-sm text-muted-foreground mt-2">Fetching top performers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Top performers across all exams
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Top Performers
                <Trophy className="w-6 h-6 text-yellow-500" />
              </CardTitle>
              <CardDescription className="text-base">
                Ranked by exam performance - Only showing announced results
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No results available yet</p>
                  <p className="text-sm">
                    Results will appear here after exams are completed and results are announced by administrators.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry, index) => (
                    <div
                      key={`${entry.user_id}-${entry.exam_title}-${index}`}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                        entry.rank <= 3 
                          ? `bg-gradient-to-r ${getRankColor(entry.rank)} shadow-md` 
                          : "hover:border-accent/50"
                      }`}
                    >
                      <div className="w-12 flex items-center justify-center flex-shrink-0">
                        {getRankIcon(entry.rank)}
                      </div>
                      
                      <Avatar className="w-12 h-12 border-2 border-muted flex-shrink-0">
                        <AvatarImage 
                          src={entry.profile_picture_url || undefined} 
                          alt={entry.full_name}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                          {entry.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{entry.full_name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{entry.exam_title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block w-3 h-3 rounded-full ${
                            entry.rank === 1 ? 'bg-yellow-500' :
                            entry.rank === 2 ? 'bg-gray-400' :
                            entry.rank === 3 ? 'bg-orange-500' : 'bg-accent'
                          }`}></span>
                          <span className="text-xs font-medium text-muted-foreground">
                            Rank #{entry.rank}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-xl text-accent">
                          {entry.total_score.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {entries.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Showing {entries.length} top performers</span>
                    <span>Updated just now</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          {entries.length === 0 && (
            <Card className="mt-6 bg-muted/50">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">How to see results?</h3>
                  <p className="text-sm text-muted-foreground">
                    Administrators need to calculate and announce results for completed exams. 
                    Once results are announced, they will appear here automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;