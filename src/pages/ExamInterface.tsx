// ExamInterface.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Menu,
  Grid3X3,
  Check,
  X
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  marks: number;
  question_order: number;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
}

interface AnswerState {
  selectedAnswer: string;
  isMarkedForReview: boolean;
}

const ExamInterface = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate exam statistics
  const answeredQuestions = Object.keys(answers).filter(
    qId => answers[qId]?.selectedAnswer
  ).length;
  
  const markedForReview = Object.keys(answers).filter(
    qId => answers[qId]?.isMarkedForReview
  ).length;

  // Fetch exam and questions
  useEffect(() => {
    const fetchExamData = async () => {
      if (!examId) return;

      try {
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

        // Check if exam is active
        if (examData.status !== 'active') {
          toast.error("This exam is not currently active");
          navigate("/");
          return;
        }

        setExam(examData);
        setTimeLeft(examData.duration_minutes * 60);

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

        // Initialize exam attempt
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Login required");
          navigate("/auth");
          return;
        }

        const { data: attempt, error: attemptError } = await supabase
          .from("exam_attempts")
          .insert([{ 
            exam_id: examId, 
            user_id: user.id,
            start_time: new Date().toISOString()
          }])
          .select("*")
          .single();

        if (attemptError) {
          console.error("Attempt error:", attemptError);
          toast.error("Failed to start exam attempt");
          navigate("/");
          return;
        }

        setAttemptId(attempt.id);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching exam data:", error);
        toast.error("An error occurred while loading the exam");
        navigate("/");
      }
    };

    fetchExamData();
  }, [examId, navigate]);

  // Timer countdown and auto-submit
  useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        selectedAnswer: prev[questionId]?.selectedAnswer === option ? "" : option,
        isMarkedForReview: prev[questionId]?.isMarkedForReview || false
      }
    }));
  };

  const toggleMarkForReview = (questionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        selectedAnswer: prev[questionId]?.selectedAnswer || "",
        isMarkedForReview: !prev[questionId]?.isMarkedForReview
      }
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setMobileMenuOpen(false);
  };

  const handleAutoSubmit = async () => {
    if (!attemptId) return;
    await submitExam("Time's up! Exam submitted automatically.");
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    
    const unanswered = questions.filter(q => !answers[q.id]?.selectedAnswer).length;
    if (unanswered > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }
    
    await submitExam("Exam submitted successfully!");
  };

const submitExam = async (successMessage: string) => {
  if (!attemptId || !examId) return;
  
  setSubmitting(true);
  try {
    // First, get all questions with correct answers for this exam
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, correct_answer, marks, negative_marks')
      .eq('exam_id', examId);

    if (questionsError) throw questionsError;

    // Calculate score based on user's answers
    let totalScore = 0;
    
    for (const question of questions) {
      const userAnswer = answers[question.id]?.selectedAnswer;
      
      if (userAnswer === question.correct_answer) {
        // Correct answer - add marks
        totalScore += question.marks;
      } else if (userAnswer && userAnswer !== question.correct_answer && question.negative_marks > 0) {
        // Wrong answer with negative marking - deduct marks
        totalScore -= question.negative_marks;
      }
      // Unanswered questions get 0 marks
    }

    // Ensure score doesn't go below 0
    totalScore = Math.max(0, totalScore);

    // Update exam attempt with calculated score
    const { error: attemptError } = await supabase
      .from("exam_attempts")
      .update({
        end_time: new Date().toISOString(),
        total_score: totalScore,
        status: 'completed'
      })
      .eq("id", attemptId);

    if (attemptError) throw attemptError;

    // Insert answers (your existing code)
    const answerPayload = questions.map(q => ({
      attempt_id: attemptId,
      question_id: q.id,
      selected_answer: answers[q.id]?.selectedAnswer || null,
      is_marked_for_review: answers[q.id]?.isMarkedForReview || false,
      answered_at: new Date().toISOString()
    }));

    const { error: answersError } = await supabase
      .from("answers")
      .insert(answerPayload);

    if (answersError) throw answersError;

    toast.success(successMessage);
    navigate("/");
  } catch (error) {
    console.error("Error submitting exam:", error);
    toast.error("Failed to submit exam. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Mobile Question Navigation Sheet
  const MobileQuestionSheet = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden gap-2">
          <Grid3X3 className="w-4 h-4" />
          Questions
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Question Navigation</h3>
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-5 gap-2 flex-1 overflow-y-auto">
            {questions.map((question, index) => {
              const answer = answers[question.id];
              let bgColor = "bg-gray-200";
              if (answer?.selectedAnswer) bgColor = "bg-green-500 text-white";
              if (answer?.isMarkedForReview) bgColor = "bg-orange-500 text-white";
              if (index === currentIndex) bgColor += " ring-2 ring-blue-500";

              return (
                <button
                  key={question.id}
                  className={`w-12 h-12 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${bgColor}`}
                  onClick={() => goToQuestion(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="border-t pt-4 mt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Answered ({answeredQuestions})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Marked for Review ({markedForReview})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Not Answered ({questions.length - answeredQuestions})</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-semibold">Loading Exam...</p>
              <p className="text-sm text-gray-600 mt-2">Please wait while we prepare your exam</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam || !questions.length) return null;

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progress = (answeredQuestions / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Desktop Sidebar - Hidden on mobile */}
        <Card className="lg:col-span-1 h-fit sticky top-4 hidden lg:block">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Question Palette</CardTitle>
            <CardDescription>
              Navigate through questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((question, index) => {
                const answer = answers[question.id];
                let bgColor = "bg-gray-200";
                if (answer?.selectedAnswer) bgColor = "bg-green-500 text-white";
                if (answer?.isMarkedForReview) bgColor = "bg-orange-500 text-white";
                if (index === currentIndex) bgColor += " ring-2 ring-blue-500";

                return (
                  <button
                    key={question.id}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${bgColor}`}
                    onClick={() => goToQuestion(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Answered ({answeredQuestions})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Marked for Review ({markedForReview})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>Not Answered ({questions.length - answeredQuestions})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          {/* Header */}
          <Card className="relative">
            <CardHeader className="pb-3">
              <div className="flex flex-col space-y-4">
                {/* Top Row - Title and Mobile Menu */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl sm:text-2xl break-words">
                      {exam.title}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {exam.description}
                    </CardDescription>
                  </div>
                  <div className="lg:hidden ml-2">
                    <MobileQuestionSheet />
                  </div>
                </div>

                {/* Bottom Row - Timer and Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={timeLeft < 300 ? "destructive" : "default"}
                      className="text-base font-mono px-3 py-2 min-w-[100px] justify-center"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {formatTime(timeLeft)}
                    </Badge>
                    <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
                      <span>Q: {questions.length}</span>
                      <span>Marks: {exam.total_marks}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleSubmit}
                    disabled={submitting}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {submitting ? "Submitting..." : "Submit Exam"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-500" />
                    Answered: {answeredQuestions}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flag className="w-4 h-4 text-orange-500" />
                    Marked: {markedForReview}
                  </span>
                  <span>
                    Progress: {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Question Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm sm:text-base">
                      Q{currentIndex + 1}/{questions.length}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      {currentQuestion.marks} mark{currentQuestion.marks !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <Button
                    variant={currentAnswer?.isMarkedForReview ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleMarkForReview(currentQuestion.id)}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Flag className="w-4 h-4" />
                    {currentAnswer?.isMarkedForReview ? "Marked" : "Mark for Review"}
                  </Button>
                </div>

                {/* Question Text */}
                <div className="bg-white p-4 sm:p-6 rounded-lg border">
                  <p className="text-base sm:text-lg font-medium leading-relaxed break-words">
                    {currentQuestion.question_text}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-2 sm:space-y-3">
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <button
                      key={option}
                      className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        currentAnswer?.selectedAnswer === option
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 ${
                          currentAnswer?.selectedAnswer === option
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "border-gray-300 bg-white"
                        }`}>
                          {option}
                        </div>
                        <span className="flex-1 text-sm sm:text-base break-words">
                          {currentQuestion[`option_${option.toLowerCase()}` as keyof Question]}
                        </span>
                        {currentAnswer?.selectedAnswer === option && (
                          <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    variant="outline"
                    className="gap-2 order-2 sm:order-1"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-2 order-1 sm:order-2">
                    {currentIndex < questions.length - 1 ? (
                      <Button onClick={handleNext} className="gap-2 flex-1 sm:flex-initial" size="sm">
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="destructive" 
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 sm:flex-initial"
                        size="sm"
                      >
                        {submitting ? "Submitting..." : "Final Submit"}
                      </Button>
                    )}
                    
                    {/* Mobile question navigation trigger */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMobileMenuOpen(true)}
                      className="lg:hidden gap-2"
                    >
                      <Menu className="w-4 h-4" />
                      Menu
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Alert for low time */}
          {timeLeft < 300 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Less than 5 minutes remaining! Please review your answers and submit the exam.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;