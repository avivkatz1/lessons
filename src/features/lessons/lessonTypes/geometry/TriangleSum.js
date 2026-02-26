import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Circle, Line, Text, Rect } from "react-konva";
import {
  useLessonState,
  useIsTouchDevice,
  useWindowDimensions,
  useKonvaTheme,
} from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";
import TouchDragHandle from "../../../../shared/helpers/TouchDragHandle";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Explore & Discover", instruction: "Drag the red vertex to reshape the triangle. Can you make a right triangle?" },
  2: { title: "Find the Missing Angle", instruction: "" },
  3: { title: "Solve for x", instruction: "" },
  4: { title: "Classify the Triangle", instruction: "" },
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

const ANGLE_COLORS = ["#3B82F6", "#10B981", "#F59E0B"];

/** Compute angle (degrees) at vertex between rays to p1 and p2 */
function computeAngle(p1, vertex, p2) {
  const v1x = p1.x - vertex.x, v1y = p1.y - vertex.y;
  const v2x = p2.x - vertex.x, v2y = p2.y - vertex.y;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
  if (mag1 === 0 || mag2 === 0) return 0;
  const cosA = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (mag1 * mag2)));
  return Math.acos(cosA) * (180 / Math.PI);
}

/** Build positioned triangle vertices from angles for static display */
function triangleFromAngles(angles, canvasWidth, canvasHeight) {
  const [angleA, angleB] = angles;
  const radA = (angleA * Math.PI) / 180;
  const radB = (angleB * Math.PI) / 180;
  const sinA = Math.sin(radA);
  const sinB = Math.sin(radB);
  const sinAB = Math.sin(radA + radB);

  if (Math.abs(sinAB) < 0.001) {
    return [
      { x: canvasWidth * 0.2, y: canvasHeight - 40 },
      { x: canvasWidth * 0.8, y: canvasHeight - 40 },
      { x: canvasWidth * 0.5, y: 40 },
    ];
  }

  // Normalized triangle (base = 1)
  const s = sinA / sinAB;
  const cx = 1 - s * Math.cos(radB);
  const cy = -s * sinB;

  // Bounding box
  const minX = Math.min(0, cx);
  const maxX = Math.max(1, cx);
  const triWidth = maxX - minX;
  const triHeight = Math.abs(cy);

  // Scale to fit canvas with margins
  const marginX = 60;
  const marginTop = 50;
  const marginBottom = 50;
  const availWidth = canvasWidth - 2 * marginX;
  const availHeight = canvasHeight - marginTop - marginBottom;
  const scale = Math.min(availWidth / triWidth, availHeight / Math.max(triHeight, 0.01));

  // Center horizontally, base at bottom
  const offsetX = (canvasWidth - triWidth * scale) / 2 - minX * scale;
  const baseY = canvasHeight - marginBottom;

  return [
    { x: offsetX, y: baseY },
    { x: offsetX + 1 * scale, y: baseY },
    { x: offsetX + cx * scale, y: baseY + cy * scale },
  ];
}

// ==================== LEVEL 1: EXPLORE ====================

function ExploreLevel({ konvaTheme, canvasWidth, canvasHeight }) {
  const generateVertices = () => ({
    a: { x: canvasWidth * 0.15, y: canvasHeight - 50 },
    b: { x: canvasWidth * 0.85, y: canvasHeight - 50 },
    c: { x: canvasWidth * (0.35 + Math.random() * 0.2), y: 40 + Math.random() * 40 },
  });

  const [vertices, setVertices] = useState(generateVertices);
  const [formed, setFormed] = useState(false);

  const angleA = Math.round(computeAngle(vertices.b, vertices.a, vertices.c));
  const angleB = Math.round(computeAngle(vertices.a, vertices.b, vertices.c));
  const angleC = 180 - angleA - angleB; // Force exact sum = 180°

  const isNearRight = !formed && (
    Math.abs(angleA - 90) <= 5 ||
    Math.abs(angleB - 90) <= 5 ||
    Math.abs(angleC - 90) <= 5
  );

  const handleDrag = (e) => {
    if (formed) return;
    const newC = { x: e.target.x(), y: e.target.y() };
    const newVerts = { ...vertices, c: newC };

    // Compute angles with new position
    const aA = Math.round(computeAngle(newVerts.b, newVerts.a, newC));
    const aB = Math.round(computeAngle(newVerts.a, newVerts.b, newC));
    const aC = 180 - aA - aB;

    setVertices(newVerts);
    if (aA === 90 || aB === 90 || aC === 90) {
      setFormed(true);
    }
  };

  const handleNewTriangle = () => {
    const baseLeft = canvasWidth * (0.1 + Math.random() * 0.1);
    const baseRight = canvasWidth * (0.8 + Math.random() * 0.1);
    setVertices({
      a: { x: baseLeft, y: canvasHeight - 50 },
      b: { x: baseRight, y: canvasHeight - 50 },
      c: { x: canvasWidth * (0.3 + Math.random() * 0.3), y: 40 + Math.random() * 50 },
    });
    setFormed(false);
  };

  // Label positions (offset toward centroid)
  const centroid = {
    x: (vertices.a.x + vertices.b.x + vertices.c.x) / 3,
    y: (vertices.a.y + vertices.b.y + vertices.c.y) / 3,
  };
  const off = 0.25;
  const labelA = { x: vertices.a.x + (centroid.x - vertices.a.x) * off - 15, y: vertices.a.y + (centroid.y - vertices.a.y) * off - 12 };
  const labelB = { x: vertices.b.x + (centroid.x - vertices.b.x) * off - 15, y: vertices.b.y + (centroid.y - vertices.b.y) * off - 12 };
  const labelC = { x: vertices.c.x + (centroid.x - vertices.c.x) * off - 15, y: vertices.c.y + (centroid.y - vertices.c.y) * off - 12 };

  const statusText = formed
    ? "Right Triangle Found!"
    : isNearRight
    ? "Almost! Keep adjusting!"
    : "Drag to reshape — angles always sum to 180°";
  const statusColor = formed ? "#48BB78" : isNearRight ? "#F59E0B" : "#3B82F6";

  return (
    <>
      <CanvasWrapper>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
            <Text
              fontSize={22}
              fontStyle="bold"
              fill={statusColor}
              text={statusText}
              x={20}
              y={15}
              width={canvasWidth - 40}
              align="center"
            />
          </Layer>
          <Layer>
            {/* Triangle fill when formed */}
            {formed && (
              <Line
                points={[vertices.a.x, vertices.a.y, vertices.c.x, vertices.c.y, vertices.b.x, vertices.b.y]}
                closed
                fill="#48BB7820"
                stroke="#48BB78"
                strokeWidth={3}
              />
            )}
            {/* Triangle sides */}
            <Line stroke={konvaTheme.shapeStroke} strokeWidth={3} points={[vertices.a.x, vertices.a.y, vertices.b.x, vertices.b.y]} />
            <Line stroke={konvaTheme.shapeStroke} strokeWidth={3} points={[vertices.a.x, vertices.a.y, vertices.c.x, vertices.c.y]} />
            <Line stroke={konvaTheme.shapeStroke} strokeWidth={3} points={[vertices.b.x, vertices.b.y, vertices.c.x, vertices.c.y]} />
            {/* Angle labels */}
            <Text fontSize={22} fontStyle="bold" fill={ANGLE_COLORS[0]} text={`${angleA}°`} x={labelA.x} y={labelA.y} />
            <Text fontSize={22} fontStyle="bold" fill={ANGLE_COLORS[1]} text={`${angleB}°`} x={labelB.x} y={labelB.y} />
            <Text fontSize={22} fontStyle="bold" fill={ANGLE_COLORS[2]} text={`${angleC}°`} x={labelC.x} y={labelC.y} />
            {/* Fixed vertices */}
            <Circle x={vertices.a.x} y={vertices.a.y} radius={6} fill={konvaTheme.shapeStroke} stroke={konvaTheme.shapeStroke} strokeWidth={2} />
            <Circle x={vertices.b.x} y={vertices.b.y} radius={6} fill={konvaTheme.shapeStroke} stroke={konvaTheme.shapeStroke} strokeWidth={2} />
            {/* Draggable vertex */}
            {formed ? (
              <Circle x={vertices.c.x} y={vertices.c.y} radius={10} fill="#48BB78" stroke="#48BB78" strokeWidth={3} />
            ) : (
              <TouchDragHandle
                id="vertex-c"
                radius={10}
                stroke="#EF4444"
                strokeWidth={4}
                x={vertices.c.x}
                y={vertices.c.y}
                fill="#EF4444"
                onDragMove={handleDrag}
                affordanceColor="#EF4444"
                dragBoundFunc={(pos) => ({
                  x: Math.max(40, Math.min(pos.x, canvasWidth - 40)),
                  y: Math.max(30, Math.min(pos.y, canvasHeight - 80)),
                })}
              />
            )}
          </Layer>
        </Stage>
      </CanvasWrapper>

      {/* Sum display */}
      <SumDisplay>
        <SumAngle $color={ANGLE_COLORS[0]}>{angleA}°</SumAngle>
        <SumOperator>+</SumOperator>
        <SumAngle $color={ANGLE_COLORS[1]}>{angleB}°</SumAngle>
        <SumOperator>+</SumOperator>
        <SumAngle $color={ANGLE_COLORS[2]}>{angleC}°</SumAngle>
        <SumOperator>=</SumOperator>
        <SumTotal>180°</SumTotal>
      </SumDisplay>

      {formed ? (
        <CompleteSection>
          <CompleteTitle>Right Triangle Found!</CompleteTitle>
          <ExplanationDetail>
            <strong style={{ color: ANGLE_COLORS[0] }}>{angleA}°</strong> +{" "}
            <strong style={{ color: ANGLE_COLORS[1] }}>{angleB}°</strong> +{" "}
            <strong style={{ color: ANGLE_COLORS[2] }}>{angleC}°</strong> = 180° ✓
          </ExplanationDetail>
          <EducationalNote>
            The Triangle Sum Theorem: the interior angles of any triangle always add up to exactly 180°.
          </EducationalNote>
          <TryAnotherButton onClick={handleNewTriangle}>
            Try Another
          </TryAnotherButton>
        </CompleteSection>
      ) : (
        <>
          <ResetButton onClick={() => setVertices(generateVertices())}>Reset Position</ResetButton>
          <ExplanationSection>
            <ExplanationTitle>Triangle Sum Theorem</ExplanationTitle>
            <ExplanationDetail>
              The interior angles of any triangle always add up to <strong>180°</strong>.
            </ExplanationDetail>
            <ExplanationDetail>
              Drag the <strong style={{ color: "#EF4444" }}>red vertex</strong> and watch the angles change.
              Try to make a <strong>right triangle</strong> (one angle = 90°)!
            </ExplanationDetail>
          </ExplanationSection>
        </>
      )}
    </>
  );
}

// ==================== MAIN COMPONENT ====================

function TriangleSum({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { isTouchDevice } = useIsTouchDevice();
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const [showHint, setShowHint] = useState(false);

  // Phase state
  const [phase, setPhase] = useState("interact");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    angles = [],
    choices = [],
    hiddenIndex,
    x: solveX,
    expression,
    educationalNote = "",
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Canvas sizing
  const canvasWidth = Math.min(windowWidth - 40, 600);
  const canvasHeight = 300;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${angles.join(",")}`;
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

  // L4 & L5: Choice click
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

  // L3: correct answer
  const correctAnswerL3 = useMemo(() => {
    if (level !== 3) return "";
    return `${solveX}`;
  }, [level, solveX]);

  // Triangle points for canvas display (Levels 2-4)
  const triPoints = useMemo(() => {
    if (level < 2 || level > 4 || angles.length < 3) return [];
    return triangleFromAngles(angles, canvasWidth, canvasHeight);
  }, [level, angles, canvasWidth, canvasHeight]);

  const centroid = useMemo(() => {
    if (triPoints.length < 3) return { x: 0, y: 0 };
    return {
      x: (triPoints[0].x + triPoints[1].x + triPoints[2].x) / 3,
      y: (triPoints[0].y + triPoints[1].y + triPoints[2].y) / 3,
    };
  }, [triPoints]);

  const labelPositions = useMemo(() => {
    if (triPoints.length < 3) return [];
    const off = 0.3;
    return triPoints.map((v) => ({
      x: v.x + (centroid.x - v.x) * off - 20,
      y: v.y + (centroid.y - v.y) * off - 15,
    }));
  }, [triPoints, centroid]);

  // ==================== RENDER ====================

  // Level 1: Explore (self-contained)
  if (level === 1) {
    return (
      <Wrapper>
        <LevelHeader>
          <LevelBadge>Level 1</LevelBadge>
          <LevelTitle>{levelInfo.title}</LevelTitle>
        </LevelHeader>
        <InstructionText>{levelInfo.instruction}</InstructionText>
        <ExploreLevel
          konvaTheme={konvaTheme}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      </Wrapper>
    );
  }

  if (!currentProblem?.visualData) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

  return (
    <Wrapper>
      {/* Hint Button */}
      {phase !== "complete" && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level Header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{levelInfo.title}</LevelTitle>
      </LevelHeader>
      <InstructionText>{questionText}</InstructionText>

      {/* ===== Level 2: Find the Missing Angle ===== */}
      {level === 2 && (
        <>
          <CanvasWrapper>
            <Stage width={canvasWidth} height={canvasHeight}>
              <Layer>
                <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
                {triPoints.length >= 3 && (
                  <>
                    <Line
                      stroke={konvaTheme.shapeStroke}
                      strokeWidth={3}
                      points={triPoints.flatMap((p) => [p.x, p.y])}
                      closed
                    />
                    {angles.map((angle, i) => (
                      <Text
                        key={i}
                        fontSize={28}
                        fontStyle="bold"
                        fill={i === hiddenIndex ? "#EF4444" : ANGLE_COLORS[i]}
                        text={i === hiddenIndex ? "?" : `${angle}°`}
                        x={labelPositions[i]?.x || 0}
                        y={labelPositions[i]?.y || 0}
                      />
                    ))}
                    {triPoints.map((p, i) => (
                      <Circle key={i} x={p.x} y={p.y} radius={5} fill={konvaTheme.shapeStroke} />
                    ))}
                  </>
                )}
              </Layer>
            </Stage>
          </CanvasWrapper>

          {phase === "interact" && choices.length > 0 && (
            <ChooseSection>
              {showHint && hint && <HintBox>{hint}</HintBox>}
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
                      $isTouchDevice={isTouchDevice}
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
        </>
      )}

      {/* ===== Level 3: Solve for x ===== */}
      {level === 3 && (
        <>
          <CanvasWrapper>
            <Stage width={canvasWidth} height={canvasHeight}>
              <Layer>
                <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
                {triPoints.length >= 3 && (
                  <>
                    <Line
                      stroke={konvaTheme.shapeStroke}
                      strokeWidth={3}
                      points={triPoints.flatMap((p) => [p.x, p.y])}
                      closed
                    />
                    <Text fontSize={28} fontStyle="bold" fill={ANGLE_COLORS[0]}
                      text={`${angles[0]}°`}
                      x={labelPositions[0]?.x || 0} y={labelPositions[0]?.y || 0}
                    />
                    <Text fontSize={28} fontStyle="bold" fill={ANGLE_COLORS[1]}
                      text={`${angles[1]}°`}
                      x={labelPositions[1]?.x || 0} y={labelPositions[1]?.y || 0}
                    />
                    <Text fontSize={32} fontStyle="bold" fill="#EF4444"
                      text={expression}
                      x={labelPositions[2]?.x || 0} y={labelPositions[2]?.y || 0}
                    />
                    {triPoints.map((p, i) => (
                      <Circle key={i} x={p.x} y={p.y} radius={5} fill={konvaTheme.shapeStroke} />
                    ))}
                  </>
                )}
              </Layer>
            </Stage>
          </CanvasWrapper>

          {phase === "interact" && (
            <AnswerSection>
              {showHint && hint && <HintBox>{hint}</HintBox>}
              <AnswerInputContainer>
                <AnswerInput
                  correctAnswer={correctAnswerL3}
                  answerType="number"
                  onCorrect={() => {
                    setPhase("complete");
                    revealAnswer();
                  }}
                  onTryAnother={handleTryAnother}
                  disabled={showAnswer}
                  placeholder="x = ?"
                />
              </AnswerInputContainer>
            </AnswerSection>
          )}
        </>
      )}

      {/* ===== Level 4: Classify the Triangle ===== */}
      {level === 4 && (
        <>
          <CanvasWrapper>
            <Stage width={canvasWidth} height={canvasHeight}>
              <Layer>
                <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
                {triPoints.length >= 3 && (
                  <>
                    <Line
                      stroke={konvaTheme.shapeStroke}
                      strokeWidth={3}
                      points={triPoints.flatMap((p) => [p.x, p.y])}
                      closed
                    />
                    {angles.map((angle, i) => (
                      <Text
                        key={i}
                        fontSize={28}
                        fontStyle="bold"
                        fill={ANGLE_COLORS[i]}
                        text={`${angle}°`}
                        x={labelPositions[i]?.x || 0}
                        y={labelPositions[i]?.y || 0}
                      />
                    ))}
                    {triPoints.map((p, i) => (
                      <Circle key={i} x={p.x} y={p.y} radius={5} fill={konvaTheme.shapeStroke} />
                    ))}
                  </>
                )}
              </Layer>
            </Stage>
          </CanvasWrapper>

          {phase === "interact" && (
            <ChooseSection>
              {showHint && hint && <HintBox>{hint}</HintBox>}
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
                      $isTouchDevice={isTouchDevice}
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
        </>
      )}

      {/* ===== Level 5: Word Problems ===== */}
      {level === 5 && phase === "interact" && choices.length > 0 && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
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
                  $isTouchDevice={isTouchDevice}
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

      {/* ===== Phase: Complete ===== */}
      {phase === "complete" && (
        <CompleteSection>
          <CompleteTitle>Correct!</CompleteTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another
          </TryAnotherButton>
        </CompleteSection>
      )}
    </Wrapper>
  );
}

export default TriangleSum;

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
  font-size: 16px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 12px 0;
  max-width: 700px;
  line-height: 1.5;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const CanvasWrapper = styled.div`
  margin: 8px 0 20px 0;
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
`;

// Level 1: Sum display
const SumDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const SumAngle = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: ${(props) => props.$color};
  font-family: "Georgia", serif;

  @media (min-width: 768px) {
    font-size: 26px;
  }
`;

const SumOperator = styled.span`
  font-size: 20px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const SumTotal = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: "Georgia", serif;

  @media (min-width: 768px) {
    font-size: 28px;
  }
`;

// Choice buttons (L4, L5)
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
  padding: ${(props) => (props.$isTouchDevice ? "16px 20px" : "13px 20px")};
  font-size: ${(props) => (props.$isTouchDevice ? "17px" : "16px")};
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

const FeedbackText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) =>
    props.$isWrong
      ? props.theme.colors.danger || "#E53E3E"
      : props.theme.colors.buttonSuccess};
  margin: 0;
`;

// Answer input sections (L2, L3)
const AnswerSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const AnswerInputContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

// Complete section
const CompleteSection = styled.div`
  width: 100%;
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

const CompleteTitle = styled.h3`
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

const ResetButton = styled.button`
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
  margin-bottom: 16px;

  &:hover {
    opacity: 0.9;
  }
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-left: 4px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 8px;
  padding: 20px;
`;

const ExplanationTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0 0 10px 0;
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
`;
