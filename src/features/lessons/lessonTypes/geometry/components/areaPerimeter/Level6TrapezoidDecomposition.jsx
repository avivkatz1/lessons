import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Line } from 'react-konva';
import GridBackground from './GridBackground';
import DimensionLabel from './DimensionLabel';
import { useWindowDimensions, useKonvaTheme } from '../../../../../../hooks';
import { InputOverlayPanel, SlimMathKeypad, EnterAnswerButton } from '../../../../../../shared/components';
import { useInputOverlay } from '../../hooks/useInputOverlay';

/**
 * Level 6: Trapezoid Decomposition
 * Trapezoid pre-divided into triangles or rectangle+triangles
 * Progressive scaffolding: Q1-5 show individual areas, Q6+ only dimensions
 *
 * NEW: Uses Input Overlay Panel system for iPad optimization
 * - Panel overlays on top (canvas stays full width)
 * - SlimMathKeypad for touch-friendly number entry
 * - Smooth slide-in animation from right
 */
function Level6TrapezoidDecomposition({ visualData, onComplete, onNextProblem, questionIndex = 0 }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const {
    base1 = 6,
    base2 = 10,
    height = 6,
    area = 48,
    decompositionType = 'twoTriangles', // 'twoTriangles' or 'rectanglePlusTriangles'
    tri1Area = 18,
    tri2Area = 30,
    rectArea = 36,
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

  // Canvas sizing (stays constant - panel overlays on top)
  const canvasWidth = useMemo(() => {
    const padding = 40;
    return Math.min(windowWidth - padding, 1200);
  }, [windowWidth]);

  const canvasHeight = 400; // Taller for better visibility
  const gridSize = 10; // More grid cells
  const cellSize = 40; // Larger cells for better visibility

  // Position trapezoid in center
  const startX = cellSize * 1.5;
  const startY = cellSize * 2;
  const trapHeight = height * (cellSize * 0.5);
  const topWidth = base1 * (cellSize * 0.5);
  const bottomWidth = base2 * (cellSize * 0.5);
  const offset = (bottomWidth - topWidth) / 2;

  // Trapezoid vertices
  const vertices = [
    { x: startX, y: startY + trapHeight }, // Bottom-left
    { x: startX + bottomWidth, y: startY + trapHeight }, // Bottom-right
    { x: startX + offset + topWidth, y: startY }, // Top-right
    { x: startX + offset, y: startY }, // Top-left
  ];

  const isCorrect = parseInt(inputValue) === area;

  // Auto-trigger success modal when goal is reached
  useEffect(() => {
    if (isCorrect && submitted && onComplete) {
      // Close panel and show success modal
      closePanel();
      const timer = setTimeout(() => {
        onComplete(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isCorrect, submitted, onComplete, closePanel]);

  // Reset state when problem changes
  useEffect(() => {
    resetAll();
  }, [questionIndex, resetAll]);

  // Handle submit from keypad
  const handleSubmit = () => {
    if (inputValue.trim() === '') return; // Don't submit empty

    setSubmitted(true);

    if (!isCorrect) {
      // Show error feedback in panel, keep panel open
      // User can try again
    }
    // If correct, useEffect above will trigger modal
  };

  // Handle next problem
  const handleNextProblem = () => {
    resetAll();
    if (onNextProblem) {
      onNextProblem();
    }
  };

  return (
    <Container>
      {/* Enter Answer Button (floating on canvas, inline on mobile) */}
      {!panelOpen && (
        <EnterAnswerButton onClick={openPanel} disabled={submitted && isCorrect} />
      )}

      {/* Canvas with trapezoid - stays at full width */}
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

            {/* Trapezoid outline */}
            <Line
              points={[
                vertices[0].x, vertices[0].y,
                vertices[1].x, vertices[1].y,
                vertices[2].x, vertices[2].y,
                vertices[3].x, vertices[3].y,
              ]}
              closed
              fill={konvaTheme.shapeFill || '#3B82F6'}
              fillOpacity={0.3}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={3}
              listening={false}
            />

            {/* Decomposition lines */}
            {decompositionType === 'twoTriangles' ? (
              // Diagonal line splitting into two triangles
              <Line
                points={[
                  startX + offset, startY,
                  startX + bottomWidth, startY + trapHeight,
                ]}
                stroke={konvaTheme.warning || '#F59E0B'}
                strokeWidth={2.5}
                dash={[6, 4]}
                listening={false}
              />
            ) : (
              // Vertical lines for rectangle + triangles
              <>
                <Line
                  points={[startX + offset, startY, startX + offset, startY + trapHeight]}
                  stroke={konvaTheme.warning || '#F59E0B'}
                  strokeWidth={2.5}
                  dash={[6, 4]}
                  listening={false}
                />
                <Line
                  points={[startX + offset + topWidth, startY, startX + offset + topWidth, startY + trapHeight]}
                  stroke={konvaTheme.warning || '#F59E0B'}
                  strokeWidth={2.5}
                  dash={[6, 4]}
                  listening={false}
                />
              </>
            )}

            {/* Individual area labels removed - causes confusion for students */}

            {/* Dimensions */}
            {/* Top base */}
            <DimensionLabel
              x1={startX + offset}
              y1={startY}
              x2={startX + offset + topWidth}
              y2={startY}
              label={`${base1} cm`}
              orientation="horizontal"
              offset={-15}
              konvaTheme={konvaTheme}
              fontSize={19}
            />

            {/* Bottom base */}
            <DimensionLabel
              x1={startX}
              y1={startY + trapHeight}
              x2={startX + bottomWidth}
              y2={startY + trapHeight}
              label={`${base2} cm`}
              orientation="horizontal"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={19}
            />

            {/* Height */}
            <DimensionLabel
              x1={startX}
              y1={startY + trapHeight}
              x2={startX}
              y2={startY}
              label={`${height} cm`}
              orientation="vertical"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={19}
            />
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* Formula helper - stays below canvas */}
      <FormulaHelper>
        <Formula>Trapezoid Formula: Area = ½(base₁ + base₂) × height</Formula>
        <HintText>Or add up the individual shapes!</HintText>
      </FormulaHelper>

      {/* Input Overlay Panel */}
      <InputOverlayPanel
        visible={panelOpen}
        onClose={closePanel}
        title="Calculate Trapezoid Area"
      >
        {/* Input label */}
        <InputLabel>Total Area (cm²):</InputLabel>

        {/* Slim Math Keypad */}
        <SlimMathKeypad
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
        />

        {/* Feedback inside panel */}
        {submitted && (
          <FeedbackSection $isCorrect={isCorrect}>
            {isCorrect ? (
              <FeedbackText>
                ✓ Correct! {decompositionType === 'twoTriangles'
                  ? `${tri1Area} + ${tri2Area} = ${area} cm²`
                  : `${tri1Area} + ${rectArea} + ${tri2Area} = ${area} cm²`
                }
                <br />
                Or use the formula: ½({base1} + {base2}) × {height} = {area} cm²
              </FeedbackText>
            ) : (
              <FeedbackText>
                Not quite. Try using the trapezoid formula: ½({base1} + {base2}) × {height}
              </FeedbackText>
            )}
          </FeedbackSection>
        )}

        {/* Action buttons inside panel */}
        <PanelButtonRow>
          <ResetButton onClick={() => { setInputValue(''); setSubmitted(false); }}>
            Clear
          </ResetButton>
          {submitted && isCorrect && (
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

const FormulaHelper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 20px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-left: 4px solid ${props => props.theme.colors.info || '#3B82F6'};
  border-radius: 8px;

  @media (max-width: 1024px) {
    padding: 10px 16px;
  }
`;

const Formula = styled.span`
  font-size: 15px;
  font-family: 'Courier New', monospace;
  color: ${props => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;

const HintText = styled.span`
  font-size: 14px;
  font-style: italic;
  color: ${props => props.theme.colors.textSecondary};

  @media (max-width: 1024px) {
    font-size: 13px;
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

export default Level6TrapezoidDecomposition;
