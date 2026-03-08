export enum Domain {
  PHYSICAL = "Physical",
  BUSINESS = "Business",
  ACADEMIC = "Academic",
  SOCIAL = "Social",
  PERSONAL = "Personal",
  FINANCIAL = "Financial"
}

export enum Quadrant {
  DO_NOW = "Do Now",
  SCHEDULE = "Schedule",
  DELEGATE = "Delegate",
  ELIMINATE = "Eliminate"
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  domain: Domain;
  urgency: number; // 1-10
  importance: number; // 1-10
  duration: number; // minutes
  quadrant: Quadrant;
  completed: boolean;
  timeblockStart?: string;
  timeblockEnd?: string;
  createdAt: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActive: string;
  skills: Record<Domain, number>;
}

export interface XPEvent {
  id: string;
  amount: number;
  reason: string;
  domain: Domain;
  timestamp: string;
}

export interface TimeBlock {
  id: string;
  taskId: string;
  start: string;
  end: string;
}
