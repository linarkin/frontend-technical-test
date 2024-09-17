import { Box, Text, useDimensions } from '@chakra-ui/react';
import { useMemo, useRef, useState } from 'react';

const REF_WIDTH = 800;
const REF_HEIGHT = 450;
const REF_FONT_SIZE = 36;

export type MemePictureProps = MemePictureType & {
  readOnly?: boolean;
};

export const MemePicture: React.FC<MemePictureProps> = ({
  pictureUrl,
  texts,
  dataTestId = '',
  readOnly,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(containerRef, true);
  const boxWidth = dimensions?.borderBox.width;

  const { height, fontSize, offsetX, offsetY, widthScale, heightScale } =
    useMemo(() => {
      if (!boxWidth) {
        return {
          height: 0,
          fontSize: 0,
          offsetX: 0,
          offsetY: 0,
          widthScale: 1,
          heightScale: 1,
        };
      }

      // Maintain the aspect ratio of the reference image
      const aspectRatio = REF_WIDTH / REF_HEIGHT;
      const height = boxWidth / aspectRatio;

      // Calculate scaling factors
      const widthScale = boxWidth / REF_WIDTH;
      const heightScale = height / REF_HEIGHT;
      const fontSize = REF_FONT_SIZE * Math.min(widthScale, heightScale);

      // Since we're using 'backgroundSize: contain', we need to adjust for possible padding
      let offsetX = 0;
      let offsetY = 0;

      // Calculate the actual image dimensions within the container
      const containerAspectRatio = boxWidth / height;
      if (containerAspectRatio > aspectRatio) {
        // Container is wider than the image
        const imageWidth = height * aspectRatio;
        offsetX = (boxWidth - imageWidth) / 2;
      } else if (containerAspectRatio < aspectRatio) {
        // Container is taller than the image
        const imageHeight = boxWidth / aspectRatio;
        offsetY = (height - imageHeight) / 2;
      }

      return {
        height,
        fontSize,
        offsetX,
        offsetY,
        widthScale,
        heightScale,
      };
    }, [boxWidth]);

  const [draggedText, setDraggedText] = useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);

  const handleMouseDown = (index: number, event: React.MouseEvent) => {
    setDraggedText({
      index,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (draggedText !== null && boxWidth) {
      const deltaX = event.clientX - draggedText.x;
      const deltaY = event.clientY - draggedText.y;

      // Adjust deltas based on scaling factors
      texts[draggedText.index].x += deltaX / widthScale;
      texts[draggedText.index].y += deltaY / heightScale;

      setDraggedText({
        ...draggedText,
        x: event.clientX,
        y: event.clientY,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedText(null);
  };

  return (
    <Box
      width="full"
      height={height}
      ref={containerRef}
      backgroundImage={`url(${pictureUrl})`}
      backgroundColor="gray.100"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundSize="contain"
      overflow="hidden"
      position="relative"
      borderRadius={8}
      data-testid={dataTestId}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        ...(readOnly && { pointerEvents: 'none' }),
      }}
    >
      {texts.map((text, index) => {
        // Calculate the position of the text within the image
        const left = offsetX + text.x * widthScale;
        const top = offsetY + text.y * heightScale;

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${left}px`,
              top: `${top}px`,
              cursor: 'grab',
            }}
            data-testid={`${dataTestId}-text-${index}`}
            onMouseDown={(event) => handleMouseDown(index, event)}
          >
            <Text
              fontSize={fontSize}
              color="white"
              fontFamily="Impact"
              fontWeight="bold"
              userSelect="none"
              textTransform="uppercase"
              style={{ WebkitTextStroke: '1px black' }}
            >
              {text.content}
            </Text>
          </div>
        );
      })}
    </Box>
  );
};
