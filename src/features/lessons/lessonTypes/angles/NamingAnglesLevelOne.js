import React, { useState } from "react";
import styled from "styled-components";
import { useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import makingAngle from "../../../../shared/helpers/makingAngle";
import { Stage, Layer, Line, Text, Rect } from "react-konva";

/**
 * NamingAnglesLevelOne - Interactive angle naming practice (introductory level)
 * Students click on letters to practice three-letter angle naming
 * Demonstrates that the vertex must always be in the middle position
 */
function NamingAnglesLevelOne({ triggerNewProblem }) {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  // Initialize angle data
  const initialAngle = React.useMemo(() => makingAngle(), []);
  const [linesArray, setLinesArray] = useState(initialAngle.linesArray);
  const [lettersArray, setLettersArray] = useState(initialAngle.lettersArray);
  const [answerArray, setAnswerArray] = useState([]);
  const [correct, setCorrect] = useState(true);
  const [showHint, setShowHint] = useState(false);

  const varOne = lettersArray[0].name;
  const varTwo = lettersArray[1].name;
  const varThree = lettersArray[2].name;

  const newAngle = () => {
    const newAngleData = makingAngle();
    setLinesArray(newAngleData.linesArray);
    setLettersArray(newAngleData.lettersArray);
    setAnswerArray([]);
    setCorrect(true);
    setShowHint(false);
  };

  const handleClick = (e) => {
    const { id } = e.target.attrs;

    // Check if clicked letter is valid for current position
    const isInvalid =
      ((answerArray.length === 0 || answerArray.length === 2) && id === varTwo) ||
      (answerArray.length === 1 && id !== varTwo);

    if (isInvalid) {
      setCorrect(false);
      setAnswerArray([]);
      setTimeout(() => {
        setCorrect(true);
      }, 2000);
      return;
    }

    setAnswerArray([...answerArray, id]);
  };

  const canvasWidth = Math.min(width - 40, 900);
  const canvasHeight = 500;

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showHint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        <QuestionText>
          {correct && answerArray.length === 3
            ? `Well done! ∠${answerArray.join("")} is correct!`
            : correct
              ? `Click the letters to name the angle`
              : `Try again! The vertex goes in the middle!`}
        </QuestionText>
        {correct && answerArray.length === 3 && (
          <FeedbackText>
            ✓ Perfect! You named the angle correctly!
          </FeedbackText>
        )}
      </QuestionSection>

      {/* 2. VisualSection - Interactive angle visualization */}
      <VisualSection>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            {/* Background for dark mode */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />

            {/* Progress text */}
            <Text
              x={20}
              y={20}
              fontSize={20}
              fill={konvaTheme.labelText}
              text={
                answerArray.length === 0
                  ? "Click letters in order to name the angle"
                  : `Your answer so far: ∠${answerArray.join("")}`
              }
              width={canvasWidth - 40}
              wrap="word"
            />

            {/* Draw angle lines */}
            {linesArray.map((line, index) => {
              const { x1, y1, x2, y2, x3, y3 } = line;
              return (
                <Line
                  id={index}
                  key={index}
                  x={line.x}
                  y={line.y}
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={3}
                  points={[x1, y1, x2, y2, x3, y3]}
                />
              );
            })}

            {/* Draw clickable letter labels */}
            {lettersArray.map((letterVar, index) => {
              const { x, y, fontSize, name } = letterVar;
              const isSelected = answerArray.includes(name);
              const isVertex = name === varTwo;

              return (
                <Text
                  id={name}
                  key={index}
                  x={x}
                  y={y}
                  fontSize={fontSize}
                  fontStyle="bold"
                  fill={isSelected ? konvaTheme.opposite : konvaTheme.labelText}
                  text={name}
                  onClick={correct ? handleClick : undefined}
                  onTap={correct ? handleClick : undefined}
                  style={{ cursor: correct ? 'pointer' : 'default' }}
                />
              );
            })}
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Control button */}
      <InteractionSection>
        <ActionButton onClick={newAngle}>
          Try Another Angle
        </ActionButton>
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content */}
      {showHint && <ExplanationSection>
        <ExplanationTitle>How to Name Angles</ExplanationTitle>
        <ExplanationText>
          <strong>Angles can be named in two ways:</strong>
        </ExplanationText>
        <PropertyList>
          <li>
            <strong>One letter (the vertex):</strong> The simplest way to name an angle is by its
            vertex point. The angle above is <strong>∠{varTwo}</strong>
          </li>
          <li>
            <strong>Three letters:</strong> When multiple angles share the same vertex, we use three
            letters to be specific
          </li>
        </PropertyList>
        <ExplanationText>
          <strong>The Three-Letter Rule:</strong>
        </ExplanationText>
        <FormulaBox>
          The vertex MUST always be in the middle!
        </FormulaBox>
        <ExplanationText>
          <strong>For the angle shown above:</strong>
        </ExplanationText>
        <PropertyList>
          <li>
            <strong>Correct ways to name it:</strong>
            <ul>
              <li>∠{varTwo} (using just the vertex)</li>
              <li>∠{varOne}{varTwo}{varThree} (three letters with vertex in middle)</li>
              <li>∠{varThree}{varTwo}{varOne} (reverse order is also correct)</li>
            </ul>
          </li>
          <li>
            <strong>Incorrect:</strong> ∠{varOne}{varThree}{varTwo} or ∠{varTwo}{varOne}{varThree}
            (vertex not in middle)
          </li>
        </PropertyList>
        <ExplanationText>
          <strong>Why this matters:</strong> When multiple angles meet at a point, the three-letter
          notation helps us specify exactly which angle we're talking about. The middle letter tells
          us where the angle is formed, and the outer letters show which rays form the angle.
        </ExplanationText>
      </ExplanationSection>}
    </Wrapper>
  );
}

export default NamingAnglesLevelOne;

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
  margin: 0 0 10px 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }

  @media (min-width: 1024px) {
    font-size: 26px;
  }
`;

const FeedbackText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: #48BB78;
  margin: 10px 0 0 0;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (min-width: 768px) {
    font-size: 20px;
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

const ActionButton = styled.button`
  background-color: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    font-size: 20px;
    padding: 16px 32px;
  }

  @media (min-width: 1024px) {
    font-size: 22px;
    padding: 18px 36px;
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
