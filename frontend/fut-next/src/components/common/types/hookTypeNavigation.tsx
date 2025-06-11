// types.ts
export interface RouteItem {
  path: string;
  title: string;
  id: number;
}

export interface AnimationBarProps {
  routes: RouteItem[];
}

export interface AnimationHookReturn {
  handleNavigation: (path: string) => (e: React.MouseEvent) => void;
}