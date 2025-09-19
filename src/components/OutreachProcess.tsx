import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MessageSquare, Phone, Mail, User, Target, CheckCircle, ArrowDown, ArrowRight, Zap, Heart, Users, TrendingUp } from 'lucide-react';
import { OutreachTemplate } from './OutreachTemplate';
import { VerticalTimeline } from './VerticalTimeline';
import { ScenarioBranch } from './ScenarioBranch';
import { ModeToggle } from './mode-toggle';

interface Step {
  id: string;
  title: string;
  timeline: string;
  action: string;
  comms: string;
  logic: string;
  icon: React.ReactNode;
  templates?: string[];
  color: string;
}

interface Phase {
  id: string;
  title: string;
  timeline: string;
  description: string;
  steps: Step[];
  color: string;
  icon: React.ReactNode;
}

const outreachPhases: Phase[] = [
  {
    id: 'phase-0',
    title: 'Lead Ingestion & Instant Triage',
    timeline: 'Instantaneous',
    description: 'Lightning-fast lead classification and routing for immediate response',
    color: 'from-red-500 to-orange-500',
    icon: <Zap className="w-5 h-5" />,
    steps: [
      {
        id: 'step-0-1',
        title: 'Automated Notification',
        timeline: 'Instant',
        action: 'CRM notification triggered for new Tier 1 lead',
        comms: 'Internal System',
        logic: 'Speed is paramount - move from lead creation to outreach in under 5 minutes',
        icon: <Zap className="w-4 h-4" />,
        color: 'red'
      },
      {
        id: 'step-0-2',
        title: 'Triage & Classification',
        timeline: '1-5 minutes',
        action: 'Classify lead by source, format interest, and communication preference',
        comms: 'Internal CRM',
        logic: 'Personalized approach from first contact - prevents generic outreach',
        icon: <Target className="w-4 h-4" />,
        templates: ['classification-template'],
        color: 'orange'
      }
    ]
  },
  {
    id: 'phase-1',
    title: 'Immediate Engagement & Rapport',
    timeline: '0-6 Hours',
    description: 'Capitalize on peak interest with warm, personalized welcome messages',
    color: 'from-emerald-500 to-teal-500',
    icon: <MessageSquare className="w-5 h-5" />,
    steps: [
      {
        id: 'step-1-1',
        title: 'First Touchpoint',
        timeline: 'Within 5 minutes',
        action: 'Send personalized welcome message based on interest',
        comms: 'WhatsApp/Email',
        logic: 'Strike while iron is hot - lead is actively thinking about fitness',
        icon: <MessageSquare className="w-4 h-4" />,
        templates: ['barre-welcome', 'cycle-welcome', 'general-welcome'],
        color: 'emerald'
      },
      {
        id: 'step-1-2',
        title: 'First Follow-Up',
        timeline: '6 hours if no response',
        action: 'Send social proof message with member story',
        comms: 'WhatsApp/Email',
        logic: 'Gentle reminder with credibility building - makes brand feel accessible',
        icon: <Users className="w-4 h-4" />,
        templates: ['social-proof-followup'],
        color: 'teal'
      }
    ]
  },
  {
    id: 'phase-2',
    title: 'Discovery & Value Building',
    timeline: '24-48 Hours',
    description: 'Deepen connection through discovery calls and value-driven content',
    color: 'from-blue-500 to-indigo-500',
    icon: <Phone className="w-5 h-5" />,
    steps: [
      {
        id: 'step-2-1',
        title: 'Discovery Call / Value Message',
        timeline: 'Day 2',
        action: 'Initiate phone call or send pattern-interrupting video message',
        comms: 'Phone/WhatsApp Video',
        logic: 'Voice builds rapport - move from salesperson to trusted advisor',
        icon: <Phone className="w-4 h-4" />,
        templates: ['discovery-call-script', 'video-message'],
        color: 'blue'
      }
    ]
  },
  {
    id: 'phase-3',
    title: 'The Experience - Trial & Conversion',
    timeline: 'Event-Driven',
    description: 'Curate flawless trial experience and capitalize on post-workout high',
    color: 'from-purple-500 to-pink-500',
    icon: <Heart className="w-5 h-5" />,
    steps: [
      {
        id: 'step-3-1',
        title: 'Pre-Trial Optimization',
        timeline: 'T-24h & T-2h',
        action: 'Send prep checklist and final encouragement',
        comms: 'WhatsApp',
        logic: 'Reduce no-shows and build excitement - shows premium care',
        icon: <Clock className="w-4 h-4" />,
        templates: ['pre-trial-24h', 'pre-trial-2h'],
        color: 'purple'
      },
      {
        id: 'step-3-2',
        title: 'In-Studio Experience',
        timeline: 'Day of Trial',
        action: 'VIP welcome, tour, and instructor handoff',
        comms: 'In-Person',
        logic: 'First 5 minutes set entire brand perception - feel like family',
        icon: <User className="w-4 h-4" />,
        templates: ['in-studio-checklist'],
        color: 'pink'
      },
      {
        id: 'step-3-3',
        title: 'Post-Trial Conversion',
        timeline: 'Within 5 minutes of class end',
        action: 'Capitalize on endorphin high for conversion',
        comms: 'In-Person',
        logic: 'Peak receptivity moment - connect feeling to membership benefits',
        icon: <CheckCircle className="w-4 h-4" />,
        templates: ['post-trial-script'],
        color: 'fuchsia'
      }
    ]
  },
  {
    id: 'phase-4',
    title: 'Educational Nurture & Urgency',
    timeline: 'Day 4-7',
    description: 'Address rational objections with educational content and clear CTAs',
    color: 'from-amber-500 to-yellow-500',
    icon: <Mail className="w-5 h-5" />,
    steps: [
      {
        id: 'step-4-1',
        title: 'Value-Driven Email',
        timeline: 'Day 4-5',
        action: 'Send educational content about method effectiveness',
        comms: 'Email + WhatsApp nudge',
        logic: 'Address logical objections with scientific proof and authority',
        icon: <Mail className="w-4 h-4" />,
        templates: ['science-email', 'whatsapp-nudge'],
        color: 'amber'
      }
    ]
  },
  {
    id: 'phase-5',
    title: 'The Final Invitation',
    timeline: 'Day 10-14',
    description: 'Honest, direct approach with irresistible risk-free offers',
    color: 'from-rose-500 to-red-500',
    icon: <Target className="w-5 h-5" />,
    steps: [
      {
        id: 'step-5-1',
        title: 'Honest & Direct Offer',
        timeline: 'Day 10-12',
        action: 'Heartfelt message addressing hesitation with guarantee',
        comms: 'WhatsApp',
        logic: 'Cut through sales-speak - vulnerable approach removes all risk',
        icon: <Heart className="w-4 h-4" />,
        templates: ['honest-offer'],
        color: 'rose'
      },
      {
        id: 'step-5-2',
        title: 'Time-Bound Offer',
        timeline: 'If positive response',
        action: 'Deploy specific urgency offer based on lead temperature',
        comms: 'WhatsApp/Phone',
        logic: 'Final push with compelling reason to act now',
        icon: <Clock className="w-4 h-4" />,
        templates: ['founders-circle', 'last-call', 'trial-guarantee'],
        color: 'red'
      },
      {
        id: 'step-5-3',
        title: 'Final Call',
        timeline: '48 hours if no response',
        action: 'Direct phone call to understand objections',
        comms: 'Phone Call',
        logic: 'Highest-effort touchpoint for definitive yes/no closure',
        icon: <Phone className="w-4 h-4" />,
        templates: ['final-call-script'],
        color: 'red'
      }
    ]
  },
  {
    id: 'phase-6',
    title: 'Conversion & Seamless Onboarding',
    timeline: 'Immediate upon purchase',
    description: 'Effortless transaction process with celebratory welcome experience',
    color: 'from-green-500 to-emerald-500',
    icon: <CheckCircle className="w-5 h-5" />,
    steps: [
      {
        id: 'step-6-1',
        title: 'Purchase Process',
        timeline: 'Immediate',
        action: 'Simple payment + structured welcome process',
        comms: 'In-Person/Email',
        logic: 'Smooth transaction validates decision and reduces buyer remorse',
        icon: <CheckCircle className="w-4 h-4" />,
        templates: ['welcome-email', 'membership-guide'],
        color: 'green'
      }
    ]
  },
  {
    id: 'phase-7',
    title: 'Long-Term Nurture',
    timeline: '14+ Days',
    description: 'Stay top-of-mind with value-driven content for future conversions',
    color: 'from-slate-500 to-gray-500',
    icon: <TrendingUp className="w-5 h-5" />,
    steps: [
      {
        id: 'step-7-1',
        title: 'Nurture Sequence',
        timeline: 'Ongoing',
        action: 'Monthly newsletter, seasonal offers, quarterly check-ins',
        comms: 'Email/WhatsApp',
        logic: '"No for now" doesn\'t mean "no forever" - maintain relationship',
        icon: <TrendingUp className="w-4 h-4" />,
        templates: ['monthly-newsletter', 'seasonal-offers', 'quarterly-checkin'],
        color: 'slate'
      }
    ]
  },
  {
    id: 'phase-8',
    title: 'Post-Purchase Engagement & Growth',
    timeline: 'Ongoing from Day 1',
    description: 'Nurture new members into loyal advocates with structured touchpoints',
    color: 'from-violet-500 to-purple-500',
    icon: <Users className="w-5 h-5" />,
    steps: [
      {
        id: 'step-8-1',
        title: 'Member Journey',
        timeline: 'First 30 days',
        action: 'Check-ins, milestone celebrations, community integration',
        comms: 'In-Person/Email/WhatsApp',
        logic: 'Transform customer into loyal advocate - identify growth opportunities',
        icon: <Users className="w-4 h-4" />,
        templates: ['30-day-checkin', 'milestone-celebration', 'referral-request'],
        color: 'violet'
      }
    ]
  }
];

export const OutreachProcess: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [activePhase, setActivePhase] = useState<string>('phase-0');
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const handlePhaseSelect = (phaseId: string) => {
    setActivePhase(phaseId);
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20">
        <div className="absolute inset-0 opacity-50" 
             style={{backgroundImage: "url('data:image/svg+xml;charset=utf-8,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}} />
        
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-10">
          <ModeToggle />
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              Physique 57 India • Tier 1 Lead Journey
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Member Outreach Process
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              A comprehensive, high-touch journey transforming leads into loyal community members through strategic touchpoints and personalized experiences.
            </p>
            
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>8 Strategic Phases</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-purple" />
                <span>25+ Touchpoints</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-blue" />
                <span>Premium Experience</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Interactive Journey Timeline</h2>
          <p className="text-muted-foreground">
            Click any phase card to explore the detailed steps and strategies
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent-purple to-accent-blue opacity-30" />
          
          <div className="space-y-6">
            {outreachPhases.map((phase, phaseIndex) => (
              <div key={phase.id} className="relative">
                {/* Timeline Dot */}
                <div className="absolute left-6 z-10">
                  <div className={`
                    w-4 h-4 rounded-full border-2 transition-all duration-300
                    ${activePhase === phase.id 
                      ? 'bg-primary border-primary shadow-lg shadow-primary/50' 
                      : 'bg-background border-border hover:border-primary'
                    }
                  `} />
                </div>
                
                {/* Phase Number */}
                <div className="absolute left-2 top-6 z-10">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${activePhase === phase.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {phaseIndex}
                  </div>
                </div>

                {/* Phase Card */}
                <Card 
                  className={`
                    ml-16 cursor-pointer transition-all duration-300 hover:shadow-lg
                    ${activePhase === phase.id 
                      ? 'ring-2 ring-primary shadow-lg shadow-primary/25' 
                      : 'hover:shadow-lg'
                    }
                  `}
                  onClick={() => handlePhaseSelect(phase.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${phase.color}`}>
                          {phase.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{phase.title}</h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {phase.timeline}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-2">
                            {phase.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <ArrowDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${expandedPhase === phase.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expandable Steps Content */}
                  {expandedPhase === phase.id && (
                    <CardContent className="pt-0 space-y-4 border-t border-border/50">
                      <div className="text-sm font-medium text-muted-foreground mb-4">
                        Phase Steps ({phase.steps.length} steps)
                      </div>
                      {phase.steps.map((step, stepIndex) => (
                        <div key={step.id} className="relative">
                          {/* Connection Line */}
                          {stepIndex < phase.steps.length - 1 && (
                            <div className="absolute left-4 top-8 w-0.5 h-8 bg-border" />
                          )}
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <div 
                                className="step-card bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStep(step);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                      {step.icon}
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm">{step.title}</h4>
                                      <p className="text-xs text-muted-foreground">{step.timeline}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {step.templates && (
                                      <Badge variant="outline" className="text-xs">
                                        {step.templates.length} Template{step.templates.length > 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                </div>
                                
                                <div className="mt-2 pl-11">
                                  <p className="text-xs text-muted-foreground mb-1">{step.action}</p>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" />
                                      {step.comms}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </DialogTrigger>

                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto glass-card">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-xl">
                                  <div className={`p-2 rounded-lg bg-gradient-to-r ${phase.color}`}>
                                    {step.icon}
                                  </div>
                                  {step.title}
                                </DialogTitle>
                              </DialogHeader>
                              
                              <OutreachTemplate step={step} phase={phase} />
                            </DialogContent>
                          </Dialog>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>

                {/* Connection Arrow */}
                {phaseIndex < outreachPhases.length - 1 && (
                  <div className="flex justify-center my-4">
                    <ArrowDown className="w-4 h-4 text-muted-foreground animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};