import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Rect, Text, Line, Circle, Arc } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Identify Rise & Run" },
  2: { title: "Compute Slope" },
  3: { title: "Slope from Coordinates" },
  4: { title: "Slope is Constant" },
  5: { title: "Bridge to Tangent" },
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
  if (den === 0) return "0";
  const sign = (num < 0) !== (den < 0) ? -1 : 1;
  const an = Math.abs(num);
  const ad = Math.abs(den);
  const g = gcd(an, ad);
  const sn = sign * (an / g);
  const sd = ad / g;
  if (sd === 1) return String(sn);
  return `${sn}/${sd}`;
}

// ==================== SLOPE GRID DIAGRAM ====================

function SlopeGrid({ visualData, konvaTheme, canvasWidth, canvasHeight }) {
  const {
    level,
    points = [],
    rise,
    run,
    triangles,
    showTriangle,
    showRiseRunLabels,
    showAngle,
    angle,
    rise12,
    run12,
    rise23,
    run23,
  } = visualData;

  if (!points || points.length === 0) return null;

  const bgColor = konvaTheme.canvasBackground || "#ffffff";
  const gridColor = konvaTheme.gridStrokeLight || "#e2e8f0";
  const axisColor = konvaTheme.gridStroke || "#718096";
  const textColor = konvaTheme.labelText || "#333333";
  const riseColor = "#3B82F6"; // blue
  const runColor = "#22C55E";  // green
  const lineColor = "#EF4444"; // red
  const pointColor = konvaTheme.shapeStroke || "#1a202c";
  const orangeColor = "#F97316"; // for second triangle in L4

  // Grid setup: range [-6, 6] with padding
  const gridMin = -6;
  const gridMax = 6;
  const gridRange = gridMax - gridMin;
  const padding = 35;
  const gridSize = canvasWidth - padding * 2;
  const cellSize = gridSize / gridRange;

  // Convert math coords to canvas pixel coords
  const toPixelX = (x) => padding + (x - gridMin) * cellSize;
  const toPixelY = (y) => padding + (gridMax - y) * cellSize; // flip Y

  const fontSize = Math.max(10, Math.min(13, canvasWidth / 42));

  // Helper to draw a single slope triangle between two points
  const renderTriangle = (p1, p2, riseVal, runVal, color, showLabels, key) => {
    const px1 = toPixelX(p1.x);
    const py1 = toPixelY(p1.y);
    const px2 = toPixelX(p2.x);
    const py2 = toPixelY(p2.y);
    // Corner of the right angle (same x as p2, same y as p1)
    const cornerX = toPixelX(p2.x);
    const cornerY = toPixelY(p1.y);

    return (
      <React.Fragment key={key}>
        {/* Hypotenuse (line from p1 to p2) */}
        <Line
          points={[px1, py1, px2, py2]}
          stroke={color === "orange" ? orangeColor : lineColor}
          strokeWidth={2.5}
          listening={false}
        />
        {/* Rise (vertical from p2 to corner) */}
        <Line
          points={[cornerX, cornerY, cornerX, py2]}
          stroke={color === "orange" ? orangeColor : riseColor}
          strokeWidth={4}
          opacity={0.6}
          listening={false}
        />
        {/* Run (horizontal from p1 to corner) */}
        <Line
          points={[px1, cornerY, cornerX, cornerY]}
          stroke={color === "orange" ? orangeColor : runColor}
          strokeWidth={4}
          opacity={0.6}
          listening={false}
        />
        {/* Rise label */}
        {showLabels && (
          <Text
            x={cornerX + 6}
            y={(cornerY + py2) / 2 - fontSize / 2}
            text={`${riseVal}`}
            fontSize={fontSize + 2}
            fontStyle="bold"
            fill={color === "orange" ? orangeColor : riseColor}
            listening={false}
          />
        )}
        {/* Run label */}
        {showLabels && (
          <Text
            x={(px1 + cornerX) / 2 - 8}
            y={cornerY + 6}
            text={`${runVal}`}
            fontSize={fontSize + 2}
            fontStyle="bold"
            fill={color === "orange" ? orangeColor : runColor}
            listening={false}
          />
        )}
      </React.Fragment>
    );
  };

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* Background */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {/* Grid lines */}
        {Array.from({ length: gridRange + 1 }, (_, i) => {
          const coord = gridMin + i;
          const px = toPixelX(coord);
          const py = toPixelY(coord);
          const isAxis = coord === 0;
          return (
            <React.Fragment key={`grid-${i}`}>
              {/* Vertical grid line */}
              <Line
                points={[px, padding, px, canvasHeight - padding]}
                stroke={isAxis ? axisColor : gridColor}
                strokeWidth={isAxis ? 2 : 0.5}
                listening={false}
              />
              {/* Horizontal grid line */}
              <Line
                points={[padding, py, canvasWidth - padding, py]}
                stroke={isAxis ? axisColor : gridColor}
                strokeWidth={isAxis ? 2 : 0.5}
                listening={false}
              />
              {/* X-axis tick labels (skip 0 to avoid clutter) */}
              {coord !== 0 && coord % 2 === 0 && (
                <Text
                  x={px - 6}
                  y={toPixelY(0) + 5}
                  text={String(coord)}
                  fontSize={fontSize - 2}
                  fill={textColor}
                  listening={false}
                />
              )}
              {/* Y-axis tick labels */}
              {coord !== 0 && coord % 2 === 0 && (
                <Text
                  x={toPixelX(0) - 18}
                  y={py - 5}
                  text={String(coord)}
                  fontSize={fontSize - 2}
                  fill={textColor}
                  listening={false}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Slope triangles */}
        {showTriangle && level !== 4 && points.length >= 2 && (
          renderTriangle(
            points[0], points[1], rise, run,
            "blue", showRiseRunLabels, "tri-main"
          )
        )}

        {/* Level 4: Two triangles on the same line */}
        {showTriangle && level === 4 && triangles && points.length >= 3 && (
          <>
            {renderTriangle(
              points[triangles[0].from], points[triangles[0].to],
              rise12, run12, "blue", showRiseRunLabels, "tri-1"
            )}
            {renderTriangle(
              points[triangles[1].from], points[triangles[1].to],
              rise23, run23, "orange", showRiseRunLabels, "tri-2"
            )}
            {/* Extended line through all 3 points */}
            <Line
              points={[
                toPixelX(points[0].x - (points[2].x - points[0].x) * 0.3),
                toPixelY(points[0].y - (points[2].y - points[0].y) * 0.3),
                toPixelX(points[2].x + (points[2].x - points[0].x) * 0.3),
                toPixelY(points[2].y + (points[2].y - points[0].y) * 0.3),
              ]}
              stroke={textColor}
              strokeWidth={1}
              opacity={0.3}
              dash={[6, 4]}
              listening={false}
            />
          </>
        )}

        {/* Level 5: Angle arc */}
        {showAngle && angle && points.length >= 2 && (
          <Arc
            x={toPixelX(points[0].x)}
            y={toPixelY(points[0].y)}
            innerRadius={0}
            outerRadius={cellSize * 1.2}
            angle={-angle}
            rotation={0}
            fill={`${lineColor}20`}
            stroke={lineColor}
            strokeWidth={1.5}
            listening={false}
          />
        )}
        {showAngle && angle && (
          <Text
            x={toPixelX(points[0].x) + cellSize * 1.3}
            y={toPixelY(points[0].y) - fontSize - 4}
            text={`${angle}°`}
            fontSize={fontSize + 1}
            fontStyle="bold"
            fill={lineColor}
            listening={false}
          />
        )}

        {/* Points */}
        {points.map((pt, i) => (
          <React.Fragment key={`pt-${i}`}>
            <Circle
              x={toPixelX(pt.x)}
              y={toPixelY(pt.y)}
              radius={5}
              fill={pointColor}
              listening={false}
            />
            <Text
              x={toPixelX(pt.x) + 8}
              y={toPixelY(pt.y) - fontSize - 6}
              text={`${pt.label}(${pt.x}, ${pt.y})`}
              fontSize={fontSize}
              fontStyle="bold"
              fill={pointColor}
              listening={false}
            />
          </React.Fragment>
        ))}
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function SlopeTrianglesLesson({ triggerNewProblem }) {
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
  const canvasHeight = canvasWidth * 0.8;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${JSON.stringify(visualData.points?.[0] || 0)}`;
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
      {!showAnswer && phase !== "complete" && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{levelInfo.title}</LevelTitle>
      </LevelHeader>

      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      <VisualSection>
        <SlopeGrid
          visualData={visualData}
          konvaTheme={konvaTheme}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      </VisualSection>

      {showHint && hint && <HintBox>{hint}</HintBox>}

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

      {!isMCLevel && !showAnswer && (
        <InteractionSection>
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="Enter slope (e.g. 3/2 or 45)"
          />
        </InteractionSection>
      )}

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

export default SlopeTrianglesLesson;

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
