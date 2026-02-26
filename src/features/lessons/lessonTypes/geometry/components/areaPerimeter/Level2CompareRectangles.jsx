import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect } from 'react-konva';
import GridBackground from './GridBackground';
import DimensionLabel from './DimensionLabel';
import SmartText from './SmartText';
import { useWindowDimensions, useKonvaTheme } from '../../../../../../hooks';
import { useSmartPositioning } from '../../hooks/useSmartPositioning';
import { registerShape } from '../../utils/smartPositioning';

/**
 * Level 2: Compare Rectangles
 * Two static rectangles displayed side-by-side, student taps to select the correct one
 */
function Level2CompareRectangles({ visualData, onComplete, onNextProblem, questionIndex = 0 }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  // Canvas sizing (iPad optimized) - larger grid space
  const canvasWidth = useMemo(() => {
    const padding = 40;
    return Math.min(windowWidth - padding, 1200); // Wider canvas
  }, [windowWidth]);

  const canvasHeight = 400; // Taller for better visibility

  // Smart positioning system
  const { registry, calculator } = useSmartPositioning(canvasWidth, canvasHeight);

  const {
    rectA = { width: 4, height: 5, area: 20, perimeter: 18 },
    rectB = { width: 6, height: 3, area: 18, perimeter: 18 },
    askingFor = 'area',
  } = visualData;

  const [selectedRect, setSelectedRect] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset state when problem changes
  useEffect(() => {
    setSelectedRect(null);
    setSubmitted(false);
  }, [questionIndex]);

  const gridSize = 10; // More grid cells
  const cellSize = 40; // Larger cells for better visibility

  // Center both rectangles with 1 cell gap between them
  const totalWidth = rectA.width + 1 + rectB.width; // Add 1 cell gap
  const startX = Math.max(2, Math.floor((canvasWidth / cellSize - totalWidth) / 2));

  const rectAX = cellSize * startX;
  const rectAY = cellSize * 2;
  const rectBX = cellSize * (startX + rectA.width + 1); // 1 cell gap
  const rectBY = cellSize * 2;

  // Register shapes with collision system
  useEffect(() => {
    // Register Rectangle A
    registerShape(registry, 'rect-a', {
      x: rectAX,
      y: rectAY,
      width: rectA.width * cellSize,
      height: rectA.height * cellSize
    }, 'shape', 10);

    // Register Rectangle B
    registerShape(registry, 'rect-b', {
      x: rectBX,
      y: rectBY,
      width: rectB.width * cellSize,
      height: rectB.height * cellSize
    }, 'shape', 10);
  }, [registry, rectAX, rectAY, rectBX, rectBY, rectA.width, rectA.height, rectB.width, rectB.height, cellSize]);

  // Handle rectangle selection
  const handleRectClick = (rect) => {
    if (!submitted) {
      setSelectedRect(rect);
    }
  };

  // Check if selection is correct
  const isCorrect = submitted && selectedRect === 'A';

  // Auto-trigger success modal when goal is reached
  useEffect(() => {
    if (isCorrect && onComplete) {
      // 2 second delay for visual feedback before modal appears
      const timer = setTimeout(() => {
        onComplete(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCorrect, onComplete]);

  // Submit answer (sets submitted state to trigger isCorrect check)
  const handleSubmit = () => {
    if (selectedRect && !submitted) {
      setSubmitted(true);
    }
  };

  // Reset
  const handleReset = () => {
    setSelectedRect(null);
    setSubmitted(false);
  };

  // Advance to next problem without showing modal
  const handleNextProblem = () => {
    if (onNextProblem) {
      onNextProblem();
    }
  };

  return (
    <Container>
      {/* Canvas with two rectangles */}
      <CanvasContainer>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />

            {/* Grid */}
            <GridBackground
              width={canvasWidth}
              height={canvasHeight}
              gridSize={gridSize}
              cellSize={cellSize}
              konvaTheme={konvaTheme}
            />

            {/* Rectangle A */}
            <Rect
              x={rectAX}
              y={rectAY}
              width={rectA.width * cellSize}
              height={rectA.height * cellSize}
              fill={askingFor === 'area'
                ? (selectedRect === 'A' ? 'rgba(251, 146, 60, 0.4)' : 'rgba(249, 115, 22, 0.3)')  // Area: orange
                : (selectedRect === 'A' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)')  // Perimeter: blue
              }
              stroke={askingFor === 'area'
                ? (konvaTheme.shapeStroke || '#3B82F6')  // Area: blue stroke
                : '#F97316'  // Perimeter: orange stroke
              }
              strokeWidth={askingFor === 'area' ? 2 : 4}
              onClick={() => handleRectClick('A')}
              onTap={() => handleRectClick('A')}
            />

            {/* Rectangle A dimensions with smart positioning */}
            <DimensionLabel
              x1={rectAX}
              y1={rectAY + rectA.height * cellSize}
              x2={rectAX + rectA.width * cellSize}
              y2={rectAY + rectA.height * cellSize}
              label={`${rectA.width} cm`}
              orientation="horizontal"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={16}
              registry={registry}
              calculator={calculator}
              enableSmartPositioning={true}
              id="rect-a-width"
            />
            <DimensionLabel
              x1={rectAX}
              y1={rectAY}
              x2={rectAX}
              y2={rectAY + rectA.height * cellSize}
              label={`${rectA.height} cm`}
              orientation="vertical"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={16}
              registry={registry}
              calculator={calculator}
              enableSmartPositioning={true}
              id="rect-a-height"
            />

            {/* Rectangle A label with smart positioning */}
            <SmartText
              calculator={calculator}
              shapeBounds={{
                x: rectAX,
                y: rectAY,
                width: rectA.width * cellSize,
                height: rectA.height * cellSize
              }}
              label="A"
              fontSize={28}
              fontStyle="bold"
              fill={konvaTheme.labelText}
              registry={registry}
              id="rect-a-label"
            />

            {/* Rectangle B */}
            <Rect
              x={rectBX}
              y={rectBY}
              width={rectB.width * cellSize}
              height={rectB.height * cellSize}
              fill={askingFor === 'area'
                ? (selectedRect === 'B' ? 'rgba(251, 146, 60, 0.4)' : 'rgba(249, 115, 22, 0.3)')  // Area: orange
                : (selectedRect === 'B' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)')  // Perimeter: blue
              }
              stroke={askingFor === 'area'
                ? (konvaTheme.shapeStroke || '#3B82F6')  // Area: blue stroke
                : '#F97316'  // Perimeter: orange stroke
              }
              strokeWidth={askingFor === 'area' ? 2 : 4}
              onClick={() => handleRectClick('B')}
              onTap={() => handleRectClick('B')}
            />

            {/* Rectangle B dimensions with smart positioning */}
            <DimensionLabel
              x1={rectBX}
              y1={rectBY + rectB.height * cellSize}
              x2={rectBX + rectB.width * cellSize}
              y2={rectBY + rectB.height * cellSize}
              label={`${rectB.width} cm`}
              orientation="horizontal"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={16}
              registry={registry}
              calculator={calculator}
              enableSmartPositioning={true}
              id="rect-b-width"
            />
            <DimensionLabel
              x1={rectBX + rectB.width * cellSize}
              y1={rectBY}
              x2={rectBX + rectB.width * cellSize}
              y2={rectBY + rectB.height * cellSize}
              label={`${rectB.height} cm`}
              orientation="vertical"
              offset={-20}
              konvaTheme={konvaTheme}
              fontSize={16}
              registry={registry}
              calculator={calculator}
              enableSmartPositioning={true}
              id="rect-b-height"
            />

            {/* Rectangle B label with smart positioning */}
            <SmartText
              calculator={calculator}
              shapeBounds={{
                x: rectBX,
                y: rectBY,
                width: rectB.width * cellSize,
                height: rectB.height * cellSize
              }}
              label="B"
              fontSize={28}
              fontStyle="bold"
              fill={konvaTheme.labelText}
              registry={registry}
              id="rect-b-label"
            />
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* Feedback */}
      {submitted && (
        <FeedbackSection $isCorrect={isCorrect}>
          {isCorrect ? (
            <FeedbackText>
              Correct! Rectangle A: {askingFor === 'area'
                ? `${rectA.width} × ${rectA.height} = ${rectA.area} cm²`
                : `2(${rectA.width} + ${rectA.height}) = ${rectA.perimeter} cm`
              }
            </FeedbackText>
          ) : (
            <FeedbackText>
              Not quite. Try comparing the {askingFor === 'area' ? 'areas' : 'perimeters'} again.
            </FeedbackText>
          )}
        </FeedbackSection>
      )}

      {/* Action buttons */}
      <ButtonRow>
        <ResetButton onClick={handleReset}>
          Reset
        </ResetButton>
        {!submitted && (
          <SubmitButton onClick={handleSubmit} disabled={!selectedRect} $isActive={!!selectedRect}>
            Submit
          </SubmitButton>
        )}
        {isCorrect && (
          <NextButton onClick={handleNextProblem}>
            Next Problem
          </NextButton>
        )}
      </ButtonRow>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 16px;

  @media (max-width: 1024px) {
    gap: 12px;
  }
`;

const CanvasContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    padding: 12px;
  }
`;

const FeedbackSection = styled.div`
  padding: 16px 24px;
  background-color: ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess + '20'
    : props.theme.colors.buttonDanger + '20'
  };
  border-radius: 8px;
  border: 2px solid ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess
    : props.theme.colors.buttonDanger
  };

  @media (max-width: 1024px) {
    padding: 12px 20px;
  }
`;

const FeedbackText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 1024px) {
    gap: 12px;
  }
`;

const ResetButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${props => props.theme.colors.border};
  cursor: pointer;
  background-color: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.textPrimary};
  transition: all 0.2s;
  min-height: 44px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    padding: 10px 24px;
    font-size: 15px;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.$isActive
    ? props.theme.colors.buttonSuccess || '#4ade80'
    : props.theme.colors.buttonNeutral || '#9CA3AF'
  };
  color: ${props => props.theme.colors.textInverted || '#FFFFFF'};
  transition: all 0.2s;
  min-height: 44px;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 1024px) {
    padding: 10px 28px;
    font-size: 15px;
  }
`;

const NextButton = styled.button`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.theme.colors.buttonSuccess || '#4ade80'};
  color: ${props => props.theme.colors.textInverted || '#FFFFFF'};
  transition: all 0.2s;
  min-height: 44px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    padding: 10px 28px;
    font-size: 15px;
  }
`;

export default Level2CompareRectangles;
