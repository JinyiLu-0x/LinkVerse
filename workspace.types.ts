import type { DatabaseDefinition, Project, Theme } from './types';

export type WorkspaceSnapshot = {
  projects: Project[];
  availableTags: string[];
  databases: DatabaseDefinition[];
  theme: Theme;
};
