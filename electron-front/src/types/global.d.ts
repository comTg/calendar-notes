// 添加canvas-confetti模块声明
declare module 'canvas-confetti' {
  type ConfettiOptions = {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: any[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  };

  type ConfettiFunction = (options?: ConfettiOptions) => Promise<null>;

  interface ConfettiObject extends ConfettiFunction {
    reset: () => void;
    create: (canvas: HTMLCanvasElement, options?: { resize?: boolean, useWorker?: boolean }) => ConfettiObject;
    shapeFromPath: (options: { path: string }) => any;
    shapeFromText: (options: { text: string, scalar?: number }) => any;
    Promise: typeof Promise;
  }

  const confetti: ConfettiObject;
  export default confetti;
} 