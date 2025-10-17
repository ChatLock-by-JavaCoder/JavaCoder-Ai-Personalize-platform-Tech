import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Exam {
  id: string;
  title: string;
}

interface Attempt {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  total_score: number | null;
  status: string;
  violation_count: number;
  profiles: {
    full_name: string;
    email: string;
  };
}

export const SubmissionsReview = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchAttempts();
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    const { data, error } = await supabase
      .from("exams")
      .select("id, title")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch exams");
      console.error(error);
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  const fetchAttempts = async () => {
    const { data: attemptsData, error } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("exam_id", selectedExamId)
      .order("start_time", { ascending: false });

    if (error) {
      toast.error("Failed to fetch submissions");
      console.error(error);
      return;
    }

    // Fetch profiles separately for each attempt
    const attemptsWithProfiles = await Promise.all(
      (attemptsData || []).map(async (attempt) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", attempt.user_id)
          .single();

        return {
          ...attempt,
          profiles: profile || { full_name: "Unknown", email: "N/A" },
        };
      })
    );

    setAttempts(attemptsWithProfiles as any);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
          <CardDescription>Choose an exam to review submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedExamId && (
        <Card>
          <CardHeader>
            <CardTitle>Submissions ({attempts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Violations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="font-medium">
                        {attempt.profiles?.full_name}
                      </TableCell>
                      <TableCell>{attempt.profiles?.email}</TableCell>
                      <TableCell>
                        {new Date(attempt.start_time).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            attempt.status === "completed"
                              ? "default"
                              : attempt.status === "in_progress"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {attempt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attempt.total_score !== null ? attempt.total_score : "N/A"}
                      </TableCell>
                      <TableCell>
                        {attempt.violation_count > 0 ? (
                          <Badge variant="destructive">{attempt.violation_count}</Badge>
                        ) : (
                          <Badge variant="outline">0</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {attempts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No submissions found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
