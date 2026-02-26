import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Line, Circle } from 'react-konva';
import GridBackground from './GridBackground';
import DimensionLabel from './DimensionLabel';
import { useWindowDimensions, useKonvaTheme } from '../../../../../../hooks';
import { useSmartPositioning } from '../../hooks/useSmartPositioning';
import { InputOverlayPanel, SlimMathKeypad, EnterAnswerButton } from '../../../../../../shared/components';
import { useInputOverlay } from '../../hooks/useInputOverlay';

/**
 * Level 5: Any Triangle
 * Scalene, isosceles, or equilateral triangles with perpendicular height marked
 * Progressive scaffolding: Q1-5 show height line, Q6+ hide
 *
 * NEW: Enhanced with canvas slide animation
 * - Triangle centered horizontally on canvas
 * - EnterAnswerButton positioned below canvas (static, not floating)
 * - Canvas slides left 75% of panel width when panel opens (desktop/iPad only)
 * - Mobile: Full-screen overlay, no slide animation
 */
function Level5AnyTriangle({ visualData, onComplete, onNextProblem, questionIndex = 0, modalClosedWithX = false }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const {
    triangleType = 'scalene', // 'scalene', 'isosceles', 'equilateral'
    base = 10,
    height = 8,
    area = 40,
    showHeightLine = true,
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

  // Calculate slide distance based on panel width (75% of panel width)
  const slideDistance = useMemo(() => {
    // Mobile: No slide
    if (windowWidth <= 768) return 0;

    // Desktop/iPad: Calculate panel width, then slide distance
    const panelWidth = Math.min(Math.max(windowWidth * 0.4, 360), 480);
    return panelWidth * 0.75; // Slide by 75% of panel width
  }, [windowWidth]);

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

  // CENTERED triangle positioning
  const triBase = base * (cellSize * 0.45);
  const triHeight = height * (cellSize * 0.45);
  const startX = (canvasWidth - triBase) / 2; // Center horizontally
  const startY = (canvasHeight - triHeight) / 2 - 30; // Center vertically with upward offset

  // Calculate triangle vertices based on type
  let vertices;
  let apexX; // For height line

  if (triangleType === 'equilateral') {
    // Apex centered above base
    apexX = startX + triBase / 2;
    vertices = [
      { x: startX, y: startY + triHeight }, // Bottom-left
      { x: startX + triBase, y: startY + triHeight }, // Bottom-right
      { x: apexX, y: startY }, // Top (centered)
    ];
  } else if (triangleType === 'isosceles') {
    // Apex slightly off-center
    apexX = startX + triBase * 0.5;
    vertices = [
      { x: startX, y: startY + triHeight },
      { x: startX + triBase, y: startY + triHeight },
      { x: apexX, y: startY },
    ];
  } else {
    // Scalene - apex notably off-center
    apexX = startX + triBase * 0.35;
    vertices = [
      { x: startX, y: startY + triHeight },
      { x: startX + triBase, y: startY + triHeight },
      { x: apexX, y: startY },
    ];
  }

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
      {/* Wrapper with slide animation (wraps canvas, formula, and button) */}
      <CanvasWrapper $panelOpen={panelOpen} $slideDistance={slideDistance}>
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

            {/* Triangle (filled) */}
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

            {/* Height line (perpendicular from apex to base) */}
            {showHeightLine && (
              <>
                <Line
                  points={[apexX, startY, apexX, startY + triHeight]}
                  stroke={konvaTheme.warning || '#F59E0B'}
                  strokeWidth={2.5}
                  dash={[6, 4]}
                  listening={false}
                />
                {/* Right angle marker at base */}
                <Line
                  points={[
                    apexX - 8, startY + triHeight - 8,
                    apexX - 8, startY + triHeight,
                    apexX, startY + triHeight,
                  ]}
                  stroke={konvaTheme.warning || '#F59E0B'}
                  strokeWidth={2}
                  listening={false}
                />
                {/* Dot at top of height line */}
                <Circle
                  x={apexX}
                  y={startY}
                  radius={4}
                  fill={konvaTheme.warning || '#F59E0B'}
                  listening={false}
                />
                {/* Height dimension label - orange, outside figure */}
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
                  id="height-label"
                />
              </>
            )}

            {/* Base dimension */}
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
            />

            {/* Height dimension (if not shown as line) - orange, outside figure */}
            {!showHeightLine && (
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
                id="height-label-no-line"
              />
            )}
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* Formula helper - below canvas */}
      <FormulaHelper>
        <Formula>Formula: Area = ½ × base × height</Formula>
        {showHeightLine && (
          <HintText>The height (h) must be perpendicular (90°) to the base!</HintText>
        )}
      </FormulaHelper>

      {/* Button - STATIC, below formula, slides with canvas */}
      {!panelOpen && (
        <ButtonContainer>
          {modalClosedWithX ? (
            <TryAnotherButton onClick={handleNextProblem}>
              Try Another Problem
            </TryAnotherButton>
          ) : (
            <EnterAnswerButton
              onClick={openPanel}
              disabled={submitted && isCorrect}
              variant="static"
            />
          )}
        </ButtonContainer>
      )}
    </CanvasWrapper>

      {/* Input Overlay Panel */}
      <InputOverlayPanel
        visible={panelOpen}
        onClose={closePanel}
        title="Calculate Triangle Area"
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
              </FeedbackText>
            ) : (
              <FeedbackText>
                Not quite. Remember: Area = ½ × base × height (perpendicular!)
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
  gap: 20px; /* Increased for better spacing */

  @media (max-width: 1024px) {
    gap: 16px;
  }
`;

// NEW: Wrapper that handles slide animation
const CanvasWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px; /* Gap between canvas, formula, and button */

  /* Smooth slide transition */
  transition: transform 0.3s ease-in-out;

  /* Desktop + iPad: Slide left when panel opens */
  @media (min-width: 769px) {
    transform: translateX(${props => props.$panelOpen ? `-${props.$slideDistance}px` : '0'});
  }

  /* Mobile: No slide */
  @media (max-width: 768px) {
    transform: translateX(0);
  }

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
  color: ${props => props.theme.colors.warning || '#F59E0B'};

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

// NEW: Container for static button below canvas
const ButtonContainer = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
  padding: 0 16px;

  @media (max-width: 1024px) {
    padding: 0 12px;
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

const TryAnotherButton = styled.button`
  width: 100%;
  padding: 14px 32px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.theme.colors.info || '#3B82F6'};
  color: ${props => props.theme.colors.textInverted || '#FFFFFF'};
  transition: all 0.2s;
  min-height: 56px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    padding: 12px 28px;
    font-size: 16px;
    min-height: 52px;
  }
`;

export default Level5AnyTriangle;
