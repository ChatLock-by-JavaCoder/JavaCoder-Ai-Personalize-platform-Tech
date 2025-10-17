import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Trophy, Clock } from "lucide-react";

interface Profile {
  full_name: string;
  email: string;
  profile_picture_url: string | null;
}

interface ExamAttempt {
  id: string;
  exam_id: string;
  total_score: number | null;
  rank: number | null;
  status: string;
  start_time: string;
  exams: {
    title: string;
    total_marks: number;
  };
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadAttempts();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
    } else {
      setProfile(data);
      setFullName(data.full_name);
    }
    setLoading(false);
  };

  const loadAttempts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from("exam_attempts")
      .select(`
        *,
        exams (
          title,
          total_marks
        )
      `)
      .eq("user_id", user.id)
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error loading attempts:", error);
    } else {
      setAttempts(data || []);
    }
  };

  const handleUpdateProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
      setEditing(false);
      loadProfile();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={profile?.profile_picture_url || undefined} />
                  <AvatarFallback className="bg-accent text-white">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>

                {editing ? (
                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={profile?.email || ""} disabled />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleUpdateProfile}
                        className="flex-1 bg-accent hover:bg-accent/90"
                      >
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditing(false);
                          setFullName(profile?.full_name || "");
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full text-center space-y-2">
                    <h3 className="font-semibold text-lg">{profile?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditing(true)}
                      className="mt-4"
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>Your exam attempts and results</CardDescription>
            </CardHeader>
            <CardContent>
              {attempts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No exam attempts yet</p>
                  <p className="text-sm mt-2">Start your first exam to see your results here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attempts.map((attempt) => (
                    <Card key={attempt.id} className="border-border">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{attempt.exams.title}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(attempt.start_time).toLocaleDateString()}
                              </span>
                              {attempt.status === "completed" && attempt.total_score !== null && (
                                <span className="flex items-center gap-1">
                                  <Trophy className="w-4 h-4" />
                                  Score: {attempt.total_score}/{attempt.exams.total_marks}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              attempt.status === "completed" 
                                ? "bg-green-100 text-green-800" 
                                : attempt.status === "under_review"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {attempt.status === "in_progress" && "In Progress"}
                              {attempt.status === "submitted" && "Submitted"}
                              {attempt.status === "under_review" && "Under Review"}
                              {attempt.status === "completed" && "Completed"}
                            </span>
                            {attempt.rank && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Rank: #{attempt.rank}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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

export default Dashboard;
