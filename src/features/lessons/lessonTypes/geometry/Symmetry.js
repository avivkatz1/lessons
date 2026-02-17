import React, { useState } from "react";
import styled from "styled-components";
import { Stage, Layer, Circle, Line, Text } from "react-konva";
import { useLessonState, useWindowDimensions } from "../../../../hooks";

const getRandomX = () => Math.floor(Math.random() * 401) + 200; // 200 to 600

const LINE_START_X = 100; // Line always starts at this position

function Symmetry({ triggerNewProblem }) {
  // Phase 3: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width } = useWindowDimensions();

  const [showAnswer, setShowAnswer] = useState(false);
  const [points, setPoints] = useState(() => [
    { id: 0, x: getRandomX(), y: 100 },
    { id: 1, x: getRandomX(), y: 20 },
  ]);
  const [lineX, setLineX] = useState(LINE_START_X);
  const [showHint, setShowHint] = useState(false);

  // The correct answer is at points[1].x (the mirror/symmetry line)
  const correctX = points[1].x;
  const isCorrect = Math.abs(lineX - correctX) < 10;

  const handleSeeAnswer = () => {
    setLineX(correctX);
    setShowAnswer(true);
    setShowHint(false);
  };

  const handleTryAnother = () => {
    setShowHint(false);
    if (triggerNewProblem) {
      triggerNewProblem();
    } else {
      setPoints([
        { id: 0, x: getRandomX(), y: 100 },
        { id: 1, x: getRandomX(), y: 20 },
      ]);
      setLineX(LINE_START_X);
      setShowAnswer(false);
    }
  };

  const changePosition = (e) => {
    const newPoints = points.map((point) => {
      if (point.id !== e.target.attrs.id) return point;
      return {
        ...point,
        x: e.target.attrs.x,
        y: e.target.attrs.y,
      };
    });
    setPoints(newPoints);
  };

  const moveLine = (e) => {
    setLineX(e.target.attrs.x);
  };

  // Calculate mirrored positions
  const centerX = points[1].x;
  const leftCircleX = points[0].x - 60;
  const rightCircleX = points[0].x + 60;

  // Mirror the red circle across the symmetry line
  const mirroredLeftX = centerX + (centerX - leftCircleX);
  const mirroredRightX = centerX + (centerX - rightCircleX);

  const hint = "Drag the vertical line to find the line of symmetry (mirror line) between the shapes.";

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}
      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        <QuestionText>
          {/* Question text hidden until hint button clicked */}
        </QuestionText>
      </QuestionSection>

      {/* Section 3: VisualSection - Interactive symmetry visualization */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 900)} height={350}>
          <Layer>
            {/* Mirrored circles (transparent) showing the reflection */}
            <Circle
              radius={10}
              stroke="black"
              strokeWidth={2}
              opacity={0.7}
              x={mirroredLeftX}
              y={points[0].y}
              fill="red"
            />
            <Circle
              radius={10}
              stroke="black"
              strokeWidth={2}
              opacity={0.7}
              x={mirroredRightX}
              y={points[0].y}
              fill="blue"
            />
            <Circle
              radius={60}
              stroke="black"
              strokeWidth={2}
              opacity={0.2}
              x={centerX + (centerX - points[0].x)}
              y={points[0].y}
              fill="lightblue"
            />
          </Layer>
          <Layer>
            {/* Original circles (on the left side) */}
            <Circle
              radius={10}
              stroke="black"
              strokeWidth={2}
              x={leftCircleX}
              y={points[0].y}
              fill="red"
              draggable={false}
            />
            <Circle
              radius={10}
              stroke="black"
              strokeWidth={2}
              x={rightCircleX}
              y={points[0].y}
              fill="blue"
              draggable={false}
            />
          </Layer>
          <Layer>
            {/* Yellow circle (draggable) */}
            <Circle
              id={0}
              radius={60}
              stroke="black"
              strokeWidth={2}
              opacity={0.5}
              x={points[0].x}
              y={points[0].y}
              fill="yellow"
              draggable={true}
              onDragMove={changePosition}
            />
            {/* Draggable symmetry line */}
            <Line
              id={1}
              stroke={isCorrect ? "green" : "lightblue"}
              strokeWidth={isCorrect ? 14 : 8}
              draggable={true}
              x={lineX}
              y={0}
              points={[0, points[1].y, 0, points[1].y + 400]}
              onDragEnd={moveLine}
            />
            {/* Line position label */}
            <Text
              fontSize={40}
              fontStyle="bold"
              fill={isCorrect ? "green" : "red"}
              text={`${lineX.toFixed(0)}`}
              x={lineX - 30}
              y={30}
              width={200}
              wrap="word"
            />
          </Layer>
        </Stage>
      </VisualSection>

      {/* Section 4: InteractionSection - Control buttons and feedback */}
      <InteractionSection>
        {showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}
        <ButtonContainer>
          <ActionButton onClick={handleTryAnother}>New Problem</ActionButton>
          {!showAnswer && <ActionButton onClick={handleSeeAnswer}>Show Answer</ActionButton>}
        </ButtonContainer>

        {isCorrect && (
          <SuccessFeedback>
            ✓ Correct! The line is at the perfect symmetry position!
          </SuccessFeedback>
        )}

        {/* Section 5: ExplanationSection - Educational content */}
        {showHint && (
          <ExplanationSection>
            <ExplanationText>
              <strong>Line of Symmetry:</strong> A line of symmetry (or mirror line) divides a shape into two identical halves.
              Each point on one side has a matching point on the other side at the same distance from the line.
            </ExplanationText>
            <ExplanationText>
              <strong>How to find it:</strong> Drag the blue vertical line until it's positioned so that the transparent shapes on
              the right perfectly match the solid shapes on the left. The line will turn <strong style={{ color: "green" }}>green</strong> when you're correct!
            </ExplanationText>
            <ExplanationText>
              You can also drag the yellow circle to create different symmetry problems. Watch how the transparent shapes move
              to stay symmetric!
            </ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default Symmetry;

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

const SuccessFeedback = styled.div`
  background: #f0fff4;
  border: 2px solid #68d391;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #22543d;
  margin: 16px 0;

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 12px;
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
