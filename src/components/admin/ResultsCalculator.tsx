import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Exam {
  id: string;
  title: string;
  status: string;
}

export const ResultsCalculator = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [calculating, setCalculating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const { data, error } = await supabase
      .from("exams")
      .select("id, title, status")
      .in("status", ["completed", "results_announced"])
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch exams");
      console.error(error);
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  const calculateResults = async () => {
    if (!selectedExamId) {
      toast.error("Please select an exam");
      return;
    }

    setCalculating(true);

    try {
      // Fetch all attempts for this exam
      const { data: attempts, error: attemptsError } = await supabase
        .from("exam_attempts")
        .select("id, user_id")
        .eq("exam_id", selectedExamId)
        .eq("status", "completed");

      if (attemptsError) throw attemptsError;

      if (!attempts || attempts.length === 0) {
        toast.error("No completed attempts found");
        setCalculating(false);
        return;
      }

      // Fetch questions for this exam
      const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select("id, correct_answer, marks, negative_marks")
        .eq("exam_id", selectedExamId);

      if (questionsError) throw questionsError;

      // Calculate scores for each attempt
      for (const attempt of attempts) {
        const { data: answers, error: answersError } = await supabase
          .from("answers")
          .select("question_id, selected_answer")
          .eq("attempt_id", attempt.id);

        if (answersError) throw answersError;

        let totalScore = 0;
        answers?.forEach((answer) => {
          const question = questions?.find((q) => q.id === answer.question_id);
          if (question && answer.selected_answer) {
            if (answer.selected_answer === question.correct_answer) {
              totalScore += question.marks;
            } else {
              totalScore -= question.negative_marks;
            }
          }
        });

        // Update attempt with calculated score
        const { error: updateError } = await supabase
          .from("exam_attempts")
          .update({ total_score: totalScore })
          .eq("id", attempt.id);

        if (updateError) throw updateError;
      }

      // Calculate ranks
      const { data: sortedAttempts, error: sortError } = await supabase
        .from("exam_attempts")
        .select("id, total_score")
        .eq("exam_id", selectedExamId)
        .eq("status", "completed")
        .order("total_score", { ascending: false });

      if (sortError) throw sortError;

      // Update ranks
      for (let i = 0; i < (sortedAttempts?.length || 0); i++) {
        const { error: rankError } = await supabase
          .from("exam_attempts")
          .update({ rank: i + 1 })
          .eq("id", sortedAttempts![i].id);

        if (rankError) throw rankError;
      }

      // Update exam status to results_announced
      const { error: statusError } = await supabase
        .from("exams")
        .update({ status: "results_announced" })
        .eq("id", selectedExamId);

      if (statusError) throw statusError;

      toast.success(`Results calculated for ${attempts.length} submissions!`);
      fetchExams();
    } catch (error) {
      console.error("Error calculating results:", error);
      toast.error("Failed to calculate results");
    }

    setCalculating(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent" />
            <CardTitle>Calculate & Announce Results</CardTitle>
          </div>
          <CardDescription>
            Automatically calculate scores, assign ranks, and announce results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Completed Exam</label>
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    <div className="flex items-center gap-2">
                      {exam.title}
                      <Badge variant={exam.status === "results_announced" ? "default" : "secondary"}>
                        {exam.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">What this will do:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Calculate total scores based on correct answers and negative marking</li>
              <li>Assign ranks based on scores (highest to lowest)</li>
              <li>Update exam status to "Results Announced"</li>
              <li>Make results visible to students on leaderboard</li>
            </ul>
          </div>

          <Button
            onClick={calculateResults}
            disabled={!selectedExamId || calculating}
            className="w-full"
          >
            {calculating ? "Calculating..." : "Calculate & Announce Results"}
          </Button>
        </CardContent>
      </Card>

      {exams.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No completed exams available for result calculation
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
