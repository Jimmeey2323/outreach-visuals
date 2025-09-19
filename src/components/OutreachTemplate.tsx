import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MessageSquare, Phone, Mail, Target, AlertCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
  color: string;
  icon: React.ReactNode;
}

interface OutreachTemplateProps {
  step: Step;
  phase: Phase;
}

const templateContent: Record<string, { title: string; content: string; type: string }> = {
  'barre-welcome': {
    title: 'Barre Interest Welcome',
    type: 'WhatsApp/Email',
    content: `Hi [Name]! 👋

Welcome to the Physique 57 family! I'm [Your Name], and I'm absolutely thrilled you're interested in our barre classes.

I saw you inquired about our sculpting and toning program - you're going to LOVE what we have in store for you! Our barre method is designed to:
✨ Sculpt lean, defined muscles
✨ Improve posture & flexibility  
✨ Build incredible core strength
✨ Create that dancer-like grace

I'd love to understand your specific goals better. Are you looking to:
• Tone specific areas?
• Build strength?
• Improve flexibility?
• All of the above? 😊

I have the perfect instructor and class time in mind for you based on your goals. When would be the best time for a quick 5-minute chat?

Can't wait to help you discover your strongest, most confident self!

[Your Name]
Physique 57 India`
  },
  'cycle-welcome': {
    title: 'Cycle/Strength Interest Welcome',
    type: 'WhatsApp/Email',
    content: `Hey [Name]! 🔥

HIGH ENERGY. INCREDIBLE RESULTS. AMAZING COMMUNITY.

That's what you just stepped into with Physique 57! I'm [Your Name] and I'm pumped you're interested in our cycle and strength training.

Our members are absolutely obsessed with the results they're seeing:
💪 Increased stamina & endurance
💪 Lean muscle building
💪 Metabolic boost that lasts hours
💪 The most supportive community you'll ever find

Plus, I have something exclusive I'd love to share with newcomers like you - our 2-for-1 Newcomer Pack that nobody knows about yet!

When would be a good time for a quick call? I'd love to:
✓ Learn about your fitness goals
✓ Recommend the perfect class format
✓ Share this special newcomer offer
✓ Get you started this week!

Ready to unleash your inner athlete? 🚀

[Your Name]
Physique 57 India`
  },
  'general-welcome': {
    title: 'General Fitness Inquiry Welcome',
    type: 'WhatsApp/Email',
    content: `Hi [Name]! ✨

Thank you for reaching out to Physique 57! I'm [Your Name], and I'm excited to help you find your perfect fitness fit.

We offer several incredible formats:
🩰 BARRE - Sculpt, tone, and lengthen
🚴 CYCLE - High-energy cardio & endurance  
💪 STRENGTH - Build lean muscle & power

Each one delivers amazing results, but the magic happens when we match YOU with the right format for your goals, schedule, and preferences.

I'd love to have a quick 10-minute discovery call to:
✓ Understand your fitness goals
✓ Learn about your experience level
✓ Recommend the perfect starting point
✓ Share our newcomer options

When works best for you - morning, afternoon, or evening?

Looking forward to welcoming you to our incredible community!

[Your Name]
Physique 57 India`
  },
  'social-proof-followup': {
    title: 'Social Proof Follow-up',
    type: 'WhatsApp/Email',
    content: `Hi [Name], I know you're probably busy! 

I just wanted to share something exciting...

One of our members, Priya, started exactly where you might be now - curious about whether this was right for her, wondering if she'd fit in, if she could keep up.

Three months later? She just sent me a photo of her first pull-up EVER. At 34 years old! 

She said: "I didn't just get stronger physically - I discovered I'm capable of so much more than I thought."

That's the Physique 57 difference. It's not just about the workout - it's about discovering what you're truly capable of.

Would you like to experience what Priya felt in her very first class? I can block you a spot this week.

No pressure - just possibility! ✨

[Your Name]`
  },
  'discovery-call-script': {
    title: 'Discovery Call Script',
    type: 'Phone Call',
    content: `📞 DISCOVERY CALL SCRIPT (10-15 minutes)

OPENING (1-2 minutes):
"Hi [Name]! Thanks for taking the time to chat. I'm excited to learn more about you and see how we can help you reach your goals. Before we dive in, how has your day been?"

[Listen, acknowledge, build rapport]

"Perfect! So I know you reached out about [specific format/general fitness]. I'd love to understand what sparked your interest in exploring something new."

DISCOVERY QUESTIONS (5-7 minutes):
1. "What does your current fitness routine look like?"
2. "What are you hoping to achieve in the next 3-6 months?"
3. "Have you tried [barre/cycle/strength training] before?"
4. "What time of day do you prefer to work out?"
5. "What's most important to you - convenience, results, community, or something else?"

RECOMMENDATION PHASE (3-4 minutes):
Based on their answers, recommend:
- Specific format (barre/cycle/strength)
- Instructor match
- Class time that fits their schedule
- Beginner-friendly options

SOCIAL PROOF:
"This sounds similar to [member name] when she started. She was looking for [similar goal] and now [specific result/transformation]."

TRIAL BOOKING:
"I'd love to get you into a trial class this week. Based on what you've shared, I think [specific class] with [instructor] would be perfect. Does [day/time] work for you?"

CLOSE:
"Fantastic! I'll send you all the details and a prep checklist so you feel completely ready. You're going to love this!"

OBJECTION HANDLING:
Price: "I understand. What if I told you the investment works out to less than a fancy coffee per day for unlimited access?"
Time: "Many of our busiest members say this actually gives them MORE energy for everything else."
Intimidation: "Everyone feels that way at first. Our instructors specialize in making newcomers feel confident and supported."`
  },
  'video-message': {
    title: 'Pattern-Interrupting Video Message',
    type: 'WhatsApp Video/Audio',
    content: `🎥 VIDEO MESSAGE SCRIPT:

[Record a warm, energetic 60-90 second video message]

"Hi [Name]! 👋 I recorded this quick message just for you...

I wanted to share something that might interest you. I was just in our 6 AM barre class this morning, and I watched this amazing transformation happening right in front of me.

There was Sarah - she's been with us for 8 weeks now - and she's gone from barely being able to hold a plank for 10 seconds to absolutely crushing a 2-minute plank series. But here's the best part...

The SMILE on her face. The confidence. The way she carries herself now.

That's what happens here. It's not just about the physical changes - though those are incredible too - it's about discovering what you're capable of.

I'd love for you to experience that feeling. If you're curious, I can get you into a trial class this week with no pressure whatsoever.

Just reply 'YES' if you'd like me to reserve a spot for you.

Talk soon!
[Your Name]"

🎯 KEY DELIVERY TIPS:
- Speak naturally, with genuine enthusiasm
- Use their name multiple times
- Smile throughout - it shows in your voice
- Keep energy high but not overwhelming
- End with a clear, simple call-to-action`
  },
  'pre-trial-24h': {
    title: '24-Hour Pre-Trial Message',
    type: 'WhatsApp',
    content: `🌟 Tomorrow's the big day, [Name]!

I'm so excited for your first Physique 57 experience tomorrow at [TIME] with [INSTRUCTOR]!

Quick prep checklist to help you feel amazing:
✅ Wear comfortable athletic wear (leggings + top)
✅ Bring a water bottle 
✅ Grip socks recommended (we have them for purchase)
✅ Arrive 15 minutes early for your welcome tour
✅ Eat a light snack 1-2 hours before (not right before!)

Our studio is located at [ADDRESS] - there's convenient parking right outside.

[INSTRUCTOR] is absolutely incredible - she has this gift for making everyone feel confident and strong, no matter their fitness level. You're in the best hands!

Any questions at all? I'm here!

See you tomorrow - you're going to LOVE this! 💪✨

[Your Name]`
  },
  'pre-trial-2h': {
    title: '2-Hour Pre-Trial Encouragement',
    type: 'WhatsApp',
    content: `Good morning [Name]! ☀️

Today's your day! Just [X] hours until your Physique 57 experience at [TIME].

I know it's natural to feel a little nervous before trying something new - that just means you're about to do something amazing! 

Remember:
🎯 Everyone was a beginner once
🎯 [INSTRUCTOR] will guide you through everything
🎯 Listen to your body - modify when needed
🎯 Focus on how GOOD you're going to feel afterward

The studio address: [ADDRESS]
Your class: [CLASS TYPE] at [TIME]
Arrive: [15 minutes early]

You've got this! Can't wait to hear how incredible you feel afterward! 💪

[Your Name]
See you soon!`
  },
  'honest-offer': {
    title: 'Honest & Direct Offer',
    type: 'WhatsApp',
    content: `Hi [Name] 💭

I don't want to keep messaging if you're not interested, but I can't stop thinking about our conversation about your [specific goal mentioned].

Here's the thing - I've been in fitness for [X] years, and I can usually tell when someone is ready to make a real change in how they FEEL about themselves.

You have that readiness. I can hear it in how you talked about [specific thing they mentioned].

So I'm going to make you an offer that removes every possible risk:

Try us for 30 days. If you don't feel stronger, more confident, and genuinely excited about your progress, I'll personally refund every penny. No questions asked.

I can offer this because I've seen what happens when someone like you experiences what we do here. I'm that confident in the transformation you'll feel.

The only question is: are you ready to bet on yourself?

If yes, just reply "I'm ready" and I'll get everything set up for you to start this week.

If not, I totally understand and wish you all the best in your fitness journey.

[Your Name]`
  }
};

export const OutreachTemplate: React.FC<OutreachTemplateProps> = ({ step, phase }) => {
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const copyToClipboard = async (content: string, templateId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTemplate(templateId);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getCommIcon = (comms: string) => {
    if (comms.toLowerCase().includes('whatsapp')) return <MessageSquare className="w-4 h-4" />;
    if (comms.toLowerCase().includes('phone')) return <Phone className="w-4 h-4" />;
    if (comms.toLowerCase().includes('email')) return <Mail className="w-4 h-4" />;
    return <MessageSquare className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Step Overview */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${phase.color}`}>
              {step.icon}
            </div>
            <div>
              <CardTitle className="text-xl">{step.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {step.timeline}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {getCommIcon(step.comms)}
                  {step.comms}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Action</h4>
            <p className="text-foreground">{step.action}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Strategic Logic</h4>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">{step.logic}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      {step.templates && step.templates.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Communication Templates
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {step.templates.length === 1 ? (
              <div className="space-y-4">
                {step.templates.map((templateId) => {
                  const template = templateContent[templateId];
                  if (!template) return null;

                  return (
                    <div key={templateId} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{template.title}</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {template.type}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(template.content, templateId)}
                          className="flex items-center gap-2"
                        >
                          {copiedTemplate === templateId ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                        <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                          {template.content}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Tabs defaultValue={step.templates[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                  {step.templates.map((templateId) => {
                    const template = templateContent[templateId];
                    if (!template) return null;
                    
                    return (
                      <TabsTrigger key={templateId} value={templateId} className="text-xs">
                        {template.title}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                
                {step.templates.map((templateId) => {
                  const template = templateContent[templateId];
                  if (!template) return null;

                  return (
                    <TabsContent key={templateId} value={templateId} className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{template.title}</h4>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {template.type}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(template.content, templateId)}
                          className="flex items-center gap-2"
                        >
                          {copiedTemplate === templateId ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                        <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                          {template.content}
                        </pre>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};