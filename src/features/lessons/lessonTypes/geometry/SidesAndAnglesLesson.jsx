import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Line, Arc, Circle, Text, Rect, Wedge } from "react-konva";
import { useLessonState, useIsTouchDevice, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "What Is Highlighted?", instruction: "Is the highlighted part a side or an angle?" },
  2: { title: "Classify Each Part", instruction: "Label each highlighted part as a Side or an Angle." },
  3: { title: "Tap to Identify", instruction: "" }, // dynamic per problem
  4: { title: "Count by Tapping", instruction: "" }, // dynamic per problem
  5: { title: "Sides & Angles", instruction: "" }, // dynamic per problem
};

const PART_COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B"];

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

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Compute the interior angle arc params at a vertex for Konva rendering.
 * Returns { startRotation, sweepDeg } for a Wedge/Arc at that vertex.
 */
function computeAngleArc(vertex, prev, next) {
  // Angles of the two edges from the vertex (in screen coords where y goes DOWN)
  const angle1 = Math.atan2(prev.y - vertex.y, prev.x - vertex.x); // to prev
  const angle2 = Math.atan2(next.y - vertex.y, next.x - vertex.x); // to next

  // Interior angle: we want the smaller sweep between the two directions
  let sweep = angle1 - angle2;
  // Normalize to [0, 2pi)
  while (sweep < 0) sweep += 2 * Math.PI;
  if (sweep > Math.PI) {
    // Use the other direction
    return {
      startRotation: toDeg(angle1),
      sweepDeg: 360 - toDeg(sweep),
    };
  }
  return {
    startRotation: toDeg(angle2),
    sweepDeg: toDeg(sweep),
  };
}

// ==================== SHAPE DIAGRAM COMPONENT ====================

function ShapeDiagram({
  vertices,
  shapeSides,
  konvaTheme,
  canvasWidth,
  canvasHeight,
  isTouchDevice,
  highlightedElements,
  flashElements,
  onSideTap,
  onAngleTap,
  level,
  // L1 props
  highlightedType,
  highlightedIndex,
  // L2 props
  parts,
}) {
  // Build part lookup for L2 (must be before any early return)
  const partLookup = useMemo(() => {
    if (!parts) return {};
    const lookup = {};
    parts.forEach((p) => {
      lookup[`${p.type}-${p.index}`] = p;
    });
    return lookup;
  }, [parts]);

  if (!vertices || vertices.length === 0) return null;

  // Scale factor: vertices are in 400x400 logical space
  const scaleX = canvasWidth / 400;
  const scaleY = canvasHeight / 400;
  const scale = (v) => ({ x: v.x * scaleX, y: v.y * scaleY });

  const hitWidth = isTouchDevice ? 50 : 30;
  const angleRadius = isTouchDevice ? 173 : 130;
  const arcVisualRadius = 26 * Math.min(scaleX, scaleY);

  // Determine highlight color for L1
  const highlightColor = konvaTheme.shapeHighlight || "#00BF63";
  const angleColor = konvaTheme.angle || "#F59E0B";

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* Background */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground || "#ffffff"} />

        {/* Angle arcs — visual only (tap targets render AFTER sides for priority) */}
        {vertices.map((v, i) => {
          const prev = vertices[(i - 1 + shapeSides) % shapeSides];
          const next = vertices[(i + 1) % shapeSides];
          const sv = scale(v);
          const sp = scale(prev);
          const sn = scale(next);
          const { startRotation, sweepDeg } = computeAngleArc(sv, sp, sn);

          // Determine color
          let arcFill = "transparent";
          let arcStroke = angleColor;
          let arcStrokeWidth = 1.5;

          // L1: highlight one angle
          if (level === 1 && highlightedType === "angle" && highlightedIndex === i) {
            arcFill = highlightColor + "40";
            arcStroke = highlightColor;
            arcStrokeWidth = 3;
          }

          // L2: highlight labeled parts
          const partKey = `angle-${i}`;
          const l2Part = partLookup[partKey];
          if (level === 2 && l2Part) {
            arcFill = l2Part.color + "40";
            arcStroke = l2Part.color;
            arcStrokeWidth = 3;
          }

          // Dynamic highlights (L3/L4 tap)
          if (highlightedElements && highlightedElements[partKey]) {
            arcFill = highlightedElements[partKey] + "40";
            arcStroke = highlightedElements[partKey];
            arcStrokeWidth = 3;
          }

          // Flash (wrong tap)
          if (flashElements && flashElements[partKey]) {
            arcFill = flashElements[partKey] + "40";
            arcStroke = flashElements[partKey];
            arcStrokeWidth = 3;
          }

          return (
            <React.Fragment key={`angle-visual-${i}`}>
              <Arc
                x={sv.x}
                y={sv.y}
                innerRadius={0}
                outerRadius={arcVisualRadius}
                angle={sweepDeg}
                rotation={startRotation}
                fill={arcFill}
                stroke={arcStroke}
                strokeWidth={arcStrokeWidth}
                listening={false}
              />
              {/* L2: label */}
              {level === 2 && l2Part && (() => {
                const midAngle = toRad(startRotation + sweepDeg / 2);
                const labelDist = arcVisualRadius + 14;
                return (
                  <Text
                    x={sv.x + labelDist * Math.cos(midAngle) - 6}
                    y={sv.y + labelDist * Math.sin(midAngle) - 8}
                    text={l2Part.label}
                    fill={l2Part.color}
                    fontSize={16}
                    fontStyle="bold"
                    listening={false}
                  />
                );
              })()}
            </React.Fragment>
          );
        })}

        {/* Draw each side as a separate tappable Line */}
        {vertices.map((v, i) => {
          const next = vertices[(i + 1) % shapeSides];
          const sv = scale(v);
          const sn = scale(next);

          let strokeColor = konvaTheme.shapeStroke || "#000000";
          let strokeWidth = 3;

          // L1: highlight one side
          if (level === 1 && highlightedType === "side" && highlightedIndex === i) {
            strokeColor = highlightColor;
            strokeWidth = 6;
          }

          // L2: highlight labeled parts
          const partKey = `side-${i}`;
          const l2Part = partLookup[partKey];
          if (level === 2 && l2Part) {
            strokeColor = l2Part.color;
            strokeWidth = 6;
          }

          // Dynamic highlights (L3/L4 tap)
          if (highlightedElements && highlightedElements[partKey]) {
            strokeColor = highlightedElements[partKey];
            strokeWidth = 6;
          }

          // Flash (wrong tap)
          if (flashElements && flashElements[partKey]) {
            strokeColor = flashElements[partKey];
            strokeWidth = 6;
          }

          return (
            <React.Fragment key={`side-${i}`}>
              <Line
                points={[sv.x, sv.y, sn.x, sn.y]}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                hitStrokeWidth={hitWidth}
                lineCap="round"
                onTap={onSideTap ? () => onSideTap(i) : undefined}
                onClick={onSideTap ? () => onSideTap(i) : undefined}
              />
              {/* L2: side label */}
              {level === 2 && l2Part && (
                <Text
                  x={(sv.x + sn.x) / 2 - 6}
                  y={(sv.y + sn.y) / 2 - 20}
                  text={l2Part.label}
                  fill={l2Part.color}
                  fontSize={16}
                  fontStyle="bold"
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Angle tap targets — render ON TOP of sides so they get tap priority */}
        {onAngleTap && vertices.map((v, i) => {
          const prev = vertices[(i - 1 + shapeSides) % shapeSides];
          const next = vertices[(i + 1) % shapeSides];
          const sv = scale(v);
          const sp = scale(prev);
          const sn = scale(next);
          const { startRotation, sweepDeg } = computeAngleArc(sv, sp, sn);
          const minAngle = Math.max(sweepDeg, 40);

          return (
            <Wedge
              key={`angle-tap-${i}`}
              x={sv.x}
              y={sv.y}
              radius={angleRadius}
              angle={minAngle}
              rotation={startRotation - (minAngle - sweepDeg) / 2}
              fill="transparent"
              onTap={() => onAngleTap(i)}
              onClick={() => onAngleTap(i)}
            />
          );
        })}

        {/* Vertex dots */}
        {vertices.map((v, i) => {
          const sv = scale(v);
          return (
            <Circle
              key={`vertex-${i}`}
              x={sv.x}
              y={sv.y}
              radius={4}
              fill={konvaTheme.point || "#ef4444"}
              listening={false}
            />
          );
        })}

        {/* L4: count badges on highlighted elements */}
        {level === 4 && highlightedElements && Object.entries(highlightedElements).map(([key, color]) => {
          if (!color) return null;
          const [type, idxStr] = key.split("-");
          const idx = Number(idxStr);
          if (type === "side") {
            const v1 = scale(vertices[idx]);
            const v2 = scale(vertices[(idx + 1) % shapeSides]);
            return (
              <React.Fragment key={`badge-${key}`}>
                <Circle x={(v1.x + v2.x) / 2} y={(v1.y + v2.y) / 2} radius={10} fill={color} listening={false} />
              </React.Fragment>
            );
          } else if (type === "angle") {
            const sv = scale(vertices[idx]);
            return (
              <React.Fragment key={`badge-${key}`}>
                <Circle x={sv.x} y={sv.y} radius={10} fill={color} listening={false} />
              </React.Fragment>
            );
          }
          return null;
        })}
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function SidesAndAnglesLesson({ triggerNewProblem }) {
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

  // L2: classify state
  const [classifications, setClassifications] = useState({});

  // L3: tap state
  const [highlightedElements, setHighlightedElements] = useState({});
  const [flashElements, setFlashElements] = useState({});

  // L4: count state
  const [countedElements, setCountedElements] = useState(new Set());
  const [currentCount, setCurrentCount] = useState(0);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    shapeSides = 4,
    shapeName = "square",
    vertices: rawVertices = [],
    rotation = 0,
    highlightedType = "side",
    highlightedIndex = 0,
    parts: rawParts = null,
    targetType = "side",
    correctCount = 0,
    problemType = "",
    choices: rawChoices = [],
    educationalNote = "",
  } = visualData;

  const vertices = rawVertices || [];
  const parts = rawParts || [];
  const choices = rawChoices || [];
  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Canvas sizing
  const canvasWidth = Math.min(windowWidth - 40, 400);
  const canvasHeight = canvasWidth;

  // Reset on problem change
  const problemKey = `${shapeSides}-${level}-${currentQuestionIndex}-${rotation}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
    setClassifications({});
    setHighlightedElements({});
    setFlashElements({});
    setCountedElements(new Set());
    setCurrentCount(0);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setClassifications({});
    setHighlightedElements({});
    setFlashElements({});
    setCountedElements(new Set());
    setCurrentCount(0);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  // L1: Choice click handler
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

  // L2: Classification toggle
  const handleClassifyToggle = useCallback((label, value) => {
    setClassifications((prev) => ({ ...prev, [label]: value }));
  }, []);

  // L2: Check classifications
  const handleCheckClassify = useCallback(() => {
    if (!parts || parts.length === 0) return;

    const allCorrect = parts.every((p) => {
      const expected = p.type === "side" ? "Side" : "Angle";
      return classifications[p.label] === expected;
    });

    if (allCorrect) {
      setPhase("complete");
      revealAnswer();
    } else {
      setWrongAttempts((prev) => prev + 1);
    }
  }, [parts, classifications, revealAnswer]);

  // L3: Side tap handler
  const handleSideTapL3 = useCallback((index) => {
    if (phase !== "interact") return;

    if (targetType === "side") {
      // Correct!
      setHighlightedElements((prev) => ({ ...prev, [`side-${index}`]: konvaTheme.shapeHighlight || "#00BF63" }));
      setTimeout(() => {
        setPhase("complete");
        revealAnswer();
      }, 600);
    } else {
      // Wrong — flash red
      const key = `side-${index}`;
      setFlashElements((prev) => ({ ...prev, [key]: "#EF4444" }));
      setWrongAttempts((prev) => prev + 1);
      setTimeout(() => {
        setFlashElements((prev) => {
          const n = { ...prev };
          delete n[key];
          return n;
        });
      }, 500);
    }
  }, [phase, targetType, konvaTheme, revealAnswer]);

  // L3: Angle tap handler
  const handleAngleTapL3 = useCallback((index) => {
    if (phase !== "interact") return;

    if (targetType === "angle") {
      // Correct!
      setHighlightedElements((prev) => ({ ...prev, [`angle-${index}`]: konvaTheme.shapeHighlight || "#00BF63" }));
      setTimeout(() => {
        setPhase("complete");
        revealAnswer();
      }, 600);
    } else {
      // Wrong — flash red
      const key = `angle-${index}`;
      setFlashElements((prev) => ({ ...prev, [key]: "#EF4444" }));
      setWrongAttempts((prev) => prev + 1);
      setTimeout(() => {
        setFlashElements((prev) => {
          const n = { ...prev };
          delete n[key];
          return n;
        });
      }, 500);
    }
  }, [phase, targetType, konvaTheme, revealAnswer]);

  // L4: Count tap handlers
  const handleSideTapL4 = useCallback((index) => {
    if (phase !== "interact") return;
    const key = `side-${index}`;
    if (targetType !== "sides") {
      // Wrong type — flash red
      setFlashElements((prev) => ({ ...prev, [key]: "#EF4444" }));
      setWrongAttempts((prev) => prev + 1);
      setTimeout(() => {
        setFlashElements((prev) => {
          const n = { ...prev };
          delete n[key];
          return n;
        });
      }, 500);
      return;
    }
    if (countedElements.has(key)) return; // already counted
    setCountedElements((prev) => new Set([...prev, key]));
    setCurrentCount((prev) => prev + 1);
    setHighlightedElements((prev) => ({ ...prev, [key]: konvaTheme.shapeHighlight || "#00BF63" }));
  }, [phase, targetType, countedElements, konvaTheme]);

  const handleAngleTapL4 = useCallback((index) => {
    if (phase !== "interact") return;
    const key = `angle-${index}`;
    if (targetType !== "angles") {
      // Wrong type — flash red
      setFlashElements((prev) => ({ ...prev, [key]: "#EF4444" }));
      setWrongAttempts((prev) => prev + 1);
      setTimeout(() => {
        setFlashElements((prev) => {
          const n = { ...prev };
          delete n[key];
          return n;
        });
      }, 500);
      return;
    }
    if (countedElements.has(key)) return; // already counted
    setCountedElements((prev) => new Set([...prev, key]));
    setCurrentCount((prev) => prev + 1);
    setHighlightedElements((prev) => ({ ...prev, [key]: konvaTheme.shapeHighlight || "#00BF63" }));
  }, [phase, targetType, countedElements, konvaTheme]);

  // L4: Submit count
  const handleSubmitCount = useCallback(() => {
    if (currentCount === correctCount) {
      setPhase("complete");
      revealAnswer();
    } else {
      setWrongAttempts((prev) => prev + 1);
    }
  }, [currentCount, correctCount, revealAnswer]);

  // L5: Word problem choice click
  const handleWordChoiceClick = useCallback((choice, idx) => {
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

  // Determine which tap handlers to pass to ShapeDiagram
  const sideTapHandler = useMemo(() => {
    if (level === 3 && phase === "interact") return handleSideTapL3;
    if (level === 4 && phase === "interact") return handleSideTapL4;
    return null;
  }, [level, phase, handleSideTapL3, handleSideTapL4]);

  const angleTapHandler = useMemo(() => {
    if (level === 3 && phase === "interact") return handleAngleTapL3;
    if (level === 4 && phase === "interact") return handleAngleTapL4;
    return null;
  }, [level, phase, handleAngleTapL3, handleAngleTapL4]);

  // Check if all L2 parts are classified
  const allClassified = parts.length > 0 && parts.every((p) => classifications[p.label]);

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
      <InstructionText>
        {level <= 2 ? levelInfo.instruction : questionText}
      </InstructionText>

      {/* Konva Shape Diagram */}
      <CanvasWrapper>
        <ShapeDiagram
          vertices={vertices}
          shapeSides={shapeSides}
          konvaTheme={konvaTheme}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          isTouchDevice={isTouchDevice}
          highlightedElements={highlightedElements}
          flashElements={flashElements}
          onSideTap={sideTapHandler}
          onAngleTap={angleTapHandler}
          level={level}
          highlightedType={highlightedType}
          highlightedIndex={highlightedIndex}
          parts={parts}
        />
      </CanvasWrapper>

      {/* ===== Level 1: Binary Choice ===== */}
      {level === 1 && phase === "interact" && choices.length > 0 && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && shakingIdx === null && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}
          <ButtonRow>
            {[...choices]
              .sort((a, b) => {
                const aIsAngle = a.text.toLowerCase().includes("angle");
                const bIsAngle = b.text.toLowerCase().includes("angle");
                if (aIsAngle && !bIsAngle) return -1;
                if (!aIsAngle && bIsAngle) return 1;
                return 0;
              })
              .map((choice) => {
                const originalIdx = choices.indexOf(choice);
                const isAngleButton = choice.text.toLowerCase().includes("angle");
                const ButtonComponent = isAngleButton ? AngleButton : SideButton;
                return (
                  <ButtonComponent
                    key={originalIdx}
                    onClick={() => handleChoiceClick(choice, originalIdx)}
                    disabled={selectedChoice !== null || shakingIdx === originalIdx}
                  >
                    {choice.text}
                  </ButtonComponent>
                );
              })}
          </ButtonRow>
        </ChooseSection>
      )}

      {/* ===== Level 2: Classify All ===== */}
      {level === 2 && phase === "interact" && (
        <ClassifySection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && (
            <FeedbackText $isWrong>Some are incorrect — check again!</FeedbackText>
          )}
          {parts.map((part) => (
            <ClassifyRow key={part.label}>
              <PartLabel $color={part.color}>{part.label}</PartLabel>
              <ToggleGroup>
                <ToggleButton
                  $active={classifications[part.label] === "Side"}
                  $isTouchDevice={isTouchDevice}
                  onClick={() => handleClassifyToggle(part.label, "Side")}
                >
                  Side
                </ToggleButton>
                <ToggleButton
                  $active={classifications[part.label] === "Angle"}
                  $isTouchDevice={isTouchDevice}
                  onClick={() => handleClassifyToggle(part.label, "Angle")}
                >
                  Angle
                </ToggleButton>
              </ToggleGroup>
            </ClassifyRow>
          ))}
          <CheckButton
            onClick={handleCheckClassify}
            disabled={!allClassified}
            $dimmed={!allClassified}
          >
            Check
          </CheckButton>
        </ClassifySection>
      )}

      {/* ===== Level 3: Tap Feedback ===== */}
      {level === 3 && phase === "interact" && (
        <TapSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && (
            <FeedbackText $isWrong>
              That's {targetType === "side" ? "an angle" : "a side"}, not {targetType === "side" ? "a side" : "an angle"}. Try again!
            </FeedbackText>
          )}
          <TapInstruction>Tap directly on the shape above</TapInstruction>
        </TapSection>
      )}

      {/* ===== Level 4: Count ===== */}
      {level === 4 && phase === "interact" && (
        <CountSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && (
            <FeedbackText $isWrong>Not the right count. Keep tapping!</FeedbackText>
          )}
          <CountDisplay>
            <CountNumber>{currentCount}</CountNumber>
            <CountLabel>{targetType} counted</CountLabel>
          </CountDisplay>
          <TapInstruction>
            Tap each {targetType === "sides" ? "side" : "angle"} on the shape to count it
          </TapInstruction>
          <CheckButton onClick={handleSubmitCount}>
            Submit Count
          </CheckButton>
        </CountSection>
      )}

      {/* ===== Level 5: Word Problem ===== */}
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
                  onClick={() => handleWordChoiceClick(choice, idx)}
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

export default SidesAndAnglesLesson;

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

/* L2: Classify section */

const ClassifySection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  animation: ${fadeInAnim} 0.3s ease;
  max-width: 420px;
`;

const ClassifyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 8px 12px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 10px;
`;

const PartLabel = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.$color || props.theme.colors.textPrimary};
  min-width: 30px;
  text-align: center;
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 8px;
  flex: 1;
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: ${(props) => (props.$isTouchDevice ? "12px" : "10px")};
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${(props) => props.$active
    ? props.theme.colors.info || "#3B82F6"
    : props.theme.colors.border};
  background-color: ${(props) => props.$active
    ? (props.theme.colors.info || "#3B82F6") + "20"
    : props.theme.colors.cardBackground};
  color: ${(props) => props.$active
    ? props.theme.colors.info || "#3B82F6"
    : props.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    border-color: ${(props) => props.theme.colors.info || "#3B82F6"};
  }
`;

/* L3: Tap section */

const TapSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: ${fadeInAnim} 0.3s ease;
`;

const TapInstruction = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
`;

/* L4: Count section */

const CountSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  animation: ${fadeInAnim} 0.3s ease;
`;

const CountDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CountNumber = styled.span`
  font-size: 48px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.info || "#3B82F6"};
  font-family: "Georgia", serif;
`;

const CountLabel = styled.span`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textSecondary};
  font-weight: 500;
`;

const CheckButton = styled.button`
  padding: 14px 32px;
  font-size: 17px;
  font-weight: 700;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.info || "#3B82F6"};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  touch-action: manipulation;

  ${(props) => props.$dimmed && css`
    opacity: 0.5;
    cursor: default;
  `}

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

/* Complete section */

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

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const AngleButton = styled.button`
  padding: 14px 40px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 10px;
  border: 3px solid #3B82F6;
  cursor: pointer;
  background-color: transparent;
  color: #3B82F6;
  transition: all 0.2s;

  &:hover {
    background-color: #3B82F6;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const SideButton = styled.button`
  padding: 14px 40px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 10px;
  border: 3px solid #F59E0B;
  cursor: pointer;
  background-color: transparent;
  color: #F59E0B;
  transition: all 0.2s;

  &:hover {
    background-color: #F59E0B;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
