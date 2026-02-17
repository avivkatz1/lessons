import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, Rect, Line, Text } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

function CompositeShape3({ triggerNewProblem }) {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

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
  const [showHint, setShowHint] = useState(false);

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
    setShowHint(false);
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
  const hint = "Find the area of the composite shape (large rectangle minus small rectangle).";

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        {/* Question text hidden until hint button clicked */}
      </QuestionSection>

      {/* Section 3: VisualSection - Interactive composite shape */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 800)} height={500}>
          <Layer>
            {/* Background for dark mode */}
            <Rect
              x={0}
              y={0}
              width={Math.min(width - 40, 800)}
              height={500}
              fill={konvaTheme.canvasBackground}
            />

            <Rect
              stroke={view ? konvaTheme.shapeStroke : "#EF4444"}
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
              stroke={view ? konvaTheme.shapeStroke : "#3B82F6"}
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
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={5}
                  points={[300, 50 - 10, 300 + widthOne, 50 - 10]}
                />
                <Text
                  fontSize={30}
                  fontStyle="bold"
                  fill={konvaTheme.labelText}
                  text={widthOne}
                  x={300 + widthOne / 2 - 20}
                  y={20}
                  width={100}
                  wrap="word"
                />
                <Line
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={5}
                  points={[300 - 10, 50, 300 - 10, 50 + heightOne]}
                />
                <Text
                  fontSize={30}
                  fontStyle="bold"
                  fill={konvaTheme.labelText}
                  text={heightOne}
                  x={250}
                  y={50 + heightOne / 2 - 15}
                  width={100}
                  wrap="word"
                />
                <Line
                  stroke="#3B82F6"
                  strokeWidth={5}
                  points={[points.x, points.y - 10, points.x + widthTwo, points.y - 10]}
                />
                <Text
                  fontSize={30}
                  fontStyle="bold"
                  fill="#3B82F6"
                  text={widthTwo}
                  x={points.x + widthTwo / 2 - 20}
                  y={points.y - 40}
                  width={100}
                  wrap="word"
                />
                <Line
                  stroke="#3B82F6"
                  strokeWidth={5}
                  points={[points.x - 10, points.y, points.x - 10, points.y + heightTwo]}
                />
                <Text
                  fontSize={30}
                  fontStyle="bold"
                  fill="#3B82F6"
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
          <>
            {showHint && hint && (
              <HintBox>{hint}</HintBox>
            )}

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
          </>
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

const AnswerInputContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  @media (min-width: 768px) {
    margin: 15px 0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 20px;
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
