// Exportar todos los shapes personalizados
export { GoalkeeperShapeUtil, type GoalkeeperShape } from './GoalkeeperShape';
export { ConeShapeUtil, type ConeShape } from './ConeShape';
export { BallShapeUtil, type BallShape } from './BallShape';
export { DummyShapeUtil, type DummyShape } from './DummyShape';
export { LadderShapeUtil, type LadderShape } from './LadderShape';
export { HoopShapeUtil, type HoopShape } from './HoopShape';
export { RebounderShapeUtil, type RebounderShape } from './RebounderShape';
export { GoalShapeUtil, type GoalShape } from './GoalShape';
export { HurdleShapeUtil, type HurdleShape } from './HurdleShape';

// Re-exportar tipos útiles de tldraw
import { TLBaseShape } from '@tldraw/tldraw';
export type { TLBaseShape };
