import { BaseBoxShapeUtil, TLBaseShape, HTMLContainer } from '@tldraw/tldraw';

export type ConeShape = TLBaseShape<
  'cone',
  {
    w: number;
    h: number;
    color: string;
  }
>;

export class ConeShapeUtil extends BaseBoxShapeUtil<ConeShape> {
  static override type = 'cone' as const;

  getDefaultProps(): ConeShape['props'] {
    return {
      w: 24,
      h: 34,
      color: '#FF6B00'
    };
  }

  component(shape: ConeShape) {
    return (
      <HTMLContainer style={{ width: shape.props.w, height: shape.props.h }}>
        <svg width="100%" height="100%" viewBox="0 0 24 34">
          {/* Cono */}
          <path 
            d="M 12 2 L 2 30 L 22 30 Z" 
            fill={shape.props.color} 
            stroke="#333" 
            strokeWidth="1.5"
          />
          {/* Franjas */}
          <path d="M 6 15 L 18 15" stroke="#FFF" strokeWidth="1.5"/>
          <path d="M 8 20 L 16 20" stroke="#FFF" strokeWidth="1.5"/>
          <path d="M 9 25 L 15 25" stroke="#FFF" strokeWidth="1.5"/>
          {/* Base */}
          <ellipse cx="12" cy="30" rx="10" ry="3" fill="#333"/>
        </svg>
      </HTMLContainer>
    );
  }

  indicator(shape: ConeShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
