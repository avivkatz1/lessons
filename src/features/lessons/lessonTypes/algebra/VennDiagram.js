import React, { useState } from "react";
import { useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import styled from "styled-components";
import { Stage, Layer, Circle, Text, Rect } from "react-konva";

const vennList = [
  {
    venn1: "Has 4 legs",
    venn2: "Hairy",
    left: "Turtle",
    center: "Dog",
    right: "Ape",
    out: "Snake",
  },
  {
    venn1: "Has Wheels",
    venn2: "Has Windows",
    left: "Stroller",
    center: "Car",
    right: "Building",
    out: "Couch",
  },
  {
    venn1: "4 equal sides",
    venn2: "4 right angles",
    left: "rhombus",
    center: "square",
    right: "rectangle",
    out: "triangle",
  },
];

// Initial positions for draggable words (start position on right side)
const initialPositions = {
  left: { x: 650, y: 50 },
  right: { x: 650, y: 100 },
  center: { x: 650, y: 150 },
  out: { x: 650, y: 200 },
};

/**
 * VennDiagram - Interactive Venn diagram exploration
 * Students drag words to the correct regions of a two-circle Venn diagram
 * Demonstrates logical classification and set intersection concepts
 */
function VennDiagram({ triggerNewProblem }) {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const [venn, setVenn] = useState(vennList[0]);
  const [wordPositions, setWordPositions] = useState(initialPositions);
  const [showHint, setShowHint] = useState(false);

  const newVenn = () => {
    const num = Math.floor(Math.random() * vennList.length);
    setVenn(vennList[num]);
    setWordPositions(initialPositions);
    setShowHint(false);
  };

  const handleDragEnd = (word, e) => {
    setWordPositions({
      ...wordPositions,
      [word]: { x: e.target.x(), y: e.target.y() },
    });
  };

  const canvasWidth = Math.min(width - 40, 900);
  const canvasHeight = 350;

  const hint = "Drag each word to the correct region of the Venn diagram!";

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}
      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        <QuestionText>
          {/* Question text hidden until hint button clicked */}
        </QuestionText>
        <CategoryLabels>
          <CategoryLabel color="#EF4444">Left circle: {venn.venn2}</CategoryLabel>
          <CategoryLabel color="#3B82F6">Right circle: {venn.venn1}</CategoryLabel>
        </CategoryLabels>
      </QuestionSection>

      {/* 2. VisualSection - Interactive Venn diagram */}
      <VisualSection>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            {/* Background for dark mode */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />

            {/* Left circle (red) */}
            <Circle
              radius={110}
              fill="#EF4444"
              opacity={0.25}
              x={280}
              y={180}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={3}
            />

            {/* Right circle (blue) */}
            <Circle
              radius={110}
              fill="#3B82F6"
              opacity={0.25}
              x={420}
              y={180}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={3}
            />

            {/* Category labels at top */}
            <Text
              x={190}
              y={30}
              fontSize={18}
              fontStyle="bold"
              fill="#EF4444"
              text={venn.venn2}
              width={180}
              align="center"
            />
            <Text
              x={430}
              y={30}
              fontSize={18}
              fontStyle="bold"
              fill="#3B82F6"
              text={venn.venn1}
              width={180}
              align="center"
            />

            {/* Draggable words */}
            <Text
              x={wordPositions.left.x}
              y={wordPositions.left.y}
              fontSize={16}
              fontStyle="bold"
              fill={konvaTheme.labelText}
              text={venn.left}
              draggable={true}
              wrap="word"
              width={90}
              align="center"
              onDragEnd={(e) => handleDragEnd("left", e)}
              shadowColor="black"
              shadowBlur={5}
              shadowOpacity={0.3}
            />
            <Text
              x={wordPositions.right.x}
              y={wordPositions.right.y}
              fontSize={16}
              fontStyle="bold"
              fill={konvaTheme.labelText}
              text={venn.right}
              draggable={true}
              wrap="word"
              width={90}
              align="center"
              onDragEnd={(e) => handleDragEnd("right", e)}
              shadowColor="black"
              shadowBlur={5}
              shadowOpacity={0.3}
            />
            <Text
              x={wordPositions.center.x}
              y={wordPositions.center.y}
              fontSize={16}
              fontStyle="bold"
              fill={konvaTheme.labelText}
              text={venn.center}
              draggable={true}
              wrap="word"
              width={90}
              align="center"
              onDragEnd={(e) => handleDragEnd("center", e)}
              shadowColor="black"
              shadowBlur={5}
              shadowOpacity={0.3}
            />
            <Text
              x={wordPositions.out.x}
              y={wordPositions.out.y}
              fontSize={16}
              fontStyle="bold"
              fill={konvaTheme.labelText}
              text={venn.out}
              draggable={true}
              wrap="word"
              width={90}
              align="center"
              onDragEnd={(e) => handleDragEnd("out", e)}
              shadowColor="black"
              shadowBlur={5}
              shadowOpacity={0.3}
            />
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Control button */}
      <InteractionSection>
        {showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}
        <ActionButton onClick={newVenn}>
          Try Another Venn Diagram
        </ActionButton>
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content */}
      {showHint && <ExplanationSection>
        <ExplanationTitle>Understanding Venn Diagrams</ExplanationTitle>
        <ExplanationText>
          <strong>Venn diagrams</strong> are visual tools for showing relationships between different sets
          or groups. They help us understand how things can be classified and what they have in common.
        </ExplanationText>
        <ExplanationText>
          <strong>The three regions:</strong>
        </ExplanationText>
        <PropertyList>
          <li>
            <strong style={{ color: "#EF4444" }}>Left circle only (red):</strong> Items that have the first
            property but NOT the second property
          </li>
          <li>
            <strong style={{ color: "#9333EA" }}>Center (overlap/purple):</strong> Items that have BOTH
            properties - this is called the intersection
          </li>
          <li>
            <strong style={{ color: "#3B82F6" }}>Right circle only (blue):</strong> Items that have the
            second property but NOT the first property
          </li>
          <li>
            <strong>Outside both circles:</strong> Items that have NEITHER property
          </li>
        </PropertyList>
        <ExplanationText>
          <strong>For this example:</strong>
        </ExplanationText>
        <PropertyList>
          <li>
            <strong>{venn.left}:</strong> Has "{venn.venn2}" but not "{venn.venn1}" → goes in left circle only
          </li>
          <li>
            <strong>{venn.center}:</strong> Has BOTH "{venn.venn2}" AND "{venn.venn1}" → goes in the center
            overlap
          </li>
          <li>
            <strong>{venn.right}:</strong> Has "{venn.venn1}" but not "{venn.venn2}" → goes in right circle
            only
          </li>
          <li>
            <strong>{venn.out}:</strong> Has NEITHER property → goes outside both circles
          </li>
        </PropertyList>
        <ExplanationText>
          <strong>Real-world applications:</strong>
        </ExplanationText>
        <PropertyList>
          <li>
            <strong>Logic and sets:</strong> Venn diagrams help visualize set theory concepts like union,
            intersection, and complement
          </li>
          <li>
            <strong>Problem solving:</strong> They're useful for organizing information and finding
            commonalities between groups
          </li>
          <li>
            <strong>Probability:</strong> Venn diagrams help calculate probabilities of combined events
          </li>
          <li>
            <strong>Data analysis:</strong> Used to compare groups and find overlapping characteristics
          </li>
        </PropertyList>
        <ExplanationText>
          <strong>Key concept:</strong> The center region (where circles overlap) is special because it
          represents items that satisfy multiple conditions at once. This intersection is often the most
          interesting part of the diagram!
        </ExplanationText>
      </ExplanationSection>}
    </Wrapper>
  );
}

export default VennDiagram;

// Styled Components - TangentLesson 5-section layout standard

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
  margin: 0 0 15px 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }

  @media (min-width: 1024px) {
    font-size: 26px;
  }
`;

const CategoryLabels = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const CategoryLabel = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.color};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 18px;
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

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #2f855a;
  margin: 0 0 15px 0;

  @media (min-width: 768px) {
    font-size: 22px;
    margin-bottom: 20px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
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

const PropertyList = styled.ul`
  margin: 15px 0;
  padding-left: 20px;

  li {
    font-size: 16px;
    color: #2d3748;
    line-height: 1.8;
    margin-bottom: 8px;

    @media (min-width: 768px) {
      font-size: 17px;
      margin-bottom: 10px;
    }

    @media (min-width: 1024px) {
      font-size: 18px;
    }
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
