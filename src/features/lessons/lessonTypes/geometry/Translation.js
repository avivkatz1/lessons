import React, { useState, useEffect } from "react";
import { useWindowDimensions } from "../../../../hooks";
import styled from "styled-components";
import { Stage, Layer, Rect, Circle, Line, Text as KonvaText } from "react-konva";

const randomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const GRID_SPACING = 15; // pixels per grid unit
const GRID_OFFSET_X = 310;
const GRID_OFFSET_Y = 10;
const TOLERANCE = 10; // pixels tolerance for "correct" positioning

/**
 * Translation - Interactive lesson for practicing translation transformations
 * Students drag a colored shape to match specific translation instructions.
 *
 * Levels:
 * 1. Simple translations (one direction)
 * 2. Two-direction translations (right/up, left/down, etc.)
 * 3. Larger distances
 */
function Translation({ level = 1 }) {
  const { width } = useWindowDimensions();

  // Problem state
  const [problem, setProblem] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Generate a new problem based on level
  const generateProblem = () => {
    let horizontalMove, verticalMove;

    if (level === 1) {
      // Level 1: Single direction only
      const direction = randomNum(0, 1);
      if (direction === 0) {
        // Horizontal only
        horizontalMove = randomNum(2, 5) * (randomNum(0, 1) === 0 ? 1 : -1);
        verticalMove = 0;
      } else {
        // Vertical only
        horizontalMove = 0;
        verticalMove = randomNum(2, 5) * (randomNum(0, 1) === 0 ? 1 : -1);
      }
    } else {
      // Level 2+: Two directions
      const maxDistance = level === 2 ? 4 : 6;
      horizontalMove = randomNum(2, maxDistance) * (randomNum(0, 1) === 0 ? 1 : -1);
      verticalMove = randomNum(2, maxDistance) * (randomNum(0, 1) === 0 ? 1 : -1);
    }

    // Starting position (centered on grid)
    const startX = randomNum(8, 12);
    const startY = randomNum(10, 15);

    setProblem({
      startX,
      startY,
      horizontalMove,
      verticalMove,
      targetX: startX + horizontalMove,
      targetY: startY + verticalMove
    });

    setDragPosition({ x: 0, y: 0 });
    setIsCorrect(false);
    setShowFeedback(false);
  };

  // Initialize first problem
  useEffect(() => {
    generateProblem();
  }, [level]);

  // Check if current position is correct
  const checkPosition = () => {
    if (!problem) return;

    const currentX = dragPosition.x / GRID_SPACING;
    const currentY = -dragPosition.y / GRID_SPACING; // Negative because canvas Y is inverted

    const distanceX = Math.abs(currentX - problem.horizontalMove);
    const distanceY = Math.abs(currentY - problem.verticalMove);

    const isCloseEnough =
      distanceX < TOLERANCE / GRID_SPACING &&
      distanceY < TOLERANCE / GRID_SPACING;

    if (isCloseEnough && !isCorrect) {
      setIsCorrect(true);
      setShowFeedback(true);
    }
  };

  const handleDragEnd = (e) => {
    const node = e.target.getStage().findOne('.draggableLayer');
    setDragPosition({ x: node.x(), y: node.y() });
    setIsDragging(false);
    checkPosition();
  };

  const handleNextProblem = () => {
    generateProblem();
  };

  if (!problem) return null;

  // Generate instruction text
  const getInstructionText = () => {
    const { horizontalMove, verticalMove } = problem;

    let parts = [];

    if (horizontalMove !== 0) {
      const direction = horizontalMove > 0 ? "right" : "left";
      parts.push(`${direction} ${Math.abs(horizontalMove)} space${Math.abs(horizontalMove) !== 1 ? 's' : ''}`);
    }

    if (verticalMove !== 0) {
      const direction = verticalMove > 0 ? "down" : "up";
      parts.push(`${direction} ${Math.abs(verticalMove)} space${Math.abs(verticalMove) !== 1 ? 's' : ''}`);
    }

    if (parts.length === 2) {
      return `Slide the shape ${parts[0]} and ${parts[1]}`;
    } else {
      return `Slide the shape ${parts[0]}`;
    }
  };

  return (
    <Wrapper>
      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        <QuestionText>{getInstructionText()}</QuestionText>
        {showFeedback && isCorrect && (
          <FeedbackText correct>
            ✓ Correct! You translated the shape perfectly!
          </FeedbackText>
        )}
      </QuestionSection>

      {/* 2. VisualSection - Grid and draggable squares */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 1300)} height={500}>
          {/* Grid Layer */}
          <Layer>
            {/* Horizontal grid lines */}
            {[...Array(35)].map((_, indexH) => (
              <Line
                key={`y${indexH}`}
                points={[0, 0, 1300, 0]}
                stroke="lightgray"
                strokeWidth={1}
                x={0}
                y={indexH * GRID_SPACING + GRID_OFFSET_Y}
              />
            ))}

            {/* Vertical grid lines */}
            {[...Array(60)].map((_, indexV) => (
              <Line
                key={`x${indexV}`}
                points={[0, 0, 0, 500]}
                stroke="lightgray"
                strokeWidth={1}
                x={indexV * GRID_SPACING + GRID_OFFSET_X}
                y={0}
              />
            ))}
          </Layer>

          {/* Target Outline Layer - Shows where shape should end up */}
          <Layer>
            <Rect
              x={problem.targetX * GRID_SPACING + GRID_OFFSET_X}
              y={problem.targetY * GRID_SPACING + GRID_OFFSET_Y}
              fill="transparent"
              opacity={0.3}
              width={30}
              height={30}
              stroke="#48BB78"
              strokeWidth={3}
              dash={[5, 5]}
            />
            <Rect
              x={problem.targetX * GRID_SPACING + GRID_OFFSET_X + 30}
              y={problem.targetY * GRID_SPACING + GRID_OFFSET_Y}
              fill="transparent"
              opacity={0.3}
              width={30}
              height={30}
              stroke="#48BB78"
              strokeWidth={3}
              dash={[5, 5]}
            />
            <Rect
              x={problem.targetX * GRID_SPACING + GRID_OFFSET_X}
              y={problem.targetY * GRID_SPACING + GRID_OFFSET_Y + 30}
              fill="transparent"
              opacity={0.3}
              width={30}
              height={30}
              stroke="#48BB78"
              strokeWidth={3}
              dash={[5, 5]}
            />
            <Rect
              x={problem.targetX * GRID_SPACING + GRID_OFFSET_X + 30}
              y={problem.targetY * GRID_SPACING + GRID_OFFSET_Y + 30}
              fill="transparent"
              opacity={0.3}
              width={30}
              height={30}
              stroke="#48BB78"
              strokeWidth={3}
              dash={[5, 5]}
            />
          </Layer>

          {/* Starting Position Layer - Semi-transparent original */}
          <Layer>
            <Rect
              x={problem.startX * GRID_SPACING + GRID_OFFSET_X}
              y={problem.startY * GRID_SPACING + GRID_OFFSET_Y}
              fill="red"
              opacity={0.2}
              width={30}
              height={30}
              stroke="black"
              strokeWidth={1}
            />
            <Rect
              x={problem.startX * GRID_SPACING + GRID_OFFSET_X + 30}
              y={problem.startY * GRID_SPACING + GRID_OFFSET_Y}
              fill="blue"
              opacity={0.2}
              width={30}
              height={30}
              stroke="black"
              strokeWidth={1}
            />
            <Rect
              x={problem.startX * GRID_SPACING + GRID_OFFSET_X}
              y={problem.startY * GRID_SPACING + GRID_OFFSET_Y + 30}
              fill="green"
              opacity={0.2}
              width={30}
              height={30}
              stroke="black"
              strokeWidth={1}
            />
            <Rect
              x={problem.startX * GRID_SPACING + GRID_OFFSET_X + 30}
              y={problem.startY * GRID_SPACING + GRID_OFFSET_Y + 30}
              fill="yellow"
              opacity={0.2}
              width={30}
              height={30}
              stroke="black"
              strokeWidth={1}
            />
          </Layer>

          {/* Draggable Squares Layer */}
          <Layer
            name="draggableLayer"
            draggable
            x={dragPosition.x}
            y={dragPosition.y}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
          >
            <Rect
              x={problem.startX * GRID_SPACING + GRID_OFFSET_X}
              y={problem.startY * GRID_SPACING + GRID_OFFSET_Y}
              fill="red"
              opacity={isCorrect ? 0.9 : 0.7}
              width={30}
              height={30}
              stroke="black"
              strokeWidth={2}
            />
            <Rect
              x={problem.startX * GRID_SPACING + GRID_OFFSET_X + 30}
              y={problem.startY * GRID_SPACING + GRID_OFFSET_Y}
              fill="blue"
              opacity={isCorrect ? 0.9 : 0.7}
              width={30}
              height={30}
              stroke="black"
              strokeWidth={2}
            />
            <Rect
              x={problem.startX * GRID_SPACING + GRID_OFFSET_X}
              y={problem.startY * GRID_SPACING + GRID_OFFSET_Y + 30}
              fill="green"
              opacity={isCorrect ? 0.9 : 0.7}
              width={30}
              height={30}
              stroke="black"
              strokeWidth={2}
            />
            <Rect
              x={problem.startX * GRID_SPACING + GRID_OFFSET_X + 30}
              y={problem.startY * GRID_SPACING + GRID_OFFSET_Y + 30}
              fill="yellow"
              opacity={isCorrect ? 0.9 : 0.7}
              width={30}
              height={30}
              stroke="black"
              strokeWidth={2}
            />
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Control buttons */}
      <InteractionSection>
        {isCorrect ? (
          <NextButton onClick={handleNextProblem}>
            Next Problem →
          </NextButton>
        ) : (
          <HintText>
            Drag the colored shape to the green dashed outline
          </HintText>
        )}
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content */}
      <ExplanationSection>
        <ExplanationTitle>Understanding Translation</ExplanationTitle>
        <ExplanationText>
          <strong>Translation</strong> is a transformation that slides every point of a shape
          the same distance in the same direction.
        </ExplanationText>
        <ExplanationText>
          <strong>Key concepts:</strong>
        </ExplanationText>
        <PropertyList>
          <li><strong>Same distance, same direction:</strong> Every point moves the exact same way</li>
          <li><strong>No rotation:</strong> The shape keeps the same orientation</li>
          <li><strong>No reflection:</strong> The shape doesn't flip</li>
          <li><strong>Size preserved:</strong> The shape stays exactly the same size</li>
        </PropertyList>
        <ExplanationText>
          The <strong style={{ color: "#48BB78" }}>green dashed outline</strong> shows where
          the shape should end up. The faded shape shows where it started.
        </ExplanationText>
      </ExplanationSection>
    </Wrapper>
  );
}

export default Translation;

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
  color: ${props => props.theme?.colors?.textPrimary || '#2d3748'};
  line-height: 1.6;
  margin: 0 0 10px 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }

  @media (min-width: 1024px) {
    font-size: 26px;
  }
`;

const FeedbackText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.correct ? '#48BB78' : '#F56565'};
  margin: 10px 0 0 0;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  background-color: ${props => props.theme?.colors?.canvasBackground || '#f7fafc'};
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
  min-height: 60px;

  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 30px;
  }
`;

const NextButton = styled.button`
  background-color: #48BB78;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 32px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #38A169;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    font-size: 22px;
    padding: 16px 36px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
    padding: 18px 40px;
  }
`;

const HintText = styled.p`
  font-size: 16px;
  color: ${props => props.theme?.colors?.textSecondary || '#718096'};
  margin: 0;
  font-style: italic;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: #f0fff4;
  border-left: 4px solid #48BB78;
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
