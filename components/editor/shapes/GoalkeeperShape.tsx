import {
  BaseBoxShapeUtil,
  HTMLContainer,
  T,
  TLBaseShape,
} from '@tldraw/tldraw';
import Image from 'next/image';

// Define the shape's type
type GoalkeeperShape = TLBaseShape<
  'goalkeeper',
  {
    w: number;
    h: number;
    rotation: number;
    color: string;
  }
>;

// Helper function to get the goalkeeper image URL based on rotation and uniform color
function getGoalkeeperImageUrl(rotation: number, color: string): string {
  const baseUrl = '/portero/posicion_base_de_pie_inicial';
  
  // If it's the default color (no color suffix)
  if (color === 'default') {
    // If rotation is 0, no rotation suffix
    if (rotation === 0) {
      return `${baseUrl}.png`;
    }
    // For other rotations, add the rotation number
    return `${baseUrl}_${rotation}.png`;
  }
  
  // For other colors, include the color and rotation
  // If rotation is 0, just add the color
  if (rotation === 0) {
    return `${baseUrl}_${color}.png`;
  }
  
  // For non-zero rotations with a color
  return `${baseUrl}_${color}_${rotation}.png`;
}

// Shape utility class
export class GoalkeeperShapeUtil extends BaseBoxShapeUtil<GoalkeeperShape> {
  static override type = 'goalkeeper' as const;

  static override props = {
    w: T.number,
    h: T.number,
    rotation: T.number,
    color: T.string,
  };

  getDefaultProps(): GoalkeeperShape['props'] {
    return {
      w: 40,
      h: 40,
      rotation: 0,
      color: 'default',
    };
  }

  component(shape: GoalkeeperShape) {
    const rotation = shape.props.rotation ?? 0;
    const color = shape.props.color ?? 'default';
    const imageUrl = getGoalkeeperImageUrl(rotation, color);
    
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
          alt="Goalkeeper"
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

  indicator(shape: GoalkeeperShape) {
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

  override async toSvg(shape: GoalkeeperShape) {
    const rotation = shape.props.rotation ?? 0;
    const color = shape.props.color ?? 'default';
    const imageUrl = getGoalkeeperImageUrl(rotation, color);
    
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
