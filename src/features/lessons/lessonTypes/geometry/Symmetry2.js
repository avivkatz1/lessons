import React, { useState } from "react";
import styled from "styled-components";
import { Stage, Layer, Circle, Line, Text, Arrow } from "react-konva";
import { useLessonState, useWindowDimensions } from "../../../../hooks";

const getRandomX = () => Math.floor(Math.random() * 201) + 250; // 250 to 450

function Symmetry2({ triggerNewProblem }) {
  // Phase 3: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width } = useWindowDimensions();

  const [points, setPoints] = useState(() => [
    { id: 0, x: getRandomX(), y: 200 },
    { id: 1, x: 450, y: 20 }, // Symmetry line position
  ]);
  const [showX, setShowX] = useState(false);
  const [showY, setShowY] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const hint = "Find the values of x and y. Click on the letters to reveal the answers!";

  const handleNewProblem = () => {
    if (triggerNewProblem) {
      triggerNewProblem();
    } else {
      setPoints([
        { id: 0, x: getRandomX(), y: 200 },
        { id: 1, x: 450, y: 20 },
      ]);
      setShowX(false);
      setShowY(false);
      setShowHint(false);
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

  // Calculate positions
  const centerX = points[1].x;
  const leftCircleX = points[0].x - 60;
  const rightCircleX = points[0].x + 60;

  // Mirror positions
  const mirroredLeftX = centerX + (centerX - leftCircleX);
  const mirroredRightX = centerX + (centerX - rightCircleX);
  const mirroredCenterX = centerX + (centerX - points[0].x);

  // Distance calculations
  const distanceX = Math.abs(Math.floor(centerX - rightCircleX));
  const distanceY = Math.abs(Math.floor(centerX - leftCircleX));

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showHint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        {showHint && (
          <QuestionText>
            {hint}
          </QuestionText>
        )}
      </QuestionSection>

      {/* Section 3: VisualSection - Interactive symmetry with measurements */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 900)} height={500}>
          <Layer>
            {/* Mirrored circles (transparent) */}
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
              x={mirroredCenterX}
              y={points[0].y}
              fill="lightblue"
            />

            {/* Distance arrows (shown when answers revealed) */}
            {showX && (
              <>
                <Arrow
                  stroke="blue"
                  strokeWidth={6}
                  opacity={0.6}
                  points={[rightCircleX, points[0].y - 40, centerX, points[0].y - 40]}
                  pointerAtBeginning={true}
                  lineCap="round"
                  dash={[13, 10]}
                />
                <Arrow
                  stroke="green"
                  strokeWidth={6}
                  opacity={0.6}
                  points={[mirroredRightX, points[0].y - 40, centerX, points[0].y - 40]}
                  pointerAtBeginning={true}
                  lineCap="round"
                  dash={[13, 10]}
                />
              </>
            )}

            {showY && (
              <>
                <Arrow
                  stroke="red"
                  strokeWidth={6}
                  opacity={0.6}
                  points={[leftCircleX, points[0].y + 40, centerX, points[0].y + 40]}
                  pointerAtBeginning={true}
                  lineCap="round"
                  dash={[13, 10]}
                />
                <Arrow
                  stroke="orange"
                  strokeWidth={6}
                  opacity={0.6}
                  points={[mirroredLeftX, points[0].y + 40, centerX, points[0].y + 40]}
                  pointerAtBeginning={true}
                  lineCap="round"
                  dash={[13, 10]}
                />
              </>
            )}
          </Layer>

          <Layer>
            {/* Original circles */}
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
            {/* Yellow draggable circle */}
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

            {/* Symmetry line */}
            <Line
              stroke="lightblue"
              strokeWidth={8}
              points={[centerX, points[1].y + 10, centerX, points[1].y + 400]}
            />

            {/* Clickable x value (above) */}
            <Text
              x={centerX - 30}
              y={points[0].y - 100}
              fontSize={30}
              fill={showX ? "green" : "gray"}
              stroke={showX ? "green" : "gray"}
              text={showX ? distanceX : "x"}
              onClick={() => setShowX(!showX)}
              style={{ cursor: "pointer" }}
            />

            {/* Clickable y value (below) */}
            <Text
              x={centerX - 30}
              y={points[0].y + 70}
              fontSize={30}
              fill={showY ? "orange" : "gray"}
              stroke={showY ? "orange" : "gray"}
              text={showY ? distanceY : "y"}
              onClick={() => setShowY(!showY)}
              style={{ cursor: "pointer" }}
            />
          </Layer>
        </Stage>
      </VisualSection>

      {/* Section 4: InteractionSection - Control buttons */}
      <InteractionSection>
        <ButtonContainer>
          <ActionButton onClick={handleNewProblem}>New Problem</ActionButton>
          <ActionButton onClick={() => { setShowX(true); setShowY(true); }}>
            Show Both Answers
          </ActionButton>
        </ButtonContainer>

        {/* Section 5: ExplanationSection - Educational content */}
        {showHint && (
          <ExplanationSection>
            <ExplanationText>
              <strong>Symmetry and Distance:</strong> In symmetric shapes, corresponding points are the same distance from the
              line of symmetry.
            </ExplanationText>
            <ExplanationText>
              <strong>x and y represent distances:</strong>
              <br />• <strong style={{ color: "green" }}>x</strong> is the distance from the blue circle to the symmetry line
              <br />• <strong style={{ color: "orange" }}>y</strong> is the distance from the red circle to the symmetry line
            </ExplanationText>
            <ExplanationText>
              The transparent shapes on the right mirror the solid shapes on the left. Click on "x" or "y" to reveal the
              distances and see the arrows showing the measurements!
            </ExplanationText>
            <ExplanationText>
              <strong>Try it:</strong> Drag the yellow circle to different positions and watch how x and y values change while the
              shapes stay symmetric.
            </ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default Symmetry2;

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
