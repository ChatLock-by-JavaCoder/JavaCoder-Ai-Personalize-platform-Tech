// ExamInterface.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  marks: number;
}

interface Exam {
  id: string;
  title: string;
  duration_minutes: number;
}

const ExamInterface = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch exam and questions
  useEffect(() => {
    const fetchExamData = async () => {
      if (!examId) return;

      const { data: examData, error: examError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (examError || !examData) {
        toast.error("Failed to load exam");
        navigate("/");
        return;
      }

      setExam(examData);
      setTimeLeft(examData.duration_minutes * 60); // convert minutes to seconds

      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_id", examId)
        .order("question_order", { ascending: true });

      if (questionError || !questionData) {
        toast.error("Failed to load questions");
        navigate("/");
        return;
      }

      setQuestions(questionData);
      setLoading(false);
    };

    fetchExamData();
  }, [examId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Login required");
      navigate("/auth");
      return;
    }

    // Insert exam attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("exam_attempts")
      .insert([{ exam_id: examId, user_id: user.id }])
      .select("*")
      .single();

    if (attemptError || !attempt) {
      toast.error("Failed to start attempt");
      return;
    }

    // Insert answers
    const answerPayload = questions.map(q => ({
      attempt_id: attempt.id,
      question_id: q.id,
      selected_answer: answers[q.id] || null,
    }));

    const { error: answersError } = await supabase
      .from("answers")
      .insert(answerPayload);

    if (answersError) {
      toast.error("Failed to save answers");
      return;
    }

    toast.success("Exam submitted successfully!");
    navigate("/");
  };

  if (loading) return <p className="text-center mt-24">Loading exam...</p>;
  if (!exam) return null;

  const currentQuestion = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>{exam.title}</CardTitle>
          <CardDescription>
            Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="font-semibold">
              Q{currentIndex + 1}. {currentQuestion.question_text}
            </p>
            <div className="mt-3 space-y-2">
              {["A", "B", "C", "D"].map(opt => (
                <button
                  key={opt}
                  className={`w-full text-left p-2 border rounded ${
                    answers[currentQuestion.id] === opt
                      ? "bg-blue-500 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestion.id, opt)}
                >
                  {opt}. {currentQuestion[`option_${opt.toLowerCase()}` as keyof Question]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button onClick={handlePrevious} disabled={currentIndex === 0}>
              Previous
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button variant="destructive" onClick={handleSubmit}>
                Submit Exam
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamInterface;
