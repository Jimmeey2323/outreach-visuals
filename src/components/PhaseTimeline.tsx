import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, ArrowRight } from 'lucide-react';

interface Phase {
  id: string;
  title: string;
  timeline: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

interface PhaseTimelineProps {
  phases: Phase[];
  activePhase: string;
  onPhaseSelect: (phaseId: string) => void;
}

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({ 
  phases, 
  activePhase, 
  onPhaseSelect 
}) => {
  return (
    <div className="bg-muted/20 py-12 border-y border-border/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Journey Timeline</h2>
          <p className="text-muted-foreground">
            Click any phase to jump to the detailed breakdown
          </p>
        </div>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent-purple to-accent-blue opacity-30" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {phases.map((phase, index) => (
              <Card 
                key={phase.id}
                className={`
                  relative cursor-pointer transition-all duration-300 hover:scale-105
                  ${activePhase === phase.id 
                    ? 'ring-2 ring-primary shadow-lg shadow-primary/25' 
                    : 'hover:shadow-lg'
                  }
                `}
                onClick={() => onPhaseSelect(phase.id)}
              >
                {/* Phase Number */}
                <div className="absolute -top-3 left-4 z-10">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${activePhase === phase.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {index}
                  </div>
                </div>
                
                {/* Connection Arrow */}
                {index < phases.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-8 z-20">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                
                <CardContent className="p-4 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${phase.color} text-white`}>
                      {phase.icon}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {phase.timeline}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {phase.title}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {phase.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Current Phase</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span>Upcoming Phase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};