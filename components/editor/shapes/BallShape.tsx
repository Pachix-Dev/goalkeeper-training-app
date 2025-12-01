import { BaseBoxShapeUtil, TLBaseShape, HTMLContainer } from '@tldraw/tldraw';

export type BallShape = TLBaseShape<
  'ball',
  {
    w: number;
    h: number;
    color: string;
  }
>;

export class BallShapeUtil extends BaseBoxShapeUtil<BallShape> {
  static override type = 'ball' as const;

  getDefaultProps(): BallShape['props'] {
    return {
      w: 22,
      h: 22,
      color: '#FFFFFF'
    };
  }

  component(shape: BallShape) {
    return (
      <HTMLContainer style={{ width: shape.props.w, height: shape.props.h }}>
        <svg width="100%" height="100%" viewBox="0 0 22 22">
          {/* Balón base */}
          <circle cx="11" cy="11" r="10" fill={shape.props.color} stroke="#333" strokeWidth="1.5"/>
          {/* Patrón de pentágonos típico */}
          <path 
            d="M 11 4 L 8 7 L 9 10 L 13 10 L 14 7 Z" 
            fill="none" 
            stroke="#333" 
            strokeWidth="1"
          />
          <path d="M 5 9 L 7 8 L 8 11 L 6 13 Z" fill="none" stroke="#333" strokeWidth="1"/>
          <path d="M 17 9 L 15 8 L 14 11 L 16 13 Z" fill="none" stroke="#333" strokeWidth="1"/>
          <path d="M 11 15 L 9 13 L 8 16 L 11 18 Z" fill="none" stroke="#333" strokeWidth="1"/>
          <path d="M 11 15 L 13 13 L 14 16 L 11 18 Z" fill="none" stroke="#333" strokeWidth="1"/>
        </svg>
      </HTMLContainer>
    );
  }

  indicator(shape: BallShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
