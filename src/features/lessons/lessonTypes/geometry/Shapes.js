import React, { useState } from "react";
import styled from "styled-components";
import { Stage, Layer, RegularPolygon, Text, Rect } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

const shapeNames = {
  3: "Triangle",
  4: "Quadrilateral",
  5: "Pentagon",
  6: "Hexagon",
  7: "Heptagon",
  8: "Octagon",
  9: "Nonagon",
  10: "Decagon",
};

function Shapes({ triggerNewProblem }) {
  // Phase 3: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  // Get number of sides from lesson data or generate random
  const getRandomSides = () => Math.floor(Math.random() * 8) + 3; // 3-10 sides
  const [sides, setSides] = useState(() => getRandomSides());
  const [showHint, setShowHint] = useState(false);

  const newShape = () => {
    setShowHint(false);
    if (triggerNewProblem) {
      triggerNewProblem();
    } else {
      setSides(getRandomSides());
    }
  };

  const shapeName = shapeNames[sides] || "Polygon";

  const hint = "Explore different polygons! Click 'New Shape' to see polygons with different numbers of sides.";

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

      {/* Section 3: VisualSection - Shape visualization */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 800)} height={400}>
          <Layer>
            {/* Background for dark mode */}
            <Rect
              x={0}
              y={0}
              width={Math.min(width - 40, 800)}
              height={400}
              fill={konvaTheme.canvasBackground}
            />

            <RegularPolygon
              sides={sides}
              radius={100}
              fill="#EF4444"
              opacity={0.3}
              x={Math.min(width - 40, 800) / 2}
              y={150}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={3}
            />

            <Text
              x={Math.min(width - 40, 800) / 2 - 150}
              y={280}
              fontSize={24}
              fill={konvaTheme.labelText}
              text={`This shape has ${sides} ${sides === 1 ? "side" : "sides"}`}
              width={300}
              align="center"
            />
            <Text
              x={Math.min(width - 40, 800) / 2 - 150}
              y={315}
              fontSize={20}
              fill={konvaTheme.labelText}
              text={`It's called a ${shapeName}`}
              width={300}
              align="center"
            />
          </Layer>
        </Stage>
      </VisualSection>

      {/* Section 4: InteractionSection - Control buttons */}
      <InteractionSection>
        {showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}
        <ButtonContainer>
          <ActionButton onClick={newShape}>New Shape</ActionButton>
        </ButtonContainer>

        {/* Section 5: ExplanationSection - Educational content */}
        {showHint && (
          <ExplanationSection>
            <ExplanationText>
              <strong>What is a Polygon?</strong> A polygon is a closed shape made up of straight line segments.
            </ExplanationText>
            <ExplanationText>
              <strong>Polygon Names:</strong> Polygons are named based on the number of sides they have:
            </ExplanationText>
            <ExplanationText>
              • <strong>Triangle</strong> (3 sides) • <strong>Quadrilateral</strong> (4 sides) • <strong>Pentagon</strong> (5 sides)
              <br />
              • <strong>Hexagon</strong> (6 sides) • <strong>Heptagon</strong> (7 sides) • <strong>Octagon</strong> (8 sides)
              <br />• <strong>Nonagon</strong> (9 sides) • <strong>Decagon</strong> (10 sides)
            </ExplanationText>
            <ExplanationText>
              <strong>Regular Polygons:</strong> When all sides and angles are equal, the polygon is called "regular" (like the shape above).
            </ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default Shapes;

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
