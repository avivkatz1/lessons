/**
 * Subtracting Integers - Interactive Lesson Component
 *
 * Five-level progression with "Keep, Change, Change" method:
 * L1 — Keep Change Change (Positive - Positive): Marker visualization
 * L2 — Subtracting Negatives (Positive - Negative): Shows double negative
 * L3 — Negative Minus Positive: Result more negative
 * L4 — Negative Minus Negative: Trickiest case
 * L5 — Word Problems: Real-world scenarios
 */

import React, { useState, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Line, Text, Transformer } from 'react-konva';
import { useLessonState, useKonvaTheme, useWindowDimensions } from '../../../../hooks';
import { InputOverlayPanel, SlimMathKeypad, EnterAnswerButton } from '../../../../shared/components';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useKeepChangeChangeValidation } from './hooks/useKeepChangeChangeValidation';
import { useInputOverlay } from './hooks/useInputOverlay';
import { calculateTargetRegions } from './utils/expressionParsing';
import { calculateStrokeBounds } from './utils/strokeAnalysis';

// ==================== KEEP CHANGE CHANGE INTERACTIVE COMPONENT ====================

function KeepChangeChange({
  visualData,
  konvaTheme,
  width,
  height,
  onClearDrawing,
  tool,
  onToolChange,
  lines,
  onLinesChange,
  validationState,
  feedbackMessage,
  katexRef,
  targetRegions, // NEW: pass target regions for debug visualization
}) {
  const { step1 } = visualData;
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [showGuides, setShowGuides] = React.useState(true); // Show subtle guide rectangles

  const stageRef = React.useRef(null);

  // Render KaTeX expression
  React.useEffect(() => {
    if (katexRef.current && step1) {
      // Convert expression to LaTeX format (e.g., "7 - 1" becomes "7 - 1")
      const latex = step1.replace(/\s/g, '\\,'); // Add proper spacing
      katex.render(latex, katexRef.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [step1]);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    onLinesChange([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];

    lastLine.points = lastLine.points.concat([point.x, point.y]);

    onLinesChange(lines.slice(0, lines.length - 1).concat([lastLine]));
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Clear callback - expose the clear function to parent
  React.useImperativeHandle(onClearDrawing, () => ({
    clear: () => onLinesChange([])
  }), [onLinesChange]);

  return (
    <CanvasContainer $validationState={validationState}>
      <Stage
        width={width}
        height={height}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {/* Canvas background */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={konvaTheme.canvasBackground}
          />

          {/* User's drawings */}
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.tool === 'eraser' ? '#FFFFFF' : '#EF4444'}
              strokeWidth={line.tool === 'eraser' ? 30 : 5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}

          {/* Guide rectangles showing calculated target regions */}
          {showGuides && targetRegions && (
            <>
              {/* Mark 1 target region (minus sign) - Subtle guide */}
              <Rect
                x={targetRegions.mark1Region.x}
                y={targetRegions.mark1Region.y}
                width={targetRegions.mark1Region.width}
                height={targetRegions.mark1Region.height}
                stroke="#10B981"
                strokeWidth={2}
                dash={[8, 4]}
                fill="rgba(16, 185, 129, 0.08)"
                listening={false}
              />

              {/* Mark 2 target region - Subtle guide */}
              <Rect
                x={targetRegions.mark2Region.x}
                y={targetRegions.mark2Region.y}
                width={targetRegions.mark2Region.width}
                height={targetRegions.mark2Region.height}
                stroke="#3B82F6"
                strokeWidth={2}
                dash={[8, 4]}
                fill="rgba(59, 130, 246, 0.08)"
                listening={false}
              />
            </>
          )}
        </Layer>
      </Stage>

      {/* KaTeX overlay - positioned on top of canvas */}
      <KaTeXOverlay ref={katexRef} />

      {/* Feedback message */}
      {feedbackMessage && <FeedbackMessage>{feedbackMessage}</FeedbackMessage>}
    </CanvasContainer>
  );
}

// ==================== MAIN COMPONENT ====================

function SubtractingIntegersLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const konvaTheme = useKonvaTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [showHint, setShowHint] = useState(false);
  const [tool, setTool] = useState('marker');
  const [lines, setLines] = useState([]);
  const clearDrawingRef = React.useRef(null);
  const katexRef = React.useRef(null);

  // InputOverlayPanel state
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

  // Modal tracking for ExplanationModal behavior
  const [isComplete, setIsComplete] = useState(false);
  const [modalClosedWithX, setModalClosedWithX] = useState(false);

  // Current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const { question, answer, acceptedAnswers, hint, explanation, visualData, level, levelNum: levelNumStr } = currentProblem;

  // Get level number - parse from string or use level field
  const levelNum = parseInt(levelNumStr || level || '1', 10);

  // Question text
  const questionText = question?.[0]?.text || question || '';

  // Format answer
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers?.length > 0) return acceptedAnswers;
    if (Array.isArray(answer)) return answer;
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  // Event handlers
  const handleTryAnother = () => {
    setShowHint(false);
    if (clearDrawingRef.current) {
      clearDrawingRef.current.clear();
    }
    resetAll(); // Reset InputOverlay state
    setIsComplete(false);
    setModalClosedWithX(false);
    triggerNewProblem();
    hideAnswer();
  };

  const handleClearDrawing = () => {
    if (clearDrawingRef.current) {
      clearDrawingRef.current.clear();
    }
  };

  const handleCorrectAnswer = () => {
    if (clearDrawingRef.current) {
      clearDrawingRef.current.clear();
    }
    setIsComplete(true);
    revealAnswer();
  };

  // Handle answer submission from InputOverlayPanel
  const handleSubmitAnswer = () => {
    if (!inputValue.trim()) return;

    setSubmitted(true);
    const isCorrect = correctAnswer.includes(inputValue.trim());

    if (isCorrect) {
      if (keepOpen) {
        // Keep Open mode: Clear input and auto-advance after 1 second
        setTimeout(() => {
          setInputValue('');
          setSubmitted(false);
          setIsComplete(false);
          setModalClosedWithX(false);
          if (clearDrawingRef.current) {
            clearDrawingRef.current.clear();
          }
          triggerNewProblem();
        }, 1000);
      } else {
        // Normal mode: Close panel and advance
        setTimeout(() => {
          closePanel();
          resetAll();
          setIsComplete(false);
          setModalClosedWithX(false);
          if (clearDrawingRef.current) {
            clearDrawingRef.current.clear();
          }
          triggerNewProblem();
        }, 1000);
      }
    }
  };

  // Canvas sizing
  const canvasWidth = useMemo(() => {
    return Math.min(windowWidth - 40, 600);
  }, [windowWidth]);

  const canvasHeight = useMemo(() => {
    if (levelNum >= 1 && levelNum <= 4) return 250; // Keep Change Change
    if (levelNum === 5) return 0; // Word problems (no visual unless hint)
    return 0;
  }, [levelNum]);

  // Canvas slide animation distance for InputOverlayPanel
  const slideDistance = useMemo(() => {
    // Mobile: No slide
    if (windowWidth <= 768) return 0;

    // Desktop/iPad: Calculate panel width, then slide distance
    const panelWidth = Math.min(Math.max(windowWidth * 0.4, 360), 480);
    return panelWidth * 0.75; // Slide by 75% of panel width
  }, [windowWidth]);

  // Target regions state (calculated after KaTeX renders)
  const [targetRegions, setTargetRegions] = useState(null);

  // Calculate target regions AFTER KaTeX renders (in useEffect, not useMemo)
  React.useEffect(() => {
    if (levelNum < 1 || levelNum > 4 || !visualData || !visualData.step1) {
      setTargetRegions(null);
      return;
    }

    // Wait for next frame to ensure KaTeX has rendered
    requestAnimationFrame(() => {
      console.log('[Validation] Recalculating target regions for:', visualData.step1);
      const regions = calculateTargetRegions(visualData, katexRef, canvasWidth, canvasHeight);
      setTargetRegions(regions);
    });
  }, [visualData?.step1, canvasWidth, canvasHeight, levelNum]);

  // Run validation hook
  const validationResult = useKeepChangeChangeValidation(lines, targetRegions);

  // Clear drawing and reset input when level or question changes
  React.useEffect(() => {
    if (clearDrawingRef.current) {
      clearDrawingRef.current.clear();
    }
    // Clear lines state
    setLines([]);
    // Reset InputOverlay state
    if (!keepOpen) {
      // Normal mode: close panel and reset everything
      resetAll();
    } else {
      // Keep Open mode: just reset input/state, keep panel open
      setInputValue('');
      setSubmitted(false);
    }
    setIsComplete(false);
    setModalClosedWithX(false);
    // Reset hint state
    setShowHint(false);
  }, [levelNum, visualData?.step1, keepOpen, resetAll, setInputValue, setSubmitted]);

  return (
    <Wrapper>
      {/* Hint button - fixed top right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {levelNum}</LevelBadge>
        <LevelTitle>
          {levelNum === 1 && 'Keep, Change, Change Method'}
          {levelNum === 2 && 'Subtracting Negatives'}
          {levelNum === 3 && 'Negative Minus Positive'}
          {levelNum === 4 && 'Negative Minus Negative'}
          {levelNum === 5 && 'Word Problems'}
        </LevelTitle>
      </LevelHeader>

      {/* Question */}
      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      {/* Visual Component with slide animation - Show for first 4 questions, then only if hint is shown */}
      {visualData && visualData.type === 'keepChangeChange' && (currentQuestionIndex < 4 || showHint) && (
        <CanvasWrapper $panelOpen={panelOpen} $slideDistance={slideDistance}>
          <VisualSection>
            <KeepChangeChange
              visualData={visualData}
              konvaTheme={konvaTheme}
              width={canvasWidth}
              height={canvasHeight}
              tool={tool}
              onToolChange={setTool}
              onClearDrawing={clearDrawingRef}
              lines={lines}
              onLinesChange={setLines}
              validationState={validationResult.validationState}
              feedbackMessage={validationResult.feedbackMessage}
              katexRef={katexRef}
              targetRegions={targetRegions}
            />
          </VisualSection>

          {/* Drawing tools - all in one row below canvas */}
          <ButtonContainer>
            <ToolButton
              $active={tool === 'marker'}
              onClick={() => setTool('marker')}
            >
              🖊️ Marker
            </ToolButton>
            <ToolButton
              $active={tool === 'eraser'}
              onClick={() => setTool('eraser')}
            >
              🧹 Eraser
            </ToolButton>
            <ActionButton onClick={handleClearDrawing}>
              Clear Drawing
            </ActionButton>
          </ButtonContainer>
        </CanvasWrapper>
      )}

      {/* Interaction Section */}
      <InteractionSection>
        {showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}

        {/* Enter Answer button - always visible */}
        {!showAnswer && (
          <EnterAnswerButtonWrapper>
            <EnterAnswerButton onClick={openPanel} disabled={showAnswer} variant="static" />
          </EnterAnswerButtonWrapper>
        )}

        {/* InputOverlayPanel */}
        <InputOverlayPanel
          visible={panelOpen}
          onClose={closePanel}
          onSubmit={handleSubmitAnswer}
          isCorrect={submitted && correctAnswer.includes(inputValue.trim())}
          isIncorrect={submitted && !correctAnswer.includes(inputValue.trim())}
        >
          <SlimMathKeypad
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmitAnswer}
            keepOpen={keepOpen}
            onKeepOpenChange={setKeepOpen}
          />

          {/* Submit button */}
          <PanelButtonRow>
            <SubmitButton onClick={handleSubmitAnswer} disabled={!inputValue.trim()}>
              Submit Answer
            </SubmitButton>
          </PanelButtonRow>

          {/* Feedback inside panel */}
          {submitted && (
            <PanelFeedback $isCorrect={correctAnswer.includes(inputValue.trim())}>
              {correctAnswer.includes(inputValue.trim()) ? '✓ Correct!' : '✗ Try again'}
            </PanelFeedback>
          )}
        </InputOverlayPanel>

        {showAnswer && explanation && (
          <ExplanationSection>
            <ExplanationTitle>Explanation</ExplanationTitle>
            <ExplanationText>{explanation}</ExplanationText>
            <TryAnotherButton onClick={handleTryAnother}>
              Try Another Problem
            </TryAnotherButton>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default SubtractingIntegersLesson;

// ==================== STYLED COMPONENTS ====================

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 1024px) {
    padding: 16px;
  }
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
  }

  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
    padding: 6px 12px;
    font-size: 13px;
  }
`;

const LevelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 1024px) {
    gap: 8px;
    margin-bottom: 12px;
  }
`;

const LevelBadge = styled.div`
  background: ${props => props.theme.colors.info};
  color: ${props => props.theme.colors.textInverted};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;

  @media (max-width: 1024px) {
    padding: 4px 10px;
    font-size: 12px;
  }
`;

const LevelTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: ${props => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const QuestionSection = styled.div`
  margin-bottom: 24px;
  text-align: center;

  @media (max-width: 1024px) {
    margin-bottom: 20px;
  }
`;

const QuestionText = styled.p`
  font-size: 20px;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.5;

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;

  @media (max-width: 1024px) {
    margin-bottom: 16px;
  }
`;

const CanvasContainer = styled.div`
  position: relative;
  display: inline-block;
  border-radius: 8px;
  border: 3px solid ${props => {
    if (props.$validationState === 'complete') {
      return props.theme.colors.buttonSuccess; // Green
    } else if (props.$validationState === 'partial') {
      return props.theme.colors.warning; // Orange
    } else {
      return props.theme.colors.border; // Gray
    }
  }};
  transition: border-color 0.3s ease-in-out;
`;

const KaTeXOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  user-select: none;

  .katex {
    font-size: 72px;
    color: ${props => props.theme.colors.info};
  }

  .katex-display {
    margin: 0;
  }

  @media (max-width: 1024px) {
    .katex {
      font-size: 60px;
    }
  }

  @media (max-width: 768px) {
    .katex {
      font-size: 48px;
    }
  }
`;

const FeedbackMessage = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.info};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  z-index: 10;
  color: ${props => props.theme.colors.textPrimary};
  white-space: nowrap;

  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 6px 12px;
  }
`;

const DebugInfo = styled.div`
  position: absolute;
  top: -240px;
  left: 0;
  background: ${props => props.theme.colors.cardBackground};
  border: 3px solid ${props => props.theme.colors.warning};
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  color: ${props => props.theme.colors.textPrimary};
  min-width: 320px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const DebugTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.warning};
`;

const DebugText = styled.div`
  font-size: 12px;
  margin-bottom: 4px;
`;

const DebugButton = styled.button`
  margin-top: 8px;
  width: 100%;
  background: ${props => props.theme.colors.warning};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const InteractionSection = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  @media (max-width: 1024px) {
    margin-top: 24px;
    gap: 16px;
  }
`;

const HintBox = styled.div`
  background-color: ${props => props.theme.colors.warning}18;
  border-left: 4px solid ${props => props.theme.colors.warning};
  padding: 16px;
  border-radius: 8px;
  font-size: 15px;
  color: ${props => props.theme.colors.textPrimary};
  max-width: 600px;

  @media (max-width: 1024px) {
    padding: 12px;
    font-size: 14px;
  }
`;

const EnterAnswerButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 12px;

  @media (max-width: 1024px) {
    margin-top: 10px;
  }
`;

// Canvas slide animation wrapper
const CanvasWrapper = styled.div`
  width: 100%;
  transition: transform 0.3s ease-in-out;
  transform: ${props => props.$panelOpen ? `translateX(-${props.$slideDistance}px)` : 'translateX(0)'};

  @media (max-width: 768px) {
    transform: none; // No slide on mobile (full-screen overlay instead)
  }
`;

const ExplanationSection = styled.div`
  background: ${props => props.theme.colors.buttonSuccess}18;
  border: 2px solid ${props => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  width: 100%;

  @media (max-width: 1024px) {
    padding: 20px;
  }
`;

const ExplanationTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  color: ${props => props.theme.colors.buttonSuccess};

  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 20px 0;

  @media (max-width: 1024px) {
    font-size: 15px;
    margin-bottom: 16px;
  }
`;

const TryAnotherButton = styled.button`
  background: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
    font-size: 15px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;

  @media (max-width: 1024px) {
    gap: 8px;
    margin-bottom: 16px;
  }
`;

const ToolButton = styled.button`
  background: ${props => props.$active ? props.theme.colors.info : props.theme.colors.cardBackground};
  color: ${props => props.$active ? props.theme.colors.textInverted : props.theme.colors.textPrimary};
  border: 2px solid ${props => props.$active ? props.theme.colors.info : props.theme.colors.border};
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
    font-size: 14px;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.theme.colors.info};
  color: ${props => props.theme.colors.textInverted};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
    font-size: 14px;
  }
`;

// InputOverlayPanel styled components
const PanelButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  width: 100%;

  @media (max-width: 1024px) {
    gap: 8px;
    margin-top: 16px;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  background: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 56px;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 1024px) {
    padding: 12px 20px;
    font-size: 15px;
    min-height: 48px;
  }
`;

const PanelFeedback = styled.div`
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  background: ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess + '18'
    : props.theme.colors.buttonDanger + '18'
  };
  border: 2px solid ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess
    : props.theme.colors.buttonDanger
  };
  color: ${props => props.theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 600;
  text-align: center;

  @media (max-width: 1024px) {
    margin-top: 12px;
    padding: 10px 14px;
    font-size: 13px;
  }
`;
