import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";

/**
 * Patterns2 - Interactive arithmetic sequence pattern recognition
 * Students identify the next numbers in arithmetic sequences
 * Demonstrates linear patterns with positive and negative changes
 */
function Patterns2({ triggerNewProblem }) {
  const generateProblem = () => {
    const nums = numbers(6, 100);
    const a = nums[0] > 50 ? nums[1] : -1 * nums[1]; // Rate of change (slope)
    const b = nums[2] > 50 ? nums[3] : -1 * nums[3]; // Starting value

    const patternArray = [];
    for (let i = 0; i < 5; i++) {
      patternArray.push(a * i + b);
    }

    return { pattern: patternArray, rate: a, start: b };
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

  const hint = `Find the next two numbers in the sequence: ${problem.pattern[0]}, ${problem.pattern[1]}, ${problem.pattern[2]}, ___, ___`;

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* 1. QuestionSection - Instructions and sequence display */}
      <QuestionSection>
        {/* Question text hidden until hint button clicked */}
      </QuestionSection>

      {/* 2. VisualSection - Not needed for text-based problems */}

      {/* 3. InteractionSection - Hint box + answer input */}
      <InteractionSection>
        {!showAnswer && showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}

        <AnswerInput
          correctAnswer={problem.pattern[3]}
          answerType="number"
          onCorrect={handleCorrect}
          onTryAnother={handlePractice}
          disabled={showAnswer}
          placeholder="Next number?"
        />
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content (shown after correct answer) */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Understanding Arithmetic Sequences</ExplanationTitle>
          <ExplanationText>
            <strong>Complete sequence:</strong>
          </ExplanationText>
          <FormulaBox>
            {problem.pattern[0]}, {problem.pattern[1]}, {problem.pattern[2]}, {problem.pattern[3]}, {problem.pattern[4]}
          </FormulaBox>
          <ExplanationText>
            <strong>Pattern breakdown:</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              <strong>Starting value:</strong> {problem.start} (the first term)
            </li>
            <li>
              <strong>Common difference:</strong> {problem.rate > 0 ? `+${problem.rate}` : problem.rate} (the amount that changes each time)
            </li>
            <li>
              <strong>Pattern rule:</strong> Starting at {problem.start}, {problem.rate > 0 ? 'add' : 'subtract'} {Math.abs(problem.rate)} each time
            </li>
          </PropertyList>
          <ExplanationText>
            <strong>What is an arithmetic sequence?</strong> An arithmetic sequence is a pattern of numbers where
            each term increases or decreases by the same amount (called the common difference).
          </ExplanationText>
          <ExplanationText>
            <strong>How to find the pattern:</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              <strong>Step 1:</strong> Find the difference between consecutive terms
              <ul>
                <li>{problem.pattern[1]} - {problem.pattern[0]} = {problem.rate}</li>
                <li>{problem.pattern[2]} - {problem.pattern[1]} = {problem.rate}</li>
              </ul>
            </li>
            <li>
              <strong>Step 2:</strong> Verify the difference is constant (same for all pairs)
            </li>
            <li>
              <strong>Step 3:</strong> Add the common difference to find the next term
              <ul>
                <li>{problem.pattern[2]} + ({problem.rate}) = {problem.pattern[3]}</li>
                <li>{problem.pattern[3]} + ({problem.rate}) = {problem.pattern[4]}</li>
              </ul>
            </li>
          </PropertyList>
          <ExplanationText>
            <strong>Formula for arithmetic sequences:</strong>
          </ExplanationText>
          <FormulaBox>
            nth term = first term + (n - 1) × common difference
          </FormulaBox>
          <ExplanationText>
            For this sequence: term(n) = {problem.start} + (n - 1) × {problem.rate}
          </ExplanationText>
          <ExplanationText>
            <strong>Real-world examples:</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              <strong>Saving money:</strong> If you start with ${problem.start > 0 ? Math.abs(problem.start) : 0} and save
              ${Math.abs(problem.rate)} each week, your savings follow an arithmetic sequence
            </li>
            <li>
              <strong>Temperature changes:</strong> If temperature starts at {problem.start}° and changes by {problem.rate}° each hour
            </li>
            <li>
              <strong>Seating arrangements:</strong> If each row has {Math.abs(problem.rate)} more seats than the previous row
            </li>
          </PropertyList>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default Patterns2;

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
  margin: 0 0 20px 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }

  @media (min-width: 1024px) {
    font-size: 26px;
  }
`;

const SequenceDisplay = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  font-family: 'Courier New', monospace;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    font-size: 40px;
    padding: 25px;
  }

  @media (min-width: 1024px) {
    font-size: 48px;
    padding: 30px;
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
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  color: #2c5282;
  font-family: 'Courier New', monospace;

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
