import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { ExamsList } from "@/components/admin/ExamsList";
import { QuestionManager } from "@/components/admin/QuestionManager";
import { SubmissionsReview } from "@/components/admin/SubmissionsReview";
import { ResultsCalculator } from "@/components/admin/ResultsCalculator";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [examType, setExamType] = useState("");
  const [status, setStatus] = useState<string>("draft");

  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (error || !data) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("exams")
      .insert([{
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: parseInt(duration),
        total_marks: parseInt(totalMarks),
        exam_type: examType,
        status: status as any,
        created_by: user.id,
      }]);

    if (error) {
      console.error("Error creating exam:", error);
      toast.error("Failed to create exam");
    } else {
      toast.success("Exam created successfully!");
      // Reset form
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setDuration("");
      setTotalMarks("");
      setExamType("");
      setStatus("draft");
    }
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
              <p className="text-muted-foreground">
                Manage exams and monitor platform activity
              </p>
            </div>
            <Button 
              onClick={() => navigate("/admin/users")}
              variant="outline"
            >
              Manage Admin Users
            </Button>
          </div>

          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="create">Create Exam</TabsTrigger>
              <TabsTrigger value="exams">All Exams</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-accent" />
                    <CardTitle>Create New Exam</CardTitle>
                  </div>
                  <CardDescription>
                    Set up a new competitive programming exam
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateExam} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Exam Title *</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          placeholder="e.g., Java Fundamentals Challenge"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="examType">Exam Type</Label>
                        <Input
                          id="examType"
                          value={examType}
                          onChange={(e) => setExamType(e.target.value)}
                          placeholder="e.g., Coding, Database, Algorithms"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide details about the exam..."
                        rows={3}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time *</Label>
                        <Input
                          id="startTime"
                          type="datetime-local"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time *</Label>
                        <Input
                          id="endTime"
                          type="datetime-local"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes) *</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          required
                          min="1"
                          placeholder="60"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalMarks">Total Marks *</Label>
                        <Input
                          id="totalMarks"
                          type="number"
                          value={totalMarks}
                          onChange={(e) => setTotalMarks(e.target.value)}
                          required
                          min="1"
                          placeholder="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="results_announced">Results Announced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-accent hover:bg-accent/90"
                      disabled={creating}
                    >
                      {creating ? "Creating..." : "Create Exam"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exams">
              <ExamsList />
            </TabsContent>

            <TabsContent value="questions">
              <QuestionManager />
            </TabsContent>

            <TabsContent value="submissions">
              <SubmissionsReview />
            </TabsContent>

            <TabsContent value="results">
              <ResultsCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
