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
  // ORIGINAL TEMPLATES
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

  // SCENARIO 1: TRIAL CLASS DAY MANAGEMENT TEMPLATES
  'pre-trial-24h-advanced': {
    title: 'T-24 Hours Pre-Trial (Advanced)',
    type: 'WhatsApp',
    content: `Hi [Name]! 🌟

Tomorrow's the big day! I'm genuinely excited for you to experience what makes Physique 57 so special.

Quick prep checklist:
✅ Comfortable workout clothes (form-fitting preferred for proper form feedback)
✅ Water bottle (stay hydrated!)
✅ Arrive 15 minutes early (I want to personally welcome you)
✅ Positive energy (that's the most important thing!)

Tonight's homework: Get a good night's sleep and maybe do some light stretching. Your body will thank you tomorrow!

I'll be there to greet you personally. Any last-minute jitters or questions?

See you bright and early! 💪✨

P.S. - [Instructor Name] is SO excited to meet you. She's planned the perfect modifications to make your first class amazing.`
  },

  'pre-trial-2h-advanced': {
    title: 'T-2 Hours Pre-Trial (Advanced)',
    type: 'WhatsApp',
    content: `Good morning [Name]! ☀️

Today's your day! I woke up excited knowing you're about to discover something incredible about yourself.

Just confirmed with [Instructor Name] - she's ready to give you the royal treatment! 👑

Studio reminder:
📍 [Address] - Park in the visitor spots
⏰ Be there by [15 min before class time]  
📱 My direct number: [Number] - Call if you need ANYTHING

Fun fact: 87% of our members say their first class exceeded expectations. I have a feeling you'll be in that group!

Can't wait to hear all about it afterward! 🎉`
  },

  'arrival-welcome-script': {
    title: 'Upon Arrival Welcome Script',
    type: 'In-Person',
    content: `"[Name]! Oh my goodness, I'm so happy you're here! How are you feeling? Excited? Nervous? Both? 

That's totally normal - I still remember my first barre class. I thought I was fit, and then... well, you'll see! *laugh*

Come, let me show you around quickly and get you set up with everything you need."

STUDIO TOUR (2-3 minutes):
- Show changing area, water station, equipment storage
- Introduce to 2-3 members who are early arrivals
- Point out modification options visibly displayed
- KEY LINE: "See how welcoming everyone is? This community becomes like family."

INSTRUCTOR INTRODUCTION:
"[Instructor Name], meet [Client Name]! This is her very first Physique 57 experience. 

[To client] [Instructor] is absolutely incredible - she has this magical ability to push you just the right amount while making sure you feel supported. You're in the best hands!

[To instructor] We talked about [specific goal/concern client mentioned], so you know exactly how to help her today."`
  },

  'post-trial-conversion': {
    title: 'Post-Trial Conversion Script',
    type: 'In-Person',
    content: `HIGH-ENERGY APPROACH:
"[Name]! Oh my God, look at you! You're absolutely glowing! 

I was watching and you were CRUSHING it in there! Especially during [specific exercise] - [Instructor] and I were so impressed!

How do you feel right now? Be honest - on a scale of 1-10, how amazing do you feel?"

[Wait for response]

"That feeling you have right now? That's what our members get to experience 3-4 times a week. It's addictive in the best way possible!"

DISCOVERY QUESTIONS:
1. "What surprised you most about the class?"
2. "How did that compare to what you expected?"
3. "What part challenged you in the best way?"
4. "Could you see yourself doing this regularly?"

THE SOFT CLOSE:
"[Name], I have to be honest - I see something special in you. Your form, your energy, your determination... you're exactly the type of person who thrives in our community.

I know this might feel like a big decision, but here's what I want you to consider: You just proved to yourself that you can do something you weren't sure about. That's huge!

We have a few membership options, and I'd love to find one that fits perfectly with your lifestyle and goals. Do you have 5 minutes right now to look at what would work best for you?"`
  },

  // SCENARIO 2: TIME-BOUND OFFERS
  'founders-circle-offer': {
    title: 'Founder\'s Circle Offer (HOT Leads)',
    type: 'WhatsApp',
    content: `Hi [Name]!

After seeing your incredible energy in class today, I want to offer you something exclusive.

I'm inviting only 10 new members this month into our "Founder's Circle" - a special group that gets:

🌟 25% off your first 3 months of unlimited classes
💼 Priority booking (never worry about full classes)
🎯 Monthly private consultation with our head trainer
👥 Exclusive Founder's Circle events and workshops
📱 Direct WhatsApp line to me for anything you need

Here's the thing - this offer expires at midnight tomorrow, and I've already extended it to 8 people this month.

The last 2 spots are yours... if you want them.

Are you ready to make this commitment to yourself?

Reply "FOUNDER" and I'll get you set up immediately.

This could be the decision that changes everything. ✨`
  },

  'last-call-offer': {
    title: 'Last Call Offer (WARM Leads)',
    type: 'WhatsApp',
    content: `Hi [Name],

I've been thinking about our conversations, and I realize I haven't been completely honest with you.

The truth is: I see incredible potential in you. Your questions, your goals, your energy - everything tells me you're ready for transformation.

But here's what I'm worried about: You're going to keep "thinking about it" until the perfect moment that never comes.

So I'm taking the risk out of your decision:

🎯 Try us for 30 days - unlimited classes
💰 If you don't see results you love, full refund
📅 If you decide it's not for you, no pressure to continue
✨ If you love it (which I know you will), lock in our best rate

This offer is good for 7 days only. After that, it's back to regular pricing.

[Name], six months from now, you'll either be grateful you took this leap, or you'll wish you had.

Which person do you want to be?

Ready to bet on yourself? Reply "YES" and let's make this happen.`
  },

  'community-giveback-offer': {
    title: 'Community Give-Back Offer (COOL Leads)',
    type: 'WhatsApp',
    content: `Hi [Name],

I wanted to reach out with something different - not a sales pitch, but an invitation to be part of something special.

This month, we're launching our "Community Wellness Initiative" where we're offering 20 local women the chance to experience Physique 57 at a significantly reduced investment.

Why? Because we believe every woman deserves to feel strong, confident, and part of an amazing community - regardless of budget.

Here's what we're offering to our Community Wellness members:

💫 2 weeks unlimited classes for ₹2,999 (usually ₹6,000)
🤝 Option to bring a friend for free to any class
📚 Complimentary wellness workshop
🎯 Personal goal-setting session with our trainer

The catch? Only 20 spots available, and 13 are already taken.

This isn't about pressure - it's about possibility. If you've been waiting for the "right time" or the "right price," this might be it.

Spots are filling up fast, and once they're gone, they're gone until next quarter.

Interested? Reply "COMMUNITY" and I'll reserve your spot immediately.

Sometimes the best opportunities come disguised as limited-time offers. ✨`
  },

  // SCENARIO 3: HOSTED CLASS LEAD MANAGEMENT
  'hosted-class-rsvp': {
    title: 'Hosted Class RSVP Confirmation',
    type: 'WhatsApp',
    content: `Hi [Name]! 

So excited you're joining us for [Event Name] on [Date]! 🎉

Quick question to help me prepare the perfect experience for you: What's your main goal with fitness right now? Weight loss, stress relief, strength building, or just having fun?

Also, have you tried barre/cycling/strength training before, or will this be a totally new adventure?

Can't wait to meet you and show you what makes our community so special!

See you [Day] at [Time]! ✨

[Your Name] | Physique 57 India`
  },

  'hosted-class-arrival': {
    title: 'Hosted Class Arrival Script',
    type: 'In-Person',
    content: `"[Name]! Welcome! I'm so glad you made it! 

I loved your message about [specific goal they mentioned]. You're going to absolutely love what we have planned for you today.

Before we start - have you been to a boutique fitness class before, or is this your first experience with this style of workout?"

[Based on answer, provide appropriate context/encouragement]

"I'm going to introduce you to [2-3 other participants] - they're regulars here and absolute sweethearts. They'll make you feel right at home!"

DURING CLASS STRATEGY:
- Position new leads strategically (middle of room, near encouraging members)
- Provide extra attention and modifications
- Celebrate their effort publicly ("Great job [Name]! Love that determination!")
- Take mental notes of their strengths and struggles`
  },

  'hosted-class-immediate-followup': {
    title: 'Hosted Class Day-Of Follow-up',
    type: 'WhatsApp',
    content: `[Name]! 

What an absolute rockstar you were today! I'm still buzzing from the energy you brought to class! ⚡

That move during the [specific exercise] - you totally nailed it! [Instructor] and I were so impressed with your natural form.

I know today was just a taste, but how did it feel? Are you feeling those good endorphins right now?

I'd love to chat about how you can keep this momentum going. Are you free for a quick 5-minute call tomorrow? I have some ideas that I think would be perfect for you! 💪✨`
  },

  'hosted-class-day2-followup': {
    title: 'Hosted Class Day +2 Follow-up',
    type: 'WhatsApp',
    content: `Hi [Name],

I hope you're still feeling amazing from our class on [Day]! 

I've been thinking about what you shared with me about [specific goal/challenge], and I have an idea that might be perfect for you.

Our next "New Member Orientation" is happening this [Day], and I'd love to save you a spot. It's specifically designed for women like yourself who are ready to make a real change but want to feel confident and supported doing it.

Plus, I'll introduce you to [Member Name] - she started with the exact same goals as you and has had incredible results.

Interested? Just reply "SAVE MY SPOT" and it's yours! 

Looking forward to seeing you again soon! 🌟`
  },

  'hosted-class-final-attempt': {
    title: 'Hosted Class Final Attempt (Day +10)',
    type: 'WhatsApp',
    content: `Hi [Name],

This is my last message, and I want to be completely honest with you.

When you left our hosted class, you had this look on your face - part surprise, part pride, part "I can't believe I just did that!" I see it a lot with first-timers, but yours was different.

You looked like someone who had just remembered something important about herself.

I don't know what's holding you back from taking the next step - maybe it's timing, maybe it's budget, maybe it's fear, maybe it's just life getting in the way.

But I want you to know something: That woman who showed up to class, who pushed through when it got tough, who smiled even when she was shaking - she's still in there.

She's waiting for you to give her another chance.

If and when you're ready, you know where to find us. Your spot in our community is here whenever you decide you're worth it.

And trust me - you absolutely are. ❤️

[Your Name] | Physique 57 India

P.S. - If you ever just want to chat about fitness, goals, or life in general, my door is always open. Sometimes we all need someone who believes in us more than we believe in ourselves.`
  },

  // SCENARIO 4: CLASS ENGAGEMENT RECOVERY
  'post-class-2h-followup': {
    title: 'Post-Class 2-Hour Follow-up',
    type: 'WhatsApp',
    content: `[Name]! 

I'm still smiling thinking about your class today! The way you powered through those [specific challenging exercise] was absolutely inspiring! 💪

I saw you chatting with [Member Name] afterward - wasn't she amazing? She's exactly the type of supportive, badass woman you'll find in every single one of our classes.

Quick question: How's your body feeling right now? Energized? Sore? Ready for more? 😄

I'd love to keep this momentum going for you. When can we chat about your next steps?`
  },

  'post-class-day1-followup': {
    title: 'Post-Class Next Day Follow-up',
    type: 'WhatsApp',
    content: `Good morning [Name]! ☀️

How are you feeling after yesterday's class? That post-workout glow is real, isn't it?

I was just thinking about what you mentioned regarding [specific goal they shared]. After seeing you in action yesterday, I'm even more convinced that Physique 57 is going to be transformational for you.

You have natural strength and determination - I can tell you're someone who, once you commit to something, you go all in.

The question is: Are you ready to go all in on yourself?

I have some ideas I'd love to share with you. Coffee this week? My treat! ☕✨`
  },

  'value-first-approach': {
    title: 'Value-First Approach (Day 3)',
    type: 'WhatsApp',
    content: `Hi [Name],

No pressure to respond, but I wanted to share something with you that I think you'd find valuable.

I noticed during class that you have incredible core strength but might benefit from some additional flexibility work. I put together a quick 5-minute morning routine that would perfectly complement what you're doing in our classes.

[Attach video or PDF of simple routine]

This is my gift to you - whether you decide to continue with us or not. I just want to see you succeed in whatever fitness journey you choose.

If you try it, I'd love to hear how it feels! And if you have questions about anything fitness-related, I'm always here to help.

Keep being amazing! 🌟`
  },

  'community-insider-approach': {
    title: 'Community Insider Approach (Day 5)',
    type: 'WhatsApp',
    content: `Hey [Name]!

Funny story - [Member Name] asked about you yesterday! She remembered meeting you after class and wanted to know if you'd joined us yet.

That's just the kind of community we have here - people genuinely care about each other's success.

She actually invited you (and me!) to coffee this Saturday morning before the 9am class. She said she'd love to share her transformation story with you and answer any questions about what it's really like to be part of our P57 family.

Interested? No pressure to take a class - just good conversation with an amazing woman who's been exactly where you are now.

Let me know! ☕💪`
  },

  'behind-scenes-approach': {
    title: 'Behind-the-Scenes Approach (Day 7)',
    type: 'WhatsApp',
    content: `[Name],

I wanted to share something personal with you.

Yesterday, our instructor [Name] asked me about "that amazing new client with the positive energy and great form." She was talking about you.

It made me realize - you made an impression in just one class. Not just on me, but on our instructor and other members too.

That's rare.

I've been in this industry for [X] years, and I can usually tell within the first class if someone has "it" - that special combination of determination, positivity, and potential that makes them not just successful, but inspirational to others.

You have it.

The question is: What are you going to do with it?

I'm not going to keep chasing you with offers and deals. Instead, I'm going to make you a simple promise:

If you're ready to bet on yourself, I'll bet on you too. Come back for one more class - on us - and let's see what happens when you really let yourself shine.

No strings attached. No pressure to sign up afterward. Just pure opportunity to surprise yourself again.

Deal?

Reply "DEAL" and I'll get you set up immediately.

Looking forward to your answer,
[Your Name] ✨`
  },

  'nuclear-option-final': {
    title: 'Nuclear Option - Final Attempt (Day 10)',
    type: 'WhatsApp',
    content: `[Name],

This is my final message, and I'm going to be brutally honest.

I've been doing this for [X] years, and I've learned to recognize something special when I see it.

When you walked into that class, you had this energy - not just excitement, but this quiet confidence that said "I'm ready for something new."

During the class, when things got tough, instead of giving up or complaining, you smiled. You actually smiled while shaking through a challenging exercise.

After class, when other members were introducing themselves to you, you lit up. You belonged in that room, with those people, in that moment.

I don't know why you haven't taken the next step. Maybe you're scared. Maybe you don't think you're worth the investment. Maybe you're waiting for the "perfect" time.

But here's what I know: Perfect doesn't exist. There will never be a perfect time, a perfect budget, or a perfect schedule.

There's only now. There's only the choice to bet on yourself or to keep waiting for someday.

[Name], you are worth the investment. You deserve to feel strong, confident, and part of an amazing community. You deserve to surprise yourself with what you're capable of.

But I can't make that decision for you. Only you can.

If you're ready - and I mean really ready - to change your life, reply to this message.

If not, I wish you all the best, and I hope you find what you're looking for.

Either way, I'm grateful we met, and I'm grateful you reminded me why I love what I do.

Take care of yourself,
[Your Name] ❤️

P.S. - That smile you had during class? The world needs more of that. Don't keep it to yourself.`
  },

  // ADDITIONAL CORE TEMPLATES
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