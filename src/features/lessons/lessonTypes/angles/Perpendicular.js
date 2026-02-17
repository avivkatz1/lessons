import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";

const newNumbers = () => {
  const equationNumbers = numbers(3, 20);
  const b = equationNumbers[1];
  const c = equationNumbers[2];
  const a = b > c ? equationNumbers[0] : equationNumbers[0] * -1;
  const equation = `y = ${a}/${b}x ${a >= 10 ? "+" : "-"} ${c}`;
  const problemAnswer = `${b}/${a * -1}`;
  return { equation, problemAnswer };
};

/**
 * Perpendicular - Interactive lesson on perpendicular line slopes
 * Students identify the slope of a line perpendicular to a given equation
 * Demonstrates that perpendicular lines have negative reciprocal slopes
 */
function Perpendicular({ triggerNewProblem }) {
  const [problem, setProblem] = useState(() => newNumbers());
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handlePractice = () => {
    const newProblem = newNumbers();
    setProblem(newProblem);
    setShowAnswer(false);
    setShowHint(false);
  };

  const correctAnswer = problem.problemAnswer;
  const hint = `What is the slope of a line perpendicular to: ${problem.equation}?`;

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* 1. QuestionSection - Problem statement */}
      <QuestionSection>
        {/* Question text hidden until hint button clicked */}
      </QuestionSection>

      {/* 2. VisualSection - Not needed for text-based algebra */}

      {/* 3. InteractionSection - Answer input */}
      <InteractionSection>
        {!showAnswer && (
          <>
            {showHint && hint && (
              <HintBox>{hint}</HintBox>
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
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content (shown after correct answer) */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Understanding Perpendicular Lines and Slope</ExplanationTitle>
          <ExplanationText>
            <strong>Correct!</strong> The slope of a line perpendicular to <strong>{problem.equation}</strong> is{" "}
            <strong>{correctAnswer}</strong>.
          </ExplanationText>
          <ExplanationText>
            <strong>The Perpendicular Lines Rule:</strong>
          </ExplanationText>
          <FormulaBox>
            Perpendicular lines have negative reciprocal slopes
          </FormulaBox>
          <ExplanationText>
            <strong>What is a negative reciprocal?</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              <strong>Step 1 - Find the reciprocal:</strong> Flip the fraction (swap numerator and denominator)
            </li>
            <li>
              <strong>Step 2 - Make it negative:</strong> Change the sign (positive becomes negative, or vice versa)
            </li>
            <li>
              <strong>Example:</strong> If the original slope is 3/4, the reciprocal is 4/3, and the negative
              reciprocal is -4/3
            </li>
          </PropertyList>
          <ExplanationText>
            <strong>For the equation {problem.equation}:</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              <strong>Original slope:</strong> The coefficient of x gives us the slope of the line
            </li>
            <li>
              <strong>Perpendicular slope:</strong> We take the negative reciprocal to get {correctAnswer}
            </li>
            <li>
              <strong>Why it works:</strong> When two lines are perpendicular (form a 90° angle), their slopes
              multiply to equal -1. You can verify: (original slope) × (perpendicular slope) = -1
            </li>
          </PropertyList>
          <ExplanationText>
            <strong>Visualizing perpendicular lines:</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              If one line rises as it goes right (positive slope), the perpendicular line falls as it goes
              right (negative slope)
            </li>
            <li>
              A steep line (like 4/1) has a gentle perpendicular line (like -1/4)
            </li>
            <li>
              A gentle line (like 1/4) has a steep perpendicular line (like -4/1)
            </li>
          </PropertyList>
          <ExplanationText>
            <strong>Special cases:</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              <strong>Horizontal lines</strong> (slope = 0) are perpendicular to <strong>vertical lines</strong>{" "}
              (undefined slope)
            </li>
            <li>
              For any slope m, its perpendicular slope is -1/m (as long as m ≠ 0)
            </li>
          </PropertyList>
          <ExplanationText>
            <strong>Contrast with parallel lines:</strong> Remember, parallel lines have identical slopes, while
            perpendicular lines have negative reciprocal slopes. These are two different relationships!
          </ExplanationText>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default Perpendicular;

// Styled Components - TangentLesson 5-section layout standard

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
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
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

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #2f855a;
  margin: 0 0 15px 0;

  @media (min-width: 768px) {
    font-size: 22px;
    margin-bottom: 20px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
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

const FormulaBox = styled.div`
  background-color: #e6fffa;
  border: 2px solid #4299e1;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  color: #2c5282;

  @media (min-width: 768px) {
    font-size: 22px;
    padding: 18px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
    padding: 20px;
  }
`;

const PropertyList = styled.ul`
  margin: 15px 0;
  padding-left: 20px;

  li {
    font-size: 16px;
    color: #2d3748;
    line-height: 1.8;
    margin-bottom: 8px;

    @media (min-width: 768px) {
      font-size: 17px;
      margin-bottom: 10px;
    }

    @media (min-width: 1024px) {
      font-size: 18px;
    }
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
