import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Rect, Text, Line } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Read the Area Model", instruction: "" },
  2: { title: "Fill in the Missing Cell", instruction: "" },
  3: { title: "Find P(A and B)", instruction: "" },
  4: { title: "Combined Probability", instruction: "" },
  5: { title: "Word Problem", instruction: "" },
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

// ==================== HELPERS ====================

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function fractionStr(num, den) {
  const g = gcd(num, den);
  const sn = num / g;
  const sd = den / g;
  if (sd === 1) return String(sn);
  return `${sn}/${sd}`;
}

// ==================== AREA MODEL DIAGRAM ====================

function AreaModelDiagram({
  visualData,
  konvaTheme,
  canvasWidth,
  canvasHeight,
}) {
  const {
    level,
    grid,
    events,
    shadedCell,
    shadedCells,
    missingCell,
    showAllCells,
    targetCell,
  } = visualData;

  if (!grid || !events) return null;

  const bgColor = konvaTheme.canvasBackground || "#ffffff";
  const strokeColor = konvaTheme.shapeStroke || "#3B82F6";
  const textColor = konvaTheme.labelText || "#333333";
  const highlightColor = konvaTheme.shapeHighlight || "#00BF63";
  const accentColor = konvaTheme.shapeDilated || "#8B5CF6";

  // Layout constants
  const headerW = 90;  // width for row headers
  const headerH = 50;  // height for column headers
  const padding = 20;
  const gridW = canvasWidth - headerW - padding * 2;
  const gridH = canvasHeight - headerH - padding * 2 - 20;
  const cellW = gridW / 2;
  const cellH = gridH / 2;
  const gridX = padding + headerW;
  const gridY = padding + headerH;

  // Determine which cells are shaded
  const isCellShaded = (r, c) => {
    if (shadedCell && shadedCell.row === r && shadedCell.col === c) return true;
    if (shadedCells) return shadedCells.some((sc) => sc.row === r && sc.col === c);
    if (targetCell && targetCell.row === r && targetCell.col === c) return true;
    return false;
  };

  const isCellMissing = (r, c) => {
    return missingCell && missingCell.row === r && missingCell.col === c;
  };

  const fontSize = Math.min(14, canvasWidth / 30);
  const cellFontSize = Math.min(16, canvasWidth / 25);

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* Background */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {/* Column headers (Event A outcomes) */}
        {events.a.outcomes.map((outcome, i) => (
          <React.Fragment key={`col-${i}`}>
            <Text
              x={gridX + i * cellW}
              y={padding + 2}
              width={cellW}
              align="center"
              text={outcome}
              fontSize={fontSize}
              fontStyle="bold"
              fill={strokeColor}
              listening={false}
            />
            <Text
              x={gridX + i * cellW}
              y={padding + 18}
              width={cellW}
              align="center"
              text={fractionStr(events.a.probs[i].num, events.a.probs[i].den)}
              fontSize={fontSize}
              fill={textColor}
              listening={false}
            />
          </React.Fragment>
        ))}

        {/* Row headers (Event B outcomes) */}
        {events.b.outcomes.map((outcome, i) => (
          <React.Fragment key={`row-${i}`}>
            <Text
              x={padding}
              y={gridY + i * cellH + cellH / 2 - 16}
              width={headerW - 8}
              align="center"
              text={outcome}
              fontSize={fontSize}
              fontStyle="bold"
              fill={accentColor}
              listening={false}
            />
            <Text
              x={padding}
              y={gridY + i * cellH + cellH / 2 + 2}
              width={headerW - 8}
              align="center"
              text={fractionStr(events.b.probs[i].num, events.b.probs[i].den)}
              fontSize={fontSize}
              fill={textColor}
              listening={false}
            />
          </React.Fragment>
        ))}

        {/* Event labels */}
        <Text
          x={gridX}
          y={padding - 12}
          width={gridW}
          align="center"
          text={events.a.label}
          fontSize={fontSize - 1}
          fill={strokeColor}
          fontStyle="bold"
          listening={false}
        />
        <Text
          x={padding - 5}
          y={gridY - 12}
          width={headerW}
          align="center"
          text={events.b.label}
          fontSize={fontSize - 1}
          fill={accentColor}
          fontStyle="bold"
          listening={false}
        />

        {/* Grid cells */}
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const x = gridX + c * cellW;
            const y = gridY + r * cellH;
            const shaded = isCellShaded(r, c);
            const missing = isCellMissing(r, c);
            const showValue = showAllCells && !missing;

            return (
              <React.Fragment key={`cell-${r}-${c}`}>
                {/* Cell background */}
                <Rect
                  x={x}
                  y={y}
                  width={cellW}
                  height={cellH}
                  fill={shaded ? `${highlightColor}30` : "transparent"}
                  stroke={strokeColor}
                  strokeWidth={2}
                  listening={false}
                />

                {/* Cell value */}
                {showValue && (
                  <Text
                    x={x}
                    y={y + cellH / 2 - cellFontSize / 2}
                    width={cellW}
                    align="center"
                    text={fractionStr(cell.num, cell.den)}
                    fontSize={cellFontSize}
                    fontStyle="bold"
                    fill={shaded ? highlightColor : textColor}
                    listening={false}
                  />
                )}

                {/* Missing cell placeholder */}
                {missing && (
                  <Text
                    x={x}
                    y={y + cellH / 2 - 14}
                    width={cellW}
                    align="center"
                    text="?"
                    fontSize={28}
                    fontStyle="bold"
                    fill={highlightColor}
                    listening={false}
                  />
                )}

                {/* Empty cell for L3/L5 */}
                {!showAllCells && !missing && (
                  <Text
                    x={x}
                    y={y + cellH / 2 - cellFontSize / 2}
                    width={cellW}
                    align="center"
                    text={isCellShaded(r, c) ? "?" : ""}
                    fontSize={cellFontSize}
                    fontStyle="bold"
                    fill={highlightColor}
                    listening={false}
                  />
                )}
              </React.Fragment>
            );
          })
        )}
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function ProbabilityAreaModelLesson({ triggerNewProblem }) {
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

  // Phase state for MC levels (L1, L2)
  const [phase, setPhase] = useState("interact");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    choices = [],
    educationalNote = "",
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
  const isMCLevel = level <= 2;

  // Canvas sizing
  const canvasWidth = Math.min(windowWidth - 40, 500);
  const canvasHeight = canvasWidth * 0.7;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${JSON.stringify(visualData.events?.a?.probs?.[0] || {})}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  // MC choice handler (L1, L2)
  const handleChoiceClick = useCallback((choice, idx) => {
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
  }, [phase, shakingIdx, revealAnswer]);

  if (!currentProblem?.visualData) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

  return (
    <Wrapper>
      {/* Hint Button */}
      {!showAnswer && phase !== "complete" && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level Header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{levelInfo.title}</LevelTitle>
      </LevelHeader>

      {/* Question */}
      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      {/* Konva Area Model */}
      <VisualSection>
        <AreaModelDiagram
          visualData={visualData}
          konvaTheme={konvaTheme}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      </VisualSection>

      {/* Hint */}
      {showHint && hint && <HintBox>{hint}</HintBox>}

      {/* ===== MC Levels (L1, L2) ===== */}
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
                  {isCorrectSelected && " \u2713"}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        </ChooseSection>
      )}

      {/* ===== Input Levels (L3, L4, L5) ===== */}
      {!isMCLevel && !showAnswer && (
        <InteractionSection>
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="Enter fraction (e.g. 1/6)"
          />
        </InteractionSection>
      )}

      {/* ===== MC Complete Phase ===== */}
      {isMCLevel && phase === "complete" && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another
          </TryAnotherButton>
        </ExplanationSection>
      )}

      {/* ===== Input Answer Revealed ===== */}
      {!isMCLevel && showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default ProbabilityAreaModelLesson;

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
  margin: 0;
  max-width: 600px;
  margin: 0 auto;

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
