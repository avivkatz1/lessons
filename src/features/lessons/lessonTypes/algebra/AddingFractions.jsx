import React, { useState, useMemo } from "react";
import { useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { useLessonState } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";
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

  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const [showHint, setShowHint] = useState(false);

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

  const handleTryAnother = () => {
    setShowHint(false);
    hideAnswer();
    triggerNewProblem();
  };

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];
  const hasConversion = conversion !== null && conversion !== undefined;

  // Canvas sizing
  const canvasWidth = Math.min(width - 40, 700);
  const scale = canvasWidth / 700;
  const barWidth = canvasWidth * 0.55;
  const barHeight = 32 * scale;
  const leftPad = (canvasWidth - barWidth) / 2;
  const canvasHeight = hasConversion ? 390 * scale : 220 * scale;

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
      {/* Hint button */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>Need a hint?</TopHintButton>
      )}

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

      {/* Interaction Section */}
      <InteractionSection>
        {!showAnswer && showHint && <HintBox>{hint}</HintBox>}

        {!showAnswer && (
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="Enter fraction (e.g. 3/4)"
          />
        )}
      </InteractionSection>

      {/* Explanation */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Explanation</ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another Problem
          </TryAnotherButton>
        </ExplanationSection>
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

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const HintBox = styled.div`
  width: 100%;
  max-width: 650px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-left: 4px solid ${(props) => props.theme.colors.warning || "#f6ad55"};
  padding: 14px 16px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 20px 24px;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const ExplanationTitle = styled.h3`
  font-size: 19px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.buttonSuccess};
  margin: 0;
`;

const ExplanationText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
  text-align: center;
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
  }
`;
