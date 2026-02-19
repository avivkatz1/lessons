import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";
import styled from "styled-components";
import { Stage, Layer, Rect, Line, Text, Circle } from "react-konva";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Does It Have Symmetry?", instruction: "Decide if the letter has a line of symmetry." },
  2: { title: "Find the Line of Symmetry", instruction: "Drag the line to the correct symmetry position." },
  3: { title: "Count Lines of Symmetry", instruction: "How many lines of symmetry does this shape have?" },
  4: { title: "Harder Shapes", instruction: "Drag the line of symmetry onto the shape." },
  5: { title: "Draw the Other Half", instruction: "Draw the mirror image on the other side of the line of symmetry." },
};


// ==================== MAIN COMPONENT ====================

function SymmetryIdentify({ triggerNewProblem }) {
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

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const { level, interactionType } = visualData;
  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  const [showHint, setShowHint] = useState(false);

  // Reset hint when problem changes
  useEffect(() => {
    setShowHint(false);
  }, [currentQuestionIndex, level]);

  const handleTryAnother = () => {
    setShowHint(false);
    hideAnswer();
    triggerNewProblem();
  };

  if (!currentProblem || !interactionType) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

  return (
    <Wrapper>
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>Need a hint?</TopHintButton>
      )}

      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{info.title}</LevelTitle>
      </LevelHeader>

      <InstructionText>{info.instruction}</InstructionText>

      {interactionType === "yesNo" && (
        <YesNoLevel
          visualData={visualData}
          problem={currentProblem}
          konvaTheme={konvaTheme}
          width={width}
          explanation={explanation}
          onTryAnother={handleTryAnother}
          showHint={showHint}
          hint={hint}
        />
      )}

      {interactionType === "dragLine" && (
        <DragLineLevel
          visualData={visualData}
          problem={currentProblem}
          konvaTheme={konvaTheme}
          width={width}
          explanation={explanation}
          onTryAnother={handleTryAnother}
          showHint={showHint}
          hint={hint}
          currentQuestionIndex={currentQuestionIndex}
          level={level}
        />
      )}

      {interactionType === "numberInput" && (
        <CountLevel
          visualData={visualData}
          problem={currentProblem}
          konvaTheme={konvaTheme}
          width={width}
          explanation={explanation}
          showAnswer={showAnswer}
          revealAnswer={revealAnswer}
          onTryAnother={handleTryAnother}
          showHint={showHint}
          hint={hint}
        />
      )}

      {interactionType === "gridClick" && (
        <GridClickLevel
          visualData={visualData}
          problem={currentProblem}
          konvaTheme={konvaTheme}
          width={width}
          explanation={explanation}
          onTryAnother={handleTryAnother}
          showHint={showHint}
          hint={hint}
          currentQuestionIndex={currentQuestionIndex}
          level={level}
        />
      )}
    </Wrapper>
  );
}

// ==================== L1: YES/NO ====================

function YesNoLevel({ visualData, problem, konvaTheme, width, explanation, onTryAnother, showHint, hint }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // Drawing state
  const [tool, setTool] = useState("marker");
  const [strokes, setStrokes] = useState([]);
  const isDrawing = useRef(false);

  // Reset on new problem
  useEffect(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setStrokes([]);
    setTool("marker");
  }, [problem]);

  const canvasWidth = Math.min(width - 40, 400);
  const canvasHeight = 250;

  const handleAnswer = (answer) => {
    if (isCorrect !== null) return;
    const correct = (answer === "Yes") === visualData.hasSymmetry;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
  };

  const getPointerPos = (e) => {
    const stage = e.target.getStage();
    return stage.getPointerPosition();
  };

  const handlePointerDown = (e) => {
    const pos = getPointerPos(e);
    if (!pos) return;

    if (tool === "marker") {
      isDrawing.current = true;
      setStrokes((prev) => [...prev, { points: [pos.x, pos.y] }]);
    } else {
      const hitRadius = 15;
      let hitIndex = -1;
      let minDist = hitRadius;
      strokes.forEach((stroke, si) => {
        const pts = stroke.points;
        for (let i = 0; i < pts.length - 1; i += 2) {
          const dx = pts[i] - pos.x;
          const dy = pts[i + 1] - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) { minDist = dist; hitIndex = si; }
        }
      });
      if (hitIndex >= 0) {
        setStrokes((prev) => prev.filter((_, i) => i !== hitIndex));
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || tool !== "marker") return;
    const pos = getPointerPos(e);
    if (!pos) return;
    setStrokes((prev) => {
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      last.points = [...last.points, pos.x, pos.y];
      updated[updated.length - 1] = last;
      return updated;
    });
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  return (
    <>
      <VisualSection style={{ cursor: tool === "marker" ? "crosshair" : "pointer" }}>
        <Stage
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />
            <Text
              x={0}
              y={canvasHeight / 2 - 70}
              text={visualData.letter}
              fontSize={140}
              fontFamily="Arial"
              fontStyle="bold"
              fill={konvaTheme.labelText}
              align="center"
              width={canvasWidth}
            />

            {/* Drawn strokes */}
            {strokes.map((stroke, i) => (
              <Line
                key={`stroke-${i}`}
                points={stroke.points}
                stroke="#F97316"
                strokeWidth={3}
                lineCap="round"
                lineJoin="round"
                tension={0.3}
              />
            ))}
          </Layer>
        </Stage>
      </VisualSection>

      {isCorrect === null && (
        <>
          <ToolRow>
            <ToolButton $active={tool === "marker"} onClick={() => setTool("marker")}>
              Marker
            </ToolButton>
            <ToolButton $active={tool === "eraser"} $isEraser onClick={() => setTool("eraser")}>
              Eraser
            </ToolButton>
            {strokes.length > 0 && (
              <ClearAllButton onClick={() => setStrokes([])}>Clear All</ClearAllButton>
            )}
          </ToolRow>
          <Spacer />
          {showHint && <HintBox>{hint}</HintBox>}
          <ButtonRow>
            <YesButton onClick={() => handleAnswer("Yes")}>Yes</YesButton>
            <NoButton onClick={() => handleAnswer("No")}>No</NoButton>
          </ButtonRow>
        </>
      )}

      {isCorrect !== null && (
        <ExplanationSection $correct={isCorrect}>
          <ExplanationTitle $correct={isCorrect}>
            {isCorrect ? "Correct!" : "Not Quite"}
          </ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          <TryAnotherButton onClick={onTryAnother}>Try Another</TryAnotherButton>
        </ExplanationSection>
      )}
    </>
  );
}

// ==================== L2/L4: DRAG LINE ====================

function DragLineLevel({ visualData, problem, konvaTheme, width, explanation, onTryAnother, showHint, hint, currentQuestionIndex, level }) {
  const [lineOrientation, setLineOrientation] = useState("vertical");
  const [linePos, setLinePos] = useState(0.25); // normalized 0-1
  const [checkResult, setCheckResult] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const canvasWidth = Math.min(width - 40, 400);
  const canvasHeight = 350;

  // Reset on new problem
  useEffect(() => {
    setLineOrientation("vertical");
    setLinePos(0.25);
    setCheckResult(null);
    setIsComplete(false);
  }, [currentQuestionIndex, level]);

  const handleCheck = () => {
    const correctAxis = visualData.correctAxis;
    const correctPos = visualData.correctPosition || 0.5;
    const tolerance = 0.12; // 12% of canvas

    const axisMatch = lineOrientation === correctAxis;
    const posMatch = Math.abs(linePos - correctPos) < tolerance;

    if (axisMatch && posMatch) {
      setCheckResult("correct");
      setIsComplete(true);
    } else if (!axisMatch) {
      setCheckResult("wrong_axis");
    } else {
      setCheckResult("wrong_position");
    }
  };

  const handleDragEnd = (e) => {
    if (lineOrientation === "vertical") {
      const newX = e.target.x();
      setLinePos(Math.max(0.05, Math.min(0.95, newX / canvasWidth)));
    } else {
      const newY = e.target.y();
      setLinePos(Math.max(0.05, Math.min(0.95, newY / canvasHeight)));
    }
  };

  // Line points based on orientation
  const lineX = lineOrientation === "vertical" ? linePos * canvasWidth : 0;
  const lineY = lineOrientation === "horizontal" ? linePos * canvasHeight : 0;

  const lineColor = isComplete ? "#10B981" : checkResult === "wrong_axis" || checkResult === "wrong_position" ? "#EF4444" : "#F97316";

  return (
    <>
      <VisualSection>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />

            {/* Render letter or shape */}
            {visualData.displayType === "letter" && (
              <Text
                x={0}
                y={canvasHeight / 2 - 60}
                text={visualData.letter}
                fontSize={120}
                fontFamily="Arial"
                fontStyle="bold"
                fill={konvaTheme.labelText}
                align="center"
                width={canvasWidth}
              />
            )}

            {visualData.displayType === "shape" && visualData.shapePoints && (
              <Line
                points={visualData.shapePoints}
                closed
                fill="#3B82F6"
                opacity={0.3}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={2.5}
              />
            )}

            {/* Draggable symmetry line */}
            {lineOrientation === "vertical" ? (
              <Line
                points={[0, 0, 0, canvasHeight]}
                x={linePos * canvasWidth}
                y={0}
                stroke={lineColor}
                strokeWidth={3}
                dash={[8, 4]}
                draggable={!isComplete}
                onDragEnd={handleDragEnd}
                dragBoundFunc={(pos) => ({
                  x: Math.max(10, Math.min(canvasWidth - 10, pos.x)),
                  y: 0,
                })}
              />
            ) : (
              <Line
                points={[0, 0, canvasWidth, 0]}
                x={0}
                y={linePos * canvasHeight}
                stroke={lineColor}
                strokeWidth={3}
                dash={[8, 4]}
                draggable={!isComplete}
                onDragEnd={handleDragEnd}
                dragBoundFunc={(pos) => ({
                  x: 0,
                  y: Math.max(10, Math.min(canvasHeight - 10, pos.y)),
                })}
              />
            )}
          </Layer>
        </Stage>
      </VisualSection>

      {!isComplete && (
        <InteractionSection>
          {showHint && <HintBox>{hint}</HintBox>}

          <ToggleRow>
            <ToggleButton $active={lineOrientation === "vertical"} onClick={() => { setLineOrientation("vertical"); setCheckResult(null); }}>
              Vertical
            </ToggleButton>
            <ToggleButton $active={lineOrientation === "horizontal"} onClick={() => { setLineOrientation("horizontal"); setCheckResult(null); }}>
              Horizontal
            </ToggleButton>
          </ToggleRow>

          {checkResult && checkResult !== "correct" && (
            <FeedbackText $isWrong>
              {checkResult === "wrong_axis" ? "Try a different orientation!" : "Close, but move the line a bit more."}
            </FeedbackText>
          )}

          <CheckButton onClick={handleCheck}>Check</CheckButton>
        </InteractionSection>
      )}

      {isComplete && (
        <ExplanationSection $correct>
          <ExplanationTitle $correct>Correct!</ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          <TryAnotherButton onClick={onTryAnother}>Try Another</TryAnotherButton>
        </ExplanationSection>
      )}
    </>
  );
}

// ==================== L3: COUNT ====================

function CountLevel({ visualData, problem, konvaTheme, width, explanation, showAnswer, revealAnswer, onTryAnother, showHint, hint }) {
  const canvasWidth = Math.min(width - 40, 400);
  const canvasHeight = 350;
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2 - 10;
  const radius = Math.min(canvasWidth, canvasHeight) * 0.25;

  // Drawing state
  const [tool, setTool] = useState("marker"); // "marker" or "eraser"
  const [strokes, setStrokes] = useState([]); // array of { points: [x,y,x,y,...] }
  const isDrawing = useRef(false);

  // Reset drawing when problem changes
  useEffect(() => {
    setStrokes([]);
    setTool("marker");
  }, [problem]);

  const correctAnswer = useMemo(() => {
    if (problem?.acceptedAnswers?.length > 0) return problem.acceptedAnswers;
    if (Array.isArray(problem?.answer)) return problem.answer;
    return [String(problem?.answer || "")];
  }, [problem]);

  // Scale shape points to fit canvas
  const scaledPoints = useMemo(() => {
    if (visualData.isCircle || !visualData.shapePoints) return null;
    const pts = visualData.shapePoints;
    const scaleX = canvasWidth / 400;
    const scaleY = canvasHeight / 350;
    return pts.map((v, i) => i % 2 === 0 ? v * scaleX : v * scaleY);
  }, [visualData, canvasWidth, canvasHeight]);

  const getPointerPos = (e) => {
    const stage = e.target.getStage();
    return stage.getPointerPosition();
  };

  const handlePointerDown = (e) => {
    const pos = getPointerPos(e);
    if (!pos) return;

    if (tool === "marker") {
      isDrawing.current = true;
      setStrokes((prev) => [...prev, { points: [pos.x, pos.y] }]);
    } else {
      // Eraser: find and remove closest stroke
      const hitRadius = 15;
      let hitIndex = -1;
      let minDist = hitRadius;

      strokes.forEach((stroke, si) => {
        const pts = stroke.points;
        for (let i = 0; i < pts.length - 1; i += 2) {
          const dx = pts[i] - pos.x;
          const dy = pts[i + 1] - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            hitIndex = si;
          }
        }
      });

      if (hitIndex >= 0) {
        setStrokes((prev) => prev.filter((_, i) => i !== hitIndex));
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || tool !== "marker") return;
    const pos = getPointerPos(e);
    if (!pos) return;
    setStrokes((prev) => {
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      last.points = [...last.points, pos.x, pos.y];
      updated[updated.length - 1] = last;
      return updated;
    });
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  return (
    <>
      <VisualSection style={{ cursor: tool === "marker" ? "crosshair" : "pointer" }}>
        <Stage
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />

            {visualData.isCircle ? (
              <Circle
                x={cx}
                y={cy}
                radius={radius}
                stroke={konvaTheme.shapeStroke}
                fill="#3B82F6"
                opacity={0.3}
                strokeWidth={3}
              />
            ) : scaledPoints && (
              <Line
                points={scaledPoints}
                closed
                fill="#3B82F6"
                opacity={0.3}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={2.5}
              />
            )}

            <Text
              x={0}
              y={canvasHeight - 35}
              text={visualData.shapeName}
              fontSize={16}
              fill={konvaTheme.labelText}
              fontStyle="italic"
              width={canvasWidth}
              align="center"
            />

            {/* Drawn strokes */}
            {strokes.map((stroke, i) => (
              <Line
                key={`stroke-${i}`}
                points={stroke.points}
                stroke="#F97316"
                strokeWidth={3}
                lineCap="round"
                lineJoin="round"
                tension={0.3}
              />
            ))}
          </Layer>
        </Stage>
      </VisualSection>

      <InteractionSection>
        {!showAnswer && (
          <ToolRow>
            <ToolButton $active={tool === "marker"} onClick={() => setTool("marker")}>
              Marker
            </ToolButton>
            <ToolButton $active={tool === "eraser"} $isEraser onClick={() => setTool("eraser")}>
              Eraser
            </ToolButton>
            {strokes.length > 0 && (
              <ClearAllButton onClick={() => setStrokes([])}>Clear All</ClearAllButton>
            )}
          </ToolRow>
        )}

        {!showAnswer && showHint && <HintBox>{hint}</HintBox>}

        {!showAnswer && (
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={revealAnswer}
            onTryAnother={onTryAnother}
            disabled={showAnswer}
            placeholder="How many lines of symmetry?"
          />
        )}
      </InteractionSection>

      {showAnswer && (
        <ExplanationSection $correct>
          <ExplanationTitle $correct>Correct!</ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          <TryAnotherButton onClick={onTryAnother}>Try Another</TryAnotherButton>
        </ExplanationSection>
      )}
    </>
  );
}

// ==================== L5: DRAW THE OTHER HALF ====================

function GridClickLevel({ visualData, problem, konvaTheme, width, explanation, onTryAnother, showHint, hint, currentQuestionIndex, level }) {
  const [tool, setTool] = useState("marker");
  const [strokes, setStrokes] = useState([]);
  const isDrawing = useRef(false);
  const [checkResult, setCheckResult] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const { canvasSize = 400, linePoints = [], halfShapePoints = [], reflectedShapePoints = [], samplePoints = [] } = visualData;

  useEffect(() => {
    setStrokes([]);
    setTool("marker");
    setCheckResult(null);
    setIsComplete(false);
  }, [currentQuestionIndex, level]);

  const canvasWidth = Math.min(width - 40, 500);
  const scale = canvasWidth / canvasSize;
  const canvasHeight = canvasWidth;

  // Scale backend points to canvas size
  const scaledHalf = useMemo(() => halfShapePoints.map((v) => v * scale), [halfShapePoints, scale]);
  const scaledReflected = useMemo(() => reflectedShapePoints.map((v) => v * scale), [reflectedShapePoints, scale]);
  const scaledLinePoints = useMemo(() => linePoints.map((v) => v * scale), [linePoints, scale]);

  const getPointerPos = (e) => {
    const stage = e.target.getStage();
    return stage.getPointerPosition();
  };

  const handlePointerDown = (e) => {
    if (isComplete) return;
    const pos = getPointerPos(e);
    if (!pos) return;

    if (tool === "marker") {
      isDrawing.current = true;
      setStrokes((prev) => [...prev, { points: [pos.x, pos.y] }]);
    } else {
      const hitRadius = 15;
      let hitIndex = -1;
      let minDist = hitRadius;
      strokes.forEach((stroke, si) => {
        const pts = stroke.points;
        for (let i = 0; i < pts.length - 1; i += 2) {
          const dx = pts[i] - pos.x;
          const dy = pts[i + 1] - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) { minDist = dist; hitIndex = si; }
        }
      });
      if (hitIndex >= 0) {
        setStrokes((prev) => prev.filter((_, i) => i !== hitIndex));
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || tool !== "marker") return;
    const pos = getPointerPos(e);
    if (!pos) return;
    setStrokes((prev) => {
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      last.points = [...last.points, pos.x, pos.y];
      updated[updated.length - 1] = last;
      return updated;
    });
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  // Score by checking how many sample points on the reflected outline
  // are near the user's drawn strokes
  const handleCheckAnswer = () => {
    const hitRadius = 18 * scale;
    const hitRadiusSq = hitRadius * hitRadius;

    // Collect all drawn points for fast lookup
    const allDrawnPts = [];
    strokes.forEach((stroke) => {
      const pts = stroke.points;
      for (let i = 0; i < pts.length; i += 2) {
        allDrawnPts.push([pts[i], pts[i + 1]]);
      }
      // Interpolate between consecutive points for better coverage
      for (let i = 0; i < pts.length - 2; i += 2) {
        const x1 = pts[i], y1 = pts[i + 1];
        const x2 = pts[i + 2], y2 = pts[i + 3];
        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const steps = Math.ceil(dist / 4);
        for (let s = 1; s < steps; s++) {
          const t = s / steps;
          allDrawnPts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
        }
      }
    });

    let hits = 0;
    const total = samplePoints.length;

    for (const [sx, sy] of samplePoints) {
      const scaledX = sx * scale;
      const scaledY = sy * scale;
      let found = false;
      for (const [dx, dy] of allDrawnPts) {
        const distSq = (dx - scaledX) ** 2 + (dy - scaledY) ** 2;
        if (distSq < hitRadiusSq) {
          found = true;
          break;
        }
      }
      if (found) hits++;
    }

    const score = Math.round((hits / total) * 100);
    setCheckResult({ hits, total, score });
    if (score >= 70) {
      setIsComplete(true);
    }
  };

  const handleReset = () => {
    setStrokes([]);
    setCheckResult(null);
  };

  return (
    <>
      <VisualSection style={{ cursor: isComplete ? "default" : (tool === "marker" ? "crosshair" : "pointer") }}>
        <Stage
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />

            {/* Original half-shape (blue filled blob) */}
            {scaledHalf.length > 0 && (
              <Line
                points={scaledHalf}
                closed
                fill="#3B82F6"
                opacity={0.5}
                stroke="#2563EB"
                strokeWidth={2.5}
                tension={0.3}
              />
            )}

            {/* After check: show the correct reflected shape */}
            {checkResult && scaledReflected.length > 0 && (
              <Line
                points={scaledReflected}
                closed
                fill={isComplete ? "#10B981" : "#EF4444"}
                opacity={0.2}
                stroke={isComplete ? "#10B981" : "#EF4444"}
                strokeWidth={2}
                dash={[6, 3]}
                tension={0.3}
              />
            )}

            {/* Line of symmetry */}
            {scaledLinePoints.length >= 4 && (
              <Line
                points={scaledLinePoints}
                stroke="#F97316"
                strokeWidth={3}
                dash={[8, 4]}
              />
            )}

            {/* User's drawn strokes */}
            {strokes.map((stroke, i) => (
              <Line
                key={`stroke-${i}`}
                points={stroke.points}
                stroke="#10B981"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
                tension={0.3}
              />
            ))}
          </Layer>
        </Stage>
      </VisualSection>

      {!isComplete && (
        <InteractionSection>
          <ToolRow>
            <ToolButton $active={tool === "marker"} onClick={() => setTool("marker")}>
              Marker
            </ToolButton>
            <ToolButton $active={tool === "eraser"} $isEraser onClick={() => setTool("eraser")}>
              Eraser
            </ToolButton>
            {strokes.length > 0 && (
              <ClearAllButton onClick={() => { setStrokes([]); setCheckResult(null); }}>Clear All</ClearAllButton>
            )}
          </ToolRow>

          {showHint && <HintBox>{hint}</HintBox>}

          {checkResult && !isComplete && (
            <FeedbackText $isWrong={checkResult.score < 70}>
              Score: {checkResult.score}% — Need at least 70% to pass. Keep drawing!
            </FeedbackText>
          )}

          <ButtonRow>
            <CheckButton onClick={handleCheckAnswer} disabled={strokes.length === 0}>Check Drawing</CheckButton>
            <ResetButton onClick={handleReset} disabled={strokes.length === 0}>Reset</ResetButton>
          </ButtonRow>
        </InteractionSection>
      )}

      {isComplete && (
        <ExplanationSection $correct>
          <ExplanationTitle $correct>
            {checkResult.score >= 90 ? "Perfect!" : `Great Job! ${checkResult.score}%`}
          </ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          <TryAnotherButton onClick={onTryAnother}>Try Another</TryAnotherButton>
        </ExplanationSection>
      )}
    </>
  );
}

export default SymmetryIdentify;

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
  margin: 0 0 12px 0;
  max-width: 700px;
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

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const YesButton = styled.button`
  padding: 14px 40px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 10px;
  border: 3px solid #10B981;
  cursor: pointer;
  background-color: transparent;
  color: #10B981;
  transition: all 0.2s;

  &:hover {
    background-color: #10B981;
    color: white;
  }
`;

const NoButton = styled.button`
  padding: 14px 40px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 10px;
  border: 3px solid #EF4444;
  cursor: pointer;
  background-color: transparent;
  color: #EF4444;
  transition: all 0.2s;

  &:hover {
    background-color: #EF4444;
    color: white;
  }
`;

const ToggleRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ToggleButton = styled.button`
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${(props) => props.$active ? props.theme.colors.buttonSuccess : props.theme.colors.border};
  cursor: pointer;
  background-color: ${(props) => props.$active ? props.theme.colors.buttonSuccess : "transparent"};
  color: ${(props) => props.$active ? props.theme.colors.textInverted : props.theme.colors.textSecondary};
  transition: all 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const CheckButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

const ResetButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${(props) => props.theme.colors.border};
  cursor: pointer;
  background-color: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  transition: all 0.2s;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.hoverBackground};
  }
`;

const FeedbackText = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: ${(props) => (props.$isWrong ? "#EF4444" : props.theme.colors.buttonSuccess)};
  margin: 0;
  text-align: center;
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.$correct ? props.theme.colors.buttonSuccess : "#EF4444"};
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
  color: ${(props) => props.$correct ? props.theme.colors.buttonSuccess : "#EF4444"};
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

const Spacer = styled.div`
  height: 16px;
`;

const ToolRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ToolButton = styled.button`
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${(props) => props.$active
    ? (props.$isEraser ? "#EF4444" : "#F97316")
    : props.theme.colors.border};
  cursor: pointer;
  background-color: ${(props) => props.$active
    ? (props.$isEraser ? "#EF4444" : "#F97316")
    : "transparent"};
  color: ${(props) => props.$active ? "white" : props.theme.colors.textSecondary};
  transition: all 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const ClearAllButton = styled.button`
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.border};
  cursor: pointer;
  background-color: transparent;
  color: ${(props) => props.theme.colors.textSecondary};
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.colors.hoverBackground};
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
