import React, { useMemo } from "react";
import styled from "styled-components";
import { Stage, Layer, Image as KonvaImage, Line } from "react-konva";
import { protractor } from "../../../../shared/images";
import { useLessonState, useWindowDimensions } from "../../../../hooks";

const Protractor = () => {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width, height } = useWindowDimensions();
  const [showHint, setShowHint] = React.useState(false);

  function toRadians(angle) {
    return angle * (Math.PI / 180);
  }

  const answer = +lessonProps?.answer?.[0]?.text || 45;

  // Original protractor image dimensions (at scale 1)
  const originalImageWidth = 500;
  const originalImageHeight = 295;
  // Origin point relative to original image (center bottom of protractor arc)
  const originalOriginX = 249;
  const originalOriginY = 295;

  // Calculate responsive scale based on available width
  const availableWidth = Math.min(width - 40, 600);
  const availableHeight = Math.min(height * 0.35, 280);

  // Scale to fit within available space
  const scaleByWidth = availableWidth / originalImageWidth;
  const scaleByHeight = availableHeight / originalImageHeight;
  const protractorScale = Math.min(scaleByWidth, scaleByHeight, 1.5);

  // Calculate actual protractor dimensions after scaling
  const scaledWidth = originalImageWidth * protractorScale;
  const scaledHeight = originalImageHeight * protractorScale;

  // Stage dimensions - fit the protractor plus room for lines
  const lineLength = Math.min(150 * protractorScale, scaledWidth * 0.5);
  const stageWidth = Math.min(width - 20, scaledWidth + lineLength * 2 + 40);
  const stageHeight = scaledHeight + 40;

  // Center the protractor image in the stage
  const protractorX = (stageWidth - scaledWidth) / 2;
  const protractorY = 10;

  // Calculate origin point (where lines meet) based on scaled image position
  const origin = useMemo(
    () => [protractorX + originalOriginX * protractorScale, protractorY + originalOriginY * protractorScale],
    [protractorX, protractorY, protractorScale]
  );

  // Stroke width scales for visibility
  const strokeWidth = Math.max(3, Math.min(8 * protractorScale, 8));

  // Calculate second point based on angle
  const secondPointArray = useMemo(() => {
    const points = [];
    if (answer === 0) {
      points.push(origin[0] + lineLength);
      points.push(origin[1]);
    } else if (answer === 180) {
      points.push(origin[0] - lineLength);
      points.push(origin[1]);
    } else if (answer === 90) {
      points.push(origin[0]);
      points.push(origin[1] - lineLength);
    } else {
      const x = Math.cos(toRadians(answer)) * lineLength;
      const y = Math.sin(toRadians(answer)) * lineLength;
      points.push(origin[0] + x);
      points.push(origin[1] - y);
    }
    return points;
  }, [answer, origin, lineLength]);

  const imageElement = useMemo(() => {
    const img = document.createElement("img");
    img.src = protractor;
    return img;
  }, []);

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showHint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        {showHint && (
          <QuestionText>
            The protractor below shows an angle of {answer}°. The red line is at 0° and the green line shows the angle.
          </QuestionText>
        )}
      </QuestionSection>

      {/* Section 3: VisualSection - Protractor with angle visualization */}
      <VisualSection>
        <Stage width={stageWidth} height={stageHeight}>
          <Layer>
            <KonvaImage
              image={imageElement}
              x={protractorX}
              y={protractorY}
              scaleX={protractorScale}
              scaleY={protractorScale}
            />

            <Line stroke="red" strokeWidth={strokeWidth} points={[...origin, origin[0] + lineLength, origin[1]]} opacity={0.6} />
            <Line stroke="green" strokeWidth={strokeWidth} points={[...origin, ...secondPointArray]} opacity={0.6} />
          </Layer>
        </Stage>
      </VisualSection>

      {/* Section 4 & 5: InteractionSection with ExplanationSection */}
      <InteractionSection>
        {showHint && (
          <ExplanationSection>
            <ExplanationText>
              <strong>Using a Protractor:</strong> A protractor measures angles in degrees. The scale goes from 0° to 180°.
            </ExplanationText>
            <ExplanationText>
              The <strong style={{ color: "red" }}>red line</strong> shows 0° (horizontal). The{" "}
              <strong style={{ color: "green" }}>green line</strong> shows {answer}°.
            </ExplanationText>
            <ExplanationText>
              <strong>How to measure:</strong> Place the center point of the protractor at the vertex (corner) of the angle. Line up
              one side with 0°, then read where the other side crosses the scale.
            </ExplanationText>
            <ExplanationText>
              <strong>Angle types:</strong> Acute angles are less than 90°, right angles are exactly 90°, and obtuse angles are
              between 90° and 180°.
            </ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
};

export default Protractor;

// Styled Components

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;

  @media (max-width: 1024px) {
    padding: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const QuestionSection = styled.div`
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 1024px) {
    margin-bottom: 16px;
  }
`;

const QuestionText = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 20px;
  }

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const VisualSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
  background: #f7fafc;
  border-radius: 12px;
  padding: 16px;
  overflow-x: auto;

  @media (max-width: 1024px) {
    margin: 16px 0;
    padding: 12px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    margin: 12px 0;
    padding: 8px;
  }
`;

const InteractionSection = styled.div`
  margin-top: 20px;

  @media (max-width: 1024px) {
    margin-top: 16px;
  }
`;

const ExplanationSection = styled.div`
  background: #f0fff4;
  border: 2px solid #68d391;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;

  @media (max-width: 1024px) {
    padding: 16px;
    margin-top: 12px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const ExplanationText = styled.p`
  font-size: 15px;
  line-height: 1.5;
  color: #2d3748;
  margin: 12px 0;

  @media (max-width: 1024px) {
    font-size: 14px;
    line-height: 1.4;
    margin: 10px 0;
  }
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  margin-bottom: 0;
  z-index: 100;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
    padding: 6px 12px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 12px;
    padding: 5px 10px;
    font-size: 12px;
  }

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
    border-color: ${props => props.theme.colors.borderDark};
  }
`;
