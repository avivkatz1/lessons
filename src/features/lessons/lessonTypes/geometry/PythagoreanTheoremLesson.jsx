import React, { useState, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Line, Circle, Rect, Text } from "react-konva";
import { useLessonState, useIsTouchDevice, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Identify the Hypotenuse", instruction: "" },
  2: { title: "Find the Hypotenuse", instruction: "" },
  3: { title: "Find a Missing Leg", instruction: "" },
  4: { title: "Mixed", instruction: "" },
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

// ==================== GEOMETRY HELPERS ====================

/**
 * Compute the right-angle square indicator points (inside the triangle).
 * Uses unit vectors along the two legs from the right-angle vertex.
 */
function rightAngleSquare(vertices, rightAngleIdx, size) {
  const C = vertices[rightAngleIdx];
  // The other two vertices
  const others = vertices.filter((_, i) => i !== rightAngleIdx);
  const A = others[0];
  const B = others[1];

  // Unit vectors from C toward A and C toward B
  const dAx = A.x - C.x;
  const dAy = A.y - C.y;
  const lenA = Math.sqrt(dAx * dAx + dAy * dAy);
  const uAx = dAx / lenA;
  const uAy = dAy / lenA;

  const dBx = B.x - C.x;
  const dBy = B.y - C.y;
  const lenB = Math.sqrt(dBx * dBx + dBy * dBy);
  const uBx = dBx / lenB;
  const uBy = dBy / lenB;

  // Four corners of the square
  const p1 = { x: C.x + uAx * size, y: C.y + uAy * size };
  const p2 = { x: C.x + uAx * size + uBx * size, y: C.y + uAy * size + uBy * size };
  const p3 = { x: C.x + uBx * size, y: C.y + uBy * size };

  return [C.x, C.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y];
}

/**
 * Compute the midpoint of a side and offset it perpendicular (away from opposite vertex).
 */
function labelPosition(from, to, opposite, offset) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;

  // Direction perpendicular to the side
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  // Two perpendicular directions
  const px1 = -dy / len;
  const py1 = dx / len;

  // Pick the one that points away from the opposite vertex
  const toOppX = opposite.x - mx;
  const toOppY = opposite.y - my;
  const dot = px1 * toOppX + py1 * toOppY;

  const sign = dot > 0 ? -1 : 1;
  return {
    x: mx + sign * px1 * offset,
    y: my + sign * py1 * offset,
  };
}

// ==================== DIAGRAM COMPONENT ====================

function PythagoreanTheoremDiagram({ visualData, konvaTheme, canvasWidth, canvasHeight }) {
  const {
    level,
    vertices,
    rightAngleVertexIndex,
    sideLabels = [],
    wordProblemContext,
    contextElements,
  } = visualData;

  const scaleX = canvasWidth / 400;
  const scaleY = canvasHeight / 400;
  const s = useCallback((v) => ({ x: v.x * scaleX, y: v.y * scaleY }), [scaleX, scaleY]);

  // Colors
  const bgColor = konvaTheme.canvasBackground;
  const legColor1 = konvaTheme.adjacent || "#3B82F6";
  const legColor2 = konvaTheme.opposite || "#EF4444";
  const hypColor = konvaTheme.hypotenuse || "#8B5CF6";
  const strokeColor = konvaTheme.shapeStroke || "#000000";
  const lblBg = konvaTheme.labelBackground || "#ffffff";
  const lblText = konvaTheme.labelText || "#000000";
  const angleColor = konvaTheme.angle || "#F59E0B";

  // ===== WORD PROBLEM DIAGRAM (L5) =====
  if (level === 5 && wordProblemContext && contextElements) {
    return (
      <Stage width={canvasWidth} height={canvasHeight}>
        <Layer>
          <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} listening={false} />
          {wordProblemContext === "ladder" && renderLadder(contextElements, s, legColor1, legColor2, hypColor, strokeColor, lblBg, lblText, angleColor, scaleX)}
          {wordProblemContext === "rectangle" && renderRectangle(contextElements, s, legColor1, legColor2, hypColor, strokeColor, lblBg, lblText, angleColor, scaleX)}
          {wordProblemContext === "distance" && renderDistance(contextElements, s, legColor1, legColor2, hypColor, strokeColor, lblBg, lblText, angleColor, scaleX)}
        </Layer>
      </Stage>
    );
  }

  // ===== TRIANGLE DIAGRAM (L1-L4) =====
  if (!vertices || vertices.length < 3) return null;

  const sv = vertices.map((v) => s(v));
  const raIdx = rightAngleVertexIndex ?? 2;

  // Assign leg colors: first leg = blue, second leg = red
  let legCount = 0;
  const sideColors = sideLabels.map((sl) => {
    if (sl.role === "hypotenuse") return hypColor;
    legCount++;
    return legCount === 1 ? legColor1 : legColor2;
  });

  // Side definitions: each side connects fromIdx → toIdx
  const sides = sideLabels.map((sl, i) => ({
    from: sv[sl.fromIdx],
    to: sv[sl.toIdx],
    display: sl.display,
    color: sideColors[i],
    isHidden: sl.display === "?",
  }));

  // Right angle square
  const raSquare = rightAngleSquare(sv, raIdx, 15 * Math.min(scaleX, scaleY));

  // Opposite vertex for each side (the vertex NOT on that side)
  const oppositeVertex = (fromIdx, toIdx) => {
    const otherIdx = [0, 1, 2].find((i) => i !== fromIdx && i !== toIdx);
    return sv[otherIdx];
  };

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} listening={false} />

        {/* Triangle outline — draw each side separately for color coding */}
        {sides.map((side, i) => (
          <Line
            key={`side-${i}`}
            points={[side.from.x, side.from.y, side.to.x, side.to.y]}
            stroke={side.color}
            strokeWidth={3}
            listening={false}
          />
        ))}

        {/* Vertex dots */}
        {sv.map((v, i) => (
          <Circle key={`v-${i}`} x={v.x} y={v.y} radius={4} fill={strokeColor} listening={false} />
        ))}

        {/* Right angle square */}
        <Line points={raSquare} closed stroke={angleColor} strokeWidth={2} listening={false} />

        {/* Side labels */}
        {sides.map((side, i) => {
          const opp = oppositeVertex(sideLabels[i].fromIdx, sideLabels[i].toIdx);
          const pos = labelPosition(side.from, side.to, opp, 22 * Math.min(scaleX, scaleY));
          const text = side.display;
          const textWidth = text.length * 11 * Math.min(scaleX, scaleY);
          const textHeight = 20 * Math.min(scaleX, scaleY);
          const fontSize = Math.round(15 * Math.min(scaleX, scaleY));
          return (
            <React.Fragment key={`label-${i}`}>
              <Rect
                x={pos.x - textWidth / 2 - 4}
                y={pos.y - textHeight / 2 - 2}
                width={textWidth + 8}
                height={textHeight + 4}
                fill={lblBg}
                cornerRadius={4}
                listening={false}
              />
              <Text
                x={pos.x - textWidth / 2}
                y={pos.y - textHeight / 2}
                text={text}
                fontSize={fontSize}
                fontStyle={side.isHidden ? "bold" : "normal"}
                fill={side.isHidden ? side.color : lblText}
                width={textWidth}
                height={textHeight}
                align="center"
                verticalAlign="middle"
                listening={false}
              />
            </React.Fragment>
          );
        })}
      </Layer>
    </Stage>
  );
}

// ==================== WORD PROBLEM RENDERERS ====================

function renderLadder(ctx, s, legColor1, legColor2, hypColor, strokeColor, lblBg, lblText, angleColor, scaleX) {
  const wallTop = s(ctx.wallTop);
  const wallBase = s(ctx.wallBase);
  const ladderBase = s(ctx.ladderBase);
  const sc = Math.min(scaleX, 1);
  const fontSize = Math.round(14 * sc);

  const labels = [
    { text: ctx.hideIdx === 0 ? "?" : String(ctx.groundDistance), pos: { x: (ladderBase.x + wallBase.x) / 2, y: wallBase.y + 22 * sc }, color: ctx.hideIdx === 0 ? legColor1 : lblText },
    { text: ctx.hideIdx === 1 ? "?" : String(ctx.wallHeight), pos: { x: wallBase.x + 22 * sc, y: (wallTop.y + wallBase.y) / 2 }, color: ctx.hideIdx === 1 ? legColor2 : lblText },
    { text: ctx.hideIdx === 2 ? "?" : String(ctx.ladderLength), pos: { x: (ladderBase.x + wallTop.x) / 2 - 20 * sc, y: (ladderBase.y + wallTop.y) / 2 - 10 * sc }, color: ctx.hideIdx === 2 ? hypColor : lblText },
  ];

  // Right angle at wall base
  const raSize = 12 * sc;

  return (
    <>
      {/* Wall (vertical) */}
      <Line points={[wallTop.x, wallTop.y, wallBase.x, wallBase.y]} stroke={legColor2} strokeWidth={4} listening={false} />
      {/* Ground */}
      <Line points={[ladderBase.x - 20 * sc, wallBase.y, wallBase.x + 30 * sc, wallBase.y]} stroke={strokeColor} strokeWidth={2} listening={false} />
      {/* Ladder (hypotenuse) */}
      <Line points={[ladderBase.x, ladderBase.y, wallTop.x, wallTop.y]} stroke={hypColor} strokeWidth={3} listening={false} />
      {/* Ground leg */}
      <Line points={[ladderBase.x, ladderBase.y, wallBase.x, wallBase.y]} stroke={legColor1} strokeWidth={3} dash={[6, 4]} listening={false} />
      {/* Right angle square */}
      <Line
        points={[
          wallBase.x - raSize, wallBase.y,
          wallBase.x - raSize, wallBase.y - raSize,
          wallBase.x, wallBase.y - raSize,
        ]}
        stroke={angleColor} strokeWidth={2} listening={false}
      />
      {/* Wall hatching */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const yy = wallTop.y + ((wallBase.y - wallTop.y) * i) / 7;
        return (
          <Line key={`h-${i}`} points={[wallBase.x, yy, wallBase.x + 10 * sc, yy + 8 * sc]} stroke={strokeColor} strokeWidth={1} opacity={0.4} listening={false} />
        );
      })}
      {/* Labels */}
      {labels.map((l, i) => (
        <React.Fragment key={`ll-${i}`}>
          <Rect x={l.pos.x - 18 * sc} y={l.pos.y - 10 * sc} width={36 * sc} height={20 * sc} fill={lblBg} cornerRadius={3} listening={false} />
          <Text x={l.pos.x - 18 * sc} y={l.pos.y - 10 * sc} text={l.text} fontSize={fontSize} fontStyle={l.text === "?" ? "bold" : "normal"} fill={l.color} width={36 * sc} height={20 * sc} align="center" verticalAlign="middle" listening={false} />
        </React.Fragment>
      ))}
    </>
  );
}

function renderRectangle(ctx, s, legColor1, legColor2, hypColor, strokeColor, lblBg, lblText, angleColor, scaleX) {
  const tl = s(ctx.topLeft);
  const tr = s(ctx.topRight);
  const bl = s(ctx.bottomLeft);
  const br = s(ctx.bottomRight);
  const sc = Math.min(scaleX, 1);
  const fontSize = Math.round(14 * sc);

  // Right angle square at bottom-left
  const raSize = 12 * sc;

  const labels = [
    // width (left side, a)
    { text: ctx.hideIdx === 0 ? "?" : String(ctx.width), pos: { x: bl.x - 25 * sc, y: (tl.y + bl.y) / 2 }, color: ctx.hideIdx === 0 ? legColor1 : lblText },
    // length (bottom side, b)
    { text: ctx.hideIdx === 1 ? "?" : String(ctx.length), pos: { x: (bl.x + br.x) / 2, y: bl.y + 22 * sc }, color: ctx.hideIdx === 1 ? legColor2 : lblText },
    // diagonal (c)
    { text: ctx.hideIdx === 2 ? "?" : String(ctx.diagonal), pos: { x: (bl.x + tr.x) / 2 + 15 * sc, y: (bl.y + tr.y) / 2 - 10 * sc }, color: ctx.hideIdx === 2 ? hypColor : lblText },
  ];

  return (
    <>
      {/* Rectangle outline */}
      <Line points={[tl.x, tl.y, tr.x, tr.y, br.x, br.y, bl.x, bl.y]} closed stroke={strokeColor} strokeWidth={2} listening={false} />
      {/* Width (left side) highlighted */}
      <Line points={[bl.x, bl.y, tl.x, tl.y]} stroke={legColor1} strokeWidth={3} listening={false} />
      {/* Length (bottom) highlighted */}
      <Line points={[bl.x, bl.y, br.x, br.y]} stroke={legColor2} strokeWidth={3} listening={false} />
      {/* Diagonal */}
      <Line points={[bl.x, bl.y, tr.x, tr.y]} stroke={hypColor} strokeWidth={3} dash={[8, 5]} listening={false} />
      {/* Right angle at bottom-left */}
      <Line
        points={[
          bl.x + raSize, bl.y,
          bl.x + raSize, bl.y - raSize,
          bl.x, bl.y - raSize,
        ]}
        stroke={angleColor} strokeWidth={2} listening={false}
      />
      {/* Labels */}
      {labels.map((l, i) => (
        <React.Fragment key={`rl-${i}`}>
          <Rect x={l.pos.x - 18 * sc} y={l.pos.y - 10 * sc} width={36 * sc} height={20 * sc} fill={lblBg} cornerRadius={3} listening={false} />
          <Text x={l.pos.x - 18 * sc} y={l.pos.y - 10 * sc} text={l.text} fontSize={fontSize} fontStyle={l.text === "?" ? "bold" : "normal"} fill={l.color} width={36 * sc} height={20 * sc} align="center" verticalAlign="middle" listening={false} />
        </React.Fragment>
      ))}
    </>
  );
}

function renderDistance(ctx, s, legColor1, legColor2, hypColor, strokeColor, lblBg, lblText, angleColor, scaleX) {
  const start = s(ctx.start);
  const corner = s(ctx.corner);
  const end = s(ctx.end);
  const sc = Math.min(scaleX, 1);
  const fontSize = Math.round(14 * sc);

  const raSize = 12 * sc;

  const labels = [
    // east distance (horizontal, a)
    { text: ctx.hideIdx === 0 ? "?" : String(ctx.east), pos: { x: (start.x + corner.x) / 2, y: corner.y + 22 * sc }, color: ctx.hideIdx === 0 ? legColor1 : lblText },
    // north distance (vertical, b)
    { text: ctx.hideIdx === 1 ? "?" : String(ctx.north), pos: { x: corner.x + 22 * sc, y: (corner.y + end.y) / 2 }, color: ctx.hideIdx === 1 ? legColor2 : lblText },
    // straight-line distance (hypotenuse, c)
    { text: ctx.hideIdx === 2 ? "?" : String(ctx.direct), pos: { x: (start.x + end.x) / 2 - 20 * sc, y: (start.y + end.y) / 2 - 10 * sc }, color: ctx.hideIdx === 2 ? hypColor : lblText },
  ];

  return (
    <>
      {/* East path (horizontal) */}
      <Line points={[start.x, start.y, corner.x, corner.y]} stroke={legColor1} strokeWidth={3} dash={[6, 4]} listening={false} />
      {/* North path (vertical) */}
      <Line points={[corner.x, corner.y, end.x, end.y]} stroke={legColor2} strokeWidth={3} dash={[6, 4]} listening={false} />
      {/* Direct distance (hypotenuse) */}
      <Line points={[start.x, start.y, end.x, end.y]} stroke={hypColor} strokeWidth={3} listening={false} />
      {/* Right angle at corner */}
      <Line
        points={[
          corner.x - raSize, corner.y,
          corner.x - raSize, corner.y - raSize,
          corner.x, corner.y - raSize,
        ]}
        stroke={angleColor} strokeWidth={2} listening={false}
      />
      {/* Start and end points */}
      <Circle x={start.x} y={start.y} radius={5} fill={konvaGreen(strokeColor)} listening={false} />
      <Circle x={end.x} y={end.y} radius={5} fill={strokeColor} listening={false} />
      {/* Start/End labels */}
      <Text x={start.x - 20 * sc} y={start.y + 10 * sc} text="Start" fontSize={Math.round(12 * sc)} fill={lblText} listening={false} />
      <Text x={end.x - 12 * sc} y={end.y - 22 * sc} text="End" fontSize={Math.round(12 * sc)} fill={lblText} listening={false} />
      {/* East/North labels */}
      <Text x={(start.x + corner.x) / 2 - 14 * sc} y={corner.y + 8 * sc} text="East" fontSize={Math.round(11 * sc)} fill={legColor1} opacity={0.7} listening={false} />
      <Text x={corner.x + 8 * sc} y={(corner.y + end.y) / 2 - 6 * sc} text="North" fontSize={Math.round(11 * sc)} fill={legColor2} opacity={0.7} listening={false} />
      {/* Value labels */}
      {labels.map((l, i) => (
        <React.Fragment key={`dl-${i}`}>
          <Rect x={l.pos.x - 18 * sc} y={l.pos.y - 10 * sc} width={36 * sc} height={20 * sc} fill={lblBg} cornerRadius={3} listening={false} />
          <Text x={l.pos.x - 18 * sc} y={l.pos.y - 10 * sc} text={l.text} fontSize={fontSize} fontStyle={l.text === "?" ? "bold" : "normal"} fill={l.color} width={36 * sc} height={20 * sc} align="center" verticalAlign="middle" listening={false} />
        </React.Fragment>
      ))}
    </>
  );
}

// Helper: return a green-ish color for start point (just use shapeHighlight if available)
function konvaGreen(fallback) {
  return "#10b981";
}

// ==================== MAIN COMPONENT ====================

function PythagoreanTheoremLesson({ triggerNewProblem }) {
  const {
    lessonProps,
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
    choices = [],
    educationalNote = "",
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Canvas sizing
  const canvasWidth = Math.min(windowWidth - 40, 400);
  const canvasHeight = canvasWidth;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${visualData.vertices?.[0]?.x || visualData.contextElements?.type || 0}`;
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

  // Choice click handler
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

      {/* Konva Diagram */}
      <CanvasWrapper>
        <PythagoreanTheoremDiagram
          visualData={visualData}
          konvaTheme={konvaTheme}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      </CanvasWrapper>

      {/* Choice Buttons */}
      {phase === "interact" && choices.length > 0 && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && shakingIdx === null && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}
          <ChoiceGrid $twoColumn={level === 1}>
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
                  {isCorrectSelected && " \u2713"}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        </ChooseSection>
      )}

      {/* Phase: Complete */}
      {phase === "complete" && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>

          <EducationalNote>{educationalNote}</EducationalNote>

          {explanation && (
            <ExplanationDetail>{explanation}</ExplanationDetail>
          )}

          <TryAnotherButton onClick={handleTryAnother}>
            Try Another
          </TryAnotherButton>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default PythagoreanTheoremLesson;

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

const CanvasWrapper = styled.div`
  margin: 8px 0 20px 0;
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
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
  flex-direction: ${(props) => (props.$twoColumn ? "row" : "column")};
  gap: 10px;
  width: 100%;
  max-width: 420px;
  margin-top: 4px;
  ${(props) => props.$twoColumn && css`
    justify-content: center;
    flex-wrap: wrap;
  `}
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

const ExplanationSection = styled.div`
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
  white-space: pre-line;
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
`;
