import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  exam_type: string | null;
  status: string;
}

export const ExamsList = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState<Partial<Exam>>({});

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch exams");
      console.error(error);
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      description: exam.description,
      start_time: exam.start_time,
      end_time: exam.end_time,
      duration_minutes: exam.duration_minutes,
      total_marks: exam.total_marks,
      exam_type: exam.exam_type,
      status: exam.status,
    });
  };

  const handleUpdate = async () => {
    if (!editingExam) return;

    const { error } = await supabase
      .from("exams")
      .update(formData as any)
      .eq("id", editingExam.id);

    if (error) {
      toast.error("Failed to update exam");
      console.error(error);
    } else {
      toast.success("Exam updated successfully");
      setEditingExam(null);
      fetchExams();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    const { error } = await supabase
      .from("exams")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete exam");
      console.error(error);
    } else {
      toast.success("Exam deleted successfully");
      fetchExams();
    }
  };

  if (loading) {
    return <div>Loading exams...</div>;
  }

  return (
    <div className="space-y-4">
      {exams.map((exam) => (
        <Card key={exam.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{exam.title}</CardTitle>
                <CardDescription>{exam.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(exam)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Exam</DialogTitle>
                      <DialogDescription>Update exam details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={formData.title || ""}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description || ""}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Input
                            type="datetime-local"
                            value={formData.start_time || ""}
                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Time</Label>
                          <Input
                            type="datetime-local"
                            value={formData.end_time || ""}
                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Duration (min)</Label>
                          <Input
                            type="number"
                            value={formData.duration_minutes || ""}
                            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Total Marks</Label>
                          <Input
                            type="number"
                            value={formData.total_marks || ""}
                            onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={formData.status || ""}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                          >
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
                      <Button onClick={handleUpdate} className="w-full">
                        Update Exam
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(exam.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium">{exam.exam_type || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{exam.duration_minutes} min</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Marks</p>
                <p className="font-medium">{exam.total_marks}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{exam.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {exams.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No exams found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
