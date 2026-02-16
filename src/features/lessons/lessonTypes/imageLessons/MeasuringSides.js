import React from "react";
import styled from "styled-components";
import { Stage, Layer, Line } from "react-konva";
import { ruler } from "../../../../shared/images";
import { useLessonState, useWindowDimensions } from "../../../../hooks";

const MeasuringSides = () => {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width } = useWindowDimensions();

  // Get length from question data
  const length = lessonProps?.question?.[0]?.[0]?.text || 6;

  // Calculate ruler width (accounting for responsive padding)
  const getPadding = () => {
    if (width <= 480) return width * 0.02; // 2% on small screens
    if (width <= 768) return width * 0.03; // 3% on medium screens
    return width * 0.04; // 4% on larger screens
  };

  const padding = getPadding();
  const rulerWidth = Math.min(width - padding * 2, 800);
  const lineLength = (rulerWidth * length) / 12;

  return (
    <Wrapper>
      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        <QuestionText>
          The red line below measures {length} {length === 1 ? "inch" : "inches"} on the ruler.
        </QuestionText>
      </QuestionSection>

      {/* Section 3: VisualSection - Ruler with measurement line */}
      <VisualSection>
        <LineContainer>
          <Stage width={rulerWidth} height={10}>
            <Layer>
              <Line points={[0, 0, lineLength, 0]} stroke="red" strokeWidth={8} />
            </Layer>
          </Stage>
        </LineContainer>
        <RulerContainer>
          <img src={ruler} alt="ruler" style={{ width: "100%", maxWidth: `${rulerWidth}px` }} />
        </RulerContainer>
      </VisualSection>

      {/* Section 4 & 5: InteractionSection with ExplanationSection */}
      <InteractionSection>
        <ExplanationSection>
          <ExplanationText>
            <strong>Reading a Ruler:</strong> A standard ruler is divided into inches, with each inch subdivided into smaller units.
          </ExplanationText>
          <ExplanationText>
            The <strong style={{ color: "red" }}>red line</strong> above shows {length} {length === 1 ? "inch" : "inches"} on the ruler.
            Practice measuring by comparing the line to the ruler markings below it.
          </ExplanationText>
          <ExplanationText>
            <strong>Tip:</strong> Start from 0 and count the inch marks until you reach the end of the red line.
          </ExplanationText>
        </ExplanationSection>
      </InteractionSection>
    </Wrapper>
  );
};

export default MeasuringSides;

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
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  background: #f7fafc;
  border-radius: 12px;
  padding: 40px 16px 16px 16px;

  @media (max-width: 1024px) {
    margin: 16px 0;
    padding: 32px 12px 12px 12px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    margin: 12px 0;
    padding: 24px 8px 8px 8px;
  }
`;

const LineContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

const RulerContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
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
