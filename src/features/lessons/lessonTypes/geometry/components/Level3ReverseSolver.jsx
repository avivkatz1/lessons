/**
 * Level 3: Reverse Problems Component
 *
 * Multi-stage workflow:
 * Stage 1: Select reverse formula (l = A ÷ w, etc.)
 * Stage 2: Calculate with DrawingCanvas support
 * Learning Objective: Use formulas backward to find missing dimensions
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Stage, Layer, Rect } from 'react-konva';
import { useWindowDimensions, useKonvaTheme } from '../../../../../hooks';
import ShapeVisualizer from './ShapeVisualizer';

function Level3ReverseSolver({ visualData, questionIndex, onCanvasOpen, disabled }) {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const [selectedFormula, setSelectedFormula] = useState(null);
  const [stage, setStage] = useState(1); // 1 = choose formula, 2 = calculate
  const [showFormulaScaffold, setShowFormulaScaffold] = useState(true);

  const {
    shapeType,
    length,
    width: rectWidth,
    side,
    area,
    givenDimension,
    unknownDimension,
  } = visualData || {};

  // Generate reverse formula options
  const reverseFormulaOptions = useMemo(() => {
    if (shapeType === 'square') {
      return [
        { formula: 's = √A', label: 'side = √Area', isCorrect: true },
        { formula: 's = A × A', label: 'side = Area × Area', isCorrect: false },
        { formula: 's = A ÷ 2', label: 'side = Area ÷ 2', isCorrect: false },
        { formula: 's = A + A', label: 'side = Area + Area', isCorrect: false },
      ];
    } else if (unknownDimension === 'width') {
      return [
        { formula: 'w = A ÷ l', label: 'width = Area ÷ length', isCorrect: true },
        { formula: 'w = A × l', label: 'width = Area × length', isCorrect: false },
        { formula: 'w = A - l', label: 'width = Area - length', isCorrect: false },
        { formula: 'w = A + l', label: 'width = Area + length', isCorrect: false },
      ];
    } else {
      // unknownDimension === 'length'
      return [
        { formula: 'l = A ÷ w', label: 'length = Area ÷ width', isCorrect: true },
        { formula: 'l = A × w', label: 'length = Area × width', isCorrect: false },
        { formula: 'l = A - w', label: 'length = Area - width', isCorrect: false },
        { formula: 'l = A + w', label: 'length = Area + width', isCorrect: false },
      ];
    }
  }, [shapeType, unknownDimension]);

  // Calculate canvas dimensions
  const canvasWidth = useMemo(() => {
    const baseMax = Math.min(width - 40, 600);
    if (width <= 1024) return Math.min(baseMax, 400);
    return baseMax;
  }, [width]);

  const canvasHeight = 400;

  // Handle formula selection
  const handleFormulaSelect = (option) => {
    setSelectedFormula(option);
    if (option.isCorrect) {
      setTimeout(() => {
        setStage(2);
      }, 800);
    }
  };

  // Reset on new problem
  useEffect(() => {
    setSelectedFormula(null);
    setStage(1);
  }, [questionIndex]);

  // Progressive fade: Hide scaffold after Q6
  useEffect(() => {
    if (questionIndex >= 5) {
      setShowFormulaScaffold(false);
    }
  }, [questionIndex]);

  return (
    <Container>
      {/* Stage 1: Choose Reverse Formula */}
      {stage === 1 && (
        <StageSection>
          <StageTitle>Step 1: Which formula finds the missing dimension?</StageTitle>

          {/* Visual representation */}
          <CanvasWrapper>
            <Stage width={canvasWidth} height={canvasHeight}>
              <Layer listening={false}>
                <Rect
                  x={0}
                  y={0}
                  width={canvasWidth}
                  height={canvasHeight}
                  fill={konvaTheme.canvasBackground}
                />
              </Layer>
              <Layer>
                <ShapeVisualizer
                  visualData={visualData}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  showGrid={false}
                  showDimensions={true}
                />
              </Layer>
            </Stage>
          </CanvasWrapper>

          <FormulaGrid>
            {reverseFormulaOptions.map((option, idx) => (
              <FormulaButton
                key={idx}
                onClick={() => !disabled && handleFormulaSelect(option)}
                $selected={selectedFormula?.formula === option.formula}
                $correct={selectedFormula?.formula === option.formula && option.isCorrect}
                $incorrect={selectedFormula?.formula === option.formula && !option.isCorrect}
                disabled={disabled || selectedFormula !== null}
              >
                <FormulaSymbol>{option.formula}</FormulaSymbol>
                <FormulaLabel>{option.label}</FormulaLabel>
              </FormulaButton>
            ))}
          </FormulaGrid>

          {selectedFormula?.isCorrect && (
            <SuccessMessage>
              ✓ Correct! Now use this formula to find the answer.
            </SuccessMessage>
          )}

          {selectedFormula && !selectedFormula.isCorrect && (
            <ErrorMessage>
              Not quite. Think about the inverse operation.
            </ErrorMessage>
          )}
        </StageSection>
      )}

      {/* Stage 2: Formula Scaffold & Calculate */}
      {stage === 2 && showFormulaScaffold && (
        <StageSection>
          <StageTitle>Step 2: Apply the formula</StageTitle>

          <FormulaScaffold>
            {shapeType === 'square' ? (
              <>
                <ScaffoldLine>s = √A</ScaffoldLine>
                <ScaffoldLine>s = √{area}</ScaffoldLine>
                <ScaffoldLine $highlight>s = {side}</ScaffoldLine>
              </>
            ) : unknownDimension === 'width' ? (
              <>
                <ScaffoldLine>w = A ÷ l</ScaffoldLine>
                <ScaffoldLine>w = {area} ÷ {length}</ScaffoldLine>
                <ScaffoldLine $highlight>w = {rectWidth}</ScaffoldLine>
              </>
            ) : (
              <>
                <ScaffoldLine>l = A ÷ w</ScaffoldLine>
                <ScaffoldLine>l = {area} ÷ {rectWidth}</ScaffoldLine>
                <ScaffoldLine $highlight>l = {length}</ScaffoldLine>
              </>
            )}
          </FormulaScaffold>

          {/* Toggle scaffold button (after Q6) */}
          {questionIndex >= 5 && (
            <ToggleButton onClick={() => setShowFormulaScaffold(!showFormulaScaffold)}>
              {showFormulaScaffold ? 'Hide' : 'Show'} Formula Steps
            </ToggleButton>
          )}
        </StageSection>
      )}

      {/* Open Canvas Button (Stage 2) */}
      {stage === 2 && (
        <OpenCanvasButton onClick={onCanvasOpen} disabled={disabled}>
          Open Canvas to Show Work
        </OpenCanvasButton>
      )}
    </Container>
  );
}

export default Level3ReverseSolver;

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

const StageSection = styled.div`
  width: 100%;
  background: ${(props) => props.theme.colors.cardBackground};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 1024px) {
    padding: 18px;
  }
`;

const StageTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  margin: 0 0 20px 0;

  @media (max-width: 1024px) {
    font-size: 16px;
    margin-bottom: 16px;
  }
`;

const CanvasWrapper = styled.div`
  background: transparent;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;

  @media (max-width: 1024px) {
    margin-bottom: 16px;
  }
`;

const FormulaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;

  @media (min-width: 600px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 1024px) {
    gap: 10px;
  }
`;

const FormulaButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 12px;
  background: ${(props) => {
    if (props.$correct) return props.theme.colors.buttonSuccess;
    if (props.$incorrect) return props.theme.colors.error;
    if (props.$selected) return props.theme.colors.info;
    return props.theme.colors.inputBackground;
  }};
  color: ${(props) =>
    props.$selected || props.$correct || props.$incorrect
      ? props.theme.colors.textInverted
      : props.theme.colors.textPrimary};
  border: 2px solid ${(props) => {
    if (props.$correct) return props.theme.colors.buttonSuccess;
    if (props.$incorrect) return props.theme.colors.error;
    if (props.$selected) return props.theme.colors.info;
    return props.theme.colors.border;
  }};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  min-height: 100px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 1024px) {
    padding: 14px 10px;
    min-height: 90px;
  }
`;

const FormulaSymbol = styled.div`
  font-size: 20px;
  font-weight: 700;
  font-family: 'Courier New', monospace;

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const FormulaLabel = styled.div`
  font-size: 12px;
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 11px;
  }
`;

const SuccessMessage = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: ${(props) => props.theme.colors.buttonSuccess}18;
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 8px;
  color: ${(props) => props.theme.colors.buttonSuccess};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 1024px) {
    font-size: 14px;
    padding: 12px;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: ${(props) => props.theme.colors.error}18;
  border: 2px solid ${(props) => props.theme.colors.error};
  border-radius: 8px;
  color: ${(props) => props.theme.colors.error};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 1024px) {
    font-size: 14px;
    padding: 12px;
  }
`;

const FormulaScaffold = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: ${(props) => props.theme.colors.inputBackground};
  border-radius: 12px;
  margin-bottom: 16px;

  @media (max-width: 1024px) {
    padding: 16px;
    gap: 10px;
  }
`;

const ScaffoldLine = styled.div`
  font-size: 18px;
  font-family: 'Courier New', monospace;
  color: ${(props) =>
    props.$highlight ? props.theme.colors.buttonSuccess : props.theme.colors.textPrimary};
  font-weight: ${(props) => (props.$highlight ? '700' : '400')};
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;

const OpenCanvasButton = styled.button`
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.primary};
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
  }

  @media (max-width: 1024px) {
    padding: 12px 24px;
    font-size: 15px;
  }
`;

const ToggleButton = styled.button`
  margin-top: 12px;
  padding: 8px 16px;
  font-size: 14px;
  border: 2px solid ${(props) => props.theme.colors.border};
  background: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.hoverBackground};
  }

  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 6px 12px;
  }
`;
