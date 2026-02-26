import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Stage, Layer, Rect, Line, Text } from "react-konva";
import { ruler } from "../../../../shared/images";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Whole Inches", instruction: "Measure the red line using the ruler." },
  2: { title: "Half Inches", instruction: "Each inch is divided into 2 halves. Measure precisely!" },
  3: { title: "Quarter Inches", instruction: "Each inch is divided into 4 quarters. Look closely!" },
  4: { title: "Eighth Inches", instruction: "Each inch is divided into 8 eighths. Be precise!" },
  5: { title: "Two Measurements", instruction: "Measure both lines, then add or subtract." },
};

// Ruler image calibration: the ruler.png has margins before 0 and after 12
const RULER_LEFT_MARGIN_PERCENT = 0.003;
const RULER_RIGHT_MARGIN_PERCENT = 0.017;

// ==================== MAIN COMPONENT ====================

const MeasuringSides = ({ triggerNewProblem }) => {
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
  const { level = 1, measurements = [], questionType = "single" } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "Measure the red line";

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (Array.isArray(currentProblem?.answer)) {
      return currentProblem.answer.map((a) => (typeof a === "object" ? a.text : String(a)));
    }
    return [String(currentProblem?.answer || "")];
  }, [currentProblem]);

  const handleTryAnother = () => {
    setShowHint(false);
    hideAnswer();
    triggerNewProblem();
  };

  // Responsive sizing
  const rulerWidth = Math.min(width - 40, 800);
  const rulerActiveWidth = rulerWidth * (1 - RULER_LEFT_MARGIN_PERCENT - RULER_RIGHT_MARGIN_PERCENT);
  const lineStartX = rulerWidth * RULER_LEFT_MARGIN_PERCENT;

  // Canvas height depends on number of lines
  const isMultiLine = questionType === "add" || questionType === "subtract";
  const stageHeight = isMultiLine ? 60 : 30;
  const lineY1 = isMultiLine ? 12 : 15;
  const lineY2 = isMultiLine ? 42 : 15;

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Calculate line pixel lengths from decimal values
  const lines = measurements.map((m) => ({
    ...m,
    pixelLength: (rulerActiveWidth * m.decimalValue) / 12,
  }));

  if (!currentProblem || measurements.length === 0) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

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

      {/* Visual: lines on canvas + ruler image */}
      <VisualSection>
        <RulerArea>
          <Stage width={rulerWidth} height={stageHeight}>
            <Layer>
              {/* Background rect for dark mode */}
              <Rect x={0} y={0} width={rulerWidth} height={stageHeight} fill={konvaTheme.canvasBackground} />

              {/* Line 1 (always present) */}
              {lines[0] && (
                <>
                  <Line
                    points={[lineStartX, lineY1, lineStartX + lines[0].pixelLength, lineY1]}
                    stroke={lines[0].lineColor}
                    strokeWidth={6}
                    lineCap="round"
                  />
                  {isMultiLine && (
                    <Text
                      x={lineStartX + lines[0].pixelLength + 8}
                      y={lineY1 - 7}
                      text={showAnswer ? lines[0].displayFraction + " in" : "?"}
                      fontSize={13}
                      fill={lines[0].lineColor}
                      fontStyle="bold"
                    />
                  )}
                </>
              )}

              {/* Line 2 (L5 only) */}
              {isMultiLine && lines[1] && (
                <>
                  <Line
                    points={[lineStartX, lineY2, lineStartX + lines[1].pixelLength, lineY2]}
                    stroke={lines[1].lineColor}
                    strokeWidth={6}
                    lineCap="round"
                  />
                  <Text
                    x={lineStartX + lines[1].pixelLength + 8}
                    y={lineY2 - 7}
                    text={showAnswer ? lines[1].displayFraction + " in" : "?"}
                    fontSize={13}
                    fill={lines[1].lineColor}
                    fontStyle="bold"
                  />
                </>
              )}
            </Layer>
          </Stage>
          <RulerImage src={ruler} alt="12-inch ruler" style={{ width: rulerWidth }} />
        </RulerArea>
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
            placeholder="Enter measurement (e.g. 3 1/4)"
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
};

export default MeasuringSides;

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
  touch-action: none;
`;

const RulerArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const RulerImage = styled.img`
  display: block;
  max-width: 100%;
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
