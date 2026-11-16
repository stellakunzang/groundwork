export interface WorkSearchActivity {
  id: string;
  date: string;
  companyName: string;
  companyId: string;
  role: string | null;
  activityType: string;
  method: string;
  detail?: string;
}

export interface WeekWin {
  id: string;
  date: string;
  label: string;
  detail?: string;
  companyId?: string;
  companyName?: string;
}

export interface ActionItem {
  id: string;
  priority: 'high' | 'medium' | 'low';
  label: string;
  detail: string;
  companyId?: string;
  companyName?: string;
}

export interface MomentumStats {
  totalInterviews: number;
  peopleMet: number;
  messagesSent: number;
  companiesExplored: number;
  stillWarm: number;
  activeInPipeline: number;
  activityLast30Days: number;
  activityPrior30Days: number;
}

export interface SourceInsight {
  source: string;
  applications: number;
  interviews: number;
}

export interface InsightsData {
  reportWeekLabel: string;
  currentWeekLabel: string;
  workSearchActivities: WorkSearchActivity[];
  weekWins: WeekWin[];
  actionItems: ActionItem[];
  momentum: MomentumStats;
  sourceInsights: SourceInsight[];
  stillWarmCompanies: {
    id: string;
    name: string;
    role: string | null;
    outcomeNotes: string | null;
  }[];
}
