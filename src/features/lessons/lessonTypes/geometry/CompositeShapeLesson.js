import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Rect, Line, Text } from "react-konva";
import {
  useLessonState,
  useIsTouchDevice,
  useWindowDimensions,
  useKonvaTheme,
} from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Identify the Shapes" },
  2: { title: "L-Shapes" },
  3: { title: "T-Shapes & U-Shapes" },
  4: { title: "Cutout Shapes" },
  5: { title: "Rectangles + Triangles" },
  6: { title: "Mixed Shapes" },
  7: { title: "Find the Missing Dimension" },
  8: { title: "Word Problems" },
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

// ==================== COLORS ====================

const SHAPE_COLOR = "#3B82F6";
const SHAPE_FILL = "#3B82F620";
const CUT_COLOR = "#EF4444";
const TRI_COLOR = "#10B981";
const TRI_FILL = "#10B98120";
const SPLIT_COLOR = "#F59E0B";

// ==================== POLYGON VERTEX BUILDERS ====================

/**
 * Build polygon vertices for an L-shape (scaled to canvas).
 * Notch orientation: 0=TR, 1=TL, 2=BL, 3=BR
 */
function buildLPolygon(data, cw, ch) {
  const { fullWidth, fullHeight, stepX, stepY, orientation } = data;
  const padding = 60;
  const maxW = cw - padding * 2;
  const maxH = ch - padding * 2;
  const scale = Math.min(maxW / fullWidth, maxH / fullHeight, 28);
  const sw = fullWidth * scale;
  const sh = fullHeight * scale;
  const sx = stepX * scale;
  const sy = stepY * scale;
  const ox = (cw - sw) / 2;
  const oy = (ch - sh) / 2;

  // Normalized L (notch in top-right): 6 vertices
  let pts;
  if (orientation === 0) {
    // notch TR
    pts = [
      [ox, oy], [ox + sx, oy], [ox + sx, oy + sh - sy],
      [ox + sw, oy + sh - sy], [ox + sw, oy + sh], [ox, oy + sh],
    ];
  } else if (orientation === 1) {
    // notch TL
    pts = [
      [ox + sw - sx, oy], [ox + sw, oy], [ox + sw, oy + sh],
      [ox, oy + sh], [ox, oy + sh - sy], [ox + sw - sx, oy + sh - sy],
    ];
  } else if (orientation === 2) {
    // notch BL
    pts = [
      [ox, oy], [ox + sw, oy], [ox + sw, oy + sh],
      [ox + sw - sx, oy + sh], [ox + sw - sx, oy + sy], [ox, oy + sy],
    ];
  } else {
    // notch BR
    pts = [
      [ox, oy], [ox + sw, oy], [ox + sw, oy + sy],
      [ox + sx, oy + sy], [ox + sx, oy + sh], [ox, oy + sh],
    ];
  }

  return { pts, ox, oy, sw, sh, sx, sy, scale };
}

/**
 * Build polygon vertices for a T-shape (scaled to canvas).
 */
function buildTPolygon(data, cw, ch) {
  const { barWidth, barHeight, stemWidth, stemHeight, orientation } = data;
  const totalH = barHeight + stemHeight;
  const padding = 60;
  const maxW = cw - padding * 2;
  const maxH = ch - padding * 2;
  const scale = Math.min(maxW / barWidth, maxH / totalH, 25);
  const bw = barWidth * scale;
  const bh = barHeight * scale;
  const stw = stemWidth * scale;
  const sth = stemHeight * scale;
  const totalSH = bh + sth;
  const ox = (cw - bw) / 2;
  const oy = (ch - totalSH) / 2;

  let pts;
  if (orientation === "top") {
    // bar on top, stem below center
    const stemOx = ox + (bw - stw) / 2;
    pts = [
      [ox, oy], [ox + bw, oy], [ox + bw, oy + bh],
      [stemOx + stw, oy + bh], [stemOx + stw, oy + totalSH],
      [stemOx, oy + totalSH], [stemOx, oy + bh], [ox, oy + bh],
    ];
  } else {
    // bar on bottom, stem above center
    const stemOx = ox + (bw - stw) / 2;
    pts = [
      [stemOx, oy], [stemOx + stw, oy], [stemOx + stw, oy + sth],
      [ox + bw, oy + sth], [ox + bw, oy + totalSH],
      [ox, oy + totalSH], [ox, oy + sth], [stemOx, oy + sth],
    ];
  }

  return { pts, ox, oy, bw, bh, stw, sth, totalSH, scale };
}

/**
 * Build polygon vertices for a U-shape (scaled to canvas).
 */
function buildUPolygon(data, cw, ch) {
  const { outerWidth, outerHeight, notchWidth, notchHeight, openSide } = data;
  const padding = 60;
  const maxW = cw - padding * 2;
  const maxH = ch - padding * 2;
  const scale = Math.min(maxW / outerWidth, maxH / outerHeight, 25);
  const ow = outerWidth * scale;
  const oh = outerHeight * scale;
  const nw = notchWidth * scale;
  const nh = notchHeight * scale;
  const ox = (cw - ow) / 2;
  const oy = (ch - oh) / 2;
  const notchOx = ox + (ow - nw) / 2;

  let pts;
  if (openSide === "top") {
    pts = [
      [ox, oy], [notchOx, oy], [notchOx, oy + nh],
      [notchOx + nw, oy + nh], [notchOx + nw, oy],
      [ox + ow, oy], [ox + ow, oy + oh], [ox, oy + oh],
    ];
  } else {
    pts = [
      [ox, oy], [ox + ow, oy], [ox + ow, oy + oh],
      [notchOx + nw, oy + oh], [notchOx + nw, oy + oh - nh],
      [notchOx, oy + oh - nh], [notchOx, oy + oh], [ox, oy + oh],
    ];
  }

  return { pts, ox, oy, ow, oh, nw, nh, notchOx, scale };
}

// ==================== CANVAS RENDERING ====================

function renderShapeCanvas(visualData, cw, ch, konvaTheme, level) {
  const st = visualData.shapeType;
  const showSplit = visualData.showSplit;
  const showAll = visualData.showAllDimensions;
  const hidden = visualData.hiddenDimension;

  // Helper: create a label
  const label = (x, y, text, color, fontSize = 16) => (
    <Text key={`lbl-${x}-${y}-${text}`} x={x} y={y} text={`${text}`} fontSize={fontSize} fontStyle="bold" fill={color} align="center" />
  );

  // Helper: dimension with possible "x" override
  const dimText = (key, value) => {
    if (hidden === key) return "x";
    return `${value} cm`;
  };

  if (st === "L") {
    const d = visualData;
    const { pts, ox, oy, sw, sh, sx, sy } = buildLPolygon(d, cw, ch);
    const flatPts = pts.flatMap((p) => p);
    const elements = [
      <Rect key="bg" x={0} y={0} width={cw} height={ch} fill={konvaTheme.canvasBackground} />,
      <Line key="shape" points={flatPts} closed fill={SHAPE_FILL} stroke={SHAPE_COLOR} strokeWidth={3} />,
    ];

    // Split line for level 2
    if (showSplit) {
      const o = d.orientation;
      let splitPts;
      if (o === 0) splitPts = [ox, oy + sh - sy, ox + sx, oy + sh - sy];
      else if (o === 1) splitPts = [ox + sw - sx, oy + sh - sy, ox + sw, oy + sh - sy];
      else if (o === 2) splitPts = [ox, oy + sy, ox + sw - sx, oy + sy];
      else splitPts = [ox + sx, oy + sy, ox + sw, oy + sy];

      elements.push(
        <Line key="split" points={splitPts} stroke={SPLIT_COLOR} strokeWidth={2} dash={[8, 5]} />
      );
    }

    // Dimension labels
    if (showAll) {
      // Full width at bottom
      elements.push(label(ox, oy + sh + 10, dimText("fullWidth", d.fullWidth), SHAPE_COLOR, 16));
      // Full height on left
      elements.push(label(ox - 45, oy + sh / 2 - 8, dimText("fullHeight", d.fullHeight), SHAPE_COLOR, 16));
      // Step dimensions
      elements.push(label(ox + sx / 2 - 15, oy - 22, dimText("stepX", d.stepX), SPLIT_COLOR, 15));
      elements.push(label(ox + sw + 8, oy + (sh - sy) / 2 + sy / 2, dimText("stepY", d.stepY), SPLIT_COLOR, 15));
    }

    return <Stage width={cw} height={ch}><Layer>{elements}</Layer></Stage>;
  }

  if (st === "T") {
    const d = visualData;
    const { pts, ox, oy, bw, bh, stw, sth, totalSH } = buildTPolygon(d, cw, ch);
    const flatPts = pts.flatMap((p) => p);
    const elements = [
      <Rect key="bg" x={0} y={0} width={cw} height={ch} fill={konvaTheme.canvasBackground} />,
      <Line key="shape" points={flatPts} closed fill={SHAPE_FILL} stroke={SHAPE_COLOR} strokeWidth={3} />,
    ];

    if (showAll) {
      // Bar width at top
      elements.push(label(ox, oy - 22, `${d.barWidth} cm`, SHAPE_COLOR, 16));
      // Bar height on left
      elements.push(label(ox - 40, oy + bh / 2 - 8, `${d.barHeight} cm`, SHAPE_COLOR, 14));
      // Stem width at bottom
      const stemOx = ox + (bw - stw) / 2;
      elements.push(label(stemOx, oy + totalSH + 10, `${d.stemWidth} cm`, SPLIT_COLOR, 14));
      // Stem height on right
      elements.push(label(stemOx + stw + 8, oy + bh + sth / 2 - 8, `${d.stemHeight} cm`, SPLIT_COLOR, 14));
    }

    return <Stage width={cw} height={ch}><Layer>{elements}</Layer></Stage>;
  }

  if (st === "U") {
    const d = visualData;
    const { pts, ox, oy, oh, nw, nh, notchOx } = buildUPolygon(d, cw, ch);
    const flatPts = pts.flatMap((p) => p);
    const elements = [
      <Rect key="bg" x={0} y={0} width={cw} height={ch} fill={konvaTheme.canvasBackground} />,
      <Line key="shape" points={flatPts} closed fill={SHAPE_FILL} stroke={SHAPE_COLOR} strokeWidth={3} />,
    ];

    if (showAll) {
      elements.push(label(ox, oy + oh + 10, `${d.outerWidth} cm`, SHAPE_COLOR, 16));
      elements.push(label(ox - 40, oy + oh / 2 - 8, `${d.outerHeight} cm`, SHAPE_COLOR, 14));
      elements.push(label(notchOx, d.openSide === "top" ? oy + nh + 5 : oy + oh - nh - 20, `${d.notchWidth} cm`, CUT_COLOR, 14));
      elements.push(label(notchOx + nw + 5, d.openSide === "top" ? oy + nh / 2 - 8 : oy + oh - nh / 2 - 8, `${d.notchHeight} cm`, CUT_COLOR, 14));
    }

    return <Stage width={cw} height={ch}><Layer>{elements}</Layer></Stage>;
  }

  if (st === "cutout") {
    const d = visualData;
    const padding = 60;
    const maxW = cw - padding * 2;
    const maxH = ch - padding * 2;
    const scale = Math.min(maxW / d.outerWidth, maxH / d.outerHeight, 25);
    const ow = d.outerWidth * scale;
    const oh = d.outerHeight * scale;
    const cutW = d.cutWidth * scale;
    const cutH = d.cutHeight * scale;
    const ox = (cw - ow) / 2;
    const oy = (ch - oh) / 2;
    const cutX = ox + (ow - cutW) / 2;
    const cutY = oy + (oh - cutH) / 2;

    const elements = [
      <Rect key="bg" x={0} y={0} width={cw} height={ch} fill={konvaTheme.canvasBackground} />,
      <Rect key="outer" x={ox} y={oy} width={ow} height={oh} fill={SHAPE_FILL} stroke={SHAPE_COLOR} strokeWidth={3} />,
      <Rect key="cut" x={cutX} y={cutY} width={cutW} height={cutH} fill={konvaTheme.canvasBackground} stroke={CUT_COLOR} strokeWidth={2} dash={[6, 4]} />,
    ];

    if (showAll) {
      elements.push(label(ox, oy + oh + 10, `${d.outerWidth} cm`, SHAPE_COLOR, 16));
      elements.push(label(ox - 40, oy + oh / 2 - 8, `${d.outerHeight} cm`, SHAPE_COLOR, 14));
      elements.push(label(cutX, cutY + cutH + 5, `${d.cutWidth} cm`, CUT_COLOR, 14));
      elements.push(label(cutX + cutW + 5, cutY + cutH / 2 - 8, `${d.cutHeight} cm`, CUT_COLOR, 14));
    }

    return <Stage width={cw} height={ch}><Layer>{elements}</Layer></Stage>;
  }

  if (st === "house") {
    const d = visualData;
    const totalH = d.rectHeight + d.triHeight;
    const padding = 60;
    const maxW = cw - padding * 2;
    const maxH = ch - padding * 2;
    const scale = Math.min(maxW / d.rectWidth, maxH / totalH, 25);
    const rw = d.rectWidth * scale;
    const rh = d.rectHeight * scale;
    const th = d.triHeight * scale;
    const ox = (cw - rw) / 2;
    const triTop = (ch - (rh + th)) / 2;
    const rectTop = triTop + th;

    const triPts = [ox, rectTop, ox + rw, rectTop, ox + rw / 2, triTop];

    const elements = [
      <Rect key="bg" x={0} y={0} width={cw} height={ch} fill={konvaTheme.canvasBackground} />,
      <Rect key="rect" x={ox} y={rectTop} width={rw} height={rh} fill={SHAPE_FILL} stroke={SHAPE_COLOR} strokeWidth={3} />,
      <Line key="tri" points={triPts} closed fill={TRI_FILL} stroke={TRI_COLOR} strokeWidth={3} />,
    ];

    if (showAll) {
      elements.push(label(ox, rectTop + rh + 10, `${d.rectWidth} cm`, SHAPE_COLOR, 16));
      elements.push(label(ox - 40, rectTop + rh / 2 - 8, `${d.rectHeight} cm`, SHAPE_COLOR, 14));
      // Triangle height (dashed line)
      elements.push(
        <Line key="th-line" points={[ox + rw / 2, triTop, ox + rw / 2, rectTop]} stroke={TRI_COLOR} strokeWidth={1.5} dash={[5, 3]} />
      );
      elements.push(label(ox + rw / 2 + 8, triTop + th / 2 - 8, `${d.triHeight} cm`, TRI_COLOR, 14));
    }

    return <Stage width={cw} height={ch}><Layer>{elements}</Layer></Stage>;
  }

  if (st === "arrow") {
    const d = visualData;
    const totalW = d.shaftWidth + d.headHeight;
    const maxDim = Math.max(d.headBase, d.shaftHeight);
    const padding = 60;
    const maxW = cw - padding * 2;
    const maxH = ch - padding * 2;
    const scale = Math.min(maxW / totalW, maxH / maxDim, 25);
    const sw = d.shaftWidth * scale;
    const shH = d.shaftHeight * scale;
    const hb = d.headBase * scale;
    const hh = d.headHeight * scale;

    const cy = ch / 2;
    let ox;
    let rectX, rectY, triPts;

    if (d.direction === "right") {
      ox = (cw - (sw + hh)) / 2;
      rectX = ox;
      rectY = cy - shH / 2;
      triPts = [ox + sw, cy - hb / 2, ox + sw, cy + hb / 2, ox + sw + hh, cy];
    } else {
      ox = (cw - (sw + hh)) / 2;
      rectX = ox + hh;
      rectY = cy - shH / 2;
      triPts = [ox + hh, cy - hb / 2, ox + hh, cy + hb / 2, ox, cy];
    }

    const elements = [
      <Rect key="bg" x={0} y={0} width={cw} height={ch} fill={konvaTheme.canvasBackground} />,
      <Rect key="shaft" x={rectX} y={rectY} width={sw} height={shH} fill={SHAPE_FILL} stroke={SHAPE_COLOR} strokeWidth={3} />,
      <Line key="head" points={triPts} closed fill={TRI_FILL} stroke={TRI_COLOR} strokeWidth={3} />,
    ];

    if (showAll) {
      elements.push(label(rectX, rectY + shH + 10, `${d.shaftWidth} cm`, SHAPE_COLOR, 14));
      elements.push(label(rectX - 40, rectY + shH / 2 - 8, `${d.shaftHeight} cm`, SHAPE_COLOR, 14));
      // Head dimensions
      const headLabelX = d.direction === "right" ? rectX + sw + hh / 2 - 15 : ox + hh / 2 - 15;
      elements.push(label(headLabelX, cy + hb / 2 + 8, `${d.headHeight} cm`, TRI_COLOR, 13));
      const baseLabelX = d.direction === "right" ? rectX + sw + hh + 5 : ox - 40;
      elements.push(label(baseLabelX, cy - 8, `${d.headBase} cm`, TRI_COLOR, 13));
    }

    return <Stage width={cw} height={ch}><Layer>{elements}</Layer></Stage>;
  }

  // Fallback
  return null;
}

// ==================== MAIN COMPONENT ====================

function CompositeShapeLesson({ triggerNewProblem }) {
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

  const [phase, setPhase] = useState("interact");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    area,
    choices = [],
    unknownValue,
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const educationalNote = currentProblem?.educationalNote || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  const canvasWidth = Math.min(windowWidth - 40, 600);
  const canvasHeight = 280;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${area}-${unknownValue}`;
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

  // For AnswerInput levels, the correct answer depends on the level
  const correctAnswer = useMemo(() => {
    if (level === 7) return `${unknownValue}`;
    if ([2, 3, 4, 5, 6].includes(level)) return `${area}`;
    return "";
  }, [level, area, unknownValue]);

  if (!currentProblem?.visualData) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

  // ==================== RENDER ====================

  const isMCLevel = level === 1 || level === 8;
  const isInputLevel = level >= 2 && level <= 7;
  const hasCanvas = level >= 1 && level <= 7;

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

      {/* Canvas for levels 1-7 */}
      {hasCanvas && visualData.shapeType && (
        <CanvasWrapper>
          {renderShapeCanvas(visualData, canvasWidth, canvasHeight, konvaTheme, level)}
        </CanvasWrapper>
      )}

      {/* Level-specific formula hints */}
      {level === 2 && phase === "interact" && (
        <FormulaDisplay>
          <FormulaOp>Split into two rectangles — add their areas!</FormulaOp>
        </FormulaDisplay>
      )}

      {level === 4 && phase === "interact" && (
        <FormulaDisplay>
          <FormulaOp>Outer area &minus; cutout area = shaded area</FormulaOp>
        </FormulaDisplay>
      )}

      {level === 5 && phase === "interact" && (
        <FormulaDisplay>
          <FormulaOp>Rectangle + Triangle (½ &times; base &times; height)</FormulaOp>
        </FormulaDisplay>
      )}

      {level === 7 && phase === "interact" && (
        <FormulaDisplay>
          <FormulaOp>Area = {area} sq cm — find the missing dimension x</FormulaOp>
        </FormulaDisplay>
      )}

      {/* MC levels (1 and 8) */}
      {isMCLevel && phase === "interact" && choices.length > 0 && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && shakingIdx === null && <FeedbackText $isWrong>Not quite — try again!</FeedbackText>}
          <ChoiceGrid>
            {choices.map((choice, idx) => {
              const isSelected = selectedChoice === idx;
              const isCorrectSelected = isSelected && choice.correct;
              const isShaking = shakingIdx === idx;
              const isFaded = selectedChoice !== null && !isSelected;
              return (
                <ChoiceButton key={idx} $correct={isCorrectSelected} $wrong={isShaking} $fadeOut={isFaded} $isTouchDevice={isTouchDevice} onClick={() => handleChoiceClick(choice, idx)} disabled={selectedChoice !== null || isShaking}>
                  {choice.text}{isCorrectSelected && " ✓"}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        </ChooseSection>
      )}

      {/* Input levels (2-7) */}
      {isInputLevel && phase === "interact" && (
        <AnswerSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          <AnswerInputContainer>
            <AnswerInput
              correctAnswer={correctAnswer}
              answerType="number"
              onCorrect={() => { setPhase("complete"); revealAnswer(); }}
              onTryAnother={handleTryAnother}
              disabled={showAnswer}
              placeholder={level === 7 ? "x = ?" : "Area = ?"}
            />
          </AnswerInputContainer>
        </AnswerSection>
      )}

      {/* Phase: Complete */}
      {phase === "complete" && (
        <CompleteSection>
          <CompleteTitle>Correct!</CompleteTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
          <TryAnotherButton onClick={handleTryAnother}>Try Another</TryAnotherButton>
        </CompleteSection>
      )}
    </Wrapper>
  );
}

export default CompositeShapeLesson;

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
  @media (min-width: 768px) { padding: 30px; }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: ${(p) => p.theme.colors.textSecondary};
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
  background-color: ${(p) => p.theme.colors.buttonSuccess};
  color: ${(p) => p.theme.colors.textInverted};
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
`;

const LevelTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.textPrimary};
  margin: 0;
  @media (min-width: 768px) { font-size: 22px; }
`;

const InstructionText = styled.p`
  font-size: 16px;
  color: ${(p) => p.theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 12px 0;
  max-width: 700px;
  line-height: 1.5;
  @media (min-width: 768px) { font-size: 18px; }
`;

const CanvasWrapper = styled.div`
  margin: 8px 0 20px 0;
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
`;

const FormulaDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: ${(p) => p.theme.colors.cardBackground};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const FormulaOp = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textSecondary};
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
  padding: ${(p) => (p.$isTouchDevice ? "16px 20px" : "13px 20px")};
  font-size: ${(p) => (p.$isTouchDevice ? "17px" : "16px")};
  font-weight: 600;
  border-radius: 10px;
  border: 2px solid ${(p) => p.theme.colors.border};
  background-color: ${(p) => p.theme.colors.cardBackground};
  color: ${(p) => p.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover:not(:disabled) {
    background-color: ${(p) => p.theme.colors.hoverBackground};
    border-color: ${(p) => p.theme.colors.info || "#3B82F6"};
  }

  ${(p) => p.$correct && css`
    background-color: ${p.theme.colors.buttonSuccess}20;
    border-color: ${p.theme.colors.buttonSuccess};
    color: ${p.theme.colors.buttonSuccess};
    cursor: default;
  `}

  ${(p) => p.$wrong && css`
    animation: ${shakeAnim} 0.5s ease;
    background-color: ${p.theme.colors.danger || "#E53E3E"}15;
    border-color: ${p.theme.colors.danger || "#E53E3E"};
  `}

  ${(p) => p.$fadeOut && css`
    opacity: 0;
    transform: scale(0.95);
    pointer-events: none;
    transition: all 0.4s ease;
  `}

  &:disabled { cursor: default; }
`;

const FeedbackText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => p.$isWrong ? (p.theme.colors.danger || "#E53E3E") : p.theme.colors.buttonSuccess};
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

const CompleteSection = styled.div`
  width: 100%;
  background-color: ${(p) => p.theme.colors.cardBackground};
  border: 2px solid ${(p) => p.theme.colors.buttonSuccess};
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
  color: ${(p) => p.theme.colors.buttonSuccess};
  margin: 0;
`;

const EducationalNote = styled.p`
  font-size: 16px;
  color: ${(p) => p.theme.colors.textPrimary};
  text-align: center;
  line-height: 1.6;
  margin: 0;
  max-width: 500px;
`;

const ExplanationDetail = styled.p`
  font-size: 15px;
  color: ${(p) => p.theme.colors.textSecondary};
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
  background-color: ${(p) => p.theme.colors.buttonSuccess};
  color: ${(p) => p.theme.colors.textInverted};
  transition: opacity 0.2s;
  touch-action: manipulation;
  &:hover { opacity: 0.9; }
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: ${(p) => p.theme.colors.cardBackground};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${(p) => p.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  &:hover { background: ${(p) => p.theme.colors.hoverBackground}; }
  @media (max-width: 1024px) { top: 12px; right: 16px; padding: 6px 12px; font-size: 13px; }
  @media (max-width: 768px) { top: 10px; right: 12px; padding: 5px 10px; font-size: 12px; }
`;

const HintBox = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${(p) => p.theme.colors.cardBackground};
  border-left: 4px solid ${(p) => p.theme.colors.warning || "#f6ad55"};
  padding: 14px 16px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  color: ${(p) => p.theme.colors.textPrimary};
`;
