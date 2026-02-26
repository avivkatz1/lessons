import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Line } from 'react-konva';
import GridBackground from './GridBackground';
import DimensionLabel from './DimensionLabel';
import SmartText from './SmartText';
import { useWindowDimensions, useKonvaTheme } from '../../../../../../hooks';
import { useSmartPositioning } from '../../hooks/useSmartPositioning';
import { registerShape } from '../../utils/smartPositioning';
import { InputOverlayPanel, SlimMathKeypad, EnterAnswerButton } from '../../../../../../shared/components';
import { useInputOverlay } from '../../hooks/useInputOverlay';

/**
 * Level 4: Right Triangles (Half Rectangle)
 * Shows right triangle with optional dashed rectangle outline to visualize half-relationship
 * Progressive scaffolding: Q1-5 show outline, Q6+ hide
 *
 * NEW: Uses Input Overlay Panel system for iPad optimization
 * - Panel overlays on top (canvas stays full width)
 * - SlimMathKeypad for touch-friendly number entry
 * - Smooth slide-in animation from right
 */
function Level4RightTriangle({ visualData, onComplete, onNextProblem, questionIndex = 0 }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const {
    base = 8,
    height = 6,
    area = 24,
    rectangleArea = 48,
    showRectangleOutline = true,
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

  // Smart positioning system
  const { registry, calculator } = useSmartPositioning(canvasWidth, canvasHeight);

  // Position triangle in center
  const startX = cellSize * 2;
  const startY = cellSize * 3;
  const triBase = base * (cellSize * 0.5);
  const triHeight = height * (cellSize * 0.5);

  // Triangle vertices (right angle at bottom-left)
  const vertices = useMemo(() => [
    { x: startX, y: startY + triHeight }, // Bottom-left (right angle)
    { x: startX + triBase, y: startY + triHeight }, // Bottom-right
    { x: startX, y: startY }, // Top-left
  ], [startX, startY, triBase, triHeight]);

  const isCorrect = parseInt(inputValue) === area;

  // Register triangle shape with collision system
  useEffect(() => {
    // Calculate bounding box for triangle
    const minX = Math.min(vertices[0].x, vertices[1].x, vertices[2].x);
    const maxX = Math.max(vertices[0].x, vertices[1].x, vertices[2].x);
    const minY = Math.min(vertices[0].y, vertices[1].y, vertices[2].y);
    const maxY = Math.max(vertices[0].y, vertices[1].y, vertices[2].y);

    registerShape(registry, 'triangle', {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }, 'shape', 10);

    // Register rectangle outline if shown
    if (showRectangleOutline) {
      registerShape(registry, 'rectangle-outline', {
        x: startX,
        y: startY,
        width: triBase,
        height: triHeight
      }, 'shape', 8);
    }
  }, [registry, vertices, showRectangleOutline, startX, startY, triBase, triHeight]);

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

      {/* Canvas with triangle - stays at full width */}
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

            {/* Dashed rectangle outline (if shown) */}
            {showRectangleOutline && (
              <>
                <Line
                  points={[
                    startX, startY,
                    startX + triBase, startY,
                    startX + triBase, startY + triHeight,
                    startX, startY + triHeight,
                    startX, startY,
                  ]}
                  stroke={konvaTheme.gridRegular}
                  strokeWidth={2}
                  dash={[8, 4]}
                  opacity={0.5}
                  listening={false}
                />
                {/* Rectangle area label with smart positioning */}
                <SmartText
                  calculator={calculator}
                  shapeBounds={{
                    x: startX,
                    y: startY,
                    width: triBase,
                    height: triHeight
                  }}
                  label={`Rectangle: ${rectangleArea} cm²`}
                  fontSize={18}
                  fontStyle="italic"
                  fill={konvaTheme.labelText}
                  registry={registry}
                  id="rectangle-area-label"
                  preferredPosition="above"
                  opacity={0.7}
                />
              </>
            )}

            {/* Right triangle (filled) */}
            <Line
              points={[
                vertices[0].x, vertices[0].y,
                vertices[1].x, vertices[1].y,
                vertices[2].x, vertices[2].y,
              ]}
              closed
              fill={konvaTheme.shapeFill || '#3B82F6'}
              fillOpacity={0.4}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={3}
              listening={false}
            />

            {/* Right angle marker */}
            <Line
              points={[
                startX, startY + triHeight - 15,
                startX, startY + triHeight,
                startX + 15, startY + triHeight,
              ]}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={2.5}
              listening={false}
            />
            <Rect
              x={startX}
              y={startY + triHeight - 12}
              width={12}
              height={12}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={2}
              listening={false}
            />

            {/* Base dimension with smart positioning */}
            <DimensionLabel
              x1={startX}
              y1={startY + triHeight}
              x2={startX + triBase}
              y2={startY + triHeight}
              label={`${base} cm`}
              orientation="horizontal"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={20}
              registry={registry}
              calculator={calculator}
              enableSmartPositioning={true}
              id="triangle-base"
            />

            {/* Height dimension with smart positioning */}
            <DimensionLabel
              x1={startX}
              y1={startY}
              x2={startX}
              y2={startY + triHeight}
              label={`${height} cm`}
              orientation="vertical"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={20}
              registry={registry}
              calculator={calculator}
              enableSmartPositioning={true}
              id="triangle-height"
            />
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* Formula helper - stays below canvas */}
      <FormulaHelper>
        <Formula>Formula: Area = ½ × base × height</Formula>
      </FormulaHelper>

      {/* Input Overlay Panel */}
      <InputOverlayPanel
        visible={panelOpen}
        onClose={closePanel}
        title="Calculate Right Triangle Area"
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
                ✓ Correct! Area = ½ × {base} × {height} = {area} cm²
                {showRectangleOutline && ` (Half of ${rectangleArea} cm²)`}
              </FeedbackText>
            ) : (
              <FeedbackText>
                Not quite. Remember: Area = ½ × base × height
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

export default Level4RightTriangle;
