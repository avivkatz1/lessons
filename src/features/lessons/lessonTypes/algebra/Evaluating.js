import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import katex from "katex";
import SettingUpProblem from "../../../../shared/helpers/SettingUpProblem";
import { AnswerInput } from "../../../../shared/components";

/**
 * Evaluating - Interactive expression evaluation practice
 * Students solve various types of mathematical expressions with KaTeX rendering
 * Supports order of operations, evaluating expressions, integer operations, and equations
 */
function Evaluating({ triggerNewProblem }) {
  const params = useParams();
  const initialProblemType = params.lesson;
  const [problem, setProblem] = useState(() => SettingUpProblem({ lesson: initialProblemType }));
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const KaTeXComponent = ({ texExpression }) => {
    const containerRef = useRef();
    useEffect(() => {
      if (containerRef.current) {
        // Clear old content first to prevent duplication
        containerRef.current.innerHTML = '';
        // Render new content
        katex.render(texExpression, containerRef.current, {
          throwOnError: false,
          displayMode: true,
        });
      }
    }, [texExpression]);

    return <KaTeXContainer ref={containerRef} />;
  };

  const handlePractice = () => {
    const newProb = SettingUpProblem({ lesson: initialProblemType });
    setProblem(newProb);
    setShowAnswer(false);
    setShowHint(false);
  };

  const handleCorrect = () => {
    setShowAnswer(true);
  };

  // Map lesson types to friendly names for educational content
  const getLessonName = (type) => {
    const names = {
      order_of_operations: "Order of Operations",
      evaluating_expressions: "Evaluating Expressions",
      adding_integers: "Adding Integers",
      subtracting_integers: "Subtracting Integers",
      multiplying_integers: "Multiplying Integers",
      one_step_equations: "One-Step Equations",
      two_step_equations: "Two-Step Equations",
    };
    return names[type] || "Mathematics";
  };

  const hint = `Solve the ${getLessonName(initialProblemType).toLowerCase()} problem shown below.`;

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

      {/* 2. VisualSection - Mathematical expression display */}
      <VisualSection>
        <KaTeXComponent texExpression={problem.problem} />
      </VisualSection>

      {/* 3. InteractionSection - Hint box + answer input */}
      <InteractionSection>
        {!showAnswer && showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}

        <AnswerInput
          correctAnswer={problem.answer}
          answerType="number"
          onCorrect={handleCorrect}
          onTryAnother={handlePractice}
          disabled={showAnswer}
          placeholder="Enter your answer"
        />
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content (shown after correct answer) */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Understanding {getLessonName(initialProblemType)}</ExplanationTitle>
          {initialProblemType === "order_of_operations" && (
            <>
              <ExplanationText>
                <strong>Order of Operations (PEMDAS):</strong> Mathematical expressions must be evaluated
                in a specific order to get the correct answer.
              </ExplanationText>
              <FormulaBox>
                Parentheses → Exponents → Multiplication/Division → Addition/Subtraction
              </FormulaBox>
              <PropertyList>
                <li>
                  <strong>P - Parentheses:</strong> Solve anything inside parentheses first
                </li>
                <li>
                  <strong>E - Exponents:</strong> Calculate powers and roots next
                </li>
                <li>
                  <strong>MD - Multiply/Divide:</strong> Work from left to right
                </li>
                <li>
                  <strong>AS - Add/Subtract:</strong> Work from left to right
                </li>
              </PropertyList>
              <ExplanationText>
                <strong>Remember:</strong> Multiplication and division are equal in priority (do them
                left to right), same with addition and subtraction.
              </ExplanationText>
            </>
          )}
          {initialProblemType === "evaluating_expressions" && (
            <>
              <ExplanationText>
                <strong>Evaluating Expressions:</strong> To evaluate an expression means to find its
                numerical value by substituting numbers for variables and simplifying.
              </ExplanationText>
              <PropertyList>
                <li>
                  <strong>Step 1:</strong> Substitute the given value for each variable
                </li>
                <li>
                  <strong>Step 2:</strong> Follow the order of operations (PEMDAS)
                </li>
                <li>
                  <strong>Step 3:</strong> Simplify step by step until you get a single number
                </li>
              </PropertyList>
              <ExplanationText>
                <strong>Example:</strong> If x = 3, then 2x + 5 = 2(3) + 5 = 6 + 5 = 11
              </ExplanationText>
            </>
          )}
          {(initialProblemType === "adding_integers" ||
            initialProblemType === "subtracting_integers" ||
            initialProblemType === "multiplying_integers") && (
            <>
              <ExplanationText>
                <strong>Working with Integers:</strong> Integers include positive numbers, negative
                numbers, and zero (..., -3, -2, -1, 0, 1, 2, 3, ...).
              </ExplanationText>
              <PropertyList>
                <li>
                  <strong>Same signs:</strong> Add the absolute values, keep the sign
                  <ul>
                    <li>5 + 3 = 8 (both positive)</li>
                    <li>-5 + (-3) = -8 (both negative)</li>
                  </ul>
                </li>
                <li>
                  <strong>Different signs:</strong> Subtract the smaller from larger, use sign of larger
                  <ul>
                    <li>5 + (-3) = 2 (5 is larger, so positive)</li>
                    <li>-5 + 3 = -2 (-5 is larger, so negative)</li>
                  </ul>
                </li>
                <li>
                  <strong>Multiplication/Division:</strong> Same signs = positive, different signs = negative
                </li>
              </PropertyList>
            </>
          )}
          {(initialProblemType === "one_step_equations" ||
            initialProblemType === "two_step_equations") && (
            <>
              <ExplanationText>
                <strong>Solving Equations:</strong> The goal is to isolate the variable on one side of
                the equation by using inverse operations.
              </ExplanationText>
              <PropertyList>
                <li>
                  <strong>Addition ↔ Subtraction:</strong> If the equation has +5, subtract 5 from both sides
                </li>
                <li>
                  <strong>Multiplication ↔ Division:</strong> If the equation has ×3, divide both sides by 3
                </li>
                <li>
                  <strong>Whatever you do to one side, do to the other!</strong> This keeps the equation balanced
                </li>
              </PropertyList>
              {initialProblemType === "two_step_equations" && (
                <ExplanationText>
                  <strong>Two-step equations:</strong> Work backwards through the order of operations.
                  Usually, undo addition/subtraction first, then undo multiplication/division.
                </ExplanationText>
              )}
            </>
          )}
          <ExplanationText>
            <strong>Your answer:</strong> {problem.answer}
          </ExplanationText>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default Evaluating;

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
  min-height: 150px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    padding: 50px 30px;
    margin-bottom: 30px;
  }

  @media (min-width: 1024px) {
    padding: 60px 40px;
  }
`;

const KaTeXContainer = styled.div`
  font-size: 40px;
  color: ${props => props.theme.colors.textPrimary};

  @media (min-width: 768px) {
    font-size: 50px;
  }

  @media (min-width: 1024px) {
    font-size: 60px;
  }

  /* KaTeX specific styles for dark mode compatibility */
  .katex {
    color: inherit;
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
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  color: #2c5282;

  @media (min-width: 768px) {
    font-size: 20px;
    padding: 18px;
  }

  @media (min-width: 1024px) {
    font-size: 22px;
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
