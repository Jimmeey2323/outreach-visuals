import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  X,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  templateSuggestion?: TemplateSuggestion;
}

interface TemplateSuggestion {
  name: string;
  description: string;
  category: string;
  priority: string;
  suggestedTitle: string;
  suggestedDescription: string;
  fields: TemplateField[];
  sections: TemplateSection[];
  tags: string[];
}

interface TemplateField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "number" | "checkbox";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface TemplateSection {
  id: string;
  title: string;
  fields: TemplateField[];
}

interface AITemplateBuilderProps {
  onTemplateCreate?: (template: TemplateSuggestion) => void;
  existingTemplates?: any[];
}

const EXAMPLE_PROMPTS = [
  "Create a template for quarterly trainer assessments with scoring categories",
  "Build a client complaint form with incident details and resolution tracking",
  "Design a membership cancellation request template",
  "Create a studio maintenance request form with priority levels",
];

export function AITemplateBuilder({ onTemplateCreate, existingTemplates = [] }: AITemplateBuilderProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm your AI Template Builder assistant. I can help you create, edit, and manage ticket templates.

You can:
• **Paste a sample form structure** and I'll parse it into a template
• **Describe the template you need** and I'll design it
• **Ask me to modify existing templates**

Try one of these examples or describe what you need:`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<TemplateSuggestion | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateSuggestion | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const parseFormStructure = (input: string): TemplateSuggestion | null => {
    // Try to detect if input contains form-like structure
    const lines = input.split('\n').filter(l => l.trim());
    
    // Detect common patterns
    const hasCheckboxes = input.includes('□') || input.includes('[ ]') || input.includes('[x]');
    const hasSections = lines.some(l => l.includes('━') || l.includes('---') || l.includes('==='));
    const hasFieldLabels = lines.some(l => l.includes(':') || l.includes('•'));
    
    if (!hasCheckboxes && !hasSections && !hasFieldLabels && lines.length < 5) {
      return null;
    }

    const fields: TemplateField[] = [];
    const sections: TemplateSection[] = [];
    let currentSection: TemplateSection | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect section headers
      if (trimmed.includes('━━') || trimmed.match(/^[A-Z]{2,}/) || trimmed.match(/^\*\*.*\*\*$/)) {
        const sectionTitle = trimmed.replace(/[━\-=*]/g, '').trim();
        if (sectionTitle) {
          currentSection = {
            id: `section-${sections.length}`,
            title: sectionTitle,
            fields: [],
          };
          sections.push(currentSection);
        }
        continue;
      }

      // Detect checkbox fields
      if (trimmed.startsWith('□') || trimmed.startsWith('[ ]') || trimmed.startsWith('[x]')) {
        const label = trimmed.replace(/^[□\[\]x\s]+/, '').trim();
        const field: TemplateField = {
          id: `field-${fields.length}`,
          label,
          type: "checkbox",
          required: false,
        };
        if (currentSection) {
          currentSection.fields.push(field);
        } else {
          fields.push(field);
        }
        continue;
      }

      // Detect labeled fields
      const labelMatch = trimmed.match(/^[•\-\*]?\s*([^:\[\]]+):\s*\[?([^\]]*)\]?$/);
      if (labelMatch) {
        const [, label, placeholder] = labelMatch;
        const isRequired = label.includes('REQUIRED') || label.includes('*');
        const cleanLabel = label.replace(/\(REQUIRED\)|\*/g, '').trim();
        
        let fieldType: TemplateField["type"] = "text";
        if (placeholder.toLowerCase().includes('date') || cleanLabel.toLowerCase().includes('date')) {
          fieldType = "date";
        } else if (placeholder.toLowerCase().includes('describe') || cleanLabel.toLowerCase().includes('description')) {
          fieldType = "textarea";
        } else if (placeholder.includes('/') || placeholder.includes('|')) {
          fieldType = "select";
        }

        const field: TemplateField = {
          id: `field-${fields.length}`,
          label: cleanLabel,
          type: fieldType,
          required: isRequired,
          placeholder: placeholder || undefined,
          options: fieldType === "select" ? placeholder.split(/[\/|,]/).map(o => o.trim()) : undefined,
        };

        if (currentSection) {
          currentSection.fields.push(field);
        } else {
          fields.push(field);
        }
      }
    }

    // Try to extract name from first meaningful line
    const titleLine = lines.find(l => !l.includes('━') && !l.includes('---') && l.trim().length > 3);
    const name = titleLine?.replace(/[^a-zA-Z\s]/g, '').trim() || "Custom Template";

    return {
      name,
      description: `Auto-generated template from pasted form structure`,
      category: "Custom",
      priority: "medium",
      suggestedTitle: `[${name}] - [Details]`,
      suggestedDescription: input,
      fields: fields.length > 0 ? fields : [],
      sections: sections.length > 0 ? sections : [],
      tags: ["custom", "ai-generated"],
    };
  };

  const processWithAI = async (userMessage: string): Promise<{ content: string; template?: TemplateSuggestion }> => {
    // First, try to parse as form structure
    const parsedTemplate = parseFormStructure(userMessage);
    
    if (parsedTemplate && (parsedTemplate.fields.length > 0 || parsedTemplate.sections.length > 0)) {
      const totalFields = parsedTemplate.fields.length + 
        parsedTemplate.sections.reduce((acc, s) => acc + s.fields.length, 0);
      
      return {
        content: `I've detected a form structure in your input and parsed it into a template!

**Template Name:** ${parsedTemplate.name}
**Sections:** ${parsedTemplate.sections.length}
**Fields:** ${totalFields}

I've extracted the following structure:
${parsedTemplate.sections.map(s => `\n• **${s.title}** (${s.fields.length} fields)`).join('')}
${parsedTemplate.fields.length > 0 ? `\n• **Ungrouped fields:** ${parsedTemplate.fields.length}` : ''}

Would you like me to:
1. **Create this template** as-is
2. **Modify** any sections or fields
3. **Add more fields** to specific sections`,
        template: parsedTemplate,
      };
    }

    // Use AI for natural language processing
    try {
      const { data, error } = await supabase.functions.invoke('analyze-ticket', {
        body: {
          action: 'generate-template',
          prompt: userMessage,
          existingTemplates: existingTemplates.map(t => t.name),
        },
      });

      if (error) throw error;

      // Generate a template suggestion based on AI analysis
      const aiSuggestion: TemplateSuggestion = {
        name: data.suggestedName || "New Template",
        description: data.description || "AI-generated template",
        category: data.category || "General",
        priority: data.priority || "medium",
        suggestedTitle: data.suggestedTitle || "[Template] - [Subject]",
        suggestedDescription: data.suggestedDescription || "",
        fields: data.fields || [],
        sections: data.sections || [],
        tags: data.tags || ["ai-generated"],
      };

      return {
        content: data.message || `I've created a template suggestion based on your request. Review the details and let me know if you'd like any changes.`,
        template: aiSuggestion,
      };
    } catch (error) {
      console.error('AI processing error:', error);
      
      // Fallback to simple template generation
      const simpleTemplate: TemplateSuggestion = {
        name: "New Template",
        description: userMessage.slice(0, 100),
        category: "General",
        priority: "medium",
        suggestedTitle: "[Template Title]",
        suggestedDescription: userMessage,
        fields: [
          { id: "f1", label: "Subject", type: "text", required: true },
          { id: "f2", label: "Description", type: "textarea", required: true },
          { id: "f3", label: "Date", type: "date", required: false },
        ],
        sections: [],
        tags: ["custom"],
      };

      return {
        content: `I've created a basic template structure. You can edit it to add more fields and customize it to your needs.`,
        template: simpleTemplate,
      };
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    try {
      const result = await processWithAI(inputValue);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.content,
        timestamp: new Date(),
        templateSuggestion: result.template,
      };

      setMessages(prev => [...prev, assistantMessage]);
      if (result.template) {
        setPendingTemplate(result.template);
      }
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateTemplate = () => {
    if (pendingTemplate && onTemplateCreate) {
      onTemplateCreate(pendingTemplate);
      toast({
        title: "Template created",
        description: `"${pendingTemplate.name}" has been added to your templates.`,
      });
      setPendingTemplate(null);
      
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `✅ Template "${pendingTemplate.name}" has been created successfully! Is there anything else you'd like to do?`,
        timestamp: new Date(),
      }]);
    }
  };

  const handleEditTemplate = () => {
    if (pendingTemplate) {
      setEditingTemplate(pendingTemplate);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingTemplate) {
      setPendingTemplate(editingTemplate);
      setIsEditDialogOpen(false);
      toast({
        title: "Template updated",
        description: "Your changes have been applied.",
      });
    }
  };

  return (
    <Card className="glass-card h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Wand2 className="h-4 w-4 text-white" />
          </div>
          AI Template Builder
        </CardTitle>
        <CardDescription>
          Chat with AI to create and manage ticket templates
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 px-6">
          <div className="space-y-4 py-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                  )}>
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className={cn(
                    "max-w-[80%] rounded-xl p-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-1 last:mb-0 text-sm" dangerouslySetInnerHTML={{
                          __html: line
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        }} />
                      ))}
                    </div>

                    {/* Template Preview */}
                    {message.templateSuggestion && (
                      <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="gap-1">
                            <FileText className="h-3 w-3" />
                            Template Preview
                          </Badge>
                        </div>
                        <p className="font-medium text-sm">{message.templateSuggestion.name}</p>
                        <p className="text-xs text-muted-foreground">{message.templateSuggestion.description}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-sm text-muted-foreground">Processing...</p>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Pending Template Actions */}
        {pendingTemplate && (
          <div className="px-6 py-3 border-t border-border/50 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{pendingTemplate.name}</span>
                <Badge variant="outline" className="text-xs">{pendingTemplate.category}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleEditTemplate}>
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" onClick={handleCreateTemplate}>
                  <Check className="h-3 w-3 mr-1" />
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Example Prompts */}
        {messages.length === 1 && (
          <div className="px-6 py-2 flex gap-2 flex-wrap">
            {EXAMPLE_PROMPTS.slice(0, 2).map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setInputValue(prompt)}
              >
                {prompt.slice(0, 40)}...
              </Button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              placeholder="Describe the template you need or paste a form structure..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="min-h-[60px] resize-none"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isProcessing}
              className="self-end"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Modify the template details before creating
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={editingTemplate.priority}
                  onValueChange={(v) => setEditingTemplate({ ...editingTemplate, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Suggested Title</Label>
                <Input
                  value={editingTemplate.suggestedTitle}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, suggestedTitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Template Content</Label>
                <Textarea
                  value={editingTemplate.suggestedDescription}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, suggestedDescription: e.target.value })}
                  rows={10}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={editingTemplate.tags.join(", ")}
                  onChange={(e) => setEditingTemplate({ 
                    ...editingTemplate, 
                    tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) 
                  })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
