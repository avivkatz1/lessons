import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, Rect, Line, Text } from "react-konva";
import { useLessonState, useWindowDimensions } from "../../../../hooks";

function CompositeShape3({ triggerNewProblem }) {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width } = useWindowDimensions();

  const [widthTwo, setWidthTwo] = useState(() => numbers(1, 135, 65)[0]);
  const [heightTwo, setHeightTwo] = useState(() => numbers(1, 135, 65)[0]);
  const [widthOne, setWidthOne] = useState(() => numbers(1, 200, numbers(1, 135, 65)[0] + 50)[0]);
  const [heightOne, setHeightOne] = useState(() => numbers(1, 100, numbers(1, 135, 65)[0] + 50)[0]);
  const [view, setView] = useState(false);
  const [randomNums, setRandomNums] = useState(() => numbers(2, 100));
  const [points, setPoints] = useState(() => ({
    x: numbers(1, 200, 200)[0],
    y: numbers(1, 100, 50)[0],
  }));
  const [showAnswer, setShowAnswer] = useState(false);

  const newShape = () => {
    const tempWidthTwo = numbers(1, 135, 65)[0];
    const tempHeightTwo = numbers(1, 135, 65)[0];
    const tempWidthOne = numbers(1, 200, tempWidthTwo + 50)[0];
    const tempHeightOne = numbers(1, 100, tempHeightTwo + 50)[0];
    setWidthTwo(tempWidthTwo);
    setHeightTwo(tempHeightTwo);
    setWidthOne(tempWidthOne);
    setHeightOne(tempHeightOne);
    setRandomNums(numbers(2, 100));
    setPoints({
      x: numbers(1, tempWidthOne - tempWidthTwo, 200)[0],
      y: numbers(1, tempHeightOne - tempHeightTwo, 50)[0],
    });
    setView(false);
    setShowAnswer(false);
  };

  const movingShapes = () => {
    setView(!view);
  };

  const handleTryAnother = () => {
    if (triggerNewProblem) {
      triggerNewProblem();
    } else {
      newShape();
    }
  };

  const changePoints = (e) => {
    let xValue = e.target.attrs.x;
    if (e.target.attrs.x + widthTwo > 300 + widthOne) xValue = 300 + widthOne - widthTwo;
    if (e.target.attrs.x < 300) xValue = 300;

    let yValue = e.target.attrs.y;
    if (e.target.attrs.y + heightTwo > 50 + heightOne) yValue = 50 + heightOne - heightTwo;
    if (e.target.attrs.y < 50) yValue = 50;

    setPoints({ x: xValue, y: yValue });
  };

  const areaOne = widthOne * heightOne;
  const areaTwo = widthTwo * heightTwo;
  const compositeArea = areaOne - areaTwo;

  return (
    <Wrapper>
      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        <QuestionText>
          Find the area of the composite shape (large rectangle minus small rectangle).
        </QuestionText>
      </QuestionSection>

      {/* Section 3: VisualSection - Interactive composite shape */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 800)} height={500}>
          <Layer>
            <Rect
              stroke={view ? "black" : "red"}
              strokeWidth={12}
              width={widthOne}
              height={heightOne}
              x={300}
              y={50}
              fill="red"
              opacity={0.4}
              draggable={false}
              onClick={() => setView(!view)}
            />
            <Rect
              stroke={view ? "black" : "blue"}
              strokeWidth={12}
              width={widthTwo}
              height={heightTwo}
              x={points.x}
              y={points.y}
              fill="white"
              opacity={1}
              draggable={randomNums[0] > 50}
              onDragStart={movingShapes}
              onDragEnd={movingShapes}
              onDragMove={changePoints}
              onClick={() => setView(!view)}
            />

            {view && (
              <>
                <Line
                  stroke="black"
                  strokeWidth={5}
                  points={[300, 50 - 10, 300 + widthOne, 50 - 10]}
                />
                <Text
                  fontSize={30}
                  fontStyle="bold"
                  fill="black"
                  text={widthOne}
                  x={300 + widthOne / 2 - 20}
                  y={20}
                  width={100}
                  wrap="word"
                />
                <Line
                  stroke="black"
                  strokeWidth={5}
                  points={[300 - 10, 50, 300 - 10, 50 + heightOne]}
                />
                <Text
                  fontSize={30}
                  fontStyle="bold"
                  fill="black"
                  text={heightOne}
                  x={250}
                  y={50 + heightOne / 2 - 15}
                  width={100}
                  wrap="word"
                />
                <Line
                  stroke="blue"
                  strokeWidth={5}
                  points={[points.x, points.y - 10, points.x + widthTwo, points.y - 10]}
                />
                <Text
                  fontSize={30}
                  fontStyle="bold"
                  fill="blue"
                  text={widthTwo}
                  x={points.x + widthTwo / 2 - 20}
                  y={points.y - 40}
                  width={100}
                  wrap="word"
                />
                <Line
                  stroke="blue"
                  strokeWidth={5}
                  points={[points.x - 10, points.y, points.x - 10, points.y + heightTwo]}
                />
                <Text
                  fontSize={30}
                  fontStyle="bold"
                  fill="blue"
                  text={heightTwo}
                  x={points.x - 60}
                  y={points.y + heightTwo / 2 - 15}
                  width={100}
                  wrap="word"
                />
              </>
            )}

            <Text
              fontSize={35}
              fontStyle="bold"
              fill="green"
              text={showAnswer ? compositeArea : "?"}
              x={width / 2 - 50}
              y={250}
              width={200}
              wrap="word"
            />
          </Layer>
        </Stage>
      </VisualSection>

      {/* Section 4: InteractionSection - Answer input and controls */}
      <InteractionSection>
        {!showAnswer && (
          <AnswerInputContainer>
            <AnswerInput
              correctAnswer={compositeArea.toString()}
              answerType="number"
              onCorrect={() => setShowAnswer(true)}
              onTryAnother={handleTryAnother}
              disabled={showAnswer}
              placeholder="Enter area"
            />
          </AnswerInputContainer>
        )}

        <ButtonContainer>
          <ActionButton onClick={() => setView(!view)}>
            {view ? "Hide Measurements" : "Show Measurements"}
          </ActionButton>
        </ButtonContainer>

        {/* Section 5: ExplanationSection - Shown after correct answer */}
        {showAnswer && (
          <ExplanationSection>
            <ExplanationText>
              <strong>Correct!</strong> The area of the composite shape is <strong>{compositeArea}</strong> square units.
              <br />
              <br />
              <strong>Calculation:</strong> Large rectangle area ({widthOne} × {heightOne} = {areaOne}) minus small rectangle area
              ({widthTwo} × {heightTwo} = {areaTwo}) = {compositeArea}.
              <br />
              <br />
              For composite shapes with cutouts, subtract the area of the removed section from the total area.
            </ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default CompositeShape3;

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
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 14px;
    line-height: 1.4;
  }
`;
