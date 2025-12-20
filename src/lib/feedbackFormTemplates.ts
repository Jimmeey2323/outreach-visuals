// Feedback form templates for different feedback categories
// These define the fields and sections for each feedback type

export interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "datetime" | "number" | "checkbox" | "rating" | "file" | "voice";
  required: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  allowAdditionalComments?: boolean;
  allowFileUpload?: boolean;
}

export interface FeedbackFormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: FormSection[];
}

// PowerCycle Feedback Form Template - based on user's sample
export const POWERCYCLE_FEEDBACK_TEMPLATE: FeedbackFormTemplate = {
  id: "powercycle",
  name: "PowerCycle Feedback",
  description: "Comprehensive evaluation form for PowerCycle class trainers",
  category: "powercycle",
  sections: [
    {
      id: "basic-info",
      title: "Basic Information",
      fields: [
        { id: "dateTime", label: "Date & Time", type: "datetime", required: true, placeholder: "Select date and time" },
        { id: "level", label: "Level", type: "select", required: true, options: ["Studio powerCycle", "powerCycle 45", "powerCycle Express", "powerCycle Endurance"] },
        { id: "evaluatedBy", label: "Evaluated By", type: "text", required: true, placeholder: "Your name" },
        { id: "trainerName", label: "Trainer Name", type: "text", required: true, placeholder: "Trainer being evaluated" },
        { id: "center", label: "Center", type: "select", required: true, options: ["Supreme HQ, Bandra", "Kwality House, Kemps Corner", "The Mews, Bandra", "Bangalore Studio"] },
      ],
    },
    {
      id: "pre-class",
      title: "Pre-Class Evaluation",
      description: "Evaluate the trainer's preparation and communication before class",
      allowAdditionalComments: true,
      allowFileUpload: true,
      fields: [
        { id: "preClassSetup", label: "❖ Pre-class set-up", type: "rating", required: true, min: 1, max: 5, description: "Rate the trainer's equipment and room preparation" },
        { id: "preClassCommunication", label: "❖ Pre-class communication and connection", type: "rating", required: true, min: 1, max: 5, description: "Rate how well the trainer connected with students before class" },
        { id: "preClassSOP", label: "❖ Pre-class SOP", type: "rating", required: true, min: 1, max: 5, description: "Rate adherence to standard operating procedures" },
      ],
    },
    {
      id: "class-delivery",
      title: "Class Delivery & Engagement",
      description: "Evaluate the trainer's performance during the class",
      allowAdditionalComments: true,
      allowFileUpload: true,
      fields: [
        { id: "overallEnergy", label: "❖ Overall class Energy, Motivation, USP integration", type: "rating", required: true, min: 1, max: 5, description: "Rate energy levels and how well unique selling points were integrated" },
        { id: "mindfulMoment", label: "❖ Mindful moment, FUN FACTOR", type: "rating", required: true, min: 1, max: 5, description: "Rate the inclusion of mindful moments and overall fun factor" },
        { id: "music", label: "❖ Music", type: "rating", required: true, min: 1, max: 5, description: "Rate music selection, timing, and energy matching" },
        { id: "useOfNames", label: "❖ Use of Names", type: "rating", required: true, min: 1, max: 5, description: "Rate how well the trainer used participant names" },
        { id: "timeManagement", label: "❖ Time Management", type: "rating", required: true, min: 1, max: 5, description: "Rate class timing and pacing" },
      ],
    },
    {
      id: "technical-skills",
      title: "Technical Skills",
      description: "Evaluate the trainer's technical teaching abilities",
      allowAdditionalComments: true,
      allowFileUpload: true,
      fields: [
        { id: "vocals", label: "❖ Vocals", type: "rating", required: true, min: 1, max: 5, description: "Rate clarity, volume, and effectiveness of verbal cues" },
        { id: "choreography", label: "❖ Choreography and Sequencing", type: "rating", required: true, min: 1, max: 5, description: "Rate the flow and creativity of movements" },
        { id: "programming", label: "❖ Programming Appropriation", type: "rating", required: true, min: 1, max: 5, description: "Rate how well the workout was programmed for the class level" },
        { id: "teachingStyles", label: "❖ Teaching styles", type: "rating", required: true, min: 1, max: 5, description: "Rate variety and effectiveness of teaching methods" },
      ],
    },
    {
      id: "voice-message",
      title: "Additional Feedback",
      description: "Add any voice notes or additional observations",
      fields: [
        { id: "voiceMessage", label: "Add a Voice Message", type: "voice", required: false, description: "Record any additional verbal feedback" },
        { id: "additionalNotes", label: "Additional Notes", type: "textarea", required: false, placeholder: "Any other observations or recommendations..." },
      ],
    },
  ],
};

// Barre Feedback Form Template
export const BARRE_FEEDBACK_TEMPLATE: FeedbackFormTemplate = {
  id: "barre",
  name: "Barre Feedback",
  description: "Comprehensive evaluation form for Barre class trainers",
  category: "barre",
  sections: [
    {
      id: "basic-info",
      title: "Basic Information",
      fields: [
        { id: "dateTime", label: "Date & Time", type: "datetime", required: true },
        { id: "level", label: "Level", type: "select", required: true, options: ["Studio Barre 57", "Barre 57 Express", "Barre Sculpt", "Advanced Barre"] },
        { id: "evaluatedBy", label: "Evaluated By", type: "text", required: true },
        { id: "trainerName", label: "Trainer Name", type: "text", required: true },
        { id: "center", label: "Center", type: "select", required: true, options: ["Supreme HQ, Bandra", "Kwality House, Kemps Corner", "The Mews, Bandra", "Bangalore Studio"] },
      ],
    },
    {
      id: "pre-class",
      title: "Pre-Class Evaluation",
      allowAdditionalComments: true,
      allowFileUpload: true,
      fields: [
        { id: "preClassSetup", label: "❖ Pre-class set-up", type: "rating", required: true, min: 1, max: 5 },
        { id: "preClassCommunication", label: "❖ Pre-class communication and connection", type: "rating", required: true, min: 1, max: 5 },
        { id: "preClassSOP", label: "❖ Pre-class SOP", type: "rating", required: true, min: 1, max: 5 },
      ],
    },
    {
      id: "class-delivery",
      title: "Class Delivery & Engagement",
      allowAdditionalComments: true,
      allowFileUpload: true,
      fields: [
        { id: "overallEnergy", label: "❖ Overall class Energy, Motivation, USP integration", type: "rating", required: true, min: 1, max: 5 },
        { id: "mindfulMoment", label: "❖ Mindful moment, FUN FACTOR", type: "rating", required: true, min: 1, max: 5 },
        { id: "music", label: "❖ Music", type: "rating", required: true, min: 1, max: 5 },
        { id: "useOfNames", label: "❖ Use of Names", type: "rating", required: true, min: 1, max: 5 },
        { id: "timeManagement", label: "❖ Time Management", type: "rating", required: true, min: 1, max: 5 },
      ],
    },
    {
      id: "technical-skills",
      title: "Technical Skills",
      allowAdditionalComments: true,
      allowFileUpload: true,
      fields: [
        { id: "vocals", label: "❖ Vocals", type: "rating", required: true, min: 1, max: 5 },
        { id: "choreography", label: "❖ Choreography and Sequencing", type: "rating", required: true, min: 1, max: 5 },
        { id: "programming", label: "❖ Programming Appropriation", type: "rating", required: true, min: 1, max: 5 },
        { id: "handsOnCorrections", label: "❖ Hands-on Corrections", type: "rating", required: true, min: 1, max: 5 },
        { id: "teachingStyles", label: "❖ Teaching styles", type: "rating", required: true, min: 1, max: 5 },
      ],
    },
  ],
};

// Quarterly Assessment Template - based on the Excel performance review
export const QUARTERLY_ASSESSMENT_TEMPLATE: FeedbackFormTemplate = {
  id: "quarterly",
  name: "Quarterly Assessment",
  description: "Quarterly trainer performance review with weighted categories",
  category: "quarterly",
  sections: [
    {
      id: "basic-info",
      title: "Assessment Information",
      fields: [
        { id: "reviewPeriod", label: "Review Period", type: "select", required: true, options: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024", "Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"] },
        { id: "trainerName", label: "Trainer Name", type: "text", required: true },
        { id: "evaluatedBy", label: "Evaluated By", type: "text", required: true },
        { id: "primaryLocation", label: "Primary Location", type: "select", required: true, options: ["Kemps Corner", "Bandra Mews", "Supreme HQ", "Bangalore"] },
      ],
    },
    {
      id: "client-metrics",
      title: "Client Metrics (Weight: 50%)",
      description: "Performance metrics related to client attendance and retention",
      allowAdditionalComments: true,
      fields: [
        { id: "clientAttendance", label: "Client Attendance (12.5%)", type: "number", required: true, min: 0, max: 12.5, step: 0.5, description: "Score based on average class attendance vs target" },
        { id: "clientRetention", label: "Client Retention (12.5%)", type: "number", required: true, min: 0, max: 12.5, step: 0.5, description: "Conversion rate and client return percentage" },
        { id: "clientConnection", label: "Client Connection & Communication (12.5%)", type: "number", required: true, min: 0, max: 12.5, step: 0.5, description: "Pre and post class interaction, interpersonal skills" },
        { id: "clientFeedback", label: "Client Feedback (12.5%)", type: "number", required: true, min: 0, max: 12.5, step: 0.5, description: "Overall client satisfaction and feedback scores" },
      ],
    },
    {
      id: "teaching-skills",
      title: "Teaching Skills (Weight: 40%)",
      description: "Technical and delivery skills evaluation",
      allowAdditionalComments: true,
      fields: [
        { id: "mindfulMoment", label: "Mindful Moment/USP Integration/Motivation (8%)", type: "number", required: true, min: 0, max: 8, step: 0.5 },
        { id: "musicality", label: "Musicality (8%)", type: "number", required: true, min: 0, max: 8, step: 0.5 },
        { id: "energyVocals", label: "Energy & Vocals (8%)", type: "number", required: true, min: 0, max: 8, step: 0.5, description: "Inflection, intonation, enunciation" },
        { id: "choreography", label: "Choreography & Sequencing (8%)", type: "number", required: true, min: 0, max: 8, step: 0.5 },
        { id: "learningStyles", label: "Learning Styles & Use of Names (8%)", type: "number", required: true, min: 0, max: 8, step: 0.5, description: "Kinesthetic, visual, auditory teaching" },
      ],
    },
    {
      id: "professionalism",
      title: "Professionalism (Weight: 10%)",
      description: "Work ethics and professional conduct",
      allowAdditionalComments: true,
      fields: [
        { id: "attendanceWorkshops", label: "Classes, Workshops, Meetings Attended (5%)", type: "number", required: true, min: 0, max: 5, step: 0.5 },
        { id: "workEthics", label: "Work Ethics & Core Values (5%)", type: "number", required: true, min: 0, max: 5, step: 0.5 },
      ],
    },
    {
      id: "summary",
      title: "Summary & Goals",
      fields: [
        { id: "totalScore", label: "Total Score (out of 100)", type: "number", required: false, min: 0, max: 100, step: 0.5 },
        { id: "highlights", label: "Highlights", type: "textarea", required: false, placeholder: "Key achievements and positive observations" },
        { id: "focusPoints", label: "Focus Points for Next Quarter", type: "textarea", required: false, placeholder: "Areas for improvement and development" },
        { id: "goals", label: "Goals for Next Quarter", type: "textarea", required: false, placeholder: "Specific, measurable goals" },
      ],
    },
  ],
};

// General Feedback Template
export const GENERAL_FEEDBACK_TEMPLATE: FeedbackFormTemplate = {
  id: "general",
  name: "General Feedback",
  description: "General trainer feedback for any class type",
  category: "general",
  sections: [
    {
      id: "basic-info",
      title: "Basic Information",
      fields: [
        { id: "dateTime", label: "Date & Time", type: "datetime", required: true },
        { id: "classType", label: "Class Type", type: "text", required: true, placeholder: "e.g., Yoga, Pilates, HIIT" },
        { id: "trainerName", label: "Trainer Name", type: "text", required: true },
        { id: "evaluatedBy", label: "Evaluated By", type: "text", required: true },
        { id: "center", label: "Center", type: "select", required: true, options: ["Supreme HQ, Bandra", "Kwality House, Kemps Corner", "The Mews, Bandra", "Bangalore Studio"] },
      ],
    },
    {
      id: "overall-rating",
      title: "Overall Rating",
      fields: [
        { id: "overallRating", label: "Overall Performance", type: "rating", required: true, min: 1, max: 5 },
        { id: "recommendation", label: "Would you recommend this trainer?", type: "select", required: true, options: ["Highly Recommend", "Recommend", "Neutral", "Do Not Recommend"] },
      ],
    },
    {
      id: "feedback",
      title: "Detailed Feedback",
      fields: [
        { id: "strengths", label: "Strengths", type: "textarea", required: false, placeholder: "What did the trainer do well?" },
        { id: "improvements", label: "Areas for Improvement", type: "textarea", required: false, placeholder: "What could be better?" },
        { id: "additionalComments", label: "Additional Comments", type: "textarea", required: false, placeholder: "Any other observations..." },
      ],
    },
  ],
};

// Export all templates
export const FEEDBACK_FORM_TEMPLATES: Record<string, FeedbackFormTemplate> = {
  powercycle: POWERCYCLE_FEEDBACK_TEMPLATE,
  barre: BARRE_FEEDBACK_TEMPLATE,
  quarterly: QUARTERLY_ASSESSMENT_TEMPLATE,
  general: GENERAL_FEEDBACK_TEMPLATE,
};

export function getFormTemplate(category: string): FeedbackFormTemplate {
  return FEEDBACK_FORM_TEMPLATES[category] || GENERAL_FEEDBACK_TEMPLATE;
}
