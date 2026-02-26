/**
 * Level 1: Click-to-Count Grid Component
 *
 * Interactive grid where students click cells to count area
 * Learning Objective: Visual understanding that Area = counting squares
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Stage, Layer, Rect } from 'react-konva';
import { useWindowDimensions, useKonvaTheme } from '../../../../../hooks';
import ShapeVisualizer from './ShapeVisualizer';

const CELL_SIZE = 40;

function Level1GridCounter({ visualData, onCorrect, disabled }) {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const [clickedCells, setClickedCells] = useState(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  const { length, width: rectWidth, side, area, shapeType } = visualData || {};

  // Calculate canvas dimensions
  const canvasWidth = useMemo(() => {
    const baseMax = Math.min(width - 40, 600);
    if (width <= 1024) return Math.min(baseMax, 400);
    return baseMax;
  }, [width]);

  const canvasHeight = 450;

  // Calculate total cells needed
  const totalCells = shapeType === 'square' ? side * side : length * rectWidth;

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (disabled || showSuccess) return;

    const cellKey = `${row},${col}`;
    setClickedCells((prev) => {
      const next = new Set(prev);
      if (next.has(cellKey)) {
        next.delete(cellKey); // Unclick if already clicked
      } else {
        next.add(cellKey);
      }
      return next;
    });
  };

  // Check if all cells are clicked
  const allCellsClicked = clickedCells.size === totalCells;

  // Handle submit
  const handleSubmit = () => {
    if (allCellsClicked && !disabled) {
      setShowSuccess(true);
      setTimeout(() => {
        onCorrect();
      }, 1000);
    }
  };

  // Reset on new problem
  useEffect(() => {
    setClickedCells(new Set());
    setShowSuccess(false);
  }, [area]);

  return (
    <Container>
      <InstructionText>Click each square to count them all!</InstructionText>

      {/* Canvas with clickable grid */}
      <CanvasWrapper $success={showSuccess}>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer listening={false}>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />
          </Layer>
          <Layer>
            {/* Shape with clickable cells */}
            <ShapeVisualizer
              visualData={visualData}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              showGrid={true}
              showDimensions={false}
              onCellClick={handleCellClick}
              clickedCells={clickedCells}
            />
          </Layer>
        </Stage>
      </CanvasWrapper>

      {/* Counter Badge */}
      <CounterBadge $complete={allCellsClicked}>
        Counted: {clickedCells.size} / {totalCells}
      </CounterBadge>

      {/* Submit Button */}
      <ButtonRow>
        <SubmitButton onClick={handleSubmit} disabled={!allCellsClicked || disabled || showSuccess}>
          {allCellsClicked ? 'Submit Answer' : 'Count All Squares First'}
        </SubmitButton>
        <ResetButton
          onClick={() => setClickedCells(new Set())}
          disabled={clickedCells.size === 0 || disabled || showSuccess}
        >
          Reset
        </ResetButton>
      </ButtonRow>

      {/* Success message */}
      {showSuccess && (
        <SuccessMessage>
          ✓ Perfect! You counted all {totalCells} squares. That's the area!
        </SuccessMessage>
      )}
    </Container>
  );
}

export default Level1GridCounter;

// ==================== STYLED COMPONENTS ====================

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const greenFlash = keyframes`
  0% { border-color: #10B981; box-shadow: 0 0 0 0 #10B98180; }
  50% { border-color: #10B981; box-shadow: 0 0 0 15px #10B98100; }
  100% { border-color: #10B981; box-shadow: 0 0 0 0 #10B98100; }
`;

const Container = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  @media (max-width: 1024px) {
    gap: 16px;
  }
`;

const InstructionText = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 0;
  font-weight: 600;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const CanvasWrapper = styled.div`
  background: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 3px solid ${(props) => props.$success ? '#10B981' : props.theme.colors.border};
  animation: ${(props) => (props.$success ? greenFlash : 'none')} 1s ease-out;
  transition: all 0.3s ease-in-out;

  @media (max-width: 1024px) {
    padding: 12px;
  }
`;

const CounterBadge = styled.div`
  background: ${(props) => (props.$complete ? '#10B98120' : props.theme.colors.inputBackground)};
  border: 2px solid ${(props) => (props.$complete ? '#10B981' : props.theme.colors.border)};
  color: ${(props) => (props.$complete ? '#10B981' : props.theme.colors.textPrimary)};
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: 700;
  transition: all 0.3s;

  @media (max-width: 1024px) {
    font-size: 16px;
    padding: 10px 20px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 1024px) {
    gap: 8px;
    flex-direction: column;
    width: 100%;
  }
`;

const SubmitButton = styled.button`
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  transition: all 0.2s;
  min-height: 44px;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 1024px) {
    padding: 12px 24px;
    font-size: 15px;
    width: 100%;
  }
`;

const ResetButton = styled.button`
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${(props) => props.theme.colors.border};
  background: transparent;
  color: ${(props) => props.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.hoverBackground};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 1024px) {
    padding: 12px 24px;
    font-size: 15px;
    width: 100%;
  }
`;

const SuccessMessage = styled.div`
  padding: 16px 24px;
  background: ${(props) => props.theme.colors.buttonSuccess}18;
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 8px;
  color: ${(props) => props.theme.colors.buttonSuccess};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 1024px) {
    font-size: 15px;
    padding: 12px 20px;
  }
`;
