
export type SkillLevel = 'Junior' | 'Mid-Level' | 'Senior' | 'Lead' | 'Executive';

export type Domain = 
  | 'Software Engineering' 
  | 'Data Science & AI' 
  | 'Product Management' 
  | 'Design & UX' 
  | 'HR & Operations' 
  | 'Finance & Fintech' 
  | 'Marketing & Growth'
  | 'Sales & Business Development'
  | 'Legal & Compliance'
  | 'Healthcare & Medicine'
  | 'Education & EdTech' 
  | 'Real Estate & Construction'
  | 'Customer Support & Success'
  | 'Security & Defense'
  | 'Aviation & Aerospace'
  | 'Media & Entertainment'
  | 'Manufacturing & Logistics'
  | 'Hospitality & Tourism'
  | 'Energy & Sustainability';

export type InterviewMode = 'Quick' | 'Full' | 'Technical' | 'Behavioral' | 'System Design' | 'Mixed';

export interface UserProfile {
  name: string;
  profilePicture?: string;
  age?: number;
  dob?: string;
  sex?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  designation: string;
  targetRole: string;
  skillLevel: SkillLevel;
  domain: Domain;
  experienceYears: number;
  schoolName?: string;
  collegeName?: string;
  courseDegree?: string;
  graduationYear?: string;
  resumeText?: string;
  targetCompany?: string;
  jobDescription?: string;
}

export interface JobRecommendation {
  id: string;
  company: string;
  role: string;
  location: string;
  salaryRange?: string;
  matchScore: number;
  reason: string;
}

export interface ATSAnalysis {
  score: number;
  keywords: {
    matched: string[];
    missing: string[];
    critical: string[]; // Highly relevant keywords missing
  };
  skillGaps: { 
    skill: string; 
    priority: 'High' | 'Medium' | 'Low'; 
    suggestion: string 
  }[];
  formattingIssues: string[];
  suggestedBulletPoints: { 
    original: string; 
    improved: string; 
    rationale: string 
  }[];
  overallVerdict: string;
  actionPlan: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  tags: string[];
  difficulty: SkillLevel;
}

export interface Answer {
  questionId: string;
  questionText: string;
  userAnswer: string;
  audioUrl?: string;
  timeSpent: number;
}

export interface Feedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvedAnswer: string;
  analysis: string;
}

export interface InterviewSession {
  id: string;
  date: string;
  profile: UserProfile;
  mode: InterviewMode;
  isVoiceMode: boolean;
  questions: Question[];
  answers: Answer[];
  results?: {
    overallScore: number;
    detailedFeedback: Record<string, Feedback>;
    summary: string;
  };
}

export interface ThemeConfig {
  id: string;
  name: string;
  primary: string;
  bg: string;
  text: string;
  isDark: boolean;
}
