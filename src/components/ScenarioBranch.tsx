import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRight, GitBranch, Target } from 'lucide-react';
import { OutreachTemplate } from './OutreachTemplate';

interface ScenarioOption {
  id: string;
  title: string;
  description: string;
  condition: string;
  color: string;
  icon: React.ReactNode;
  templates: string[];
}

interface ScenarioBranchProps {
  title: string;
  description: string;
  scenarios: ScenarioOption[];
  phase: any;
}

export const ScenarioBranch: React.FC<ScenarioBranchProps> = ({ 
  title, 
  description, 
  scenarios, 
  phase 
}) => {
  return (
    <Card className="scenario-branch-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {scenarios.map((scenario, index) => (
            <div key={scenario.id} className="relative">
              {/* Branch connector */}
              <div className="absolute -left-6 top-4 w-6 h-0.5 bg-gradient-to-r from-border to-primary/50" />
              
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="scenario-option-card cursor-pointer hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${scenario.color}-500/20 text-${scenario.color}-500`}>
                            {scenario.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold">{scenario.title}</h4>
                            <p className="text-xs text-muted-foreground">{scenario.description}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {scenario.condition}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {scenario.templates.length} Templates
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>

                <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto glass-card">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${scenario.color}-500/20 text-${scenario.color}-500`}>
                        {scenario.icon}
                      </div>
                      {scenario.title}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <OutreachTemplate 
                    step={{
                      id: scenario.id,
                      title: scenario.title,
                      timeline: scenario.condition,
                      action: scenario.description,
                      comms: 'Multi-Channel',
                      logic: `Scenario-based approach for ${scenario.title.toLowerCase()}`,
                      icon: scenario.icon,
                      templates: scenario.templates,
                      color: scenario.color
                    }} 
                    phase={phase} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};