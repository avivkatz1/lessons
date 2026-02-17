import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, Rect, Line, Text } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

function CompositeShape({ triggerNewProblem }) {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const [adding, setAdding] = useState(() => randomNum(301));
  const [widths, setWidths] = useState(() => numbers(2, 300));
  const [view, setView] = useState(false);
  const [randomNums, setRandomNums] = useState(() => numbers(2, 100));
  const [points, setPoints] = useState(() => ({ x: 300 + randomNum(301), y: 170 + 12 }));
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const newShape = () => {
    const newAdding = randomNum(301);
    setAdding(newAdding);
    setRandomNums(numbers(2, 100));
    setWidths(numbers(2, 300));
    setPoints({ x: 300 + newAdding, y: 170 + 12 });
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
    if (e.target.attrs.x + widths[1] > 600 + widths[0]) xValue = 600 + widths[0] - widths[1];
    if (e.target.attrs.x < 300) xValue = 300;
    setPoints({ x: xValue, y: e.target.attrs.y });
  };

  const currentX = Math.round(points.x - 300);
  const hint = randomNums[0] > 50
    ? `Slide the rectangle to make x = ${randomNums[1]}`
    : "Find the value of x by analyzing the composite shape";

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
        <Stage width={Math.min(width - 40, 900)} height={500}>
          <Layer>
            {/* Background for dark mode */}
            <Rect
              x={0}
              y={0}
              width={Math.min(width - 40, 900)}
              height={500}
              fill={konvaTheme.canvasBackground}
            />

            <Rect
                stroke={view ? konvaTheme.shapeStroke : "#EF4444"}
                strokeWidth={12}
                width={400 + widths[0]}
                height={120}
                x={300}
                y={50}
                fill={"red"}
                opacity={0.4}
                draggable={false}
                onDragStart={movingShapes}
                onDragEnd={movingShapes}
                onClick={() => setView(!view)}
              />
              <Rect
                stroke={view ? konvaTheme.shapeStroke : "#EF4444"}
                strokeWidth={12}
                width={100 + widths[1]}
                height={200}
                x={points.x}
                y={points.y}
                fill={"red"}
                opacity={0.4}
                draggable={randomNums[0] > 50 ? true : false}
                onDragStart={movingShapes}
                onDragEnd={movingShapes}
                onDragMove={changePoints}
                onClick={() => setView(!view)}
              />

              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"lightgreen"}
                text={showAnswer ? Math.round(points.x - 300) : "x"}
                x={points.x - 100}
                y={180}
                width={200}
                wrap={"word"}
              />

              {view && (
                <>
                  <Line
                    stroke={konvaTheme.shapeStroke}
                    strokeWidth={10}
                    points={[300 - 6, 170, 700 + 6 + widths[0], 170]}
                  />
                  <Line
                    stroke={"red"}
                    strokeWidth={10}
                    points={[points.x - 6, 170 + 6, points.x + 100 + 6 + widths[1], 170 + 6]}
                  />
                  <Line
                    stroke={"red"}
                    strokeWidth={10}
                    points={[
                      points.x - 6,
                      points.y + 200,
                      points.x + 100 + 6 + widths[1],
                      points.y + 200,
                    ]}
                  />
                  <Line
                    stroke={"lightgreen"}
                    strokeWidth={10}
                    points={[300 - 6, 170 + 6, points.x - 6, 170 + 6]}
                  />
                  <Line
                    stroke={"lightblue"}
                    strokeWidth={10}
                    points={[points.x + 100 + 6 + widths[1], 170 + 6, 706 + widths[0], 170 + 6]}
                  />
                  <Text
                    fontSize={40}
                    fontStyle={"bold"}
                    fill={konvaTheme.labelText}
                    text={400 + 12 + widths[0]}
                    x={(900 + widths[0]) / 2}
                    y={130}
                    width={200}
                    wrap={"word"}
                    draggable={true}
                  />
                  <Text
                    fontSize={40}
                    fontStyle={"bold"}
                    fill={"red"}
                    text={112 + widths[1]}
                    x={points.x + 15 + widths[1] / 2}
                    y={180}
                    width={200 + widths[1]}
                    wrap={"word"}
                    draggable={true}
                  />
                </>
              )}
              <Line
                stroke={"lightblue"}
                strokeWidth={10}
                points={[points.x + 100 + 6 + widths[1], 170 + 6, 706 + widths[0], 170 + 6]}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={konvaTheme.labelText}
                text={400 + 12 + widths[0]}
                x={(900 + widths[0]) / 2}
                y={10}
                width={200}
                wrap={"word"}
                draggable={true}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"red"}
                text={112 + widths[1]}
                x={points.x + 15 + widths[1] / 2}
                y={points.y + 210}
                width={200 + widths[1]}
                wrap={"word"}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"lightblue"}
                text={Math.abs(Math.round(500 - points.x + 100) + widths[0] - widths[1])}
                x={
                  500 - points.x + 100 + widths[0] - widths[1] > 0
                    ? points.x + widths[1] + 150
                    : points.x + widths[1] + 70
                }
                y={
                  500 - points.x + 100 + widths[0] - widths[1] < 0
                    ? 130
                    : 500 - points.x + 100 + widths[0] - widths[1] > 0 && points.x <= 519
                      ? 180
                      : 200
                }
                width={200}
                wrap={"word"}
              />
              {points.x > 519 && (
                <Line
                  stroke={"lightblue"}
                  strokeWidth={10}
                  points={[points.x + 100 + 6 + widths[1], 170 + 6, 706 + widths[0], 170 + 6]}
                />
              )}
            </Layer>
          </Stage>
        </VisualSection>

        {/* Section 4: InteractionSection - Hint box + answer input and controls */}
        <InteractionSection>
          {!showAnswer && (
            <>
              {showHint && hint && (
                <HintBox>{hint}</HintBox>
              )}

              <AnswerInputContainer>
                  <AnswerInput
                  correctAnswer={currentX.toString()}
                  answerType="number"
                  onCorrect={() => setShowAnswer(true)}
                  onTryAnother={handleTryAnother}
                  disabled={showAnswer}
                  placeholder="x = ?"
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
                <strong>Correct!</strong> The value of x is <strong>{currentX}</strong>.
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

export default CompositeShape;

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
