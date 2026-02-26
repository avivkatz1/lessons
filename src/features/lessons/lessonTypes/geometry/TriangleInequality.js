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
  1: { title: "Explore & Discover", instruction: "Drag the red endpoints together to form a triangle!" },
  2: { title: "Can It Form a Triangle?", instruction: "" },
  3: { title: "Which Rule Fails?", instruction: "" },
  4: { title: "Find the Range", instruction: "" },
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

// ==================== LEVEL 1: EXPLORE COMPONENT ====================

function ExploreLevel({ konvaTheme, canvasWidth, canvasHeight }) {
  const generatePoints = () => [
    { id: 0, x: canvasWidth * 0.3, y: 43 },
    { id: 1, x: canvasWidth * 0.22, y: canvasHeight - 80 },
    { id: 2, x: canvasWidth * 0.78, y: canvasHeight - 80 },
    { id: 3, x: canvasWidth * 0.65, y: 63 },
  ];

  const [points, setPoints] = useState(generatePoints);
  const [formed, setFormed] = useState(false);

  const handleDrag = (e) => {
    if (formed) return;
    const draggedId = Number(e.target.attrs.id);
    const newPoints = points.map((point) => {
      if (point.id !== draggedId) return point;
      return { ...point, x: e.target.x(), y: e.target.y() };
    });

    // Check if endpoints 0 and 3 are close enough to snap together
    const p0 = newPoints[0];
    const p3 = newPoints[3];
    const dist = Math.sqrt(Math.pow(p0.x - p3.x, 2) + Math.pow(p0.y - p3.y, 2));

    if (dist < 30) {
      // Snap together at midpoint
      const midX = (p0.x + p3.x) / 2;
      const midY = (p0.y + p3.y) / 2;
      newPoints[0] = { ...newPoints[0], x: midX, y: midY };
      newPoints[3] = { ...newPoints[3], x: midX, y: midY };
      setPoints(newPoints);
      setFormed(true);
    } else {
      setPoints(newPoints);
    }
  };

  const handleNewTriangle = () => {
    // Randomize base width for variety
    const baseLeft = canvasWidth * (0.15 + Math.random() * 0.12);
    const baseRight = canvasWidth * (0.68 + Math.random() * 0.15);
    setPoints([
      { id: 0, x: canvasWidth * (0.2 + Math.random() * 0.15), y: 40 + Math.random() * 40 },
      { id: 1, x: baseLeft, y: canvasHeight - 80 },
      { id: 2, x: baseRight, y: canvasHeight - 80 },
      { id: 3, x: canvasWidth * (0.55 + Math.random() * 0.2), y: 40 + Math.random() * 40 },
    ]);
    setFormed(false);
  };

  const sideA = Math.sqrt(
    Math.pow(points[1].y - points[0].y, 2) + Math.pow(points[1].x - points[0].x, 2)
  );
  const sideB = Math.sqrt(
    Math.pow(points[3].y - points[2].y, 2) + Math.pow(points[3].x - points[2].x, 2)
  );
  const sideC = Math.sqrt(
    Math.pow(points[2].y - points[1].y, 2) + Math.pow(points[2].x - points[1].x, 2)
  );

  const canFormTriangle = sideC < sideA + sideB;

  // Distance between the two draggable endpoints
  const endpointDist = Math.sqrt(
    Math.pow(points[0].x - points[3].x, 2) + Math.pow(points[0].y - points[3].y, 2)
  );
  const isClose = !formed && endpointDist < 80;

  return (
    <>
      <CanvasWrapper>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
            {formed ? (
              <Text
                fontSize={24}
                fontStyle="bold"
                fill="#48BB78"
                text="Triangle Formed!"
                x={40}
                y={20}
                width={canvasWidth - 80}
                align="center"
              />
            ) : (
              <Text
                fontSize={22}
                fontStyle="bold"
                fill={canFormTriangle ? (isClose ? "#48BB78" : "#3B82F6") : "#EF4444"}
                text={
                  canFormTriangle
                    ? isClose
                      ? "Almost there! Bring them together!"
                      : "The two sides can reach!"
                    : "The two sides aren't long enough"
                }
                x={40}
                y={20}
                width={canvasWidth - 80}
                wrap="word"
              />
            )}
          </Layer>
          <Layer>
            {/* Side length bars (only when not formed) */}
            {!formed && (
              <>
                <Rect stroke="#48BB78" strokeWidth={2} x={points[1].x} y={canvasHeight - 40} width={sideA} height={10} fill="#48BB78" opacity={0.4} />
                <Text fontSize={28} fontStyle="bold" fill="#48BB78" text={sideA.toFixed(0)} x={canvasWidth * 0.32} y={canvasHeight - 30} />
                <Rect stroke="#F59E0B" strokeWidth={2} x={points[2].x - sideB} y={canvasHeight - 40} width={sideB} height={10} fill="#F59E0B" opacity={0.4} />
                <Text fontSize={28} fontStyle="bold" fill="#F59E0B" text={sideB.toFixed(0)} x={canvasWidth * 0.6} y={canvasHeight - 30} />
                <Text fontSize={28} fontStyle="bold" fill={konvaTheme.labelText} text={sideC.toFixed(0)} x={canvasWidth * 0.46} y={canvasHeight - 110} />
              </>
            )}
            {/* Side labels along edges when formed */}
            {formed && (
              <>
                <Text fontSize={20} fontStyle="bold" fill="#48BB78"
                  text={`a = ${sideA.toFixed(0)}`}
                  x={(points[0].x + points[1].x) / 2 - 40}
                  y={(points[0].y + points[1].y) / 2 - 10}
                />
                <Text fontSize={20} fontStyle="bold" fill="#F59E0B"
                  text={`b = ${sideB.toFixed(0)}`}
                  x={(points[3].x + points[2].x) / 2 + 10}
                  y={(points[3].y + points[2].y) / 2 - 10}
                />
                <Text fontSize={20} fontStyle="bold" fill={konvaTheme.labelText}
                  text={`c = ${sideC.toFixed(0)}`}
                  x={(points[1].x + points[2].x) / 2 - 20}
                  y={points[1].y + 15}
                />
              </>
            )}
          </Layer>
          <Layer>
            {/* Filled triangle when formed */}
            {formed && (
              <Line
                points={[points[1].x, points[1].y, points[0].x, points[0].y, points[2].x, points[2].y]}
                closed
                fill="#48BB7820"
                stroke="#48BB78"
                strokeWidth={3}
              />
            )}
            {/* Side lines */}
            <Line stroke="#48BB78" strokeWidth={4} points={[points[1].x, points[1].y, points[0].x, points[0].y]} />
            <Line stroke={konvaTheme.shapeStroke} strokeWidth={4} points={[points[1].x, points[1].y, points[2].x, points[2].y]} />
            <Line stroke="#F59E0B" strokeWidth={4} points={[points[2].x, points[2].y, points[3].x, points[3].y]} />
            {/* Points */}
            {points.map((p, i) => {
              if (i === 0 || i === 3) {
                if (formed) {
                  // Show merged vertex as a green dot (only render once for point 0)
                  return i === 0 ? (
                    <Circle key={p.id} radius={10} fill="#48BB78" stroke="#48BB78" strokeWidth={3} x={p.x} y={p.y} />
                  ) : null;
                }
                return (
                  <TouchDragHandle
                    key={p.id}
                    id={i}
                    radius={10}
                    stroke={canFormTriangle ? "#48BB78" : "#EF4444"}
                    strokeWidth={4}
                    x={p.x}
                    y={p.y}
                    fill="#EF4444"
                    onDragMove={handleDrag}
                    affordanceColor="#EF4444"
                    dragBoundFunc={(pos) => ({
                      x: Math.max(20, Math.min(pos.x, canvasWidth - 20)),
                      y: Math.max(20, Math.min(pos.y, canvasHeight - 60)),
                    })}
                  />
                );
              }
              return (
                <Circle key={p.id} id={i} radius={6} stroke={konvaTheme.shapeStroke} strokeWidth={2} x={p.x} y={p.y} fill={konvaTheme.shapeStroke} />
              );
            })}
          </Layer>
        </Stage>
      </CanvasWrapper>

      {formed ? (
        <CompleteSection>
          <CompleteTitle>Triangle Formed!</CompleteTitle>
          <ExplanationDetail>
            <strong style={{ color: "#48BB78" }}>{sideA.toFixed(0)}</strong> +{" "}
            <strong style={{ color: "#F59E0B" }}>{sideB.toFixed(0)}</strong> ={" "}
            {(sideA + sideB).toFixed(0)} &gt; <strong>{sideC.toFixed(0)}</strong> ✓
          </ExplanationDetail>
          <EducationalNote>
            The Triangle Inequality Theorem says that the sum of any two sides must be greater than the third side.
          </EducationalNote>
          <TryAnotherButton onClick={handleNewTriangle}>
            Try Another
          </TryAnotherButton>
        </CompleteSection>
      ) : (
        <>
          <ResetButton onClick={() => setPoints(generatePoints())}>Reset Position</ResetButton>
          <ExplanationSection>
            <ExplanationTitle>Triangle Inequality Theorem</ExplanationTitle>
            <ExplanationDetail>
              For any triangle, the sum of any two sides must be greater than the third side: <strong>a + b &gt; c</strong>
            </ExplanationDetail>
            <ExplanationDetail>
              Drag the <strong style={{ color: "#EF4444" }}>red endpoints</strong> together to form a triangle! Make the{" "}
              <strong style={{ color: "#48BB78" }}>green</strong> and{" "}
              <strong style={{ color: "#F59E0B" }}>orange</strong> sides meet.
            </ExplanationDetail>
          </ExplanationSection>
        </>
      )}
    </>
  );
}

// ==================== MAIN COMPONENT ====================

function TriangleInequality({ triggerNewProblem }) {
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

  // L3: selected check index
  const [selectedCheck, setSelectedCheck] = useState(null);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    sides = [],
    choices = [],
    checks = [],
    failingIndex,
    sideA,
    sideB,
    minVal,
    maxVal,
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
  const problemKey = `${level}-${currentQuestionIndex}-${sides.join(",")}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
    setSelectedCheck(null);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setSelectedCheck(null);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  // L2 & L5: Choice click
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

  // L3: Check card click
  const handleCheckClick = useCallback((index) => {
    if (phase !== "interact" || shakingIdx !== null) return;

    // "All Pass" is index -1
    if (index === -1) {
      if (failingIndex === -1) {
        setSelectedCheck(-1);
        setTimeout(() => {
          setPhase("complete");
          revealAnswer();
        }, 800);
      } else {
        setShakingIdx(-1);
        setWrongAttempts((prev) => prev + 1);
        setTimeout(() => setShakingIdx(null), 600);
      }
    } else {
      if (index === failingIndex) {
        setSelectedCheck(index);
        setTimeout(() => {
          setPhase("complete");
          revealAnswer();
        }, 800);
      } else {
        setShakingIdx(index);
        setWrongAttempts((prev) => prev + 1);
        setTimeout(() => setShakingIdx(null), 600);
      }
    }
  }, [phase, shakingIdx, failingIndex, revealAnswer]);

  // L4: answer as array [minVal, maxVal]
  const correctAnswerL4 = useMemo(() => {
    if (level !== 4) return [];
    return [`${minVal}`, `${maxVal}`];
  }, [level, minVal, maxVal]);

  // ==================== RENDER ====================

  // Level 1: Explore (self-contained, no backend data needed for interaction)
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

      {/* ===== Level 2: Yes/No Choice with triangle visualization ===== */}
      {level === 2 && (
        <>
          <CanvasWrapper>
            <SidesDisplay>
              {sides.map((s, i) => (
                <SideChip key={i} $color={["#3B82F6", "#10B981", "#F59E0B"][i]}>
                  Side {i + 1}: <strong>{s}</strong>
                </SideChip>
              ))}
            </SidesDisplay>
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

      {/* ===== Level 3: Which Rule Fails? ===== */}
      {level === 3 && (
        <>
          <CanvasWrapper>
            <SidesDisplay>
              {sides.map((s, i) => (
                <SideChip key={i} $color={["#3B82F6", "#10B981", "#F59E0B"][i]}>
                  Side {i + 1}: <strong>{s}</strong>
                </SideChip>
              ))}
            </SidesDisplay>
          </CanvasWrapper>

          {phase === "interact" && (
            <CheckSection>
              {showHint && hint && <HintBox>{hint}</HintBox>}
              {wrongAttempts > 0 && shakingIdx === null && (
                <FeedbackText $isWrong>That rule actually holds — try another!</FeedbackText>
              )}
              <CheckGrid>
                {checks.map((check, idx) => {
                  const isSelected = selectedCheck === idx;
                  const isCorrectSelected = isSelected && idx === failingIndex;
                  const isShaking = shakingIdx === idx;
                  return (
                    <CheckCard
                      key={idx}
                      $correct={isCorrectSelected}
                      $wrong={isShaking}
                      $isTouchDevice={isTouchDevice}
                      onClick={() => handleCheckClick(idx)}
                      disabled={selectedCheck !== null || isShaking}
                    >
                      <CheckText>{check.text}</CheckText>
                      {isCorrectSelected && <CheckResult $fail>FAILS ✗</CheckResult>}
                    </CheckCard>
                  );
                })}
                {/* All Pass button */}
                <CheckCard
                  $correct={selectedCheck === -1 && failingIndex === -1}
                  $wrong={shakingIdx === -1}
                  $isTouchDevice={isTouchDevice}
                  onClick={() => handleCheckClick(-1)}
                  disabled={selectedCheck !== null || shakingIdx !== null}
                >
                  <CheckText>All Pass!</CheckText>
                  {selectedCheck === -1 && failingIndex === -1 && <CheckResult $pass>✓</CheckResult>}
                </CheckCard>
              </CheckGrid>
            </CheckSection>
          )}
        </>
      )}

      {/* ===== Level 4: Find the Range ===== */}
      {level === 4 && (
        <>
          <RangeDisplay>
            <RangeFormula>
              |{sideA} − {sideB}| &lt; third side &lt; {sideA} + {sideB}
            </RangeFormula>
            <RangeInstruction>
              Enter the lower bound and upper bound (exclusive) for the third side.
            </RangeInstruction>
          </RangeDisplay>

          {phase === "interact" && (
            <AnswerSection>
              {showHint && hint && <HintBox>{hint}</HintBox>}
              <AnswerInputContainer>
                <AnswerInput
                  correctAnswer={correctAnswerL4}
                  answerType="array"
                  onCorrect={() => {
                    setPhase("complete");
                    revealAnswer();
                  }}
                  onTryAnother={handleTryAnother}
                  disabled={showAnswer}
                  placeholder="lower, upper (e.g. 3, 15)"
                />
              </AnswerInputContainer>
            </AnswerSection>
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

export default TriangleInequality;

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

// Sides display chips
const SidesDisplay = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const SideChip = styled.div`
  background-color: ${(props) => props.$color + "18"};
  border: 2px solid ${(props) => props.$color};
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 18px;
  color: ${(props) => props.$color};
  font-weight: 500;

  strong {
    font-size: 24px;
  }

  @media (min-width: 768px) {
    padding: 14px 24px;
    font-size: 20px;

    strong {
      font-size: 28px;
    }
  }
`;

// Choice buttons (L2, L5)
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

// Level 3: Check cards
const CheckSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: ${fadeInAnim} 0.3s ease;
`;

const CheckGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 420px;
`;

const CheckCard = styled.button`
  width: 100%;
  padding: ${(props) => (props.$isTouchDevice ? "16px 20px" : "14px 20px")};
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
  justify-content: space-between;
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
      cursor: default;
    `}

  ${(props) =>
    props.$wrong &&
    css`
      animation: ${shakeAnim} 0.5s ease;
      background-color: ${props.theme.colors.danger || "#E53E3E"}15;
      border-color: ${props.theme.colors.danger || "#E53E3E"};
    `}

  &:disabled {
    cursor: default;
  }
`;

const CheckText = styled.span`
  font-size: 18px;
  font-weight: 600;
  font-family: "Georgia", serif;
`;

const CheckResult = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${(props) =>
    props.$fail
      ? props.theme.colors.danger || "#E53E3E"
      : props.theme.colors.buttonSuccess};
`;

// Level 4: Range
const RangeDisplay = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
`;

const RangeFormula = styled.p`
  font-size: 20px;
  font-weight: 700;
  font-family: "Georgia", serif;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0 0 10px 0;

  @media (min-width: 768px) {
    font-size: 22px;
  }
`;

const RangeInstruction = styled.p`
  font-size: 14px;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
`;

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
