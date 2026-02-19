import React, { useState } from "react";
import { useLessonState, useWindowDimensions } from "../../../../hooks";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";
import TouchDragHandle from "../../../../shared/helpers/TouchDragHandle";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

function Angles({ triggerNewProblem }) {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width, height } = useWindowDimensions();

  // State with lazy initializers
  const [points, setPoints] = useState(() => [
    { id: 0, x: 503, y: 283 },
    { id: 1, x: 329, y: 186 },
    { id: 2, x: 328, y: 43 },
  ]);

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

  const newGrid = () => {
    setPoints([
      { id: 0, x: 503, y: 283 },
      { id: 1, x: 329, y: 186 },
      { id: 2, x: 328, y: 43 },
    ]);
  };

  const [showHint, setShowHint] = useState(false);
  const hint = "Explore angles! Drag the red point to change the angle. The blue area highlights the angle formed by the two lines.";

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

      {/* Section 3: VisualSection - Interactive angle visualization */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 800)} height={500}>
          <Layer>
            <Shape
              sceneFunc={(context, shape) => {
                context.beginPath();
                context.moveTo((points[0].x + points[1].x) / 2, (points[0].y + points[1].y) / 2);
                context.lineTo((points[2].x + points[1].x) / 2, (points[2].y + points[1].y) / 2);
                context.lineTo(points[1].x, points[1].y);
                context.closePath();
                context.fillStrokeShape(shape);
              }}
              fill="#00D2FF"
              stroke="black"
              strokeWidth={2}
            />
          </Layer>
          <Layer>
            <Text
              x={points[1].x + 20}
              y={points[1].y - 10}
              fontSize={20}
              fill="blue"
              text="The angle is at this corner"
            />
          </Layer>
          <Layer>
            <Line
              stroke="black"
              strokeWidth={3}
              points={[points[1].x, points[1].y, points[0].x, points[0].y]}
            />
            <Line
              stroke="black"
              strokeWidth={3}
              points={[points[1].x, points[1].y, points[2].x, points[2].y]}
            />
            {points.map((p, i) => {
              return (
                <TouchDragHandle
                  key={i}
                  id={i}
                  radius={4}
                  stroke={i === 1 ? "red" : "black"}
                  strokeWidth={2}
                  x={p.x}
                  y={p.y}
                  fill={i === 1 ? "red" : "black"}
                  onDragMove={changePosition}
                  affordanceColor={i === 1 ? "red" : "black"}
                />
              );
            })}
          </Layer>
        </Stage>
      </VisualSection>

      {/* Section 4: InteractionSection - Control buttons */}
      <InteractionSection>
        <ButtonContainer>
          <ActionButton onClick={newGrid}>Reset Angle</ActionButton>
        </ButtonContainer>

        {/* Section 5: ExplanationSection - Educational content */}
        {showHint && (
          <ExplanationSection>
            <ExplanationText>
              <strong>What is an Angle?</strong> An angle is formed when two lines (or rays) meet at a common point called the vertex.
            </ExplanationText>
            <ExplanationText>
              The <strong style={{ color: "red" }}>red point</strong> is the vertex of the angle. The two black lines extend from this vertex.
            </ExplanationText>
            <ExplanationText>
              The <strong style={{ color: "#00D2FF" }}>blue area</strong> shows the space between the two lines. This is the angle!
            </ExplanationText>
            <ExplanationText>
              Try dragging the red point or the black points to see how the angle changes.
            </ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default Angles;

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
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;

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
