import { BaseBoxShapeUtil, TLBaseShape, HTMLContainer } from '@tldraw/tldraw';

// Definición del tipo de shape para portero
export type GoalkeeperShape = TLBaseShape<
  'goalkeeper',
  {
    w: number;
    h: number;
    color: string;
  }
>;

// Utilidad para renderizar el shape de portero
export class GoalkeeperShapeUtil extends BaseBoxShapeUtil<GoalkeeperShape> {
  static override type = 'goalkeeper' as const;

  getDefaultProps(): GoalkeeperShape['props'] {
    return {
      w: 40,
      h: 40,
      color: '#FFA500'
    };
  }

  component(shape: GoalkeeperShape) {
    return (
      <HTMLContainer style={{ width: shape.props.w, height: shape.props.h }}>
        <svg width="100%" height="100%" viewBox="0 0 40 40">
          {/* Cuerpo del portero */}
          <circle cx="20" cy="20" r="18" fill={shape.props.color} stroke="#333" strokeWidth="2"/>
          {/* Guantes (manos) */}
          <circle cx="8" cy="18" r="5" fill="#FFF" stroke="#333" strokeWidth="1"/>
          <circle cx="32" cy="18" r="5" fill="#FFF" stroke="#333" strokeWidth="1"/>
          {/* Cara */}
          <circle cx="20" cy="17" r="6" fill="#FFD4A3" stroke="#333" strokeWidth="1"/>
          {/* Ojos */}
          <circle cx="17" cy="16" r="1.5" fill="#000"/>
          <circle cx="23" cy="16" r="1.5" fill="#000"/>
          {/* Boca */}
          <path d="M 17 20 Q 20 22 23 20" stroke="#000" fill="none" strokeWidth="1"/>
        </svg>
      </HTMLContainer>
    );
  }

  indicator(shape: GoalkeeperShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
