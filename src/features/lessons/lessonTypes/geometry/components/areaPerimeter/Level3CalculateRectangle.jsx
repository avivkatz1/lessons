import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect } from 'react-konva';
import GridBackground from './GridBackground';
import DimensionLabel from './DimensionLabel';
import { useWindowDimensions, useKonvaTheme } from '../../../../../../hooks';
import { InputOverlayPanel, SlimMathKeypad, EnterAnswerButton } from '../../../../../../shared/components';
import { useInputOverlay } from '../../hooks/useInputOverlay';

/**
 * Level 3: Calculate Area/Perimeter
 * Static rectangle with labeled dimensions, student enters area and/or perimeter
 * Progressive scaffolding: Q1-4 area only, Q5-8 perimeter only, Q9+ both
 *
 * NEW: Uses Input Overlay Panel system for iPad optimization
 * - Panel overlays on top (canvas stays full width)
 * - SlimMathKeypad for touch-friendly number entry
 * - Supports area, perimeter, or both inputs
 */
function Level3CalculateRectangle({ visualData, onComplete, onNextProblem, questionIndex = 0 }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const {
    length = 8,
    width = 5,
    area = 40,
    perimeter = 26,
    askingFor = 'area', // 'area', 'perimeter', or 'both'
  } = visualData;

  // Input Overlay system hook
  const {
    panelOpen,
    inputValue,
    submitted,
    setInputValue,
    setSubmitted,
    openPanel,
    closePanel,
    resetAll,
  } = useInputOverlay();

  // Additional state for perimeter when asking for both
  const [perimeterInput, setPerimeterInput] = useState('');

  // Canvas sizing (stays constant - panel overlays on top)
  const canvasWidth = useMemo(() => {
    const padding = 40;
    return Math.min(windowWidth - padding, 1200);
  }, [windowWidth]);

  const canvasHeight = 400; // Taller for better visibility
  const gridSize = 10; // More grid cells
  const cellSize = 40; // Larger cells for better visibility

  // Center rectangle on grid
  const rectX = cellSize * 2;
  const rectY = cellSize * 3;
  const rectWidth = length * (cellSize * 0.5); // Scale for visibility
  const rectHeight = width * (cellSize * 0.5);

  // Check correctness
  const areaCorrect = parseInt(inputValue) === area;
  const perimeterCorrect = parseInt(perimeterInput) === perimeter;
  const allCorrect = askingFor === 'area' ? areaCorrect :
                     askingFor === 'perimeter' ? perimeterCorrect :
                     areaCorrect && perimeterCorrect;

  // Auto-trigger success modal when goal is reached
  useEffect(() => {
    if (allCorrect && submitted && onComplete) {
      // Close panel and show success modal
      closePanel();
      const timer = setTimeout(() => {
        onComplete(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [allCorrect, submitted, onComplete, closePanel]);

  // Reset state when problem changes
  useEffect(() => {
    resetAll();
    setPerimeterInput('');
  }, [questionIndex, resetAll]);

  // Handle submit from keypad
  const handleSubmit = () => {
    // Check if required fields are filled
    if (askingFor === 'area' && inputValue.trim() === '') return;
    if (askingFor === 'perimeter' && inputValue.trim() === '') return;
    if (askingFor === 'both' && (inputValue.trim() === '' || perimeterInput.trim() === '')) return;

    setSubmitted(true);

    if (!allCorrect) {
      // Show error feedback in panel, keep panel open
      // User can try again
    }
    // If correct, useEffect above will trigger modal
  };

  // Handle next problem
  const handleNextProblem = () => {
    resetAll();
    setPerimeterInput('');
    if (onNextProblem) {
      onNextProblem();
    }
  };

  return (
    <Container>
      {/* Enter Answer Button (floating on canvas, inline on mobile) */}
      {!panelOpen && (
        <EnterAnswerButton onClick={openPanel} disabled={submitted && allCorrect} />
      )}

      {/* Canvas with rectangle - stays at full width */}
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

            {/* Rectangle */}
            <Rect
              x={rectX}
              y={rectY}
              width={rectWidth}
              height={rectHeight}
              fill={konvaTheme.shapeFill || '#3B82F6'}
              fillOpacity={0.4}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={3}
              listening={false}
            />

            {/* Dimensions - horizontal (length) */}
            <DimensionLabel
              x1={rectX}
              y1={rectY + rectHeight}
              x2={rectX + rectWidth}
              y2={rectY + rectHeight}
              label={`${length} cm`}
              orientation="horizontal"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={20}
            />

            {/* Dimensions - vertical (width) */}
            <DimensionLabel
              x1={rectX}
              y1={rectY}
              x2={rectX}
              y2={rectY + rectHeight}
              label={`${width} cm`}
              orientation="vertical"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={20}
            />
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* Input Overlay Panel */}
      <InputOverlayPanel
        visible={panelOpen}
        onClose={closePanel}
        title={askingFor === 'both' ? 'Calculate Area & Perimeter' :
               askingFor === 'area' ? 'Calculate Area' : 'Calculate Perimeter'}
      >
        {/* Area input (if needed) */}
        {(askingFor === 'area' || askingFor === 'both') && (
          <>
            <InputLabel>
              Area (cm²):
              {submitted && (areaCorrect ? ' ✓' : ' ✗')}
            </InputLabel>
            <SlimMathKeypad
              value={inputValue}
              onChange={setInputValue}
              onSubmit={askingFor === 'area' ? handleSubmit : undefined}
            />
          </>
        )}

        {/* Perimeter input (if needed) */}
        {(askingFor === 'perimeter' || askingFor === 'both') && (
          <>
            {askingFor === 'both' && <InputDivider />}
            <InputLabel>
              Perimeter (cm):
              {submitted && (perimeterCorrect ? ' ✓' : ' ✗')}
            </InputLabel>
            <SlimMathKeypad
              value={perimeterInput}
              onChange={setPerimeterInput}
              onSubmit={handleSubmit}
            />
          </>
        )}

        {/* Feedback inside panel */}
        {submitted && (
          <FeedbackSection $isCorrect={allCorrect}>
            {allCorrect ? (
              <FeedbackText>
                ✓ Correct!
                {(askingFor === 'area' || askingFor === 'both') && ` Area: ${length} × ${width} = ${area} cm².`}
                {(askingFor === 'perimeter' || askingFor === 'both') && ` Perimeter: 2(${length} + ${width}) = ${perimeter} cm.`}
              </FeedbackText>
            ) : (
              <FeedbackText>
                Not quite. Check your calculations and try again.
              </FeedbackText>
            )}
          </FeedbackSection>
        )}

        {/* Action buttons inside panel */}
        <PanelButtonRow>
          <ResetButton onClick={() => { setInputValue(''); setPerimeterInput(''); setSubmitted(false); }}>
            Clear
          </ResetButton>
          {submitted && allCorrect && (
            <NextButton onClick={handleNextProblem}>
              Next Problem
            </NextButton>
          )}
        </PanelButtonRow>
      </InputOverlayPanel>
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

const InputLabel = styled.label`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: -8px; /* Reduce gap before keypad */

  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;

const InputDivider = styled.div`
  height: 1px;
  background-color: ${props => props.theme.colors.border};
  margin: 12px 0;
  opacity: 0.5;
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

const PanelButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;

  @media (max-width: 1024px) {
    gap: 10px;
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

export default Level3CalculateRectangle;
