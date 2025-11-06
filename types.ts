
export interface Match {
  id: number;
  championName: string;
  championIconUrl: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gold: number;
  durationMinutes: number;
}

export interface SummonerData {
  gameName: string;
  tagLine: string;
  iconUrl: string;
  level: number;
  rank: string;
  winRate: number;
  kda: number;
  avgCsPerMinute: number;
  recentMatches: Match[];
}
