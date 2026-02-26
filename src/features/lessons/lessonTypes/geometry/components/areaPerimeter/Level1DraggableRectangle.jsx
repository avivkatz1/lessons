import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect } from 'react-konva';
import GridBackground from './GridBackground';
import DraggableRectangle from './DraggableRectangle';
import { useWindowDimensions, useKonvaTheme } from '../../../../../../hooks';

/**
 * Level 1: Draggable Rectangle Grid
 * Student drags corner handles to resize rectangle to match target area or perimeter
 */
function Level1DraggableRectangle({ visualData, onComplete, onNextProblem, questionIndex = 0 }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const {
    targetArea,
    targetPerimeter,
    gridSize = 10,
    initialWidth = 4,
    initialHeight = 5,
    askingFor = 'area',
  } = visualData;

  // Current rectangle dimensions
  const [rectWidth, setRectWidth] = useState(initialWidth);
  const [rectHeight, setRectHeight] = useState(initialHeight);

  // Canvas sizing - wide but short to fit iPad screen
  // Width: extends to screen width, Height: fixed at 400px for iPad compatibility
  const canvasWidth = useMemo(() => {
    const padding = 40;
    return Math.min(windowWidth - padding, 1200); // Full width up to 1200px
  }, [windowWidth]);

  const canvasHeight = 400; // Fixed height to fit iPad (768px viewport)
  const cellSize = 40; // Smaller cells (half of original 80px)

  // Calculate current area and perimeter
  const currentArea = rectWidth * rectHeight;
  const currentPerimeter = 2 * (rectWidth + rectHeight);

  // Check if target is met
  const isCorrect = askingFor === 'area'
    ? currentArea === targetArea
    : currentPerimeter === targetPerimeter;

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

  // Handle rectangle resize
  const handleResize = (newWidth, newHeight) => {
    setRectWidth(newWidth);
    setRectHeight(newHeight);
  };

  // Reset rectangle
  const handleReset = () => {
    setRectWidth(initialWidth);
    setRectHeight(initialHeight);
  };

  // Advance to next problem without showing modal
  const handleNextProblem = () => {
    if (onNextProblem) {
      onNextProblem();
    }
  };

  return (
    <Container>
      {/* Tile Row - All tiles in one horizontal row */}
      <TileRow>
        {/* Target Tile */}
        <Tile>
          <TileLabel>Target:</TileLabel>
          <TileValue $isCorrect={isCorrect}>
            {askingFor === 'area' ? (
              <>Area = {targetArea} cm²</>
            ) : (
              <>Perimeter = {targetPerimeter} cm</>
            )}
            {isCorrect && <CheckMark> ✓</CheckMark>}
          </TileValue>
        </Tile>

        {/* Current Tile */}
        <Tile>
          <TileLabel>Current:</TileLabel>
          <TileValue $isCorrect={isCorrect}>
            {askingFor === 'area' ? (
              <>{rectWidth} × {rectHeight} = <strong>{currentArea} cm²</strong></>
            ) : (
              <>2({rectWidth} + {rectHeight}) = <strong>{currentPerimeter} cm</strong></>
            )}
          </TileValue>
        </Tile>

        {/* Reset Tile */}
        <TileButton onClick={handleReset}>
          Reset
        </TileButton>

        {/* Next Problem Tile (only visible when correct) */}
        {isCorrect && (
          <TileButton $isSuccess onClick={handleNextProblem}>
            Next Problem
          </TileButton>
        )}
      </TileRow>

      {/* Canvas with grid and draggable rectangle */}
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

            {/* Draggable Rectangle */}
            <DraggableRectangle
              width={rectWidth}
              height={rectHeight}
              x={cellSize}
              y={cellSize}
              onResize={handleResize}
              gridSize={cellSize}
              minWidth={2}
              maxWidth={Math.min(Math.floor(canvasWidth / cellSize) - 2, 15)}
              minHeight={2}
              maxHeight={Math.min(Math.floor(canvasHeight / cellSize) - 2, 8)}
              snapToGrid={true}
              showHandles={true}
              konvaTheme={konvaTheme}
              isCorrect={isCorrect}
              askingFor={askingFor}
            />
          </Layer>
        </Stage>
      </CanvasContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 12px;

  @media (max-width: 1024px) {
    gap: 8px;
  }
`;

const TileRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: stretch;
  width: 100%;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    gap: 8px;
  }
`;

const Tile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background-color: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex: 1;
  min-width: 150px;

  @media (max-width: 1024px) {
    padding: 10px 14px;
    min-width: 120px;
  }
`;

const TileLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 1024px) {
    font-size: 12px;
  }
`;

const TileValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess || '#4ade80'
    : props.theme.colors.textPrimary
  };
  transition: color 0.3s;

  strong {
    font-weight: 700;
  }

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const CheckMark = styled.span`
  margin-left: 8px;
  font-size: 20px;
  animation: popIn 0.3s ease-out;

  @keyframes popIn {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

const TileButton = styled.button`
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
  flex-shrink: 0;
  border: 2px solid ${props => props.$isSuccess
    ? props.theme.colors.buttonSuccess || '#4ade80'
    : props.theme.colors.border
  };
  background-color: ${props => props.$isSuccess
    ? props.theme.colors.buttonSuccess || '#4ade80'
    : props.theme.colors.cardBackground
  };
  color: ${props => props.$isSuccess
    ? props.theme.colors.textInverted || '#FFFFFF'
    : props.theme.colors.textPrimary
  };

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    padding: 10px 16px;
    font-size: 15px;
  }
`;

const CanvasContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 12px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;

  @media (max-width: 1024px) {
    padding: 8px;
  }
`;

export default Level1DraggableRectangle;
