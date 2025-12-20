import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Calendar,
  Award,
  Target,
  MessageSquare,
  BarChart3,
  ChevronRight,
  Plus,
  Filter,
  ArrowLeft,
  Sparkles,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { TRAINERS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { TrainerAnalyticsDashboard } from "@/components/trainer-analytics-dashboard";
import { DynamicFeedbackForm } from "@/components/dynamic-feedback-form";
import { TrainerFeedbackHistory } from "@/components/trainer-feedback-history";

// Feedback categories
export const FEEDBACK_CATEGORIES = [
  { id: "quarterly", name: "Quarterly Assessment", icon: Calendar, color: "from-blue-500 to-indigo-500" },
  { id: "barre", name: "Barre Feedback", icon: Target, color: "from-pink-500 to-rose-500" },
  { id: "powercycle", name: "PowerCycle Feedback", icon: TrendingUp, color: "from-amber-500 to-orange-500" },
  { id: "general", name: "General Feedback", icon: MessageSquare, color: "from-emerald-500 to-teal-500" },
] as const;

export type FeedbackCategory = typeof FEEDBACK_CATEGORIES[number]["id"];

interface TrainerProfile {
  id: string;
  name: string;
  avatar?: string;
  specialization: string;
  rating: number;
  totalFeedback: number;
  trend: "up" | "down" | "stable";
  scores: {
    technique: number;
    communication: number;
    motivation: number;
    punctuality: number;
    professionalism: number;
  };
}

// Generate trainer profiles from constants
const TRAINER_PROFILES: TrainerProfile[] = TRAINERS.map((trainer) => ({
  id: trainer.id,
  name: trainer.name,
  avatar: undefined,
  specialization: trainer.specialization,
  rating: 4.2 + Math.random() * 0.8,
  totalFeedback: Math.floor(50 + Math.random() * 200),
  trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable",
  scores: {
    technique: 75 + Math.floor(Math.random() * 25),
    communication: 70 + Math.floor(Math.random() * 30),
    motivation: 80 + Math.floor(Math.random() * 20),
    punctuality: 85 + Math.floor(Math.random() * 15),
    professionalism: 78 + Math.floor(Math.random() * 22),
  },
}));

export default function TrainerFeedback() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("trainers");
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [showNewFeedbackForm, setShowNewFeedbackForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory>("general");

  // Get unique specializations
  const specializations = useMemo(() => 
    [...new Set(TRAINER_PROFILES.map(t => t.specialization))],
    []
  );

  // Filter trainers
  const filteredTrainers = useMemo(() => {
    return TRAINER_PROFILES.filter(trainer => {
      const matchesSearch = 
        trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.specialization.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpec = specializationFilter === "all" || trainer.specialization === specializationFilter;
      return matchesSearch && matchesSpec;
    });
  }, [searchQuery, specializationFilter]);

  // Fetch feedback history for selected trainer
  const { data: trainerFeedback = [], isLoading: isLoadingFeedback } = useQuery({
    queryKey: ["trainer-feedback", selectedTrainer?.id],
    queryFn: async () => {
      if (!selectedTrainer) return [];
      
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("source", "trainer-feedback")
        .contains("dynamicFieldData", { trainerId: selectedTrainer.id })
        .order("createdAt", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedTrainer,
  });

  const handleTrainerSelect = (trainer: TrainerProfile) => {
    setSelectedTrainer(trainer);
    setActiveTab("profile");
  };

  const handleBackToList = () => {
    setSelectedTrainer(null);
    setActiveTab("trainers");
    setShowNewFeedbackForm(false);
  };

  const handleNewFeedback = () => {
    setShowNewFeedbackForm(true);
    setActiveTab("new-feedback");
  };

  const handleFeedbackSubmitted = () => {
    setShowNewFeedbackForm(false);
    setActiveTab("history");
    queryClient.invalidateQueries({ queryKey: ["trainer-feedback", selectedTrainer?.id] });
    toast({
      title: "Feedback submitted",
      description: "Your feedback has been recorded successfully.",
    });
  };

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedTrainer && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToList}
              className="rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold gradient-text-accent flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              {selectedTrainer ? selectedTrainer.name : "Trainer Feedback & Analytics"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {selectedTrainer 
                ? `${selectedTrainer.specialization} • ${selectedTrainer.totalFeedback} feedback entries`
                : "View trainer performance, submit feedback, and track analytics"
              }
            </p>
          </div>
        </div>
        
        {selectedTrainer && !showNewFeedbackForm && (
          <Button onClick={handleNewFeedback} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            New Feedback
          </Button>
        )}
      </div>

      {/* Trainer List View */}
      {!selectedTrainer && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trainer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredTrainers.map((trainer, index) => (
                <motion.div
                  key={trainer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card
                    className="glass-card cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] group"
                    onClick={() => handleTrainerSelect(trainer)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                          <AvatarImage src={trainer.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                            {trainer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold truncate">{trainer.name}</h3>
                            <TrendIcon trend={trainer.trend} />
                          </div>
                          <p className="text-sm text-muted-foreground">{trainer.specialization}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span className="text-sm font-medium">{trainer.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span className="text-xs">{trainer.totalFeedback}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <p className="text-lg font-bold text-primary">{trainer.scores.technique}%</p>
                          <p className="text-xs text-muted-foreground">Technique</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-emerald-500">{trainer.scores.communication}%</p>
                          <p className="text-xs text-muted-foreground">Communication</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-amber-500">{trainer.scores.motivation}%</p>
                          <p className="text-xs text-muted-foreground">Motivation</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredTrainers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No trainers found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Trainer View */}
      {selectedTrainer && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="profile" className="gap-2">
              <Users className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <FileText className="h-4 w-4" />
              Feedback History
            </TabsTrigger>
            <TabsTrigger value="new-feedback" className="gap-2">
              <Plus className="h-4 w-4" />
              New Feedback
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trainer Info Card */}
              <Card className="glass-card lg:col-span-1">
                <CardHeader>
                  <CardTitle>Trainer Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20 mb-4">
                      <AvatarImage src={selectedTrainer.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl font-bold">
                        {selectedTrainer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">{selectedTrainer.name}</h2>
                    <Badge variant="secondary" className="mt-2">{selectedTrainer.specialization}</Badge>
                    <div className="flex items-center gap-2 mt-3">
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                      <span className="text-2xl font-bold">{selectedTrainer.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">/ 5.0</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on {selectedTrainer.totalFeedback} feedback entries
                    </p>
                  </div>

                  {/* Performance Trend */}
                  <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/50">
                    <TrendIcon trend={selectedTrainer.trend} />
                    <span className="text-sm font-medium">
                      {selectedTrainer.trend === "up" ? "Improving" : 
                       selectedTrainer.trend === "down" ? "Needs attention" : "Stable"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Scores */}
              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Scores</CardTitle>
                  <CardDescription>Key performance metrics across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(selectedTrainer.scores).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{key}</span>
                          <span className="text-sm font-bold">{value}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FEEDBACK_CATEGORIES.map((cat) => (
                <Card
                  key={cat.id}
                  className="glass-card cursor-pointer hover:shadow-lg transition-all group"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveTab("new-feedback");
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                      cat.color
                    )}>
                      <cat.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">Submit feedback</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <TrainerAnalyticsDashboard 
              selectedTrainerId={selectedTrainer.id} 
              onTrainerSelect={() => {}}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <TrainerFeedbackHistory 
              trainerId={selectedTrainer.id}
              trainerName={selectedTrainer.name}
              feedback={trainerFeedback}
              isLoading={isLoadingFeedback}
            />
          </TabsContent>

          {/* New Feedback Tab */}
          <TabsContent value="new-feedback">
            <DynamicFeedbackForm
              trainer={selectedTrainer}
              category={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onSuccess={handleFeedbackSubmitted}
              onCancel={() => setActiveTab("profile")}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
