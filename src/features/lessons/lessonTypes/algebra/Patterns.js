import React, { useState } from "react";
import styled from "styled-components";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, Rect, Text } from "react-konva";
import { useLessonState, useWindowDimensions } from "../../../../hooks";

const yPosition = 150;

function Patterns({ triggerNewProblem }) {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width } = useWindowDimensions();

  const [showAnswer, setShowAnswer] = useState(false);

  // Extract lesson data from props
  const question = lessonProps?.question?.[0];
  const answer = lessonProps?.answer?.[0]?.text;
  const hint = lessonProps?.hint?.[0]?.text;
  const explanation = lessonProps?.explanation?.[0]?.text;

  // Question should be an array of numbers representing the pattern
  const patternNumbers = Array.isArray(question) ? question : question?.text || [];

  const handleTryAnother = () => {
    if (triggerNewProblem) {
      triggerNewProblem();
      setShowAnswer(false);
    }
  };

  // Show first 4 numbers, or all 5 if answer is revealed
  const numbersToShow = showAnswer ? patternNumbers : patternNumbers.slice(0, 4);

  return (
    <Wrapper>
      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        <QuestionText>
          Study the pattern below. What number comes next?
        </QuestionText>
      </QuestionSection>

      {/* Section 3: VisualSection - Pattern visualization */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 800)} height={350}>
          <Layer>
            {numbersToShow.map((occurances, index) => {
              const numValue = typeof occurances === 'object' ? occurances.text : occurances;
              return (
                <React.Fragment key={index}>
                  <Text
                    x={100 * index + 100}
                    y={yPosition}
                    fontSize={20}
                    fill={showAnswer && index === 4 ? "green" : "red"}
                    text={numValue}
                  />
                  {[...Array(Math.abs(Number(numValue)))].map((_, occurancesIndex) => {
                    return (
                      <Rect
                        key={`${index}-${occurancesIndex}`}
                        fill={Number(numValue) < 0 ? "blue" : "red"}
                        width={30}
                        height={10}
                        stroke="black"
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

const AnswerInputContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;

  @media (max-width: 1024px) {
    margin: 16px 0;
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
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 14px;
    line-height: 1.4;
  }
`;
