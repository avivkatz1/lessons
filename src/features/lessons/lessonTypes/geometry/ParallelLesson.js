import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Rect, Text, Arrow } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Identify Parallel Lines" },
  2: { title: "Match Parallel Pairs" },
  3: { title: "Make Lines Parallel" },
  4: { title: "Equations - Identify" },
  5: { title: "Equations - Find Parallel" },
};

// ==================== ANIMATIONS ====================

const shakeAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
`;

const fadeInAnim = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ==================== HELPER FUNCTIONS ====================

function mathToCanvas(mathX, mathY, canvasWidth, canvasHeight) {
  const scale = 30;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  return {
    x: centerX + mathX * scale,
    y: centerY - mathY * scale,
  };
}

// ==================== LINES CANVAS COMPONENT ====================

function LinesCanvas({ visualData, konvaTheme, canvasWidth, canvasHeight, onLineClick, selectedLines, isCorrect }) {
  const [hoveredLine, setHoveredLine] = useState(null);

  if (!visualData || !visualData.lines) return null;

  const { lines, showArrows = true } = visualData;
  const bgColor = konvaTheme.canvasBackground || "#ffffff";

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {lines.map((line, idx) => {
          const p1 = mathToCanvas(line.x1, line.y1, canvasWidth, canvasHeight);
          const p2 = mathToCanvas(line.x2, line.y2, canvasWidth, canvasHeight);

          const isSelected = selectedLines.includes(line.color);
          const isHovered = hoveredLine === idx;
          const strokeWidth = isSelected || isHovered ? 6 : 4;

          const lineColor = isSelected
            ? (isCorrect === true ? "#10B981" : isCorrect === false ? "#EF4444" : line.color)
            : line.color;

          return (
            <Arrow
              key={idx}
              points={[p1.x, p1.y, p2.x, p2.y]}
              stroke={lineColor}
              strokeWidth={strokeWidth}
              fill={lineColor}
              pointerLength={showArrows ? 12 : 0}
              pointerWidth={showArrows ? 12 : 0}
              onClick={() => onLineClick && onLineClick(line.color)}
              onTap={() => onLineClick && onLineClick(line.color)}
              onMouseEnter={() => setHoveredLine(idx)}
              onMouseLeave={() => setHoveredLine(null)}
              hitStrokeWidth={20}
              listening={!!onLineClick}
              opacity={isSelected || isHovered ? 1 : 0.8}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}

// ==================== ADJUSTABLE LINE COMPONENT ====================

function AdjustableLineCanvas({ visualData, konvaTheme, canvasWidth, canvasHeight, currentSlope, onSlopeChange }) {
  if (!visualData) return null;

  const { targetLine, adjustableLine, targetSlope } = visualData;
  const bgColor = konvaTheme.canvasBackground || "#ffffff";

  const targetP1 = mathToCanvas(targetLine.x1, targetLine.y1, canvasWidth, canvasHeight);
  const targetP2 = mathToCanvas(targetLine.x2, targetLine.y2, canvasWidth, canvasHeight);

  // Recalculate adjustable line with current slope
  const adjY1 = currentSlope * adjustableLine.x1 + adjustableLine.yIntercept;
  const adjY2 = currentSlope * adjustableLine.x2 + adjustableLine.yIntercept;
  const adjP1 = mathToCanvas(adjustableLine.x1, adjY1, canvasWidth, canvasHeight);
  const adjP2 = mathToCanvas(adjustableLine.x2, adjY2, canvasWidth, canvasHeight);

  const isParallel = Math.abs(currentSlope - targetSlope) < 0.01;

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {/* Target line (red) */}
        <Arrow
          points={[targetP1.x, targetP1.y, targetP2.x, targetP2.y]}
          stroke={targetLine.color}
          strokeWidth={4}
          fill={targetLine.color}
          pointerLength={12}
          pointerWidth={12}
        />

        {/* Target line label */}
        <Text
          x={targetP1.x - 80}
          y={targetP1.y - 20}
          text="RED (target)"
          fontSize={14}
          fill={konvaTheme.labelText}
          fontStyle="bold"
        />

        {/* Adjustable line (blue or green when correct) */}
        <Arrow
          points={[adjP1.x, adjP1.y, adjP2.x, adjP2.y]}
          stroke={isParallel ? "#10B981" : adjustableLine.color}
          strokeWidth={4}
          fill={isParallel ? "#10B981" : adjustableLine.color}
          pointerLength={12}
          pointerWidth={12}
        />

        {/* Adjustable line label */}
        <Text
          x={adjP1.x - 80}
          y={adjP1.y + 10}
          text={isParallel ? "BLUE (parallel!)" : "BLUE (adjust)"}
          fontSize={14}
          fill={konvaTheme.labelText}
          fontStyle="bold"
        />

        {/* Slope display */}
        <Text
          x={canvasWidth / 2 - 60}
          y={canvasHeight - 40}
          text={`Current slope: ${currentSlope.toFixed(2)}`}
          fontSize={16}
          fill={konvaTheme.labelText}
          fontStyle="bold"
        />

        {isParallel && (
          <Text
            x={canvasWidth / 2 - 50}
            y={20}
            text="✓ Lines are parallel!"
            fontSize={18}
            fill="#10B981"
            fontStyle="bold"
          />
        )}
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function ParallelLesson({ triggerNewProblem }) {
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
  const [showHint, setShowHint] = useState(false);

  const [phase, setPhase] = useState("interact");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);

  // Level 1-2: Line clicking
  const [selectedLines, setSelectedLines] = useState([]);
  const [lineClickCorrect, setLineClickCorrect] = useState(null);

  // Level 3: Slope adjustment
  const [currentSlope, setCurrentSlope] = useState(0);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = useMemo(() => currentProblem?.visualData || {}, [currentProblem?.visualData]);
  const {
    level = 1,
    questionType,
    choices = [],
    educationalNote = "",
    correctColors,
    correctColor,
    targetSlope,
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (Array.isArray(currentProblem?.answer)) return currentProblem.answer;
    return [String(currentProblem?.answer || "")];
  }, [currentProblem?.answer, currentProblem?.acceptedAnswers]);

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];
  const isEquationLevel = level >= 4;
  const isMCLevel = (level === 1 && questionType === 'yes_no') || level === 4;

  const canvasWidth = Math.min(windowWidth - 40, 500);
  const canvasHeight = 400;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${questionType}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
    setSelectedLines([]);
    setLineClickCorrect(null);
    setCurrentSlope(visualData.startSlope || 0);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setSelectedLines([]);
    setLineClickCorrect(null);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  const handleLineClick = useCallback((color) => {
    if (phase !== "interact") return;

    if (questionType === 'click_parallel') {
      // Select up to 2 lines
      const newSelection = selectedLines.includes(color)
        ? selectedLines.filter(c => c !== color)
        : selectedLines.length < 2
        ? [...selectedLines, color]
        : [selectedLines[1], color];

      setSelectedLines(newSelection);

      if (newSelection.length === 2) {
        const sorted = newSelection.slice().sort();
        const correct = correctColors?.slice().sort();
        const isCorrect = JSON.stringify(sorted) === JSON.stringify(correct);

        setLineClickCorrect(isCorrect);

        if (isCorrect) {
          setTimeout(() => {
            setPhase("complete");
            revealAnswer();
          }, 1000);
        } else {
          setWrongAttempts(prev => prev + 1);
          setTimeout(() => {
            setSelectedLines([]);
            setLineClickCorrect(null);
          }, 1500);
        }
      }
    } else if (questionType === 'match_to_line') {
      setSelectedLines([color]);
      const isCorrect = color === correctColor;
      setLineClickCorrect(isCorrect);

      if (isCorrect) {
        setTimeout(() => {
          setPhase("complete");
          revealAnswer();
        }, 800);
      } else {
        setWrongAttempts(prev => prev + 1);
        setTimeout(() => {
          setSelectedLines([]);
          setLineClickCorrect(null);
        }, 1000);
      }
    }
  }, [phase, questionType, selectedLines, correctColors, correctColor, revealAnswer]);

  const handleSlopeChange = useCallback((delta) => {
    setCurrentSlope(prev => {
      const newSlope = Math.round((prev + delta) * 10) / 10;
      return newSlope;
    });
  }, []);

  const handleSlopeSubmit = useCallback(() => {
    const isCorrect = Math.abs(currentSlope - targetSlope) < 0.1;

    if (isCorrect) {
      setPhase("complete");
      revealAnswer();
    } else {
      setWrongAttempts(prev => prev + 1);
    }
  }, [currentSlope, targetSlope, revealAnswer]);

  const handleChoiceClick = useCallback(
    (choice, idx) => {
      if (phase !== "interact" || shakingIdx !== null) return;
      if (choice.correct) {
        setSelectedChoice(idx);
        setTimeout(() => {
          setPhase("complete");
          revealAnswer();
        }, 800);
      } else {
        setShakingIdx(idx);
        setWrongAttempts((prev) => prev + 1);
        setTimeout(() => setShakingIdx(null), 600);
      }
    },
    [phase, shakingIdx, revealAnswer]
  );

  if (!currentProblem?.visualData) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {!showAnswer && phase !== "complete" && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>Need a hint?</TopHintButton>
      )}

      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{levelInfo.title}</LevelTitle>
      </LevelHeader>

      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      {showHint && hint && <HintBox>{hint}</HintBox>}

      {/* Visual Section for Levels 1-3 */}
      {!isEquationLevel && (
        <VisualSection>
          {questionType === 'adjust_slope' ? (
            <AdjustableLineCanvas
              visualData={visualData}
              konvaTheme={konvaTheme}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              currentSlope={currentSlope}
              onSlopeChange={handleSlopeChange}
            />
          ) : (
            <LinesCanvas
              visualData={visualData}
              konvaTheme={konvaTheme}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              onLineClick={handleLineClick}
              selectedLines={selectedLines}
              isCorrect={lineClickCorrect}
            />
          )}
        </VisualSection>
      )}

      {/* Slope adjustment controls for Level 3 */}
      {questionType === 'adjust_slope' && phase === "interact" && (
        <SlopeControls>
          <SlopeButton onClick={() => handleSlopeChange(-0.5)}>Slope - 0.5</SlopeButton>
          <SlopeButton onClick={() => handleSlopeChange(-0.1)}>Slope - 0.1</SlopeButton>
          <SlopeButton onClick={() => handleSlopeChange(0.1)}>Slope + 0.1</SlopeButton>
          <SlopeButton onClick={() => handleSlopeChange(0.5)}>Slope + 0.5</SlopeButton>
          <SubmitButton onClick={handleSlopeSubmit}>Check if Parallel</SubmitButton>
        </SlopeControls>
      )}

      {/* Feedback for line clicking */}
      {!isEquationLevel && wrongAttempts > 0 && !lineClickCorrect && selectedLines.length === 0 && (
        <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
      )}

      {/* Multiple choice for some levels */}
      {isMCLevel && phase === "interact" && choices.length > 0 && (
        <ChooseSection>
          {wrongAttempts > 0 && shakingIdx === null && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}
          <ChoiceGrid>
            {choices.map((choice, idx) => {
              const isSelected = selectedChoice === idx;
              const isCorrectSelected = isSelected && choice.correct;
              const isShaking = shakingIdx === idx;
              const isFaded = selectedChoice !== null && !isSelected;
              return (
                <ChoiceButton
                  key={idx}
                  $correct={isCorrectSelected}
                  $wrong={isShaking}
                  $fadeOut={isFaded}
                  onClick={() => handleChoiceClick(choice, idx)}
                  disabled={selectedChoice !== null || isShaking}
                >
                  {choice.text}
                  {isCorrectSelected && " ✓"}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        </ChooseSection>
      )}

      {/* Input for levels 5 */}
      {level === 5 && !showAnswer && (
        <InteractionSection>
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="Enter equation (e.g. y = 2x + 3)"
          />
        </InteractionSection>
      )}

      {/* Explanation on completion */}
      {phase === "complete" && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
          <TryAnotherButton onClick={handleTryAnother}>Try Another</TryAnotherButton>
        </ExplanationSection>
      )}

      {/* Explanation for input levels */}
      {level === 5 && showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default ParallelLesson;

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

const QuestionSection = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 12px;
`;

const QuestionText = styled.p`
  font-size: 17px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin: 0 auto;
  max-width: 600px;
  white-space: pre-line;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SlopeControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
`;

const SlopeButton = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.cardBackground};
  color: ${(props) => props.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.colors.hoverBackground};
  }
`;

const SubmitButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  flex-basis: 100%;

  &:hover {
    opacity: 0.9;
  }
`;

const ChooseSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: ${fadeInAnim} 0.3s ease;
`;

const ChoiceGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 420px;
  margin-top: 4px;
`;

const ChoiceButton = styled.button`
  width: 100%;
  padding: 13px 20px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  border: 2px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.cardBackground};
  color: ${(props) => props.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.hoverBackground};
    border-color: ${(props) => props.theme.colors.info || "#3B82F6"};
  }

  ${(props) =>
    props.$correct &&
    css`
      background-color: ${props.theme.colors.buttonSuccess}20;
      border-color: ${props.theme.colors.buttonSuccess};
      color: ${props.theme.colors.buttonSuccess};
      cursor: default;
    `}

  ${(props) =>
    props.$wrong &&
    css`
      animation: ${shakeAnim} 0.5s ease;
      background-color: ${props.theme.colors.danger || "#E53E3E"}15;
      border-color: ${props.theme.colors.danger || "#E53E3E"};
    `}

  ${(props) =>
    props.$fadeOut &&
    css`
      opacity: 0;
      transform: scale(0.95);
      pointer-events: none;
      transition: all 0.4s ease;
    `}

  &:disabled {
    cursor: default;
  }
`;

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const FeedbackText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) =>
    props.$isWrong
      ? props.theme.colors.danger || "#E53E3E"
      : props.theme.colors.buttonSuccess};
  margin: 0;
`;

const ExplanationSection = styled.div`
  width: 100%;
  max-width: 600px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${fadeInAnim} 0.4s ease;
`;

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.buttonSuccess};
  margin: 0;
`;

const EducationalNote = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  line-height: 1.6;
  margin: 0;
  max-width: 500px;
`;

const ExplanationDetail = styled.p`
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  line-height: 1.5;
  margin: 0;
  max-width: 500px;
  white-space: pre-line;
`;

const TryAnotherButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  touch-action: manipulation;
  &:hover {
    opacity: 0.9;
  }
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  &:hover {
    background: ${(props) => props.theme.colors.hoverBackground};
  }
  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
    padding: 6px 12px;
    font-size: 13px;
  }
  @media (max-width: 768px) {
    top: 10px;
    right: 12px;
    padding: 5px 10px;
    font-size: 12px;
  }
`;

const HintBox = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-left: 4px solid ${(props) => props.theme.colors.warning || "#f6ad55"};
  padding: 14px 16px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 12px;
`;
