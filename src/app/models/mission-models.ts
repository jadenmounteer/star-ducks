export type MissionDifficulty = 'Easy' | 'Medium' | 'Hard';

export type MissionState = {
  startedAt: number;
  objectives: { [key: string]: boolean };
  failureConditions: { [key: string]: number };
};
