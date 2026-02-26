import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import styled from "styled-components";
import { Stage, Layer, Image as KonvaImage, Line, Rect, Text, Group, Circle } from "react-konva";
import { protractor } from "../../../../shared/images";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Multiples of 10°", instruction: "Measure the angle using the protractor." },
  2: { title: "Multiples of 5°", instruction: "Read between the major marks. Each small mark is 5°." },
  3: { title: "Any Degree", instruction: "Measure the angle precisely." },
  4: { title: "Identify & Measure", instruction: "What type of angle is this? Measure it." },
  5: { title: "Rotatable Protractor", instruction: "Drag the protractor to rotate it. Align 0° with one line, then read the other." },
};

const ANGLE_TYPE_LABELS = {
  acute: "Acute (<90°)",
  right: "Right (=90°)",
  obtuse: "Obtuse (>90°)",
};

// ==================== HELPERS ====================

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

// ==================== MAIN COMPONENT ====================

const Protractor = ({ triggerNewProblem }) => {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width, height } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const [showHint, setShowHint] = useState(false);

  // L5 rotatable state
  const [protractorRotation, setProtractorRotation] = useState(0);
  const isDraggingRef = useRef(false);
  const lastAngleRef = useRef(0);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const { level = 1, angles = [], angleType, questionType = "single" } = visualData;
  const isRotatable = questionType === "rotatable";

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "Measure the angle shown";

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (Array.isArray(currentProblem?.answer)) {
      return currentProblem.answer.map((a) => (typeof a === "object" ? a.text : String(a)));
    }
    return [String(currentProblem?.answer || "")];
  }, [currentProblem]);

  // Reset rotation on new problem
  useEffect(() => {
    if (isRotatable && angles.length >= 2) {
      // Start misaligned: random offset from the aligned-with-red position
      const alignedWithRed = -angles[0].degrees;
      const offset = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 40);
      setProtractorRotation(alignedWithRed + offset);
    } else {
      setProtractorRotation(0);
    }
    setShowHint(false);
  }, [currentProblem]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTryAnother = () => {
    setShowHint(false);
    hideAnswer();
    triggerNewProblem();
  };

  // Protractor image dimensions (original)
  const originalImageWidth = 500;
  const originalImageHeight = 295;
  const originalOriginX = 249;
  const originalOriginY = 295;

  // Responsive scaling
  const availableWidth = Math.min(width - 40, 600);
  const availableHeight = Math.min(height * 0.35, 280);
  const scaleByWidth = availableWidth / originalImageWidth;
  const scaleByHeight = availableHeight / originalImageHeight;
  const protractorScale = Math.min(scaleByWidth, scaleByHeight, 1.5);

  const scaledWidth = originalImageWidth * protractorScale;
  const scaledHeight = originalImageHeight * protractorScale;

  const lineLength = Math.min(220 * protractorScale, scaledWidth * 0.65);
  const stageWidth = Math.min(width - 20, scaledWidth + lineLength * 2 + 40);
  const stageHeight = scaledHeight + 40;

  const protractorX = (stageWidth - scaledWidth) / 2;
  const protractorY = 10;

  const origin = useMemo(
    () => [protractorX + originalOriginX * protractorScale, protractorY + originalOriginY * protractorScale],
    [protractorX, protractorY, protractorScale]
  );

  const strokeWidth = Math.max(3, Math.min(8 * protractorScale, 8));

  // Calculate line endpoint from angle (absolute, in stage coords)
  const getLineEnd = (degrees) => {
    if (degrees === 0) return [origin[0] + lineLength, origin[1]];
    if (degrees === 180) return [origin[0] - lineLength, origin[1]];
    if (degrees === 90) return [origin[0], origin[1] - lineLength];
    const x = Math.cos(toRadians(degrees)) * lineLength;
    const y = Math.sin(toRadians(degrees)) * lineLength;
    return [origin[0] + x, origin[1] - y];
  };

  // Rotation handlers for L5
  const handleRotateStart = useCallback((e) => {
    isDraggingRef.current = true;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const dx = pos.x - origin[0];
    const dy = pos.y - origin[1];
    lastAngleRef.current = toDegrees(Math.atan2(dy, dx));
  }, [origin]);

  const handleRotateMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const dx = pos.x - origin[0];
    const dy = pos.y - origin[1];
    const currentAngle = toDegrees(Math.atan2(dy, dx));
    let delta = currentAngle - lastAngleRef.current;
    // Handle wraparound at ±180°
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastAngleRef.current = currentAngle;
    setProtractorRotation((prev) => prev + delta);
  }, [origin]);

  const handleRotateEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const imageElement = useMemo(() => {
    const img = document.createElement("img");
    img.src = protractor;
    return img;
  }, []);

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];
  const isMultiAngle = questionType === "add" || questionType === "subtract";

  if (!currentProblem || angles.length === 0) {
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

      {/* L4: Angle type badge */}
      {level === 4 && angleType && (
        <AngleTypeBadge type={angleType}>
          {ANGLE_TYPE_LABELS[angleType]}
        </AngleTypeBadge>
      )}

      {/* Question text */}
      <QuestionTextStyled>{questionText}</QuestionTextStyled>

      {/* Protractor visualization */}
      <VisualSection>
        <Stage
          width={stageWidth}
          height={stageHeight}
          onMouseMove={isRotatable ? handleRotateMove : undefined}
          onMouseUp={isRotatable ? handleRotateEnd : undefined}
          onTouchMove={isRotatable ? handleRotateMove : undefined}
          onTouchEnd={isRotatable ? handleRotateEnd : undefined}
        >
          <Layer>
            {/* Background for dark mode */}
            <Rect x={0} y={0} width={stageWidth} height={stageHeight} fill={konvaTheme.canvasBackground} />

            {isRotatable ? (
              <>
                {/* Rotatable protractor group — rotates around origin */}
                <Group
                  x={origin[0]}
                  y={origin[1]}
                  offsetX={originalOriginX * protractorScale}
                  offsetY={originalOriginY * protractorScale}
                  rotation={protractorRotation}
                  onMouseDown={handleRotateStart}
                  onTouchStart={handleRotateStart}
                >
                  <KonvaImage
                    image={imageElement}
                    x={0}
                    y={0}
                    scaleX={protractorScale}
                    scaleY={protractorScale}
                  />
                </Group>

                {/* L5 Rotatable: Fixed lines (drawn on top of protractor) */}
                {angles.map((angle, i) => {
                  const end = getLineEnd(angle.degrees);
                  return (
                    <Line
                      key={i}
                      stroke={angle.lineColor}
                      strokeWidth={strokeWidth + 1}
                      points={[...origin, ...end]}
                      opacity={0.8}
                    />
                  );
                })}

                {/* Labels at line ends */}
                {angles.map((angle, i) => {
                  const end = getLineEnd(angle.degrees);
                  return (
                    <Text
                      key={`label-${i}`}
                      x={end[0] + (angle.degrees > 90 ? -35 : 5)}
                      y={end[1] - 20}
                      text={showAnswer ? `${angle.degrees}°` : (angle.lineColor === "red" ? "Red" : "Green")}
                      fontSize={13 * protractorScale}
                      fill={angle.lineColor}
                      fontStyle="bold"
                    />
                  );
                })}

                {/* Origin dot */}
                <Circle
                  x={origin[0]}
                  y={origin[1]}
                  radius={4}
                  fill="#333"
                  opacity={0.5}
                />
              </>
            ) : (
              <>
                {/* L1-L4: Fixed protractor */}
                <KonvaImage
                  image={imageElement}
                  x={protractorX}
                  y={protractorY}
                  scaleX={protractorScale}
                  scaleY={protractorScale}
                />

                {/* Red baseline at 0° */}
                <Line
                  stroke="red"
                  strokeWidth={strokeWidth}
                  points={[...origin, origin[0] + lineLength, origin[1]]}
                  opacity={0.6}
                />

                {/* Angle line(s) */}
                {angles.map((angle, i) => {
                  const end = getLineEnd(angle.degrees);
                  return (
                    <Line
                      key={i}
                      stroke={angle.lineColor}
                      strokeWidth={strokeWidth}
                      points={[...origin, ...end]}
                      opacity={0.6}
                    />
                  );
                })}

                {/* Labels for multi-angle */}
                {isMultiAngle && angles.map((angle, i) => {
                  const end = getLineEnd(angle.degrees);
                  return (
                    <Text
                      key={`label-${i}`}
                      x={end[0] + 5}
                      y={end[1] - 15}
                      text={showAnswer ? `${angle.degrees}°` : "?"}
                      fontSize={14 * protractorScale}
                      fill={angle.lineColor}
                      fontStyle="bold"
                    />
                  );
                })}
              </>
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
            answerType="array"
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="Enter angle in degrees"
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

export default Protractor;

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

const AngleTypeBadge = styled.div`
  display: inline-block;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  background-color: ${(props) =>
    props.type === "acute" ? props.theme.colors.info :
    props.type === "right" ? props.theme.colors.buttonSuccess :
    props.theme.colors.warning};
  color: ${(props) => props.theme.colors.textInverted};
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
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  touch-action: none;
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
