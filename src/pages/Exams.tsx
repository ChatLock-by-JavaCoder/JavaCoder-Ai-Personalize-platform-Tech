import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Exam {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  exam_type: string;
  status: string;
}

const Exams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .in("status", ["upcoming", "active", "completed", "results_announced"])
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error loading exams:", error);
      toast.error("Failed to load exams");
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "results_announced":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleStartExam = async (examId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please sign in to start the exam");
      navigate("/auth");
      return;
    }

    // Check if exam is active
    const exam = exams.find(e => e.id === examId);
    if (exam?.status !== "active") {
      toast.error("This exam is not currently active");
      return;
    }

    // Navigate to exam page (to be implemented)
     navigate(`/exam/${examId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <p>Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Available Exams</h1>
            <p className="text-muted-foreground">
              Browse and participate in our competitive programming exams
            </p>
          </div>

          {exams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">No exams available at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <Card key={exam.id} className="border-border hover:border-accent transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{exam.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {exam.description}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(exam.status)}>
                        {exam.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(exam.start_time).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{exam.duration_minutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="w-4 h-4" />
                        <span>{exam.total_marks} marks</span>
                      </div>
                    </div>
                    {exam.exam_type && (
                      <p className="text-sm text-muted-foreground mb-4">
                        Type: {exam.exam_type}
                      </p>
                    )}
                    <Button
                      onClick={() => handleStartExam(exam.id)}
                      disabled={exam.status !== "active"}
                      className="bg-accent hover:bg-accent/90"
                    >
                      {exam.status === "active" ? "Start Exam" : "Not Available"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Exams;
