import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";
import { useLessonState } from "../../../../hooks";

const newNumbers = () => {
  const equationNumbers = numbers(3, 20);
  const b = equationNumbers[1];
  const c = equationNumbers[2];
  const a = b > c ? equationNumbers[0] : equationNumbers[0] * -1;
  const equation = `y = ${a}/${b}x ${a >= 10 ? "+" : "-"} ${c}`;
  const problemAnswer = `${b}/${a * -1}`;
  return { equation: equation, problemAnswer: problemAnswer };
};

function Perpendicular({ triggerNewProblem }) {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();

  // Get data from lessonProps or generate fallback
  const [problem, setProblem] = useState(() => newNumbers());
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Extract lesson data from props (if available from backend)
  const question = lessonProps?.question?.[0]?.text;
  const answer = lessonProps?.answer?.[0]?.text;
  const hint = lessonProps?.hint?.[0]?.text;
  const explanation = lessonProps?.explanation?.[0]?.text;

  const handlePractice = () => {
    if (triggerNewProblem) {
      triggerNewProblem();
      setShowAnswer(false);
      setShowHint(false);
    } else {
      const newProblem = newNumbers();
      setProblem(newProblem);
      setShowAnswer(false);
      setShowHint(false);
    }
  };

  // Use backend answer if available, otherwise use generated problem answer
  const correctAnswer = answer || problem?.problemAnswer;
  const questionText = question || `What is the slope of a line perpendicular to: ${problem?.equation}`;

  return (
    <Wrapper>
      {/* Section 1: TopHintButton - Fixed position, only shown when hint available and not revealed */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      {/* Section 3: VisualSection - Not needed for text-based algebra lesson */}

      {/* Section 4: InteractionSection - Answer input and hint display */}
      <InteractionSection>
        {!showAnswer && (
          <>
            {showHint && hint && (
              <HintBox>
                <HintText>{hint}</HintText>
              </HintBox>
            )}
            <AnswerInputContainer>
              <AnswerInput
                correctAnswer={correctAnswer}
                answerType="text"
                onCorrect={() => setShowAnswer(true)}
                onTryAnother={handlePractice}
                disabled={showAnswer}
                placeholder="Enter slope (e.g., -4/3)"
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
                  <strong>Correct!</strong> The slope of a line perpendicular to <strong>{problem?.equation}</strong> is{" "}
                  <strong>{correctAnswer}</strong>.
                  <br />
                  <br />
                  Perpendicular lines have slopes that are negative reciprocals of each other. If one line has slope m,
                  a perpendicular line has slope -1/m.
                </>
              )}
            </ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default Perpendicular;

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

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: #edf2f7;
  border: 2px solid #cbd5e0;
  color: #2d3748;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #e2e8f0;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 1024px) {
    top: 10px;
    right: 15px;
    padding: 8px 16px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    top: 8px;
    right: 10px;
    padding: 6px 12px;
    font-size: 12px;
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

const InteractionSection = styled.div`
  margin-top: 20px;

  @media (max-width: 1024px) {
    margin-top: 16px;
  }
`;

const HintBox = styled.div`
  background: #fffbeb;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;

  @media (max-width: 1024px) {
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 12px;
  }
`;

const HintText = styled.p`
  font-size: 15px;
  line-height: 1.5;
  color: #78350f;
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 14px;
    line-height: 1.4;
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
