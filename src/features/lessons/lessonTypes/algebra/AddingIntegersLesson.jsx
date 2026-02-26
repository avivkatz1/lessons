/**
 * Adding Integers - Interactive Lesson Component
 *
 * Five-level progression with varied visualizations:
 * L1 — Both Positive (Number Line): Visual number line showing addition
 * L2 — Both Negative (Chips): Negative chips combining
 * L3 — Mixed Signs (Positive Result): Different signs, positive larger
 * L4 — Mixed Signs (Negative Result): Different signs, negative larger
 * L5 — Word Problems: Real-world scenarios
 */

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Circle, Line, Text, Arrow } from 'react-konva';
import { useLessonState, useKonvaTheme, useWindowDimensions } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

// ==================== NUMBER LINE COMPONENT ====================

function NumberLine({ visualData, konvaTheme, width, height }) {
  const { start, end, num1, num2, sum, showJumps } = visualData;

  const padding = 40;
  const lineY = height / 2;
  const lineWidth = width - padding * 2;
  const tickHeight = 10;

  // Calculate positions
  const range = end - start;
  const getX = (value) => padding + ((value - start) / range) * lineWidth;

  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* Canvas background */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={konvaTheme.canvasBackground}
        />

        {/* Number line */}
        <Line
          points={[padding, lineY, width - padding, lineY]}
          stroke={konvaTheme.shapeStroke}
          strokeWidth={3}
        />

        {/* Tick marks and labels */}
        {Array.from({ length: end - start + 1 }, (_, i) => {
          const value = start + i;
          const x = getX(value);

          return (
            <React.Fragment key={`tick-${value}`}>
              <Line
                points={[x, lineY - tickHeight, x, lineY + tickHeight]}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={2}
              />
              <Text
                x={x - 8}
                y={lineY + tickHeight + 5}
                text={String(value)}
                fill={konvaTheme.labelText}
                fontSize={12}
              />
            </React.Fragment>
          );
        })}

        {/* Jump arrows showing addition */}
        {showJumps && (
          <>
            {/* Starting point on number line - GREEN */}
            <Circle
              x={getX(0)}
              y={lineY}
              radius={8}
              fill="#10B981"
              stroke={konvaTheme.shapeStroke}
              strokeWidth={2}
            />

            {/* First jump - upper level */}
            {/* Green starting point for first arrow */}
            <Circle
              x={getX(0)}
              y={lineY - 40}
              radius={6}
              fill="#10B981"
              stroke={konvaTheme.shapeStroke}
              strokeWidth={2}
            />
            <Arrow
              points={[getX(0), lineY - 40, getX(num1), lineY - 40]}
              stroke={konvaTheme.adjacent}
              fill={konvaTheme.adjacent}
              strokeWidth={3}
              pointerLength={10}
              pointerWidth={10}
            />
            <Text
              x={getX(num1 / 2) - 15}
              y={lineY - 60}
              text={num1 >= 0 ? `+${num1}` : String(num1)}
              fill={konvaTheme.adjacent}
              fontSize={16}
              fontStyle="bold"
            />

            {/* Second jump - lower level */}
            <Arrow
              points={[getX(num1), lineY - 20, getX(sum), lineY - 20]}
              stroke={konvaTheme.opposite}
              fill={konvaTheme.opposite}
              strokeWidth={3}
              pointerLength={10}
              pointerWidth={10}
            />
            <Text
              x={getX(num1 + num2 / 2) - 15}
              y={lineY - 35}
              text={num2 >= 0 ? `+${num2}` : String(num2)}
              fill={konvaTheme.opposite}
              fontSize={16}
              fontStyle="bold"
            />

            {/* Final position */}
            <Circle
              x={getX(sum)}
              y={lineY}
              radius={8}
              fill={konvaTheme.angle}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={2}
            />
            <Text
              x={getX(sum) - 12}
              y={lineY + 30}
              text={String(sum)}
              fill={konvaTheme.angle}
              fontSize={18}
              fontStyle="bold"
            />
          </>
        )}
      </Layer>
    </Stage>
  );
}

// ==================== CHIPS COMPONENT ====================

function Chips({ visualData, konvaTheme, width, height }) {
  const { negativeChips1, negativeChips2, totalNegativeChips } = visualData;

  const chipRadius = 15;
  const chipSpacing = 10;
  const chipsPerRow = 6;
  const startY = 90;

  const renderChipGroup = (count, startX, startY, color, label) => {
    const chips = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / chipsPerRow);
      const col = i % chipsPerRow;
      const x = startX + col * (chipRadius * 2 + chipSpacing);
      const y = startY + row * (chipRadius * 2 + chipSpacing);

      chips.push(
        <React.Fragment key={`chip-${label}-${i}`}>
          <Circle
            x={x}
            y={y}
            radius={chipRadius}
            fill={color}
            stroke={konvaTheme.shapeStroke}
            strokeWidth={2}
          />
          <Text
            x={x - 5}
            y={y - 7}
            text="-"
            fill={konvaTheme.textInverted || '#fff'}
            fontSize={18}
            fontStyle="bold"
          />
        </React.Fragment>
      );
    }
    return chips;
  };

  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* Canvas background */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={konvaTheme.canvasBackground}
        />

        {/* Group 1 */}
        <Text
          x={30}
          y={15}
          text={`First number: ${negativeChips1} negative chips`}
          fill={konvaTheme.labelText}
          fontSize={14}
        />
        {renderChipGroup(negativeChips1, 40, startY, konvaTheme.opposite, 'group1')}

        {/* Plus sign */}
        <Text
          x={width / 2 - 10}
          y={height / 2 - 15}
          text="+"
          fill={konvaTheme.labelText}
          fontSize={24}
          fontStyle="bold"
        />

        {/* Group 2 */}
        <Text
          x={width / 2 + 30}
          y={15}
          text={`Second number: ${negativeChips2} negative chips`}
          fill={konvaTheme.labelText}
          fontSize={14}
        />
        {renderChipGroup(negativeChips2, width / 2 + 40, startY, konvaTheme.opposite, 'group2')}

        {/* Result */}
        <Line
          points={[30, height - 70, width - 30, height - 70]}
          stroke={konvaTheme.shapeStroke}
          strokeWidth={2}
          dash={[5, 5]}
        />
        <Text
          x={30}
          y={height - 60}
          text={`Total: ${totalNegativeChips} negative chips = ${-totalNegativeChips}`}
          fill={konvaTheme.angle}
          fontSize={16}
          fontStyle="bold"
        />
      </Layer>
    </Stage>
  );
}

// ==================== THERMOMETER COMPONENT ====================

function Thermometer({ visualData, konvaTheme, width, height }) {
  const { startTemp, change, endTemp } = visualData;

  const thermWidth = 40;
  const thermHeight = 200;
  const thermX = width / 2 - thermWidth / 2;
  const thermY = 50;

  const minTemp = Math.min(startTemp, endTemp, -20);
  const maxTemp = Math.max(startTemp, endTemp, 40);
  const tempRange = maxTemp - minTemp;

  const getTempY = (temp) => {
    return thermY + thermHeight - ((temp - minTemp) / tempRange) * thermHeight;
  };

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill={konvaTheme.canvasBackground} />

        {/* Thermometer tube */}
        <Rect
          x={thermX}
          y={thermY}
          width={thermWidth}
          height={thermHeight}
          fill={konvaTheme.cardBackground || '#fff'}
          stroke={konvaTheme.shapeStroke}
          strokeWidth={3}
        />

        {/* Start temperature line */}
        <Line
          points={[thermX - 20, getTempY(startTemp), thermX + thermWidth + 20, getTempY(startTemp)]}
          stroke={konvaTheme.adjacent}
          strokeWidth={2}
          dash={[5, 3]}
        />
        <Text
          x={thermX - 60}
          y={getTempY(startTemp) - 10}
          text={`${startTemp}°F`}
          fill={konvaTheme.adjacent}
          fontSize={14}
          fontStyle="bold"
        />

        {/* End temperature line */}
        <Line
          points={[thermX - 20, getTempY(endTemp), thermX + thermWidth + 20, getTempY(endTemp)]}
          stroke={konvaTheme.opposite}
          strokeWidth={2}
          dash={[5, 3]}
        />
        <Text
          x={thermX + thermWidth + 30}
          y={getTempY(endTemp) - 10}
          text={`${endTemp}°F`}
          fill={konvaTheme.opposite}
          fontSize={14}
          fontStyle="bold"
        />

        {/* Arrow showing change */}
        <Arrow
          points={[thermX + thermWidth / 2, getTempY(startTemp), thermX + thermWidth / 2, getTempY(endTemp)]}
          stroke={konvaTheme.angle}
          fill={konvaTheme.angle}
          strokeWidth={3}
          pointerLength={10}
          pointerWidth={10}
        />

        {/* Change label */}
        <Text
          x={width / 2 - 40}
          y={height - 30}
          text={change >= 0 ? `+${change}°F` : `${change}°F`}
          fill={konvaTheme.angle}
          fontSize={18}
          fontStyle="bold"
        />
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function AddingIntegersLesson({ triggerNewProblem }) {
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

  // Event handler
  const handleTryAnother = () => {
    setShowHint(false);
    triggerNewProblem();
    hideAnswer();
  };

  // Canvas sizing
  const canvasWidth = useMemo(() => {
    return Math.min(windowWidth - 40, 600);
  }, [windowWidth]);

  const canvasHeight = useMemo(() => {
    if (levelNum === 1 || levelNum === 3 || levelNum === 4) return 200; // Number line
    if (levelNum === 2) return 250; // Chips
    if (levelNum === 5 && visualData?.type === 'thermometer') return 300; // Thermometer
    return 0; // No visual
  }, [levelNum, visualData]);

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
          {levelNum === 1 && 'Positive Numbers'}
          {levelNum === 2 && 'Negative Numbers'}
          {levelNum === 3 && 'Mixed Signs (Positive Result)'}
          {levelNum === 4 && 'Mixed Signs (Negative Result)'}
          {levelNum === 5 && 'Word Problems'}
        </LevelTitle>
      </LevelHeader>

      {/* Question */}
      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      {/* Visual Component - Show for first 4 questions, then only if hint is shown */}
      {visualData && (currentQuestionIndex < 4 || showHint) && (
        <CanvasWrapper>
          {visualData.type === 'numberLine' && (levelNum === 1 || levelNum === 3 || levelNum === 4) && (
            <NumberLine
              visualData={visualData}
              konvaTheme={konvaTheme}
              width={canvasWidth}
              height={canvasHeight}
            />
          )}

          {visualData.type === 'chips' && levelNum === 2 && (
            <Chips
              visualData={visualData}
              konvaTheme={konvaTheme}
              width={canvasWidth}
              height={canvasHeight}
            />
          )}

          {visualData.type === 'thermometer' && levelNum === 5 && (
            <Thermometer
              visualData={visualData}
              konvaTheme={konvaTheme}
              width={canvasWidth}
              height={canvasHeight}
            />
          )}
        </CanvasWrapper>
      )}

      {/* Interaction Section */}
      <InteractionSection>
        {!showAnswer && (
          <>
            {showHint && hint && (
              <HintBox>{hint}</HintBox>
            )}

            <AnswerInputContainer>
              <AnswerInput
                correctAnswer={correctAnswer}
                answerType="array"
                onCorrect={revealAnswer}
                onTryAnother={handleTryAnother}
                disabled={showAnswer}
                placeholder="Enter your answer"
              />
            </AnswerInputContainer>
          </>
        )}

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

export default AddingIntegersLesson;

// ==================== STYLED COMPONENTS ====================

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 1024px) {
    padding: 16px;
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

const CanvasWrapper = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    padding: 12px;
    margin-bottom: 16px;
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

const AnswerInputContainer = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: center;
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
