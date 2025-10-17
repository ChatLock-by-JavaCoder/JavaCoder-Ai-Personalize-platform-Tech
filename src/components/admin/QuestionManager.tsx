import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";

interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  marks: number;
  negative_marks: number;
  question_order: number | null;
}

interface Exam {
  id: string;
  title: string;
}

export const QuestionManager = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    marks: 1,
    negative_marks: 0,
  });

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchQuestions();
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

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("exam_id", selectedExamId)
      .order("question_order", { ascending: true });

    if (error) {
      toast.error("Failed to fetch questions");
      console.error(error);
    } else {
      setQuestions(data || []);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) {
      toast.error("Please select an exam first");
      return;
    }

    const { error } = await supabase
      .from("questions")
      .insert([{
        exam_id: selectedExamId,
        ...formData,
        question_order: questions.length + 1,
      }]);

    if (error) {
      toast.error("Failed to add question");
      console.error(error);
    } else {
      toast.success("Question added successfully");
      setFormData({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        marks: 1,
        negative_marks: 0,
      });
      fetchQuestions();
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete question");
      console.error(error);
    } else {
      toast.success("Question deleted successfully");
      fetchQuestions();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
          <CardDescription>Choose an exam to manage its questions</CardDescription>
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
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-accent" />
                <CardTitle>Add New Question</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text *</Label>
                  <Textarea
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    required
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Option A *</Label>
                    <Input
                      value={formData.option_a}
                      onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Option B *</Label>
                    <Input
                      value={formData.option_b}
                      onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Option C *</Label>
                    <Input
                      value={formData.option_c}
                      onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Option D *</Label>
                    <Input
                      value={formData.option_d}
                      onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Correct Answer *</Label>
                    <Select
                      value={formData.correct_answer}
                      onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Option A</SelectItem>
                        <SelectItem value="B">Option B</SelectItem>
                        <SelectItem value="C">Option C</SelectItem>
                        <SelectItem value="D">Option D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Marks *</Label>
                    <Input
                      type="number"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                      required
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Negative Marks</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={formData.negative_marks}
                      onChange={(e) => setFormData({ ...formData, negative_marks: parseFloat(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Add Question
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Questions ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Q{index + 1}. {question.question_text}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className={question.correct_answer === "A" ? "font-bold text-primary" : ""}>
                      A) {question.option_a}
                    </p>
                    <p className={question.correct_answer === "B" ? "font-bold text-primary" : ""}>
                      B) {question.option_b}
                    </p>
                    <p className={question.correct_answer === "C" ? "font-bold text-primary" : ""}>
                      C) {question.option_c}
                    </p>
                    <p className={question.correct_answer === "D" ? "font-bold text-primary" : ""}>
                      D) {question.option_d}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Marks: {question.marks} | Negative: {question.negative_marks}
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No questions added yet
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
