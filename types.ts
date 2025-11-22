export interface Project {
  id: string;
  name: string;
  description: string;
  fullPrd: string;
  imageUrl?: string;
  createdAt: number;
  modelUsed: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CREATE = 'CREATE',
  DETAILS = 'DETAILS'
}

export interface GenerateResult {
  prd: string;
  imageUrl?: string;
}