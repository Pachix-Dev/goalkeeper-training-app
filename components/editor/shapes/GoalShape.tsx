import { BaseBoxShapeUtil, TLBaseShape, HTMLContainer } from '@tldraw/tldraw';

export type GoalShape = TLBaseShape<
  'goal',
  {
    w: number;
    h: number;
    postColor: string;
    netColor: string;
  }
>;

export class GoalShapeUtil extends BaseBoxShapeUtil<GoalShape> {
  static override type = 'goal' as const;

  getDefaultProps(): GoalShape['props'] {
    return {
      w: 140,
      h: 60,
      postColor: '#FFFFFF',
      netColor: '#D9D9D9',
    };
  }

  component(shape: GoalShape) {
    const { w, h, postColor, netColor } = shape.props;
    return (
      <HTMLContainer style={{ width: w, height: h }}>
        <svg width="100%" height="100%" viewBox="0 0 140 60">
          {/* Postes */}
          <rect x="5" y="5" width="130" height="8" fill={postColor} stroke="#333" strokeWidth="1" />
          <rect x="5" y="5" width="8" height="50" fill={postColor} stroke="#333" strokeWidth="1" />
          <rect x="127" y="5" width="8" height="50" fill={postColor} stroke="#333" strokeWidth="1" />
          {/* Red */}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={'h'+i} x1={13} y1={15 + i * 6} x2={127} y2={15 + i * 6} stroke={netColor} strokeWidth="1" />
          ))}
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={'v'+i} x1={13 + i * 6} y1={15} x2={13 + i * 6} y2={49} stroke={netColor} strokeWidth="1" />
          ))}
        </svg>
      </HTMLContainer>
    );
  }

  indicator(shape: GoalShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
