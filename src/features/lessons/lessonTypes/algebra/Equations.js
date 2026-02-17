import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";

/**
 * Equations - Interactive one-step and two-step equation practice
 * Students solve for x in algebraic equations
 * Randomly generates equations with variable on either left or right side
 */
function Equations({ triggerNewProblem }) {
  const generateProblem = () => {
    const levelOneNumbers = numbers(3, 20);
    const x = levelOneNumbers[0];
    const a = levelOneNumbers[1];
    const b = levelOneNumbers[2];
    const c = x * a - b;
    const leftRight = Math.random();
    const leftSide = leftRight > 0.5 ? `${a}x - ${b}` : `${c}`;
    const rightSide = leftRight <= 0.5 ? `${a}x - ${b}` : `${c}`;
    const equation = `${leftSide} = ${rightSide}`;
    return { x, equation };
  };

  const [problem, setProblem] = useState(generateProblem);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handlePractice = () => {
    setProblem(generateProblem());
    setShowAnswer(false);
    setShowHint(false);
  };

  const handleCorrect = () => {
    setShowAnswer(true);
  };

  const hint = `Solve for x in the equation: ${problem.equation}`;

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        {/* Question text hidden until hint button clicked */}
      </QuestionSection>

      {/* 2. VisualSection - Equation display */}
      <VisualSection>
        <EquationDisplay>{problem.equation}</EquationDisplay>
      </VisualSection>

      {/* 3. InteractionSection - Hint box + answer input */}
      <InteractionSection>
        {!showAnswer && showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}

        <AnswerInput
          correctAnswer={problem.x}
          answerType="number"
          onCorrect={handleCorrect}
          onTryAnother={handlePractice}
          disabled={showAnswer}
          placeholder="x = ?"
        />
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content (shown after correct answer) */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Understanding Equation Solving</ExplanationTitle>
          <ExplanationText>
            <strong>What is an equation?</strong> An equation is a mathematical statement that shows two
            expressions are equal. Our goal is to find the value of x that makes the equation true.
          </ExplanationText>
          <FormulaBox>
            {problem.equation}
          </FormulaBox>
          <ExplanationText>
            <strong>Steps to solve:</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              <strong>Step 1:</strong> Identify which side has the variable (x)
            </li>
            <li>
              <strong>Step 2:</strong> Use inverse operations to isolate x
              <ul>
                <li>Addition ↔ Subtraction</li>
                <li>Multiplication ↔ Division</li>
              </ul>
            </li>
            <li>
              <strong>Step 3:</strong> Whatever you do to one side, do to the other side (balance the equation)
            </li>
            <li>
              <strong>Step 4:</strong> Simplify to find the value of x
            </li>
          </PropertyList>
          <ExplanationText>
            <strong>Key principles:</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              <strong>Balance:</strong> Equations are like a balance scale - what you do to one side must be done to the other
            </li>
            <li>
              <strong>Inverse operations:</strong> To "undo" addition, subtract; to "undo" multiplication, divide
            </li>
            <li>
              <strong>Work backwards:</strong> Reverse the order of operations (undo addition/subtraction first, then multiplication/division)
            </li>
            <li>
              <strong>Check your work:</strong> Substitute your answer back into the original equation to verify
            </li>
          </PropertyList>
          <ExplanationText>
            <strong>Your answer:</strong> x = {problem.x}
          </ExplanationText>
          <ExplanationText>
            <strong>Verify:</strong> Substitute x = {problem.x} back into the equation to confirm both sides are equal.
          </ExplanationText>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default Equations;

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

const VisualSection = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 40px 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    padding: 50px 30px;
    margin-bottom: 30px;
  }

  @media (min-width: 1024px) {
    padding: 60px 40px;
  }
`;

const EquationDisplay = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  text-align: center;

  @media (min-width: 768px) {
    font-size: 44px;
  }

  @media (min-width: 1024px) {
    font-size: 52px;
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
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  color: #2c5282;

  @media (min-width: 768px) {
    font-size: 32px;
    padding: 18px;
  }

  @media (min-width: 1024px) {
    font-size: 36px;
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

    ul {
      margin-top: 8px;
      margin-left: 20px;

      li {
        margin-bottom: 4px;
      }
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

