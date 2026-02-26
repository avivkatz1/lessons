/**
 * Level 2: Formula Introduction Component
 *
 * Multi-stage workflow:
 * Stage 1: Choose correct formula from 4 options
 * Stage 2: Apply formula with visual comparison
 * Learning Objective: Connect visual counting to algebraic formula
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Stage, Layer, Rect } from 'react-konva';
import { useWindowDimensions, useKonvaTheme } from '../../../../../hooks';
import ShapeVisualizer from './ShapeVisualizer';

function Level2FormulaIntro({ visualData, questionIndex, onCanvasOpen, disabled }) {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const [selectedFormula, setSelectedFormula] = useState(null);
  const [stage, setStage] = useState(1); // 1 = choose formula, 2 = calculate
  const [showVisualHelper, setShowVisualHelper] = useState(true);

  const { shapeType, length, width: rectWidth, side, area, perimeter } = visualData || {};

  // Generate formula options
  const formulaOptions = useMemo(() => {
    if (shapeType === 'square') {
      return [
        { formula: 'A = s × s', label: 'Area = side × side', isCorrect: true },
        { formula: 'A = s + s', label: 'Area = side + side', isCorrect: false },
        { formula: 'A = 4 × s', label: 'Area = 4 × side', isCorrect: false },
        { formula: 'A = s ÷ 2', label: 'Area = side ÷ 2', isCorrect: false },
      ];
    } else {
      // Rectangle
      return [
        { formula: 'A = l × w', label: 'Area = length × width', isCorrect: true },
        { formula: 'A = l + w', label: 'Area = length + width', isCorrect: false },
        { formula: 'A = 2(l + w)', label: 'Area = 2(length + width)', isCorrect: false },
        { formula: 'A = l ÷ w', label: 'Area = length ÷ width', isCorrect: false },
      ];
    }
  }, [shapeType]);

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

  // Progressive fade: Hide helper after Q8
  useEffect(() => {
    if (questionIndex >= 7) {
      setShowVisualHelper(false);
    }
  }, [questionIndex]);

  return (
    <Container>
      {/* Stage 1: Choose Formula */}
      {stage === 1 && (
        <StageSection>
          <StageTitle>Step 1: Which formula calculates area?</StageTitle>
          <FormulaGrid>
            {formulaOptions.map((option, idx) => (
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
              ✓ Correct! Now let's use this formula.
            </SuccessMessage>
          )}

          {selectedFormula && !selectedFormula.isCorrect && (
            <ErrorMessage>
              Not quite. Think about how we count rows and columns.
            </ErrorMessage>
          )}
        </StageSection>
      )}

      {/* Stage 2: Visual Comparison */}
      {stage === 2 && showVisualHelper && (
        <StageSection>
          <StageTitle>Step 2: Compare grid count vs formula</StageTitle>

          <ComparisonWrapper>
            {/* Visual Grid */}
            <ComparisonPanel>
              <PanelTitle>Visual Method</PanelTitle>
              <CanvasWrapper>
                <Stage width={canvasWidth / 2.2} height={canvasHeight / 2}>
                  <Layer listening={false}>
                    <Rect
                      x={0}
                      y={0}
                      width={canvasWidth / 2.2}
                      height={canvasHeight / 2}
                      fill={konvaTheme.canvasBackground}
                    />
                  </Layer>
                  <Layer>
                    <ShapeVisualizer
                      visualData={visualData}
                      canvasWidth={canvasWidth / 2.2}
                      canvasHeight={canvasHeight / 2}
                      showGrid={true}
                      showDimensions={false}
                    />
                  </Layer>
                </Stage>
              </CanvasWrapper>
              <ResultText>Counted squares = {area}</ResultText>
            </ComparisonPanel>

            {/* Formula Method */}
            <ComparisonPanel>
              <PanelTitle>Formula Method</PanelTitle>
              <FormulaDisplay>
                {shapeType === 'square' ? (
                  <>
                    <FormuleLine>A = s × s</FormuleLine>
                    <FormuleLine>A = {side} × {side}</FormuleLine>
                    <FormuleLine $highlight>A = {area}</FormuleLine>
                  </>
                ) : (
                  <>
                    <FormuleLine>A = l × w</FormuleLine>
                    <FormuleLine>A = {length} × {rectWidth}</FormuleLine>
                    <FormuleLine $highlight>A = {area}</FormuleLine>
                  </>
                )}
              </FormulaDisplay>
              <ResultText>Formula result = {area}</ResultText>
            </ComparisonPanel>
          </ComparisonWrapper>

          <SuccessMessage>
            ✓ Both methods give the same answer! The formula is faster.
          </SuccessMessage>

          {/* Toggle helper button */}
          {questionIndex >= 7 && (
            <ToggleButton onClick={() => setShowVisualHelper(!showVisualHelper)}>
              {showVisualHelper ? 'Hide' : 'Show'} Visual Helper
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

export default Level2FormulaIntro;

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

const ComparisonWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const ComparisonPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${(props) => props.theme.colors.inputBackground};
  border-radius: 8px;

  @media (max-width: 1024px) {
    padding: 12px;
  }
`;

const PanelTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;

const CanvasWrapper = styled.div`
  background: transparent;
  border-radius: 8px;
`;

const FormulaDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: ${(props) => props.theme.colors.cardBackground};
  border-radius: 8px;
  min-height: 120px;
  justify-content: center;

  @media (max-width: 1024px) {
    padding: 12px;
  }
`;

const FormuleLine = styled.div`
  font-size: 16px;
  font-family: 'Courier New', monospace;
  color: ${(props) =>
    props.$highlight ? props.theme.colors.buttonSuccess : props.theme.colors.textPrimary};
  font-weight: ${(props) => (props.$highlight ? '700' : '400')};
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const ResultText = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 14px;
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
