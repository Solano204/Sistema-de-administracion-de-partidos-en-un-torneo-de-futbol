
  interface CardProps {
    content: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }
  
  // In types.ts
  export interface SlideItem {
    id: string; // Required for the list
    title: string;
    content: React.ReactNode;
  }
  
  export interface SliderProps {
    children: React.ReactNode;
    activeIndex?: number;
    className?: string;
    onIndexChange?: (index: number) => void;
  }