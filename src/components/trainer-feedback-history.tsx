import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Calendar,
  Target,
  TrendingUp,
  MessageSquare,
  Star,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { FEEDBACK_CATEGORIES, type FeedbackCategory } from "@/pages/trainer-feedback";

interface FeedbackEntry {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  createdAt: string;
  status: string;
  priority: string;
  dynamicFieldData: {
    feedbackCategory?: FeedbackCategory;
    overallRating?: number;
    scores?: {
      technique: number;
      communication: number;
      motivation: number;
      punctuality: number;
      professionalism: number;
    };
    classType?: string;
    classDate?: string;
    reviewPeriod?: string;
    customerName?: string;
    aiInsights?: {
      sentiment: string;
      score: number;
      insights?: string;
    };
  };
}

interface TrainerFeedbackHistoryProps {
  trainerId: string;
  trainerName: string;
  feedback: FeedbackEntry[];
  isLoading: boolean;
}

const categoryIcons: Record<FeedbackCategory, typeof Calendar> = {
  quarterly: Calendar,
  barre: Target,
  powercycle: TrendingUp,
  general: MessageSquare,
};

const categoryColors: Record<FeedbackCategory, string> = {
  quarterly: "from-blue-500 to-indigo-500",
  barre: "from-pink-500 to-rose-500",
  powercycle: "from-amber-500 to-orange-500",
  general: "from-emerald-500 to-teal-500",
};

export function TrainerFeedbackHistory({
  trainerId,
  trainerName,
  feedback,
  isLoading,
}: TrainerFeedbackHistoryProps) {
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Group feedback by category
  const groupedFeedback = useMemo(() => {
    const filtered = categoryFilter === "all" 
      ? feedback 
      : feedback.filter(f => f.dynamicFieldData?.feedbackCategory === categoryFilter);

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    // Group by category
    const groups: Record<string, FeedbackEntry[]> = {};
    FEEDBACK_CATEGORIES.forEach(cat => {
      groups[cat.id] = [];
    });

    sorted.forEach(entry => {
      const cat = entry.dynamicFieldData?.feedbackCategory || "general";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(entry);
    });

    return groups;
  }, [feedback, categoryFilter, sortOrder]);

  // Calculate category stats
  const categoryStats = useMemo(() => {
    return FEEDBACK_CATEGORIES.map(cat => {
      const entries = feedback.filter(f => f.dynamicFieldData?.feedbackCategory === cat.id);
      const avgRating = entries.length > 0
        ? entries.reduce((acc, e) => acc + (e.dynamicFieldData?.overallRating || 0), 0) / entries.length
        : 0;
      return {
        ...cat,
        count: entries.length,
        avgRating: avgRating.toFixed(1),
      };
    });
  }, [feedback]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categoryStats.map((cat) => {
          const Icon = categoryIcons[cat.id];
          return (
            <Card
              key={cat.id}
              className={cn(
                "glass-card cursor-pointer transition-all",
                categoryFilter === cat.id && "ring-2 ring-primary"
              )}
              onClick={() => setCategoryFilter(categoryFilter === cat.id ? "all" : cat.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                    categoryColors[cat.id]
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {cat.count}
                  </Badge>
                </div>
                <h3 className="font-medium text-sm mt-3">{cat.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-sm text-muted-foreground">{cat.avgRating} avg</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {FEEDBACK_CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
          className="gap-2"
        >
          {sortOrder === "newest" ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
          {sortOrder === "newest" ? "Newest First" : "Oldest First"}
        </Button>
      </div>

      {/* Feedback List */}
      {feedback.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No feedback recorded</h3>
            <p className="text-muted-foreground">
              Be the first to submit feedback for {trainerName}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {FEEDBACK_CATEGORIES.map(cat => {
            const entries = groupedFeedback[cat.id] || [];
            if (categoryFilter !== "all" && categoryFilter !== cat.id) return null;
            if (entries.length === 0) return null;

            const Icon = categoryIcons[cat.id];

            return (
              <AccordionItem key={cat.id} value={cat.id} className="border-0">
                <Card className="glass-card overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                        categoryColors[cat.id]
                      )}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ScrollArea className="max-h-[500px]">
                      <div className="space-y-3 px-6 pb-4">
                        <AnimatePresence>
                          {entries.map((entry, index) => (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <FeedbackCard entry={entry} />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

function FeedbackCard({ entry }: { entry: FeedbackEntry }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const data = entry.dynamicFieldData;

  return (
    <Card className="bg-muted/30 hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {entry.ticketNumber}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(entry.createdAt), "MMM d, yyyy")}
              </span>
              {data?.classType && (
                <Badge variant="secondary" className="text-xs">
                  {data.classType}
                </Badge>
              )}
            </div>

            {/* Rating */}
            {data?.overallRating && (
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= data.overallRating!
                        ? "text-amber-500 fill-amber-500"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
                <span className="ml-1 text-sm font-medium">{data.overallRating}/5</span>
              </div>
            )}

            {/* Scores Preview */}
            {data?.scores && (
              <div className="flex flex-wrap gap-2 mb-2">
                {Object.entries(data.scores).slice(0, 3).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs capitalize">
                    {key}: {value}%
                  </Badge>
                ))}
                {Object.keys(data.scores).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{Object.keys(data.scores).length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* AI Insights */}
            {data?.aiInsights && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                <span className="capitalize">{data.aiInsights.sentiment}</span>
                <span>•</span>
                <span>AI Score: {data.aiInsights.score}/100</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Less" : "More"}
          </Button>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border/50"
            >
              {/* All Scores */}
              {data?.scores && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  {Object.entries(data.scores).map(([key, value]) => (
                    <div key={key} className="text-center p-2 rounded-lg bg-background/50">
                      <p className="text-lg font-bold text-primary">{value}%</p>
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Description Preview */}
              <p className="text-sm text-muted-foreground line-clamp-4">
                {entry.description.split('\n').slice(0, 5).join('\n')}
              </p>

              {data?.customerName && (
                <p className="text-xs text-muted-foreground mt-2">
                  Submitted by: {data.customerName}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
