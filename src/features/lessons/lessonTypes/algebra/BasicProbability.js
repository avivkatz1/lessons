import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { useLessonState } from "../../../../hooks";
import { useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, Rect, Circle, Text, Line, Wedge, Group } from "react-konva";

// ==================== KONVA SUB-RENDERERS ====================

// Pip layouts for die faces (normalized 0-1 coordinates)
const PIP_LAYOUTS = {
  "1": [[0.5, 0.5]],
  "2": [[0.25, 0.25], [0.75, 0.75]],
  "3": [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  "4": [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  "5": [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  "6": [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
};

function MarbleBagVisual({ visualData, canvasWidth, canvasHeight, konvaTheme }) {
  const { marbles, targetColor, targetHex, total } = visualData;

  const bagPadding = 30;
  const bagWidth = canvasWidth - bagPadding * 2;
  const bagHeight = canvasHeight - 80;
  const bagX = bagPadding;
  const bagY = 20;

  // Grid layout for marbles
  const cols = Math.ceil(Math.sqrt(total * 1.5));
  const rows = Math.ceil(total / cols);
  const marbleRadius = Math.min(22, (bagWidth - 40) / (cols * 2.8));
  const spacingX = (bagWidth - 40) / (cols + 1);
  const spacingY = (bagHeight - 40) / (rows + 1);

  return (
    <>
      {/* Bag body */}
      <Rect
        x={bagX}
        y={bagY}
        width={bagWidth}
        height={bagHeight}
        cornerRadius={20}
        fill={konvaTheme.canvasBackground}
        stroke={konvaTheme.shapeStroke}
        strokeWidth={3}
        opacity={0.9}
      />
      {/* Bag opening */}
      <Line
        points={[bagX + 30, bagY, bagX + bagWidth - 30, bagY]}
        stroke={konvaTheme.shapeStroke}
        strokeWidth={4}
        lineCap="round"
      />

      {/* Marbles */}
      {marbles.map((marble, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const mx = bagX + 20 + spacingX * (col + 1);
        const my = bagY + 20 + spacingY * (row + 1);
        const isTarget = marble.color === targetColor;

        return (
          <Circle
            key={i}
            x={mx}
            y={my}
            radius={marbleRadius}
            fill={marble.hex}
            opacity={0.85}
            stroke={isTarget ? targetHex : konvaTheme.shapeStroke}
            strokeWidth={isTarget ? 3 : 1}
          />
        );
      })}

      {/* Legend */}
      {(() => {
        const counts = visualData.counts;
        const colors = Object.keys(counts);
        const legendY = bagY + bagHeight + 15;
        const legendWidth = colors.length * 100;
        const startX = canvasWidth / 2 - legendWidth / 2;

        return colors.map((color, i) => (
          <Group key={color}>
            <Circle
              x={startX + i * 100 + 10}
              y={legendY}
              radius={8}
              fill={visualData.marbles.find((m) => m.color === color)?.hex || "#999"}
            />
            <Text
              x={startX + i * 100 + 22}
              y={legendY - 7}
              text={`${color}: ${counts[color]}`}
              fontSize={13}
              fill={konvaTheme.labelText}
            />
          </Group>
        ));
      })()}
    </>
  );
}

function SpinnerVisual({ visualData, canvasWidth, canvasHeight, konvaTheme }) {
  const { sections, numSections, targetColor, targetHex } = visualData;

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2 + 10;
  const spinnerRadius = Math.min(140, (canvasHeight - 80) / 2);

  return (
    <>
      {/* Wedge sections */}
      {sections.map((section, i) => (
        <Wedge
          key={i}
          x={centerX}
          y={centerY}
          radius={spinnerRadius}
          angle={section.sweepAngle}
          rotation={section.startAngle - 90}
          fill={section.hex}
          opacity={section.color === targetColor ? 0.85 : 0.5}
          stroke={konvaTheme.shapeStroke}
          strokeWidth={2}
        />
      ))}

      {/* Divider lines */}
      {sections.map((section, i) => {
        const angleRad = ((section.startAngle - 90) * Math.PI) / 180;
        const endX = centerX + Math.cos(angleRad) * spinnerRadius;
        const endY = centerY + Math.sin(angleRad) * spinnerRadius;
        return (
          <Line
            key={`div-${i}`}
            points={[centerX, centerY, endX, endY]}
            stroke={konvaTheme.shapeStroke}
            strokeWidth={2}
          />
        );
      })}

      {/* Center hub */}
      <Circle
        x={centerX}
        y={centerY}
        radius={8}
        fill={konvaTheme.shapeStroke}
      />

      {/* Pointer at top */}
      <Line
        points={[
          centerX,
          centerY - spinnerRadius - 18,
          centerX - 10,
          centerY - spinnerRadius - 4,
          centerX + 10,
          centerY - spinnerRadius - 4,
        ]}
        fill={konvaTheme.shapeStroke}
        closed
      />

      {/* Section labels */}
      {sections.map((section, i) => {
        const midAngle = section.startAngle + section.sweepAngle / 2 - 90;
        const midRad = (midAngle * Math.PI) / 180;
        const labelDist = spinnerRadius * 0.65;
        const lx = centerX + Math.cos(midRad) * labelDist;
        const ly = centerY + Math.sin(midRad) * labelDist;
        return (
          <Text
            key={`lbl-${i}`}
            x={lx - 15}
            y={ly - 7}
            width={30}
            align="center"
            text={section.color.charAt(0).toUpperCase()}
            fontSize={14}
            fontStyle="bold"
            fill={konvaTheme.canvasBackground}
          />
        );
      })}
    </>
  );
}

function CoinVisual({ x, y, radius, outcome, isTarget, konvaTheme }) {
  return (
    <Group>
      <Circle
        x={x}
        y={y}
        radius={radius}
        fill="#F59E0B"
        stroke={isTarget ? "#EF4444" : konvaTheme.shapeStroke}
        strokeWidth={isTarget ? 4 : 2}
      />
      <Text
        x={x - radius * 0.35}
        y={y - radius * 0.4}
        text={outcome === "heads" ? "H" : "T"}
        fontSize={radius * 0.8}
        fontStyle="bold"
        fill="#78350F"
      />
    </Group>
  );
}

function DieVisual({ x, y, size, outcome, isTarget, konvaTheme }) {
  const pips = PIP_LAYOUTS[outcome] || PIP_LAYOUTS["1"];
  const pipRadius = size * 0.07;

  return (
    <Group>
      <Rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill={konvaTheme.canvasBackground}
        stroke={isTarget ? "#EF4444" : konvaTheme.shapeStroke}
        strokeWidth={isTarget ? 4 : 2}
        cornerRadius={8}
      />
      {pips.map(([px, py], i) => (
        <Circle
          key={i}
          x={x + px * size}
          y={y + py * size}
          radius={pipRadius}
          fill={konvaTheme.shapeStroke}
        />
      ))}
    </Group>
  );
}

function IndependentEventsVisual({ visualData, canvasWidth, canvasHeight, konvaTheme }) {
  const { event1, event2 } = visualData;

  const halfW = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const renderEvent = (evt, cx, cy) => {
    if (evt.type === "coin") {
      return (
        <CoinVisual
          x={cx}
          y={cy}
          radius={50}
          outcome={evt.outcome}
          isTarget
          konvaTheme={konvaTheme}
        />
      );
    }
    // die
    const dieSize = 90;
    return (
      <DieVisual
        x={cx - dieSize / 2}
        y={cy - dieSize / 2}
        size={dieSize}
        outcome={evt.outcome}
        isTarget
        konvaTheme={konvaTheme}
      />
    );
  };

  return (
    <>
      {renderEvent(event1, halfW / 2, centerY)}

      {/* "AND" label */}
      <Text
        x={halfW - 25}
        y={centerY - 12}
        text="AND"
        fontSize={20}
        fontStyle="bold"
        fill={konvaTheme.labelText}
        width={50}
        align="center"
      />

      {renderEvent(event2, halfW + halfW / 2, centerY)}

      {/* Probability labels underneath */}
      <Text
        x={halfW / 2 - 30}
        y={centerY + 65}
        text={`P = 1/${event1.total}`}
        fontSize={16}
        fill={konvaTheme.labelText}
        width={60}
        align="center"
      />
      <Text
        x={halfW + halfW / 2 - 30}
        y={centerY + 65}
        text={`P = 1/${event2.total}`}
        fontSize={16}
        fill={konvaTheme.labelText}
        width={60}
        align="center"
      />
    </>
  );
}

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Marbles in a Bag", instruction: "Express the probability as a fraction." },
  2: { title: "Spinner Probability", instruction: "Count the colored sections and express the probability as a fraction." },
  3: { title: "Complementary Events", instruction: "Find the probability of the event NOT happening." },
  4: { title: "Two Independent Events", instruction: "Multiply the individual probabilities." },
  5: { title: "Word Problems", instruction: "Read carefully and express the probability as a fraction." },
};

// ==================== MAIN COMPONENT ====================

function BasicProbability({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const [showHint, setShowHint] = useState(false);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const { level, type } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const question = currentProblem?.question;

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (Array.isArray(currentProblem?.answer)) return currentProblem.answer;
    return [String(currentProblem?.answer || "")];
  }, [currentProblem?.answer, currentProblem?.acceptedAnswers]);

  const handleTryAnother = () => {
    setShowHint(false);
    triggerNewProblem();
    hideAnswer();
  };

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];
  const canvasWidth = Math.min(width - 40, 600);
  const canvasHeight = type === "independent_events" ? 280 : type === "spinner" ? 380 : 320;
  const showCanvas = type !== "word_problem";

  const renderVisual = () => {
    switch (type) {
      case "marbles":
        return (
          <MarbleBagVisual
            visualData={visualData}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            konvaTheme={konvaTheme}
          />
        );
      case "spinner":
        return (
          <SpinnerVisual
            visualData={visualData}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            konvaTheme={konvaTheme}
          />
        );
      case "independent_events":
        return (
          <IndependentEventsVisual
            visualData={visualData}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            konvaTheme={konvaTheme}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Wrapper>
      {/* TopHintButton */}
      {!showAnswer && !showHint && hint && (
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
        <QuestionText>{question?.[0]?.text || ""}</QuestionText>
      </QuestionSection>

      {/* Visual Section */}
      {showCanvas && (
        <VisualSection>
          <Stage width={canvasWidth} height={canvasHeight}>
            <Layer>
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill={konvaTheme.canvasBackground}
              />
              {renderVisual()}
            </Layer>
          </Stage>
        </VisualSection>
      )}

      {/* Interaction Section */}
      <InteractionSection>
        {showHint && hint && <HintBox>{hint}</HintBox>}

        {!showAnswer && (
          <AnswerInputContainer>
            <AnswerInput
              correctAnswer={correctAnswer}
              answerType="array"
              onCorrect={revealAnswer}
              onTryAnother={handleTryAnother}
              disabled={showAnswer}
              placeholder="Enter fraction (e.g. 3/8)"
            />
          </AnswerInputContainer>
        )}

        {showAnswer && (
          <ExplanationSection>
            <ExplanationText>{explanation}</ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default BasicProbability;

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

  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
    padding: 6px 12px;
    font-size: 13px;
  }

  &:hover {
    background: ${(props) => props.theme.colors.hoverBackground};
  }
`;

const LevelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const LevelBadge = styled.span`
  background: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
`;

const LevelTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }
`;

const QuestionSection = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
`;

const QuestionText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 22px;
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

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const AnswerInputContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const HintBox = styled.div`
  background: ${(props) => props.theme.colors.cardBackground};
  border-left: 4px solid #f6ad55;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 15px;
  color: ${(props) => props.theme.colors.textPrimary};
  width: 100%;
  max-width: 500px;
`;

const ExplanationSection = styled.div`
  width: 100%;
  max-width: 600px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 20px;
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 17px;
  }
`;
