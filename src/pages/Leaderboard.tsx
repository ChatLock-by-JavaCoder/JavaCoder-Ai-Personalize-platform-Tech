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
  profiles: {
    full_name: string;
    profile_picture_url: string | null;
  };
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data, error } = await supabase
      .from("exam_attempts")
      .select(`
        rank,
        user_id,
        total_score,
        exams (
          title
        ),
        profiles (
          full_name,
          profile_picture_url
        )
      `)
      .eq("status", "completed")
      .not("rank", "is", null)
      .order("rank", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Error loading leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } else {
      const formattedData = (data || []).map((entry: any) => ({
        rank: entry.rank,
        user_id: entry.user_id,
        total_score: entry.total_score,
        exam_title: entry.exams?.title || "Unknown Exam",
        profiles: entry.profiles,
      }));
      setEntries(formattedData);
    }
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <p>Loading leaderboard...</p>
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
            <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">
              Top performers across all exams
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Ranked by exam performance</CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No results announced yet</p>
                  <p className="text-sm mt-2">Check back after exams are completed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div
                      key={`${entry.user_id}-${entry.exam_title}`}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 hover:border-accent ${
                        entry.rank <= 3 ? "bg-accent/5" : "bg-background"
                      }`}
                    >
                      <div className="w-12 flex items-center justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={entry.profiles?.profile_picture_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {entry.profiles?.full_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{entry.profiles?.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{entry.exam_title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-accent">{entry.total_score}</p>
                        <p className="text-sm text-muted-foreground">points</p>
                      </div>
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
};

export default Leaderboard;
