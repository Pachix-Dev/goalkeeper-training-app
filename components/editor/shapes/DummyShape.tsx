import { BaseBoxShapeUtil, TLBaseShape, HTMLContainer } from '@tldraw/tldraw';

export type DummyShape = TLBaseShape<
  'dummy',
  {
    w: number;
    h: number;
    color: string;
  }
>;

export class DummyShapeUtil extends BaseBoxShapeUtil<DummyShape> {
  static override type = 'dummy' as const;

  getDefaultProps(): DummyShape['props'] {
    return {
      w: 26,
      h: 60,
      color: '#FF5722'
    };
  }

  component(shape: DummyShape) {
    return (
      <HTMLContainer style={{ width: shape.props.w, height: shape.props.h }}>
        <svg width="100%" height="100%" viewBox="0 0 26 60">
          {/* Cabeza */}
          <circle cx="13" cy="8" r="6" fill="#FFD4A3" stroke="#333" strokeWidth="1.5"/>
          {/* Cuerpo */}
          <rect 
            x="6" 
            y="14" 
            width="14" 
            height="30" 
            fill={shape.props.color} 
            stroke="#333" 
            strokeWidth="1.5"
            rx="2"
          />
          {/* Brazos */}
          <rect x="2" y="18" width="4" height="18" fill={shape.props.color} stroke="#333" strokeWidth="1.5" rx="2"/>
          <rect x="20" y="18" width="4" height="18" fill={shape.props.color} stroke="#333" strokeWidth="1.5" rx="2"/>
          {/* Piernas */}
          <rect x="8" y="44" width="4" height="14" fill={shape.props.color} stroke="#333" strokeWidth="1.5" rx="2"/>
          <rect x="14" y="44" width="4" height="14" fill={shape.props.color} stroke="#333" strokeWidth="1.5" rx="2"/>
          {/* Detalles de cara */}
          <circle cx="11" cy="7" r="1" fill="#000"/>
          <circle cx="15" cy="7" r="1" fill="#000"/>
        </svg>
      </HTMLContainer>
    );
  }

  indicator(shape: DummyShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
