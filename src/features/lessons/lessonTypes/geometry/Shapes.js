import React, { useState } from "react";
import styled from "styled-components";
import { Stage, Layer, RegularPolygon, Text } from "react-konva";
import { useLessonState, useWindowDimensions } from "../../../../hooks";

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

  // Get number of sides from lesson data or generate random
  const getRandomSides = () => Math.floor(Math.random() * 8) + 3; // 3-10 sides
  const [sides, setSides] = useState(() => getRandomSides());

  const newShape = () => {
    if (triggerNewProblem) {
      triggerNewProblem();
    } else {
      setSides(getRandomSides());
    }
  };

  const shapeName = shapeNames[sides] || "Polygon";

  return (
    <Wrapper>
      {/* Section 2: QuestionSection - Centered instruction text */}
      <QuestionSection>
        <QuestionText>
          Explore different polygons! Click "New Shape" to see polygons with different numbers of sides.
        </QuestionText>
      </QuestionSection>

      {/* Section 3: VisualSection - Shape visualization */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 800)} height={400}>
          <Layer>
            <RegularPolygon
              sides={sides}
              radius={100}
              fill="red"
              opacity={0.3}
              x={Math.min(width - 40, 800) / 2}
              y={150}
              stroke="black"
              strokeWidth={3}
            />

            <Text
              x={Math.min(width - 40, 800) / 2 - 150}
              y={280}
              fontSize={24}
              fill="black"
              text={`This shape has ${sides} ${sides === 1 ? "side" : "sides"}`}
              width={300}
              align="center"
            />
            <Text
              x={Math.min(width - 40, 800) / 2 - 150}
              y={315}
              fontSize={20}
              fill="black"
              text={`It's called a ${shapeName}`}
              width={300}
              align="center"
            />
          </Layer>
        </Stage>
      </VisualSection>

      {/* Section 4: InteractionSection - Control buttons */}
      <InteractionSection>
        <ButtonContainer>
          <ActionButton onClick={newShape}>New Shape</ActionButton>
        </ButtonContainer>

        {/* Section 5: ExplanationSection - Educational content */}
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
      </InteractionSection>
    </Wrapper>
  );
}

export default Shapes;

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
