import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowDown } from 'lucide-react';

interface TimelinePhase {
  id: string;
  title: string;
  timeline: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

interface VerticalTimelineProps {
  phases: TimelinePhase[];
  activePhase: string;
  onPhaseSelect: (phaseId: string) => void;
}

export const VerticalTimeline: React.FC<VerticalTimelineProps> = ({ 
  phases, 
  activePhase, 
  onPhaseSelect 
}) => {
  return (
    <div className="relative">
      {/* Main Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent-purple to-accent-blue opacity-30" />
      
      <div className="space-y-6">
        {phases.map((phase, index) => (
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
                {index}
              </div>
            </div>

            {/* Phase Card */}
            <Card 
              className={`
                ml-16 cursor-pointer transition-all duration-300 hover:shadow-lg
                ${activePhase === phase.id 
                  ? 'ring-2 ring-primary shadow-lg shadow-primary/25 bg-primary/5' 
                  : 'hover:shadow-lg'
                }
              `}
              onClick={() => onPhaseSelect(phase.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${phase.color}`}>
                      {phase.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{phase.title}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {phase.timeline}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connection Arrow */}
            {index < phases.length - 1 && (
              <div className="flex justify-center my-4">
                <ArrowDown className="w-4 h-4 text-muted-foreground animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};