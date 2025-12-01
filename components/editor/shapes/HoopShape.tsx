import { BaseBoxShapeUtil, TLBaseShape, HTMLContainer } from '@tldraw/tldraw';

export type HoopShape = TLBaseShape<
  'hoop',
  {
    w: number;
    h: number;
    color: string;
    ringWidth: number;
  }
>;

export class HoopShapeUtil extends BaseBoxShapeUtil<HoopShape> {
  static override type = 'hoop' as const;

  getDefaultProps(): HoopShape['props'] {
    return {
      w: 46,
      h: 46,
      color: '#2196F3',
      ringWidth: 6,
    };
  }

  component(shape: HoopShape) {
    const { w, h, color, ringWidth } = shape.props;
    return (
      <HTMLContainer style={{ width: w, height: h }}>
        <svg width="100%" height="100%" viewBox="0 0 46 46">
          <circle cx="23" cy="23" r="20" fill="none" stroke={color} strokeWidth={ringWidth} />
        </svg>
      </HTMLContainer>
    );
  }

  indicator(shape: HoopShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
