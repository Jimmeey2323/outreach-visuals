import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Star,
  Target,
  MessageSquare,
  Calendar,
  User,
  Award,
  Loader2,
  Sparkles,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { FEEDBACK_CATEGORIES, type FeedbackCategory } from "@/pages/trainer-feedback";

interface TrainerProfile {
  id: string;
  name: string;
  specialization: string;
}

interface TrainerFeedbackFormProps {
  trainer: TrainerProfile;
  category: FeedbackCategory;
  onCategoryChange: (category: FeedbackCategory) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

const SCORE_CATEGORIES = [
  { key: "technique", label: "Technique & Form", icon: Target },
  { key: "communication", label: "Communication", icon: MessageSquare },
  { key: "motivation", label: "Motivation", icon: Award },
  { key: "punctuality", label: "Punctuality", icon: Calendar },
  { key: "professionalism", label: "Professionalism", icon: User },
];

export function TrainerFeedbackForm({
  trainer,
  category,
  onCategoryChange,
  onSuccess,
  onCancel,
}: TrainerFeedbackFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    classType: "",
    classDate: new Date().toISOString().split('T')[0],
    overallRating: 4,
    technique: 75,
    communication: 75,
    motivation: 75,
    punctuality: 75,
    professionalism: 75,
    feedback: "",
    customerName: "",
    customerEmail: "",
    reviewPeriod: "",
  });

  const analyzeFeedback = async () => {
    if (!formData.feedback.trim()) {
      toast({
        title: "No feedback to analyze",
        description: "Please enter feedback text first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: {
          title: `Trainer Feedback - ${trainer.name}`,
          description: formData.feedback,
          feedback: formData.feedback,
          trainerName: trainer.name,
        },
      });

      if (error) throw error;
      setAiInsights(data);
      toast({
        title: "Analysis complete",
        description: "AI insights have been generated.",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Generate ticket number
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const ticketNumber = `TKT-${year}${month}${day}-${random}`;

      // Get category for trainer feedback
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('isActive', true);
      
      const feedbackCategoryDb = categories?.find(c => 
        c.name.toLowerCase().includes('customer') || c.name.toLowerCase().includes('service')
      );

      // Get first studio
      const { data: studios } = await supabase
        .from('studios')
        .select('id')
        .limit(1)
        .single();

      // Determine priority based on rating
      let priority = 'medium';
      if (formData.overallRating <= 2) priority = 'high';
      else if (formData.overallRating >= 4) priority = 'low';

      // Create title based on category
      const categoryLabel = FEEDBACK_CATEGORIES.find(c => c.id === category)?.name || 'General';
      const feedbackType = formData.overallRating >= 4 ? 'Positive' : 
                          formData.overallRating <= 2 ? 'Concern' : 'Neutral';
      const title = `${categoryLabel} - ${trainer.name} - ${feedbackType}`;

      const description = `**${categoryLabel}**

**Trainer:** ${trainer.name}
**Specialization:** ${trainer.specialization}
**Class Type:** ${formData.classType || 'Not specified'}
**Class Date:** ${formData.classDate}
${formData.reviewPeriod ? `**Review Period:** ${formData.reviewPeriod}` : ''}

**Overall Rating:** ${formData.overallRating}/5 ⭐

**Performance Scores:**
- Technique & Form: ${formData.technique}%
- Communication: ${formData.communication}%
- Motivation: ${formData.motivation}%
- Punctuality: ${formData.punctuality}%
- Professionalism: ${formData.professionalism}%

**Feedback:**
${formData.feedback}

${formData.customerName ? `**Submitted by:** ${formData.customerName}` : ''}
${formData.customerEmail ? `**Contact:** ${formData.customerEmail}` : ''}

${aiInsights ? `
**AI Analysis:**
- Sentiment: ${aiInsights.sentiment}
- Score: ${aiInsights.score}/100
${aiInsights.insights ? `- Insights: ${aiInsights.insights}` : ''}
` : ''}`;

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert([{
          ticketNumber,
          title,
          description,
          categoryId: feedbackCategoryDb?.id || categories?.[0]?.id,
          studioId: studios?.id,
          priority,
          status: 'new',
          source: 'trainer-feedback',
          tags: ['trainer-feedback', category, trainer.specialization.toLowerCase(), feedbackType.toLowerCase()].filter(Boolean),
          reportedByUserId: user?.id,
          dynamicFieldData: {
            trainerId: trainer.id,
            trainerName: trainer.name,
            feedbackCategory: category,
            classType: formData.classType,
            classDate: formData.classDate,
            reviewPeriod: formData.reviewPeriod,
            overallRating: formData.overallRating,
            scores: {
              technique: formData.technique,
              communication: formData.communication,
              motivation: formData.motivation,
              punctuality: formData.punctuality,
              professionalism: formData.professionalism,
            },
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            aiInsights: aiInsights || null,
            feedbackType: 'trainer-evaluation',
          },
        }])
        .select()
        .single();

      if (error) throw error;
      return ticket;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting feedback",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.feedback.trim()) {
      toast({
        title: "Feedback required",
        description: "Please provide written feedback before submitting.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate();
  };

  const selectedCategoryData = FEEDBACK_CATEGORIES.find(c => c.id === category);

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Feedback Category</CardTitle>
          <CardDescription>Select the type of feedback you're submitting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FEEDBACK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  category === cat.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br mb-2",
                  cat.color
                )}>
                  <cat.icon className="h-5 w-5 text-white" />
                </div>
                <p className="font-medium text-sm">{cat.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Details */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Feedback Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {category === "quarterly" && (
              <div className="space-y-2">
                <Label>Review Period</Label>
                <Select 
                  value={formData.reviewPeriod}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, reviewPeriod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                    <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                    <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                    <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Class Type</Label>
              <Input
                placeholder="e.g., Studio Barre 57, PowerCycle"
                value={formData.classType}
                onChange={(e) => setFormData(prev => ({ ...prev, classType: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Class Date</Label>
              <Input
                type="date"
                value={formData.classDate}
                onChange={(e) => setFormData(prev => ({ ...prev, classDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Overall Rating</Label>
              <div className="flex items-center gap-2 pt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFormData(prev => ({ ...prev, overallRating: rating }))}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        rating <= formData.overallRating
                          ? "text-amber-500 fill-amber-500"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
                <span className="ml-2 text-lg font-bold">{formData.overallRating}/5</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Submitted By (Optional)</Label>
              <Input
                placeholder="Your name"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Contact Email (Optional)</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Scores */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Performance Scores</CardTitle>
            <CardDescription>Rate each category from 0-100</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {SCORE_CATEGORIES.map((cat) => (
              <div key={cat.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <cat.icon className="h-4 w-4 text-muted-foreground" />
                    {cat.label}
                  </Label>
                  <span className="font-bold">{formData[cat.key as keyof typeof formData]}%</span>
                </div>
                <Slider
                  value={[formData[cat.key as keyof typeof formData] as number]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, [cat.key]: value }))}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Text */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Written Feedback</CardTitle>
              <CardDescription>Provide detailed feedback about the trainer's performance</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeFeedback}
              disabled={isAnalyzing || !formData.feedback.trim()}
              className="gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Analyze with AI
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your detailed feedback here..."
            value={formData.feedback}
            onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
            rows={6}
          />

          {aiInsights && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-primary/5 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">AI Analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Sentiment:</span>
                  <span className="ml-2 font-medium capitalize">{aiInsights.sentiment}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Score:</span>
                  <span className="ml-2 font-medium">{aiInsights.score}/100</span>
                </div>
              </div>
              {aiInsights.insights && (
                <p className="text-sm text-muted-foreground mt-2">{aiInsights.insights}</p>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} className="gap-2">
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={submitMutation.isPending}
          className="gap-2"
        >
          {submitMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit Feedback
        </Button>
      </div>
    </div>
  );
}
