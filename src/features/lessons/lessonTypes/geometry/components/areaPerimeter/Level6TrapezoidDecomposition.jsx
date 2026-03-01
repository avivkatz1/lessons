import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Line } from 'react-konva';
import GridBackground from './GridBackground';
import DimensionLabel from './DimensionLabel';
import { useWindowDimensions, useKonvaTheme } from '../../../../../../hooks';
import { InputOverlayPanel, UnifiedMathKeypad, EnterAnswerButton } from '../../../../../../shared/components';
import { useInputOverlay } from '../../hooks/useInputOverlay';

/**
 * Level 6: Trapezoid Decomposition
 * Trapezoid pre-divided into triangles or rectangle+triangles
 * Progressive scaffolding: Q1-5 show individual areas, Q6+ only dimensions
 *
 * NEW: Enhanced with canvas slide animation
 * - Trapezoid centered horizontally on canvas
 * - EnterAnswerButton positioned below canvas (static, not floating)
 * - Canvas slides left 75% of panel width when panel opens (desktop/iPad only)
 * - Mobile: Full-screen overlay, no slide animation
 */
function Level6TrapezoidDecomposition({ visualData, onComplete, onNextProblem, questionIndex = 0, modalClosedWithX = false }) {
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
    keepOpen,
    setKeepOpen,
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

  // CENTERED trapezoid positioning
  const trapHeight = height * (cellSize * 0.5);
  const topWidth = base1 * (cellSize * 0.5);
  const bottomWidth = base2 * (cellSize * 0.5);
  const offset = (bottomWidth - topWidth) / 2;
  const startX = (canvasWidth - bottomWidth) / 2; // Center horizontally (use wider base)
  const startY = (canvasHeight - trapHeight) / 2 - 30; // Center vertically with upward offset

  // Trapezoid vertices
  const vertices = [
    { x: startX, y: startY + trapHeight }, // Bottom-left
    { x: startX + bottomWidth, y: startY + trapHeight }, // Bottom-right
    { x: startX + offset + topWidth, y: startY }, // Top-right
    { x: startX + offset, y: startY }, // Top-left
  ];

  const isCorrect = parseInt(inputValue) === area;


  // Reset state when problem changes
  useEffect(() => {
    if (!keepOpen) {
      // Normal mode: close panel and reset everything
      resetAll();
    } else {
      // Keep Open mode: just reset input/state, keep panel open
      setInputValue('');
      setSubmitted(false);
    }
  }, [questionIndex, keepOpen, resetAll, setInputValue, setSubmitted]);

  // Handle submit from keypad
  const handleSubmit = () => {
    if (inputValue.trim() === '') return; // Don't submit empty

    setSubmitted(true);

    // Check correctness
    const isCorrect = parseInt(inputValue) === area;

    if (isCorrect) {
      if (keepOpen) {
        // Keep Open mode: auto-advance after 1 second
        setTimeout(() => {
          setInputValue('');
          setSubmitted(false);
          onNextProblem?.();
        }, 1000);
      } else {
        // Normal mode: close panel and show modal
        closePanel();
        setTimeout(() => {
          onComplete?.(true);
        }, 500);
      }
    }
    // If wrong, panel stays open with feedback
  };

  // Handle input change - reset submitted state to allow re-submission
  const handleInputChange = (value) => {
    setInputValue(value);
    if (submitted) {
      setSubmitted(false);
    }
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
      {/* Wrapper with slide animation (wraps canvas and button) */}
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
        title="Calculate Trapezoid Area"
      >
        {/* Input label */}
        <InputLabel>Total Area (cm²):</InputLabel>

        {/* Slim Math Keypad */}
        <UnifiedMathKeypad
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          layout="inline"
          buttonSet="basic"
          showKeepOpen={true}
          keepOpen={keepOpen}
          onKeepOpenChange={setKeepOpen}
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
          {!submitted || !isCorrect ? (
            <SubmitButton
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
            >
              Submit
            </SubmitButton>
          ) : (
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

const SubmitButton = styled.button`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.theme.colors.info || '#3b82f6'};
  color: ${props => props.theme.colors.textInverted || '#FFFFFF'};
  transition: all 0.2s;
  min-height: 44px;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
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

export default Level6TrapezoidDecomposition;
