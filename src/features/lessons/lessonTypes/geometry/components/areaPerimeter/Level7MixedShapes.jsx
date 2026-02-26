import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import GridBackground from './GridBackground';
import DimensionLabel from './DimensionLabel';
import { useWindowDimensions, useKonvaTheme } from '../../../../../../hooks';
import { useSmartPositioning } from '../../hooks/useSmartPositioning';
import { InputOverlayPanel, SlimMathKeypad, EnterAnswerButton } from '../../../../../../shared/components';
import { useInputOverlay } from '../../hooks/useInputOverlay';

/**
 * Level 7: Mixed Shapes
 * Random shape: rectangle, triangle, parallelogram, or trapezoid
 * Progressive scaffolding: Q1-5 show shape label, Q6+ student identifies
 *
 * NEW: Uses Input Overlay Panel system for iPad optimization
 * - Panel overlays on top (canvas stays full width)
 * - SlimMathKeypad for touch-friendly number entry
 * - Smooth slide-in animation from right
 */
function Level7MixedShapes({ visualData, onComplete, onNextProblem, questionIndex = 0 }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const {
    shapeType = 'rectangle', // 'rectangle', 'triangle', 'parallelogram', 'trapezoid'
    showShapeLabel = true,
    area = 40,
    // Shape-specific data
    length, width, base, height, slant, base1, base2,
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

  // Canvas sizing (iPad optimized) - larger grid space
  const canvasWidth = useMemo(() => {
    const padding = 40;
    return Math.min(windowWidth - padding, 1200); // Wider canvas
  }, [windowWidth]);

  const canvasHeight = 400; // Taller for better visibility
  const gridSize = 10; // More grid cells
  const cellSize = 40; // Larger cells for better visibility

  // Smart positioning system
  const { registry, calculator } = useSmartPositioning(canvasWidth, canvasHeight);

  // Render shape based on type
  const renderShape = () => {
    const startX = cellSize * 2;
    const startY = cellSize * 2.5;

    switch (shapeType) {
      case 'rectangle': {
        const rectWidth = length * (cellSize * 0.5);
        const rectHeight = width * (cellSize * 0.5);
        return (
          <>
            <Rect
              x={startX}
              y={startY}
              width={rectWidth}
              height={rectHeight}
              fill={konvaTheme.shapeFill || '#3B82F6'}
              fillOpacity={0.4}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={3}
              listening={false}
            />
            <DimensionLabel
              x1={startX}
              y1={startY + rectHeight}
              x2={startX + rectWidth}
              y2={startY + rectHeight}
              label={`${length} cm`}
              orientation="horizontal"
              offset={20}
              konvaTheme={konvaTheme}
            />
            <DimensionLabel
              x1={startX}
              y1={startY}
              x2={startX}
              y2={startY + rectHeight}
              label={`${width} cm`}
              orientation="vertical"
              offset={20}
              konvaTheme={konvaTheme}
            />
          </>
        );
      }

      case 'triangle': {
        const triBase = base * (cellSize * 0.5);
        const triHeight = height * (cellSize * 0.5);
        const apexX = startX + triBase * 0.4;
        return (
          <>
            <Line
              points={[
                startX, startY + triHeight,
                startX + triBase, startY + triHeight,
                apexX, startY,
              ]}
              closed
              fill={konvaTheme.shapeFill || '#3B82F6'}
              fillOpacity={0.4}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={3}
              listening={false}
            />
            {/* Height line */}
            <Line
              points={[apexX, startY, apexX, startY + triHeight]}
              stroke={konvaTheme.warning || '#F59E0B'}
              strokeWidth={2}
              dash={[6, 4]}
              listening={false}
            />
            <DimensionLabel
              x1={startX}
              y1={startY + triHeight}
              x2={startX + triBase}
              y2={startY + triHeight}
              label={`${base} cm`}
              orientation="horizontal"
              offset={20}
              konvaTheme={konvaTheme}
              registry={registry}
              calculator={calculator}
              enableSmartPositioning={true}
              id="triangle-base"
            />
            <DimensionLabel
              x1={startX}
              y1={startY}
              x2={startX}
              y2={startY + triHeight}
              label={`${height} cm`}
              orientation="vertical"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={19}
              color={konvaTheme.warning || '#F59E0B'}
              registry={registry}
              calculator={calculator}
              enableSmartPositioning={true}
              id="triangle-height"
            />
          </>
        );
      }

      case 'parallelogram': {
        const paraBase = base * (cellSize * 0.5);
        const paraHeight = height * (cellSize * 0.5);
        const paraSlant = slant * (cellSize * 0.5);
        const offset = Math.sqrt(paraSlant * paraSlant - paraHeight * paraHeight);
        return (
          <>
            <Line
              points={[
                startX, startY + paraHeight,
                startX + paraBase, startY + paraHeight,
                startX + paraBase + offset, startY,
                startX + offset, startY,
              ]}
              closed
              fill={konvaTheme.shapeFill || '#3B82F6'}
              fillOpacity={0.4}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={3}
              listening={false}
            />
            {/* Perpendicular height line */}
            <Line
              points={[startX + paraBase / 2, startY + paraHeight, startX + paraBase / 2, startY]}
              stroke={konvaTheme.warning || '#F59E0B'}
              strokeWidth={2}
              dash={[6, 4]}
              listening={false}
            />
            {/* Right angle marker */}
            <Line
              points={[
                startX + paraBase / 2 - 8, startY + paraHeight - 8,
                startX + paraBase / 2 - 8, startY + paraHeight,
                startX + paraBase / 2, startY + paraHeight,
              ]}
              stroke={konvaTheme.warning || '#F59E0B'}
              strokeWidth={2}
              listening={false}
            />
            <DimensionLabel
              x1={startX}
              y1={startY + paraHeight}
              x2={startX + paraBase}
              y2={startY + paraHeight}
              label={`${base} cm`}
              orientation="horizontal"
              offset={20}
              konvaTheme={konvaTheme}
              registry={registry}
              calculator={calculator}
              enableSmartPositioning={true}
              id="parallelogram-base"
            />
            <DimensionLabel
              x1={startX}
              y1={startY + paraHeight}
              x2={startX}
              y2={startY}
              label={`${height} cm`}
              orientation="vertical"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={19}
              color={konvaTheme.warning || '#F59E0B'}
              registry={registry}
              calculator={calculator}
              enableSmartPositioning={true}
              id="parallelogram-height"
            />
          </>
        );
      }

      case 'trapezoid': {
        const trapHeight = height * (cellSize * 0.5);
        const topWidth = base1 * (cellSize * 0.5);
        const bottomWidth = base2 * (cellSize * 0.5);
        const offset = (bottomWidth - topWidth) / 2;
        return (
          <>
            <Line
              points={[
                startX, startY + trapHeight,
                startX + bottomWidth, startY + trapHeight,
                startX + offset + topWidth, startY,
                startX + offset, startY,
              ]}
              closed
              fill={konvaTheme.shapeFill || '#3B82F6'}
              fillOpacity={0.4}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={3}
              listening={false}
            />
            <DimensionLabel
              x1={startX + offset}
              y1={startY}
              x2={startX + offset + topWidth}
              y2={startY}
              label={`${base1} cm`}
              orientation="horizontal"
              offset={-15}
              konvaTheme={konvaTheme}
              fontSize={18}
            />
            <DimensionLabel
              x1={startX}
              y1={startY + trapHeight}
              x2={startX + bottomWidth}
              y2={startY + trapHeight}
              label={`${base2} cm`}
              orientation="horizontal"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={18}
            />
            <DimensionLabel
              x1={startX}
              y1={startY + trapHeight}
              x2={startX}
              y2={startY}
              label={`${height} cm`}
              orientation="vertical"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={18}
            />
          </>
        );
      }

      default:
        return null;
    }
  };

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

      {/* Canvas with shape - stays at full width */}
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

            {/* Shape */}
            {renderShape()}
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* Input Overlay Panel */}
      <InputOverlayPanel
        visible={panelOpen}
        onClose={closePanel}
        title={`Calculate ${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Area`}
      >
        {/* Input label */}
        <InputLabel>Area (cm²):</InputLabel>

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
                ✓ Correct! The area is {area} cm².
              </FeedbackText>
            ) : (
              <FeedbackText>
                Not quite. Check the formula reference and try again!
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

export default Level7MixedShapes;
