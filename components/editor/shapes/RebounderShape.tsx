import { BaseBoxShapeUtil, TLBaseShape, HTMLContainer } from '@tldraw/tldraw';

export type RebounderShape = TLBaseShape<
  'rebounder',
  {
    w: number;
    h: number;
    color: string;
    netColor: string;
  }
>;

export class RebounderShapeUtil extends BaseBoxShapeUtil<RebounderShape> {
  static override type = 'rebounder' as const;

  getDefaultProps(): RebounderShape['props'] {
    return {
      w: 80,
      h: 50,
      color: '#009688',
      netColor: '#CCCCCC',
    };
  }

  component(shape: RebounderShape) {
    const { w, h, color, netColor } = shape.props;
    return (
      <HTMLContainer style={{ width: w, height: h }}>
        <svg width="100%" height="100%" viewBox="0 0 80 50">
          {/* Marco */}
          <rect x="2" y="2" width="76" height="46" rx="6" fill="none" stroke={color} strokeWidth="4" />
          {/* Red simple */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={'h'+i} x1="6" y1={10 + i * 6} x2="74" y2={10 + i * 6} stroke={netColor} strokeWidth="1" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={'v'+i} x1={10 + i * 6} y1="6" x2={10 + i * 6} y2="44" stroke={netColor} strokeWidth="1" />
          ))}
        </svg>
      </HTMLContainer>
    );
  }

  indicator(shape: RebounderShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
