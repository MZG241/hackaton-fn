export interface ISkill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface ILanguage {
  name: string;
  proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
}

export interface ICertification {
  name: string;
  issuer: string;
  issueDate?: string;
  certificateLink?: string;
}

export interface IProject {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  image?: string;
}

export interface IExperience {
  company: string;
  role: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM or null
  description: string;
  location?: string;
}

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear?: number;
  endYear?: number;
  grade?: string;
  certificateUrl?: string;
}

export interface IAvailability {
  status: "Available" | "Open to Offers" | "Not Available";
}

export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface IAIScores {
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  overallScore: number;
}

export interface IScreeningResult {
  _id?: string;
  job: string;
  applicant: string;
  fitScore: number;
  detailedAnalysis: string;
  status: "Passed" | "Borderline" | "Rejected";
  matchedSkills: string[];
  missingSkills: string[];
  yearsOfExperience: number;
  aiScores?: IAIScores;
  suggestedRole?: string;
  careerPathAdvice?: string;
  createdAt?: string;
}

export interface IUser {
  _id: string;
  fullname?: string;
  email: string;
  role: "admin" | "employer" | "jobseeker";
  isVerified: boolean;
  profileImage?: string;
  phone?: string;
  headline?: string;
  bio?: string;
  location?: string;

  // New Talent Profile Fields
  skills: ISkill[];
  languages: ILanguage[];
  certifications: ICertification[];
  projects: IProject[];
  experience: IExperience[];
  education: IEducation[];
  availability: IAvailability;
  socialLinks: ISocialLinks;

  // Employer specific
  companyName?: string;
  companyLogo?: string;
  companyDescription?: string;
  website?: string;

  // Job seeker specific
  resume?: string;
  resumeContent?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IJob {
  _id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  postedBy: string | IUser;
  salaryMin?: number;
  salaryMax?: number;
  skillsRequired: string[];
  requirements?: string[];
  isClosed: boolean;
  hasApplied?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IApplicant {
  _id: string;
  job: string | IJob;
  applicant: string | IUser;
  status: "Applied" | "In Review" | "Accepted" | "Rejected";
  resume?: string;
  coverLetter?: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}
