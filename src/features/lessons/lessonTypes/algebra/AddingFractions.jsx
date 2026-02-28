import React, { useState, useMemo, useEffect } from "react";
import { useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { useLessonState } from "../../../../hooks";
import { InputOverlayPanel, EnterAnswerButton } from "../../../../shared/components";
import ExplanationModal from "../geometry/ExplanationModal";
import { useInputOverlay } from "../geometry/hooks/useInputOverlay";
import FractionKeypad from "./components/FractionKeypad";
import styled from "styled-components";
import { Stage, Layer, Rect, Text, Line, Group } from "react-konva";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Same Denominator", instruction: "Add the fractions. The denominators are already the same!" },
  2: { title: "Related Denominators", instruction: "One denominator divides the other. Convert, then add." },
  3: { title: "Different Denominators", instruction: "Find the LCD, convert both fractions, then add." },
  4: { title: "Word Problems", instruction: "Read the problem and add the fractions." },
};

const BAR_COLORS = { fraction1: "#3B82F6", fraction2: "#EF4444", result: "#10B981" };

// ==================== FRACTION BAR RENDERER ====================

function FractionBar({ x, y, barWidth, barHeight, numerator, denominator, color, konvaTheme, label, scale }) {
  const segW = barWidth / denominator;
  return (
    <Group>
      {/* Filled segments */}
      {Array.from({ length: numerator }).map((_, i) => (
        <Rect
          key={`fill-${i}`}
          x={x + i * segW + 0.5}
          y={y + 0.5}
          width={segW - 1}
          height={barHeight - 1}
          fill={color}
          opacity={0.45}
        />
      ))}
      {/* Outer border */}
      <Rect
        x={x}
        y={y}
        width={barWidth}
        height={barHeight}
        stroke={konvaTheme.shapeStroke}
        strokeWidth={1.5}
        cornerRadius={3}
      />
      {/* Divider lines */}
      {Array.from({ length: denominator - 1 }).map((_, i) => (
        <Line
          key={`div-${i}`}
          points={[x + (i + 1) * segW, y, x + (i + 1) * segW, y + barHeight]}
          stroke={konvaTheme.shapeStroke}
          strokeWidth={1}
          opacity={0.5}
        />
      ))}
      {/* Label */}
      <Text
        x={x + barWidth + 12 * scale}
        y={y + barHeight / 2 - 9 * scale}
        text={label || `${numerator}/${denominator}`}
        fontSize={16 * scale}
        fontStyle="bold"
        fill={konvaTheme.labelText}
      />
    </Group>
  );
}

// ==================== MAIN COMPONENT ====================

function AddingFractions({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  // InputOverlay system hook
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

  // Modal tracking (v2.0 pattern)
  const [isComplete, setIsComplete] = useState(false);
  const [modalClosedWithX, setModalClosedWithX] = useState(false);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level,
    fraction1,
    fraction2,
    converted1,
    converted2,
    result,
    simplified,
    commonDenominator,
    conversion,
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (Array.isArray(currentProblem?.answer)) return currentProblem.answer;
    return [String(currentProblem?.answer || "")];
  }, [currentProblem]);

  // Calculate slide distance based on panel width (75% of panel width)
  const slideDistance = useMemo(() => {
    if (windowWidth <= 768) return 0; // Mobile: no slide
    const panelWidth = Math.min(Math.max(windowWidth * 0.4, 360), 480);
    return panelWidth * 0.75; // 75% of panel width
  }, [windowWidth]);

  // Validate answer
  const isCorrect = useMemo(() => {
    const acceptedAnswers = currentProblem?.acceptedAnswers || correctAnswer || [];
    return acceptedAnswers.includes(inputValue.trim());
  }, [inputValue, currentProblem, correctAnswer]);

  // Auto-show modal on correct answer OR auto-advance if keepOpen is ON
  useEffect(() => {
    if (isCorrect && submitted) {
      if (keepOpen) {
        // Keep Open mode: skip modal, auto-advance after 1 second
        const timer = setTimeout(() => {
          // Clear input and reset for next problem
          setInputValue('');
          setSubmitted(false);
          setModalClosedWithX(false);
          // Advance to next problem
          triggerNewProblem();
        }, 1000); // 1 second delay
        return () => clearTimeout(timer);
      } else {
        // Normal mode: close panel and show modal after 500ms
        closePanel();
        const timer = setTimeout(() => {
          if (!modalClosedWithX) {
            setIsComplete(true);
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isCorrect, submitted, modalClosedWithX, keepOpen, closePanel, setInputValue, setSubmitted, triggerNewProblem]);

  // Reset on problem change
  useEffect(() => {
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
  }, [currentQuestionIndex, keepOpen, resetAll, setInputValue, setSubmitted]);

  // Handlers
  const handleSubmit = () => {
    if (inputValue.trim() === '') return;
    setSubmitted(true);
  };

  const handleClose = () => {
    setIsComplete(false);
    setModalClosedWithX(true); // Mark as manually closed
  };

  const handleTryAnother = () => {
    setIsComplete(false);
    setModalClosedWithX(false); // Reset flag
    resetAll();
    hideAnswer();
    triggerNewProblem();
  };

  const handleNextProblem = () => {
    resetAll();
    triggerNewProblem();
  };

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];
  const hasConversion = conversion !== null && conversion !== undefined;

  // Canvas sizing (NO panelOpen dependency!)
  const canvasWidth = useMemo(() => {
    return Math.min(windowWidth - 40, 700);
  }, [windowWidth]);

  const canvasHeight = useMemo(() => {
    const base = hasConversion ? 390 : 220;
    if (windowWidth <= 1024 && hasConversion) return 350;
    if (windowWidth <= 1024 && !hasConversion) return 200;
    return base;
  }, [hasConversion, windowWidth]);

  const scale = canvasWidth / 700;
  const barWidth = canvasWidth * 0.55;
  const barHeight = 32 * scale;
  const leftPad = (canvasWidth - barWidth) / 2;

  if (!currentProblem || !fraction1) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  // Build the bars to render
  const bars = [];
  let curY = 25 * scale;
  const gap = 12 * scale;
  const sectionGap = 90 * scale;

  if (hasConversion) {
    // Show original fractions at top
    bars.push({ y: curY, num: fraction1.numerator, den: fraction1.denominator, color: BAR_COLORS.fraction1, label: `${fraction1.numerator}/${fraction1.denominator}` });
    curY += barHeight + gap;
    bars.push({ y: curY, num: fraction2.numerator, den: fraction2.denominator, color: BAR_COLORS.fraction2, label: `${fraction2.numerator}/${fraction2.denominator}`, showPlus: true });
    curY += barHeight + sectionGap;

    // "Convert" label position
    const convertLabelY = curY;
    curY += 22 * scale;

    // Converted fractions
    bars.push({ y: curY, num: converted1.numerator, den: converted1.denominator, color: BAR_COLORS.fraction1, label: `${converted1.numerator}/${converted1.denominator}`, isConverted: true });
    curY += barHeight + gap;
    bars.push({ y: curY, num: converted2.numerator, den: converted2.denominator, color: BAR_COLORS.fraction2, label: `${converted2.numerator}/${converted2.denominator}`, showPlus: true, isConverted: true });
    curY += barHeight + sectionGap;

    // Result (shown on reveal)
    if (showAnswer) {
      const simpLabel = simplified.denominator === 1
        ? String(simplified.numerator)
        : `${simplified.numerator}/${simplified.denominator}`;
      const resultLabel = result.numerator !== simplified.numerator || result.denominator !== simplified.denominator
        ? `${result.numerator}/${result.denominator} = ${simpLabel}`
        : `${result.numerator}/${result.denominator}`;
      bars.push({ y: curY, num: result.numerator, den: result.denominator, color: BAR_COLORS.result, label: resultLabel, showEquals: true });
    }

    // Store convertLabelY for rendering
    bars.convertLabelY = convertLabelY;
  } else {
    // No conversion — just 3 bars
    bars.push({ y: curY, num: fraction1.numerator, den: fraction1.denominator, color: BAR_COLORS.fraction1, label: `${fraction1.numerator}/${fraction1.denominator}` });
    curY += barHeight + gap;
    bars.push({ y: curY, num: fraction2.numerator, den: fraction2.denominator, color: BAR_COLORS.fraction2, label: `${fraction2.numerator}/${fraction2.denominator}`, showPlus: true });
    curY += barHeight + sectionGap;

    if (showAnswer) {
      const simpLabel = simplified.denominator === 1
        ? String(simplified.numerator)
        : `${simplified.numerator}/${simplified.denominator}`;
      const resultLabel = result.numerator !== simplified.numerator || result.denominator !== simplified.denominator
        ? `${result.numerator}/${result.denominator} = ${simpLabel}`
        : `${result.numerator}/${result.denominator}`;
      bars.push({ y: curY, num: result.numerator, den: result.denominator, color: BAR_COLORS.result, label: resultLabel, showEquals: true });
    }
  }

  return (
    <Wrapper>
      {/* Wrapper with slide animation (wraps canvas and button) */}
      <CanvasWrapper $panelOpen={panelOpen} $slideDistance={slideDistance}>
        {/* Level header */}
        <LevelHeader>
          <LevelBadge>Level {level}</LevelBadge>
          <LevelTitle>{info.title}</LevelTitle>
        </LevelHeader>

        <InstructionText>{info.instruction}</InstructionText>

        {/* Question text */}
        <QuestionText>{questionText}</QuestionText>

        {/* Konva fraction bars */}
        <VisualSection>
          <Stage width={canvasWidth} height={Math.max(canvasHeight, (bars[bars.length - 1]?.y || 0) + barHeight + 30 * scale)}>
            <Layer>
              {/* Background */}
              <Rect x={0} y={0} width={canvasWidth} height={canvasHeight + 60 * scale} fill={konvaTheme.canvasBackground} />

              {/* Conversion label */}
              {hasConversion && bars.convertLabelY != null && (
                <Text
                  x={leftPad}
                  y={bars.convertLabelY}
                  text={`Convert to common denominator ${commonDenominator}:`}
                  fontSize={13 * scale}
                  fontStyle="italic"
                  fill={konvaTheme.labelText}
                  opacity={0.7}
                />
              )}

              {/* Bars */}
              {bars.filter(b => b && typeof b === "object" && b.y != null).map((bar, i) => (
                <Group key={i}>
                  {/* + or = sign */}
                  {bar.showPlus && (
                    <Text
                      x={leftPad - 30 * scale}
                      y={bar.y + barHeight / 2 - 10 * scale}
                      text="+"
                      fontSize={20 * scale}
                      fontStyle="bold"
                      fill={konvaTheme.labelText}
                    />
                  )}
                  {bar.showEquals && (
                    <Text
                      x={leftPad - 30 * scale}
                      y={bar.y + barHeight / 2 - 10 * scale}
                      text="="
                      fontSize={20 * scale}
                      fontStyle="bold"
                      fill={konvaTheme.labelText}
                    />
                  )}
                  <FractionBar
                    x={leftPad}
                    y={bar.y}
                    barWidth={barWidth}
                    barHeight={barHeight}
                    numerator={bar.num}
                    denominator={bar.den}
                    color={bar.color}
                    konvaTheme={konvaTheme}
                    label={bar.label}
                    scale={scale}
                  />
                </Group>
              ))}
            </Layer>
          </Stage>
        </VisualSection>

        {/* Static button below canvas */}
        {!panelOpen && (
          <ButtonContainer>
            {modalClosedWithX ? (
              <TryAnotherButton onClick={handleTryAnother}>
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
        title="Enter Your Answer"
      >
        <InputLabel>Answer (as a fraction):</InputLabel>
        <FractionKeypad
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          keepOpen={keepOpen}
          onKeepOpenChange={setKeepOpen}
        />

        {submitted && (
          <FeedbackSection $isCorrect={isCorrect}>
            {isCorrect ? (
              <FeedbackText>✓ Correct!</FeedbackText>
            ) : (
              <FeedbackText>Not quite. Try again!</FeedbackText>
            )}
          </FeedbackSection>
        )}

        <PanelButtonRow>
          <ResetButton onClick={() => { setInputValue(''); setSubmitted(false); }}>
            Clear
          </ResetButton>
        </PanelButtonRow>
      </InputOverlayPanel>

      {/* Explanation Modal */}
      {isComplete && (
        <ExplanationModal
          explanation={explanation}
          onClose={handleClose}
          onTryAnother={handleTryAnother}
        />
      )}
    </Wrapper>
  );
}

export default AddingFractions;

// ==================== STYLED COMPONENTS ====================

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 30px;
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const CanvasWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease-in-out;

  @media (min-width: 769px) {
    transform: translateX(${props => props.$panelOpen ? `-${props.$slideDistance}px` : '0'});
  }

  @media (max-width: 768px) {
    transform: translateX(0); // No slide on mobile
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
  padding: 0 16px;

  @media (max-width: 768px) {
    padding: 0 12px;
  }
`;

const LevelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  width: 100%;
  justify-content: center;
`;

const LevelBadge = styled.span`
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
`;

const LevelTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 22px;
  }
`;

const InstructionText = styled.p`
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 8px 0;
  max-width: 700px;
`;

const QuestionText = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  margin: 4px 0 12px 0;
  max-width: 700px;
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const InputLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 12px;
`;

const FeedbackSection = styled.div`
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${props => props.$isCorrect
    ? 'rgba(16, 185, 129, 0.1)'
    : 'rgba(239, 68, 68, 0.1)'};
  border: 2px solid ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess
    : props.theme.colors.buttonError || '#EF4444'};
`;

const FeedbackText = styled.div`
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  color: ${props => props.theme.colors.textPrimary};
`;

const PanelButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ResetButton = styled.button`
  flex: 1;
  min-height: 44px;
  padding: 10px 20px;
  background-color: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.textPrimary};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.theme.colors.cardBackgroundHover || props.theme.colors.cardBackground};
    border-color: ${props => props.theme.colors.borderHover || props.theme.colors.border};
  }
`;

const TryAnotherButton = styled.button`
  width: 100%;
  min-height: 56px;
  padding: 14px 32px;
  background-color: ${props => props.theme.colors.info};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.theme.colors.infoHover || props.theme.colors.info};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    min-height: 48px;
    font-size: 15px;
  }
`;
