export interface Territory {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export type TerritoryId = 'federation' | 'neutral';
