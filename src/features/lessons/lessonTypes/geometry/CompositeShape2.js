import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, Rect, Line, Text } from "react-konva";
import { useLessonState, useWindowDimensions } from "../../../../hooks";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

function CompositeShape2({ triggerNewProblem }) {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width } = useWindowDimensions();

  const [adding, setAdding] = useState(() => randomNum(301));
  const [widths, setWidths] = useState(() => numbers(2, 100));
  const [view, setView] = useState(false);
  const [randomNums, setRandomNums] = useState(() => numbers(2, 100));
  const [points, setPoints] = useState(() => ({ x: 612, y: 50 + randomNum(301) }));
  const [showAnswer, setShowAnswer] = useState(false);

  const newShape = () => {
    const newAdding = randomNum(301);
    setAdding(newAdding);
    setRandomNums(numbers(2, 100));
    setWidths(numbers(2, 100));
    setPoints({ x: 612, y: 50 + newAdding });
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
    let yValue = e.target.attrs.y;
    if (e.target.attrs.y + widths[1] > 350 + widths[0]) yValue = 350 + widths[0] - widths[1];
    if (e.target.attrs.y < 50) yValue = 50;
    setPoints({ x: e.target.attrs.x, y: yValue });
  };

  const currentY = Math.round(points.y - 50);

  return (
    <Wrapper>
      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        <QuestionText>
          {randomNums[0] > 50
            ? `Slide the rectangle to make y = ${randomNums[1]}`
            : "Find the value of y by analyzing the composite shape"}
        </QuestionText>
      </QuestionSection>

      {/* Section 3: VisualSection - Interactive composite shape */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 700)} height={600}>
          <Layer>
            <Rect
              stroke={view ? "black" : "red"}
              strokeWidth={12}
              width={400}
              height={300 + widths[0]}
              x={200}
              y={50}
              fill="red"
              opacity={0.4}
              draggable={false}
              onDragStart={movingShapes}
              onDragEnd={movingShapes}
              onClick={() => setView(!view)}
            />
            <Rect
              stroke={view ? "black" : "red"}
              strokeWidth={12}
              width={200}
              height={100 + widths[1]}
              x={points.x}
              y={points.y}
              fill="red"
              opacity={0.4}
              draggable={randomNums[0] > 50}
              onDragStart={movingShapes}
              onDragEnd={movingShapes}
              onDragMove={changePoints}
              onClick={() => setView(!view)}
            />

            <Text
              fontSize={40}
              fontStyle="bold"
              fill="lightgreen"
              text={showAnswer ? currentY : "y"}
              x={width / 2 - 50}
              y={points.y - 60}
              width={200}
              wrap="word"
            />

            {view && (
              <>
                <Line
                  stroke="black"
                  strokeWidth={10}
                  points={[612, 50 - 6, 612, 350 + 6 + widths[0]]}
                />
                <Line
                  stroke="red"
                  strokeWidth={10}
                  points={[612 - 6, points.y - 6, 612 - 6, points.y + 100 + 6 + widths[1]]}
                />
                <Line
                  stroke="red"
                  strokeWidth={10}
                  points={[812 + 6, points.y - 6, 812 + 6, points.y + 100 + 6 + widths[1]]}
                />
                <Line
                  stroke="lightgreen"
                  strokeWidth={10}
                  points={[612 - 6, 50 - 6, 612 - 6, points.y - 6]}
                />
                <Line
                  stroke="lightblue"
                  strokeWidth={10}
                  points={[612 - 6, points.y + 100 + 6 + widths[1], 612 - 6, 356 + widths[0]]}
                />
                <Text
                  fontSize={40}
                  fontStyle="bold"
                  fill="black"
                  text={300 + 12 + widths[0]}
                  x={650}
                  y={(600 + widths[0]) / 2 - 20}
                  width={200}
                  wrap="word"
                />
                <Text
                  fontSize={40}
                  fontStyle="bold"
                  fill="red"
                  text={112 + widths[1]}
                  x={830}
                  y={points.y + 15 + widths[1] / 2}
                  width={200}
                  wrap="word"
                />
              </>
            )}
            <Line
              stroke="lightblue"
              strokeWidth={10}
              points={[612 - 6, points.y + 100 + 6 + widths[1], 612 - 6, 356 + widths[0]]}
            />
            <Text
              fontSize={40}
              fontStyle="bold"
              fill="black"
              text={300 + 12 + widths[0]}
              x={120}
              y={(600 + widths[0]) / 2 - 20}
              width={200}
              wrap="word"
            />
            <Text
              fontSize={40}
              fontStyle="bold"
              fill="red"
              text={112 + widths[1]}
              x={20}
              y={points.y + 15 + widths[1] / 2}
              width={200}
              wrap="word"
            />
            <Text
              fontSize={40}
              fontStyle="bold"
              fill="lightblue"
              text={Math.abs(Math.round(300 - points.y + 50) + widths[0] - widths[1])}
              x={650}
              y={
                300 - points.y + 50 + widths[0] - widths[1] < 0
                  ? points.y + widths[1] + 120
                  : points.y + widths[1] + 70
              }
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
              correctAnswer={currentY.toString()}
              answerType="number"
              onCorrect={() => setShowAnswer(true)}
              onTryAnother={handleTryAnother}
              disabled={showAnswer}
              placeholder="y = ?"
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
              <strong>Correct!</strong> The value of y is <strong>{currentY}</strong>.
              <br />
              <br />
              In composite shapes, you can find unknown lengths by analyzing how the shapes overlap and align.
              Use the "Show Measurements" button to see all the dimensions and understand the relationship.
            </ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default CompositeShape2;

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
