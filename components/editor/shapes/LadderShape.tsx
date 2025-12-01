import { BaseBoxShapeUtil, TLBaseShape, HTMLContainer } from '@tldraw/tldraw';

export type LadderShape = TLBaseShape<
  'ladder',
  {
    w: number;
    h: number;
    color: string;
  }
>;

export class LadderShapeUtil extends BaseBoxShapeUtil<LadderShape> {
  static override type = 'ladder' as const;

  getDefaultProps(): LadderShape['props'] {
    return {
      w: 120,
      h: 20,
      color: '#9C27B0'
    };
  }

  component(shape: LadderShape) {
    return (
      <HTMLContainer style={{ width: shape.props.w, height: shape.props.h }}>
        <svg width="100%" height="100%" viewBox="0 0 120 20">
          {/* Lados de la escalera */}
          <rect x="0" y="2" width="120" height="3" fill={shape.props.color} stroke="#333" strokeWidth="1"/>
          <rect x="0" y="15" width="120" height="3" fill={shape.props.color} stroke="#333" strokeWidth="1"/>
          {/* Peldaños */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <rect 
              key={i} 
              x={i * 12 + 2} 
              y="5" 
              width="2" 
              height="10" 
              fill={shape.props.color} 
              stroke="#333" 
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </HTMLContainer>
    );
  }

  indicator(shape: LadderShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
