import React from "react";
import styled from "styled-components";
import { Stage, Layer, Line } from "react-konva";
import { ruler } from "../../../../shared/images";
import { useLessonState, useWindowDimensions } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

const MeasuringSides = () => {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width } = useWindowDimensions();
  const [showHint, setShowHint] = React.useState(false);
  const [showAnswer, setShowAnswer] = React.useState(false);

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

  const hint = (
    <>
      <strong>Reading a Ruler:</strong> A standard ruler is divided into inches, with each inch subdivided into smaller units.
      <br/><br/>
      <strong>Tip:</strong> Start from 0 and count the inch marks until you reach the end of the red line.
    </>
  );

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        {/* Question text now hidden - shown in hint */}
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

      {/* Section 4: InteractionSection with HintBox and AnswerInput */}
      <InteractionSection>
        {!showAnswer && (
          <>
            {showHint && hint && (
              <HintBox>{hint}</HintBox>
            )}
            <AnswerInputContainer>
              <AnswerInput
                correctAnswer={String(length)}
                answerType="number"
                onCorrect={() => setShowAnswer(true)}
                onTryAnother={() => setShowAnswer(false)}
                disabled={showAnswer}
                placeholder="Enter length in inches"
              />
            </AnswerInputContainer>
          </>
        )}
        {showAnswer && (
          <ExplanationSection>
            <ExplanationText>
              <strong>Correct!</strong> The red line measures <strong>{length} {length === 1 ? "inch" : "inches"}</strong> on the ruler.
            </ExplanationText>
          </ExplanationSection>
        )}
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

const HintBox = styled.div`
  background: #fff5e6;
  border-left: 4px solid #f6ad55;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 15px;
  color: #744210;

  @media (max-width: 1024px) {
    padding: 10px;
    margin-bottom: 12px;
    font-size: 14px;
  }
`;

const AnswerInputContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 16px 0;
`;
