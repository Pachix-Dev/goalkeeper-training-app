import { BaseBoxShapeUtil, TLBaseShape, HTMLContainer } from '@tldraw/tldraw';

export type HurdleShape = TLBaseShape<
  'hurdle',
  {
    w: number;
    h: number;
    color: string;
  }
>;

export class HurdleShapeUtil extends BaseBoxShapeUtil<HurdleShape> {
  static override type = 'hurdle' as const;

  getDefaultProps(): HurdleShape['props'] {
    return {
      w: 80,
      h: 24,
      color: '#FFD400',
    };
  }

  component(shape: HurdleShape) {
    const { w, h, color } = shape.props;
    return (
      <HTMLContainer style={{ width: w, height: h }}>
        <svg width="100%" height="100%" viewBox="0 0 80 24">
          {/* Barra superior */}
          <rect x="8" y="4" width="64" height="6" fill={color} stroke="#333" strokeWidth="1" />
          {/* Patas */}
          <rect x="8" y="10" width="6" height="10" fill={color} stroke="#333" strokeWidth="1" />
          <rect x="66" y="10" width="6" height="10" fill={color} stroke="#333" strokeWidth="1" />
          {/* Refuerzo inferior */}
          <rect x="8" y="20" width="64" height="2" fill={color} />
        </svg>
      </HTMLContainer>
    );
  }

  indicator(shape: HurdleShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
