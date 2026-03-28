import type { Project, Theme } from './types';

export type WorkspaceSnapshot = {
  projects: Project[];
  availableTags: string[];
  theme: Theme;
};
