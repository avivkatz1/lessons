import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Stage, Layer, Rect, Circle, Line, Text } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Quadrant I (Small)", instruction: "Find the coordinates of the red dot. Count from the origin." },
  2: { title: "Quadrant I (Larger)", instruction: "The numbers are bigger now. Count carefully from the origin!" },
  3: { title: "Introducing Negatives", instruction: "Some coordinates can be negative. Left is negative x, down is negative y." },
  4: { title: "All Four Quadrants", instruction: "The point can be anywhere. Remember: (x, y)." },
  5: { title: "Challenge", instruction: "Full range and word problems. You've got this!" },
};

// ==================== MAIN COMPONENT ====================

const PlottingPoints = ({ triggerNewProblem }) => {
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
    level = 1,
    pointX = 0,
    pointY = 0,
    originGridX = 5,
    originGridY = 14,
    gridSize = 20,
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "Find the coordinates of the red dot";

  const correctAnswer = useMemo(() => {
    if (currentProblem?.answer && Array.isArray(currentProblem.answer) && currentProblem.answer.length === 2) {
      return currentProblem.answer;
    }
    return [pointX, pointY];
  }, [currentProblem, pointX, pointY]);

  const handleTryAnother = () => {
    setShowHint(false);
    hideAnswer();
    triggerNewProblem();
  };

  // Responsive square canvas — bigger than the old 350px
  const canvasSize = Math.min(width - 40, 600);
  const spacing = canvasSize / gridSize;

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  if (!currentProblem || !visualData.level) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  // Point pixel position
  const pointPxX = (originGridX + pointX) * spacing;
  const pointPxY = (originGridY - pointY) * spacing;

  // Determine which axis labels to show (skip every other for dense levels)
  const showEveryN = level <= 2 ? 2 : 1;

  return (
    <Wrapper>
      {/* Hint button */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{info.title}</LevelTitle>
      </LevelHeader>

      <InstructionText>{info.instruction}</InstructionText>

      {/* Question text */}
      <QuestionTextStyled>{questionText}</QuestionTextStyled>

      {/* Grid visualization */}
      <VisualSection>
        <Stage width={canvasSize} height={canvasSize}>
          <Layer>
            {/* Background */}
            <Rect x={0} y={0} width={canvasSize} height={canvasSize} fill={konvaTheme.canvasBackground} />

            {/* Horizontal grid lines */}
            {[...Array(gridSize)].map((_, i) => {
              const isOriginRow = i === originGridY;
              return (
                <Line
                  key={`h${i}`}
                  points={[0, i * spacing, canvasSize, i * spacing]}
                  stroke={isOriginRow ? konvaTheme.gridOrigin : konvaTheme.gridRegular}
                  strokeWidth={isOriginRow ? 2.5 : 0.5}
                />
              );
            })}

            {/* Vertical grid lines */}
            {[...Array(gridSize)].map((_, i) => {
              const isOriginCol = i === originGridX;
              return (
                <Line
                  key={`v${i}`}
                  points={[i * spacing, 0, i * spacing, canvasSize]}
                  stroke={isOriginCol ? konvaTheme.gridOrigin : konvaTheme.gridRegular}
                  strokeWidth={isOriginCol ? 2.5 : 0.5}
                />
              );
            })}

            {/* X-axis number labels */}
            {[...Array(gridSize)].map((_, i) => {
              const xValue = i - originGridX;
              if (xValue === 0) return null;
              if (i % showEveryN !== 0) return null;
              // Skip labels too close to edges
              if (i < 1 || i > gridSize - 2) return null;
              const labelFontSize = Math.max(9, Math.round(spacing * 0.35));
              return (
                <Text
                  key={`xl${i}`}
                  x={i * spacing - labelFontSize * 0.3 * String(xValue).length}
                  y={originGridY * spacing + 4}
                  text={String(xValue)}
                  fontSize={labelFontSize}
                  fill={konvaTheme.coordinateText || konvaTheme.labelText}
                />
              );
            })}

            {/* Y-axis number labels */}
            {[...Array(gridSize)].map((_, i) => {
              const yValue = originGridY - i;
              if (yValue === 0) return null;
              if (i % showEveryN !== 0) return null;
              if (i < 1 || i > gridSize - 2) return null;
              const labelFontSize = Math.max(9, Math.round(spacing * 0.35));
              return (
                <Text
                  key={`yl${i}`}
                  x={originGridX * spacing + 4}
                  y={i * spacing - labelFontSize * 0.45}
                  text={String(yValue)}
                  fontSize={labelFontSize}
                  fill={konvaTheme.coordinateText || konvaTheme.labelText}
                />
              );
            })}

            {/* Origin "0" label */}
            <Text
              x={originGridX * spacing + 4}
              y={originGridY * spacing + 4}
              text="0"
              fontSize={Math.max(9, Math.round(spacing * 0.35))}
              fill={konvaTheme.coordinateText || konvaTheme.labelText}
            />

            {/* Origin dot */}
            <Circle
              x={originGridX * spacing}
              y={originGridY * spacing}
              radius={4}
              fill={konvaTheme.shapeStroke}
            />
          </Layer>

          {/* Point layer (on top) */}
          <Layer>
            {/* Red dot */}
            <Circle
              x={pointPxX}
              y={pointPxY}
              radius={10}
              fill={konvaTheme.point}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={1.5}
            />

            {/* Answer reveal: coordinate label */}
            {showAnswer && (
              <Text
                x={pointPxX + 14}
                y={pointPxY - 10}
                text={`(${pointX}, ${pointY})`}
                fontSize={Math.round(spacing * 0.5)}
                fontStyle="bold"
                fill={konvaTheme.labelText}
              />
            )}
          </Layer>
        </Stage>
      </VisualSection>

      {/* Interaction Section */}
      <InteractionSection>
        {!showAnswer && showHint && <HintBox>{hint}</HintBox>}

        {!showAnswer && (
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="coordinate"
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="e.g. (3, 4)"
          />
        )}
      </InteractionSection>

      {/* Explanation */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another Problem
          </TryAnotherButton>
        </ExplanationSection>
      )}
    </Wrapper>
  );
};

export default PlottingPoints;

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

const QuestionTextStyled = styled.p`
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
