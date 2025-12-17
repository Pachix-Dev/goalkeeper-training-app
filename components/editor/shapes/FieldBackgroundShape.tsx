import {
  BaseBoxShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  TLBaseShape,
} from '@tldraw/tldraw';

// Definir el tipo de shape para el fondo de la cancha
type FieldBackgroundShape = TLBaseShape<
  'field-background',
  {
    w: number;
    h: number;
    backgroundType: 'color' | 'image';
    backgroundColor: string;
    backgroundImage: string;
  }
>;

export class FieldBackgroundShapeUtil extends BaseBoxShapeUtil<FieldBackgroundShape> {
  static override type = 'field-background' as const;

  override isAspectRatioLocked = () => true;
  override canResize = () => false;
  override canScroll = () => false;
  override canEdit = () => false;
  override canBind = () => false;
  override hideSelectionBoundsFg = () => true;
  override hideSelectionBoundsBg = () => true;

  static override props = {
    w: T.number,
    h: T.number,
    backgroundType: T.literalEnum('color', 'image'),
    backgroundColor: T.string,
    backgroundImage: T.string,
  };

  getDefaultProps(): FieldBackgroundShape['props'] {
    return {
      w: 1300,
      h: 659,
      backgroundType: 'color',
      backgroundColor: '#6ba04d',
      backgroundImage: '',
    };
  }

  getGeometry(shape: FieldBackgroundShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: FieldBackgroundShape) {
    const { w, h, backgroundType, backgroundColor, backgroundImage } = shape.props;

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: w,
          height: h,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: -1,
        }}
      >
        <div
          style={{
            width: '1300px',
            height: '659px',
            backgroundColor: backgroundColor && backgroundColor !== '' ? backgroundColor : '#6ba04d',
            backgroundImage: backgroundType === 'image' && backgroundImage && backgroundImage !== '' ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      </HTMLContainer>
    );
  }

  indicator(shape: FieldBackgroundShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  override async toSvg(shape: FieldBackgroundShape) {
    const { w, h, backgroundType, backgroundColor, backgroundImage } = shape.props;
    const fillColor = backgroundColor && backgroundColor !== '' ? backgroundColor : '#6ba04d';

    if (backgroundType === 'image' && backgroundImage) {
      const base64Image = await this.imageToBase64(backgroundImage);
      return (
        <>
          <rect width={w} height={h} fill={fillColor} />
          <image
            href={base64Image}
            x={0}
            y={0}
            width={w}
            height={h}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      );
    }

    return <rect width={w} height={h} fill={fillColor} />;
  }

  private async imageToBase64(url: string): Promise<string> {
    try {
      const absoluteUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${url}`
        : url;

      const response = await fetch(absoluteUrl);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting background image to base64:', error);
      return typeof window !== 'undefined'
        ? `${window.location.origin}${url}`
        : url;
    }
  }
}
