import React, { useState } from "react";
import styled from "styled-components";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

import makingAngle from "../../../../shared/helpers/makingAngle";
import { Stage, Layer, Line, Text, Rect } from "react-konva";

const NamingAnglesLevelOne = ({ triggerNewProblem }) => {
  // Initialize state with lazy initializer function to avoid module-level errors
  const initialAngle = React.useMemo(() => makingAngle(), []);
  const [linesArray, setLinesArray] = useState(initialAngle.linesArray);
  const [lettersArray, setLettersArray] = useState(initialAngle.lettersArray);
  const [answerArray, setAnswerArray] = useState([]);
  const [correct, setCorrect] = useState(true);

  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const varOne = lettersArray[0].name;
  const varTwo = lettersArray[1].name;
  const varThree = lettersArray[2].name;

  const newAngle = () => {
    setAnswerArray([]);
    setCorrect(true);
    if (triggerNewProblem) {
      triggerNewProblem();
    } else {
      const newAngleData = makingAngle();
      setLinesArray(newAngleData.linesArray);
      setLettersArray(newAngleData.lettersArray);
    }
  };

  const handleClick = (e) => {
    const { id } = e.target.attrs;
    if (
      ((answerArray.length === 0 || answerArray.length === 2) && id === varTwo) ||
      (answerArray.length === 1 && id !== varTwo)
    ) {
      setCorrect(false);
      setAnswerArray([]);
      setTimeout(() => {
        setCorrect(true);
      }, 2000);
      return;
    }
    setAnswerArray([...answerArray, id]);
  };

  return (
    <Wrapper>
      {/* Section 2: QuestionSection - Instruction text in canvas */}
      <QuestionSection>
        <QuestionText>
          Click on the letters in the correct order to name the angle below.
        </QuestionText>
      </QuestionSection>

      {/* Section 3: VisualSection - Interactive angle visualization */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 800)} height={500}>
          <Layer>
            <Rect
              x={0}
              y={0}
              width={Math.min(width - 40, 800)}
              height={500}
              fill={konvaTheme.canvasBackground}
            />

            <Text
              x={20}
              y={10}
              fontSize={18}
              fill={konvaTheme.labelText}
              text={
                correct && answerArray.length === 3
                  ? `Well done! ∠${answerArray.join("")} is correct! Try another angle, or move on to the next level.`
                  : correct
                    ? `Tap on the letters in the correct order to name the angle: ∠${answerArray.join("")}`
                    : "Try again! Remember, the vertex always goes in the middle!"
              }
              width={Math.min(width - 80, 760)}
              wrap="word"
            />
            {linesArray.map((line, index) => {
              const { x1, y1, x2, y2, x3, y3 } = line;
              return (
                <Line
                  id={index}
                  key={index}
                  x={line.x}
                  y={line.y}
                  stroke={konvaTheme.shapeStroke}
                  points={[x1, y1, x2, y2, x3, y3]}
                />
              );
            })}
            {lettersArray.map((letterVar, index) => {
              const { x, y, fontSize, fill, fontWidth, name } = letterVar;
              return (
                <Text
                  id={name}
                  key={index}
                  x={x}
                  y={y}
                  fontSize={fontSize}
                  fill={fill}
                  text={name}
                  fontWidth={fontWidth}
                  onClick={handleClick}
                />
              );
            })}
          </Layer>
        </Stage>
      </VisualSection>

      {/* Section 4: InteractionSection - Control buttons and explanation */}
      <InteractionSection>
        <ButtonContainer>
          <ActionButton onClick={newAngle}>Another Angle</ActionButton>
        </ButtonContainer>

        {/* Section 5: ExplanationSection - Educational content */}
        <ExplanationSection>
          <ExplanationText>
            <strong>How to Name an Angle:</strong> Angles can be named using one letter (the vertex) or three letters.
          </ExplanationText>
          <ExplanationText>
            When using three letters, the <strong>vertex must always be in the middle</strong>. For example, ∠ABC has B as the vertex.
          </ExplanationText>
          <ExplanationText>
            The angle above can be named as: <strong>∠{varTwo}</strong> or <strong>∠{varOne}{varTwo}{varThree}</strong> or{" "}
            <strong>∠{varThree}{varTwo}{varOne}</strong>.
          </ExplanationText>
        </ExplanationSection>
      </InteractionSection>
    </Wrapper>
  );
};

export default NamingAnglesLevelOne;

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

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    margin: 12px 0;
  }
`;

const ActionButton = styled.button`
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #3182ce;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
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
