import React, { useState } from "react";
import styled from "styled-components";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, Rect, Text } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

const yPosition = 150;

function Patterns({ triggerNewProblem }) {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Extract lesson data from props
  const question = lessonProps?.question?.[0];
  const answer = lessonProps?.answer?.[0]?.text;
  const hint = lessonProps?.hint?.[0]?.text || "Study the pattern below. What number comes next?";
  const explanation = lessonProps?.explanation?.[0]?.text;

  // Question should be an array of numbers representing the pattern
  const patternNumbers = Array.isArray(question) ? question : question?.text || [];

  const handleTryAnother = () => {
    if (triggerNewProblem) {
      triggerNewProblem();
      setShowAnswer(false);
      setShowHint(false);
    }
  };

  // Show first 4 numbers, or all 5 if answer is revealed
  const numbersToShow = showAnswer ? patternNumbers : patternNumbers.slice(0, 4);

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

      {/* Section 3: VisualSection - Pattern visualization */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 800)} height={350}>
          <Layer>
            {/* Background for dark mode */}
            <Rect
              x={0}
              y={0}
              width={Math.min(width - 40, 800)}
              height={350}
              fill={konvaTheme.canvasBackground}
            />

            {numbersToShow.map((occurances, index) => {
              const numValue = typeof occurances === 'object' ? occurances.text : occurances;
              return (
                <React.Fragment key={index}>
                  <Text
                    x={100 * index + 100}
                    y={yPosition}
                    fontSize={20}
                    fill={showAnswer && index === 4 ? "#10B981" : "#EF4444"}
                    text={numValue}
                  />
                  {[...Array(Math.abs(Number(numValue)))].map((_, occurancesIndex) => {
                    return (
                      <Rect
                        key={`${index}-${occurancesIndex}`}
                        fill={Number(numValue) < 0 ? "#3B82F6" : "#EF4444"}
                        width={30}
                        height={10}
                        stroke={konvaTheme.shapeStroke}
                        strokeWidth={1}
                        x={occurancesIndex < 9 ? 100 * index + 100 : 100 * index + 140}
                        y={
                          occurancesIndex >= 9 && Number(numValue) < 0
                            ? yPosition + 30 + (occurancesIndex - 9) * 15
                            : occurancesIndex >= 9 && Number(numValue) > 0
                              ? yPosition - 20 + (occurancesIndex - 9) * -15
                              : Number(numValue) < 0
                                ? yPosition + 30 + occurancesIndex * 15
                                : yPosition - 20 + occurancesIndex * -15
                        }
                      />
                    );
                  })}
                </React.Fragment>
              );
            })}
          </Layer>
        </Stage>
      </VisualSection>

      {/* Section 4: InteractionSection - Answer input */}
      <InteractionSection>
        {!showAnswer && (
          <>
            {showHint && hint && (
              <HintBox>{hint}</HintBox>
            )}

            <AnswerInputContainer>
              <AnswerInput
                correctAnswer={answer}
                answerType="number"
                onCorrect={() => setShowAnswer(true)}
                onTryAnother={handleTryAnother}
                disabled={showAnswer}
                placeholder="Enter the next number"
              />
            </AnswerInputContainer>
          </>
        )}

        {/* Section 5: ExplanationSection - Shown after correct answer */}
        {showAnswer && (
          <ExplanationSection>
            <ExplanationText>
              {explanation || (
                <>
                  <strong>Correct!</strong> The next number in the pattern is <strong>{answer}</strong>.
                  <br />
                  <br />
                  Look at how the numbers change from one to the next. Do they increase or decrease?
                  By how much? Finding the pattern helps you predict what comes next!
                </>
              )}
            </ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default Patterns;

// Styled Components

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 30px;
  }

  @media (min-width: 1024px) {
    padding: 40px;
  }
`;

const QuestionSection = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    margin-bottom: 30px;
  }
`;

const QuestionText = styled.p`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }

  @media (min-width: 1024px) {
    font-size: 26px;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    padding: 30px;
    margin-bottom: 30px;
  }

  @media (min-width: 1024px) {
    padding: 40px;
  }
`;

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 30px;
  }
`;

const AnswerInputContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  @media (min-width: 768px) {
    margin: 15px 0;
  }
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: #f0fff4;
  border-left: 4px solid #68d391;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;

  @media (min-width: 768px) {
    padding: 25px;
    margin-top: 30px;
  }

  @media (min-width: 1024px) {
    padding: 30px;
  }
`;

const ExplanationText = styled.p`
  font-size: 16px;
  color: #2d3748;
  line-height: 1.6;
  margin: 0 0 12px 0;

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: 768px) {
    font-size: 17px;
    margin-bottom: 15px;
  }

  @media (min-width: 1024px) {
    font-size: 18px;
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
