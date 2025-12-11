import {
  BaseBoxShapeUtil,
  HTMLContainer,
  T,
  TLBaseShape,
} from '@tldraw/tldraw';
import Image from 'next/image';

// Define the shape's type
type BallShape = TLBaseShape<
  'ball',
  {
    w: number;
    h: number;
  }
>;

// Helper function to get the ball image URL
function getBallImageUrl(): string {
  return '/balones/balon_futbol_incial.png';
}

// Shape utility class
export class BallShapeUtil extends BaseBoxShapeUtil<BallShape> {
  static override type = 'ball' as const;

  static override props = {
    w: T.number,
    h: T.number,
  };

  getDefaultProps(): BallShape['props'] {
    return {
      w: 30,
      h: 30,
    };
  }

  component(shape: BallShape) {
    const imageUrl = getBallImageUrl();
    
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: shape.props.w,
          height: shape.props.h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all',
        }}
      >
        <Image
          src={imageUrl}
          alt="Ball"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
          width={shape.props.w}
          height={shape.props.h}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
      </HTMLContainer>
    );
  }

  indicator(shape: BallShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        fill="none"
        stroke="blue"
        strokeWidth={2}
      />
    );
  }

  override async toSvg(shape: BallShape) {
    const imageUrl = getBallImageUrl();
    
    // Convertir imagen a base64 para exportación
    const base64Image = await this.imageToBase64(imageUrl);
    
    return (
      <image
        href={base64Image}
        x={0}
        y={0}
        width={shape.props.w}
        height={shape.props.h}
        preserveAspectRatio="xMidYMid meet"
      />
    );
  }

  private async imageToBase64(url: string): Promise<string> {
    try {
      // Convertir URL relativa a absoluta
      const absoluteUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}${url}`
        : url;

      // Cargar imagen y convertir a base64
      const response = await fetch(absoluteUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      // Fallback a URL absoluta si falla la conversión
      return typeof window !== 'undefined' 
        ? `${window.location.origin}${url}`
        : url;
    }
  }
}
