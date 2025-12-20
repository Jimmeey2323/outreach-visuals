import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Loader2,
  Sparkles,
  Send,
  X,
  Upload,
  Mic,
  MicOff,
  ChevronDown,
  ChevronUp,
  Plus,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  type FeedbackFormTemplate, 
  type FormField, 
  type FormSection,
  getFormTemplate 
} from "@/lib/feedbackFormTemplates";
import { FEEDBACK_CATEGORIES, type FeedbackCategory } from "@/pages/trainer-feedback";

interface TrainerProfile {
  id: string;
  name: string;
  specialization: string;
}

interface DynamicFeedbackFormProps {
  trainer: TrainerProfile;
  category: FeedbackCategory;
  onCategoryChange: (category: FeedbackCategory) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

interface SectionState {
  isOpen: boolean;
  showAdditionalComments: boolean;
  additionalComments: string;
  uploadedFiles: File[];
}

export function DynamicFeedbackForm({
  trainer,
  category,
  onCategoryChange,
  onSuccess,
  onCancel,
}: DynamicFeedbackFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  
  const template = getFormTemplate(category);
  
  // Dynamic form data based on template
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Section-specific state (comments, files, expanded state)
  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>(() => {
    const initial: Record<string, SectionState> = {};
    template.sections.forEach(section => {
      initial[section.id] = {
        isOpen: true,
        showAdditionalComments: false,
        additionalComments: "",
        uploadedFiles: [],
      };
    });
    return initial;
  });

  // Reset form when category changes
  const handleCategoryChange = (newCategory: FeedbackCategory) => {
    setFormData({});
    const newTemplate = getFormTemplate(newCategory);
    const newStates: Record<string, SectionState> = {};
    newTemplate.sections.forEach(section => {
      newStates[section.id] = {
        isOpen: true,
        showAdditionalComments: false,
        additionalComments: "",
        uploadedFiles: [],
      };
    });
    setSectionStates(newStates);
    setAiInsights(null);
    onCategoryChange(newCategory);
  };

  const updateField = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const updateSectionState = (sectionId: string, updates: Partial<SectionState>) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], ...updates },
    }));
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id];

    switch (field.type) {
      case "text":
        return (
          <Input
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => updateField(field.id, e.target.value)}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value || ""}
            onChange={(e) => updateField(field.id, e.target.value)}
            rows={4}
          />
        );

      case "select":
        return (
          <Select value={value || ""} onValueChange={(v) => updateField(field.id, v)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => updateField(field.id, e.target.value)}
          />
        );

      case "datetime":
        return (
          <Input
            type="datetime-local"
            value={value || ""}
            onChange={(e) => updateField(field.id, e.target.value)}
          />
        );

      case "number":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={field.min}
              max={field.max}
              step={field.step || 1}
              value={value || ""}
              onChange={(e) => updateField(field.id, parseFloat(e.target.value))}
              className="w-24"
            />
            {field.max && (
              <span className="text-sm text-muted-foreground">/ {field.max}</span>
            )}
          </div>
        );

      case "rating":
        const rating = value || 0;
        const maxRating = field.max || 5;
        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => updateField(field.id, star)}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    star <= rating
                      ? "text-amber-500 fill-amber-500"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-medium">{rating}/{maxRating}</span>
          </div>
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => updateField(field.id, e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm">{field.placeholder || "Yes"}</span>
          </label>
        );

      case "file":
        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
            <span className="text-sm text-muted-foreground">No files uploaded</span>
          </div>
        );

      case "voice":
        return (
          <Button variant="outline" size="sm" className="gap-2">
            <Mic className="h-4 w-4" />
            Record Voice Message
          </Button>
        );

      default:
        return (
          <Input
            value={value || ""}
            onChange={(e) => updateField(field.id, e.target.value)}
          />
        );
    }
  };

  const renderSection = (section: FormSection) => {
    const state = sectionStates[section.id];
    
    return (
      <Collapsible
        key={section.id}
        open={state?.isOpen}
        onOpenChange={(open) => updateSectionState(section.id, { isOpen: open })}
      >
        <Card className="glass-card">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </div>
                {state?.isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {section.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {field.label}
                    {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}
                  {renderField(field)}
                </div>
              ))}

              {/* Additional Comments Toggle */}
              {section.allowAdditionalComments && (
                <div className="pt-4 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => updateSectionState(section.id, { 
                      showAdditionalComments: !state?.showAdditionalComments 
                    })}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Plus className="h-4 w-4" />
                    {state?.showAdditionalComments ? "Hide" : "Add"} Additional Comments
                  </button>
                  
                  <AnimatePresence>
                    {state?.showAdditionalComments && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-3"
                      >
                        <Textarea
                          placeholder="Add additional comments for this section..."
                          value={state.additionalComments}
                          onChange={(e) => updateSectionState(section.id, { 
                            additionalComments: e.target.value 
                          })}
                          rows={3}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* File Upload Toggle */}
              {section.allowFileUpload && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload a file
                  </Button>
                  <span className="text-sm text-muted-foreground">No files uploaded</span>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  const analyzeFeedback = async () => {
    // Collect all text feedback
    const feedbackText = Object.entries(formData)
      .filter(([_, v]) => typeof v === "string" && v.length > 10)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    if (!feedbackText) {
      toast({
        title: "No text feedback to analyze",
        description: "Please enter some written feedback first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: {
          title: `${template.name} - ${trainer.name}`,
          description: feedbackText,
          feedback: feedbackText,
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

      // Get category from DB
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

      // Calculate average rating if there are rating fields
      const ratings = Object.entries(formData)
        .filter(([k, v]) => typeof v === "number" && v >= 1 && v <= 5)
        .map(([_, v]) => v as number);
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 3;

      // Determine priority based on average rating
      let priority = 'medium';
      if (avgRating <= 2) priority = 'high';
      else if (avgRating >= 4) priority = 'low';

      // Build description from form data
      const categoryLabel = FEEDBACK_CATEGORIES.find(c => c.id === category)?.name || 'General';
      const feedbackType = avgRating >= 4 ? 'Positive' : avgRating <= 2 ? 'Concern' : 'Neutral';
      const title = `${categoryLabel} - ${trainer.name} - ${feedbackType}`;

      // Build description with all form data
      let description = `**${template.name}**\n\n`;
      description += `**Trainer:** ${trainer.name}\n`;
      description += `**Specialization:** ${trainer.specialization}\n`;
      description += `**Feedback Type:** ${categoryLabel}\n\n`;

      template.sections.forEach(section => {
        description += `**${section.title}**\n`;
        section.fields.forEach(field => {
          const value = formData[field.id];
          if (value !== undefined && value !== "") {
            if (field.type === "rating") {
              description += `- ${field.label}: ${value}/${field.max || 5} ⭐\n`;
            } else {
              description += `- ${field.label}: ${value}\n`;
            }
          }
        });
        
        // Add section comments if any
        const sectionState = sectionStates[section.id];
        if (sectionState?.additionalComments) {
          description += `- Additional Comments: ${sectionState.additionalComments}\n`;
        }
        description += "\n";
      });

      if (aiInsights) {
        description += `\n**AI Analysis:**\n`;
        description += `- Sentiment: ${aiInsights.sentiment}\n`;
        description += `- Score: ${aiInsights.score}/100\n`;
        if (aiInsights.insights) {
          description += `- Insights: ${aiInsights.insights}\n`;
        }
      }

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
            templateId: template.id,
            templateName: template.name,
            feedbackCategory: category,
            formData: formData,
            sectionComments: Object.fromEntries(
              Object.entries(sectionStates)
                .filter(([_, s]) => s.additionalComments)
                .map(([k, s]) => [k, s.additionalComments])
            ),
            averageRating: avgRating,
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
      toast({
        title: "Feedback submitted",
        description: "Your feedback has been recorded successfully.",
      });
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
    // Validate required fields
    const missingFields: string[] = [];
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.required && !formData[field.id]) {
          missingFields.push(field.label);
        }
      });
    });

    if (missingFields.length > 0) {
      toast({
        title: "Required fields missing",
        description: `Please fill in: ${missingFields.slice(0, 3).join(", ")}${missingFields.length > 3 ? ` and ${missingFields.length - 3} more` : ""}`,
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
                onClick={() => handleCategoryChange(cat.id)}
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

      {/* Template Info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>Using template: <strong>{template.name}</strong></span>
        <Badge variant="outline">{template.sections.length} sections</Badge>
      </div>

      {/* Dynamic Form Sections */}
      <div className="space-y-4">
        {template.sections.map(renderSection)}
      </div>

      {/* AI Analysis */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Analysis
              </CardTitle>
              <CardDescription>Get AI-powered insights on your feedback</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeFeedback}
              disabled={isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Analyze
            </Button>
          </div>
        </CardHeader>
        {aiInsights && (
          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-primary/5 border border-primary/20"
            >
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
          </CardContent>
        )}
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
