import { ThemeConfig, Domain, SkillLevel, InterviewMode } from './types';

export const DOMAINS: Domain[] = [
  'Software Engineering',
  'Data Science & AI',
  'Product Management',
  'Design & UX',
  'HR & Operations',
  'Finance & Fintech',
  'Marketing & Growth',
  'Sales & Business Development',
  'Legal & Compliance',
  'Healthcare & Medicine',
  'Education & EdTech',
  'Real Estate & Construction',
  'Customer Support & Success',
  'Security & Defense',
  'Aviation & Aerospace',
  'Media & Entertainment',
  'Manufacturing & Logistics',
  'Hospitality & Tourism',
  'Energy & Sustainability'
];

export const SKILL_LEVELS: SkillLevel[] = [
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Executive'
];

export const INTERVIEW_MODES: { id: InterviewMode; label: string; icon: string; description: string; count: number }[] = [
  { id: 'Quick', label: 'Quick Blitz', icon: 'bolt', description: '5 rapid-fire questions for daily practice.', count: 5 },
  { id: 'Full', label: 'Full Mock', icon: 'list_alt', description: '20 questions simulating a real-world interview.', count: 20 },
  { id: 'Technical', label: 'Deep Technical', icon: 'terminal', description: 'Focus on DSA, Architecture, and Language internals.', count: 10 },
  { id: 'Behavioral', label: 'Soft Skills (STAR)', icon: 'groups', description: 'Leadership, conflict, and situational scenarios.', count: 8 },
  { id: 'System Design', label: 'System Design', icon: 'schema', description: 'High-level architecture and scalability.', count: 5 },
  { id: 'Mixed', label: 'Mixed Mode', icon: 'layers', description: 'A balance of technical and behavioral questions.', count: 12 }
];

export const THEMES: ThemeConfig[] = [
  { id: 'exclusive-light', name: 'Exclusive Light', primary: '#3b82f6', bg: '#ffffff', text: '#0f172a', isDark: false },
  { id: 'pro-dark', name: 'Professional Dark', primary: '#60a5fa', bg: '#0f172a', text: '#f8fafc', isDark: true }
];

export const QUESTION_TAGS = ['DSA', 'ML', 'NLP', 'OOP', 'DBMS', 'OS', 'System Design', 'HR', 'React', 'Product Sense', 'Communication'];
