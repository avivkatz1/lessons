import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Circle, Line, Arc, Text, Rect } from 'react-konva';
import { useLessonState, useWindowDimensions, useKonvaTheme } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

/**
 * InverseTrig - Inverse Trigonometric Functions lesson (3 levels)
 * Level 1: Recognition - Find angles from standard unit circle values
 * Level 2: Calculation - Evaluate non-standard values with right triangles
 * Level 3: Real-world applications - Practical angle-finding problems
 *
 * Architecture: Redux-First (all data from backend via questionAnswerArray)
 * Role: react_specialist - Consumes visualData from backend, renders Konva components
 */
function InverseTrig({ triggerNewProblem }) {
  // 1. Get lesson state and data from Redux
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();
  const { width: viewportWidth } = useWindowDimensions();

  // 2. Local UI state only (not problem data)
  const [showHint, setShowHint] = useState(false);

  // 3. Get current problem from Redux
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;

  const {
    question = currentProblem.question,
    answer = currentProblem.answer,
    acceptedAnswers = currentProblem.acceptedAnswers,
    visualData = currentProblem.visualData,
    hint = currentProblem.hint,
    explanation = currentProblem.explanation,
  } = currentProblem;

  // 4. Format answer as array
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers && Array.isArray(acceptedAnswers) && acceptedAnswers.length > 0) {
      return acceptedAnswers;
    }
    if (Array.isArray(answer)) return answer;
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  // 5. Handle user actions
  const handleTryAnother = () => {
    setShowHint(false);
    triggerNewProblem();
    hideAnswer();
  };

  // Determine visualization type from backend visualData
  const showUnitCircle = visualData?.showUnitCircle;
  const showTriangle = visualData?.showTriangle;
  const showContext = visualData?.contextType;

  // 6. Render
  return (
    <Wrapper>
      {/* Section 1: TopHintButton - Fixed position top-right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Section 2: QuestionSection - Centered question text */}
      <QuestionSection>
        <QuestionText>{question?.[0]?.text || question}</QuestionText>
      </QuestionSection>

      {/* Section 3: VisualSection - Light background container */}
      {showUnitCircle && visualData && (
        <VisualSection>
          <UnitCircleVisualization visualData={visualData} />
        </VisualSection>
      )}

      {showTriangle && visualData && (
        <VisualSection>
          <RightTriangleVisualization visualData={visualData} />
        </VisualSection>
      )}

      {showContext && visualData && (
        <VisualSection>
          <ContextDiagram visualData={visualData} />
        </VisualSection>
      )}

      {/* Section 4: InteractionSection - Hint box + answer input */}
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
                placeholder="Enter angle in degrees"
              />
            </AnswerInputContainer>
          </>
        )}

        {/* Section 5: ExplanationSection - Green background on answer reveal */}
        {showAnswer && explanation && (
          <ExplanationSection>
            <ExplanationText>{explanation}</ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

// ============================================================================
// Geometry Helpers (VISUAL_DESIGN_RULES.md compliant)
// ============================================================================

/** Rule #1: Dynamic angle arc — always shows interior angle */
function calcAngleArc(vertex, p1, p2) {
  const theta1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x) * (180 / Math.PI);
  const theta2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x) * (180 / Math.PI);
  const sweep = ((theta2 - theta1) % 360 + 360) % 360;
  const arcAngle = sweep <= 180 ? sweep : 360 - sweep;
  const arcRotation = sweep <= 180 ? theta1 : theta2;
  const d1 = Math.sqrt((p1.x - vertex.x) ** 2 + (p1.y - vertex.y) ** 2);
  const d2 = Math.sqrt((p2.x - vertex.x) ** 2 + (p2.y - vertex.y) ** 2);
  const arcRadius = Math.min(Math.min(d1, d2) * 0.2, 35);
  return { arcAngle, arcRotation, arcRadius };
}

/** Rule #1: Right angle indicator via unit vectors */
function calcRightAngleCorners(vertex, p1, p2, size) {
  const dx1 = p1.x - vertex.x, dy1 = p1.y - vertex.y;
  const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const ux1 = dx1 / len1, uy1 = dy1 / len1;
  const dx2 = p2.x - vertex.x, dy2 = p2.y - vertex.y;
  const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
  const ux2 = dx2 / len2, uy2 = dy2 / len2;
  return [
    vertex.x + ux1 * size, vertex.y + uy1 * size,
    vertex.x + ux1 * size + ux2 * size, vertex.y + uy1 * size + uy2 * size,
    vertex.x + ux2 * size, vertex.y + uy2 * size,
  ];
}

/** Rule #2: Rotated label outside triangle via perpendicular offset */
function calcRotatedLabel(start, end, thirdVertex, offset) {
  const rotation = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
  const dx = end.x - start.x, dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const perpX = -dy / len, perpY = dx / len;
  const midX = (start.x + end.x) / 2, midY = (start.y + end.y) / 2;
  const testDist = Math.sqrt((midX + perpX * 10 - thirdVertex.x) ** 2 + (midY + perpY * 10 - thirdVertex.y) ** 2);
  const midDist = Math.sqrt((midX - thirdVertex.x) ** 2 + (midY - thirdVertex.y) ** 2);
  const flip = testDist < midDist ? -1 : 1;
  return { x: midX + flip * perpX * offset, y: midY + flip * perpY * offset, rotation };
}

/** Rule #4: Theta label along angle bisector, leader line for narrow angles */
function calcAngleLabel(vertex, arcRotation, arcAngle, arcRadius) {
  const bisectorDeg = arcRotation + arcAngle / 2;
  const bisectorRad = bisectorDeg * (Math.PI / 180);
  if (arcAngle >= 25) {
    const dist = arcRadius + 18;
    return {
      x: vertex.x + Math.cos(bisectorRad) * dist,
      y: vertex.y + Math.sin(bisectorRad) * dist,
      needsLeaderLine: false,
    };
  }
  const labelDist = arcRadius + 55;
  const lineDist = arcRadius + 5;
  return {
    x: vertex.x + Math.cos(bisectorRad) * labelDist,
    y: vertex.y + Math.sin(bisectorRad) * labelDist,
    needsLeaderLine: true,
    lineEnd: {
      x: vertex.x + Math.cos(bisectorRad) * lineDist,
      y: vertex.y + Math.sin(bisectorRad) * lineDist,
    },
  };
}

// ============================================================================
// Level 1: Unit Circle Visualization
// ============================================================================

function UnitCircleVisualization({ visualData }) {
  const { width: viewportWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  if (!visualData) return null;

  const { correctAngle = 0, functionType = 'arcsin' } = visualData;

  const canvasWidth = Math.min(viewportWidth - 40, 600);
  const canvasHeight = 280;

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = 90;

  const angleRad = (correctAngle * Math.PI) / 180;
  const pointX = centerX + radius * Math.cos(angleRad);
  const pointY = centerY - radius * Math.sin(angleRad);

  const arcColor = functionType === 'arcsin' ? konvaTheme.opposite
    : functionType === 'arccos' ? konvaTheme.adjacent
    : konvaTheme.horizontal;

  const arcFill = functionType === 'arcsin' ? 'rgba(239, 68, 68, 0.2)'
    : functionType === 'arccos' ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(16, 185, 129, 0.2)';

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* Canvas background */}
        <Rect
          x={0} y={0}
          width={canvasWidth} height={canvasHeight}
          fill={konvaTheme.canvasBackground}
        />

        {/* Unit circle */}
        <Circle
          x={centerX} y={centerY} radius={radius}
          stroke={konvaTheme.shapeStroke} strokeWidth={2}
          fill={konvaTheme.shapeFill}
          opacity={0.1}
        />

        {/* X and Y axes */}
        <Line
          points={[centerX - radius - 20, centerY, centerX + radius + 20, centerY]}
          stroke={konvaTheme.tickMark} strokeWidth={1} dash={[5, 5]}
        />
        <Line
          points={[centerX, centerY - radius - 20, centerX, centerY + radius + 20]}
          stroke={konvaTheme.tickMark} strokeWidth={1} dash={[5, 5]}
        />

        {/* Angle arc */}
        <Arc
          x={centerX} y={centerY}
          innerRadius={0} outerRadius={30}
          angle={correctAngle} fill={arcFill}
          stroke={arcColor} strokeWidth={2}
          rotation={-correctAngle}
        />

        {/* Radius line to point */}
        <Line
          points={[centerX, centerY, pointX, pointY]}
          stroke={arcColor} strokeWidth={2}
        />

        {/* Point on circle */}
        <Circle
          x={pointX} y={pointY} radius={6}
          fill={arcColor} stroke={konvaTheme.canvasBackground} strokeWidth={2}
        />

        {/* Angle label */}
        <Text
          x={centerX + 35} y={centerY - 15}
          text={"\u03B8 = ?"} fontSize={16}
          fill={konvaTheme.labelText} fontStyle="bold"
        />

        {/* Coordinate labels */}
        <Text x={centerX + radius + 10} y={centerY - 10} text="1" fontSize={14} fill={konvaTheme.coordinateText} />
        <Text x={centerX - 5} y={centerY - radius - 25} text="1" fontSize={14} fill={konvaTheme.coordinateText} />
      </Layer>
    </Stage>
  );
}

// ============================================================================
// Level 2: Right Triangle Visualization
// ============================================================================

function RightTriangleVisualization({ visualData }) {
  const { width: viewportWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  if (!visualData || !visualData.triangle) return null;

  const { triangle } = visualData;
  const { opposite, adjacent, hypotenuse } = triangle;

  const canvasWidth = Math.min(viewportWidth - 40, 600);
  const canvasHeight = 300;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const absOpp = Math.abs(opposite);
  const absAdj = Math.abs(adjacent);
  const absHyp = Math.abs(hypotenuse);

  // Rule #3: Scale then clamp to 80px minimum per side
  const maxSide = Math.max(absOpp, absAdj);
  const scale = Math.min(70, (canvasWidth - 150) / (maxSide * 2));
  const scaledAdj = Math.max(absAdj * scale, 80);
  const scaledOpp = Math.max(absOpp * scale, 80);

  const bottomLeft = { x: centerX - scaledAdj / 2, y: centerY + scaledOpp / 2 + 20 };
  const bottomRight = { x: centerX + scaledAdj / 2, y: centerY + scaledOpp / 2 + 20 };
  const topRight = { x: centerX + scaledAdj / 2, y: centerY - scaledOpp / 2 + 20 };

  const raCorners = calcRightAngleCorners(bottomRight, bottomLeft, topRight, 12);
  const arc = calcAngleArc(bottomLeft, bottomRight, topRight);
  const hypLabel = calcRotatedLabel(bottomLeft, topRight, bottomRight, 20);
  const thetaPos = calcAngleLabel(bottomLeft, arc.arcRotation, arc.arcAngle, arc.arcRadius);

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* Canvas background */}
        <Rect
          x={0} y={0}
          width={canvasWidth} height={canvasHeight}
          fill={konvaTheme.canvasBackground}
        />

        {/* Adjacent (bottom) */}
        <Line points={[bottomLeft.x, bottomLeft.y, bottomRight.x, bottomRight.y]} stroke={konvaTheme.adjacent} strokeWidth={3} />
        <Text x={(bottomLeft.x + bottomRight.x) / 2 - 35} y={bottomLeft.y + 20} text={`adjacent = ${absAdj.toFixed(3)}`} fontSize={13} fill={konvaTheme.adjacent} fontStyle="bold" />

        {/* Opposite (right side) */}
        <Line points={[bottomRight.x, bottomRight.y, topRight.x, topRight.y]} stroke={konvaTheme.opposite} strokeWidth={3} />
        <Text x={topRight.x + 15} y={(bottomRight.y + topRight.y) / 2 - 5} text={`opposite = ${absOpp.toFixed(3)}`} fontSize={13} fill={konvaTheme.opposite} fontStyle="bold" />

        {/* Hypotenuse */}
        <Line points={[bottomLeft.x, bottomLeft.y, topRight.x, topRight.y]} stroke={konvaTheme.hypotenuse} strokeWidth={3} />
        <Text x={hypLabel.x} y={hypLabel.y} text={`hypotenuse = ${absHyp.toFixed(3)}`} fontSize={13} fill={konvaTheme.hypotenuse} fontStyle="bold" rotation={hypLabel.rotation} offsetX={70} offsetY={8} />

        {/* Right angle indicator */}
        <Line points={raCorners} stroke={konvaTheme.shapeStroke} strokeWidth={2} closed={false} />

        {/* Angle arc */}
        <Arc x={bottomLeft.x} y={bottomLeft.y} innerRadius={0} outerRadius={arc.arcRadius} angle={arc.arcAngle} rotation={arc.arcRotation} fill="rgba(245, 158, 11, 0.2)" stroke={konvaTheme.angle} strokeWidth={2} />

        {/* Theta label */}
        <Text x={thetaPos.x} y={thetaPos.y} text={"\u03B8"} fontSize={16} fill={konvaTheme.labelText} fontStyle="bold" offsetX={6} offsetY={8} />
        {thetaPos.needsLeaderLine && (
          <Line points={[thetaPos.x, thetaPos.y, thetaPos.lineEnd.x, thetaPos.lineEnd.y]} stroke={konvaTheme.tickMark} strokeWidth={1} />
        )}
      </Layer>
    </Stage>
  );
}

// ============================================================================
// Level 3: Context Diagrams
// ============================================================================

function ContextDiagram({ visualData }) {
  const { width: viewportWidth } = useWindowDimensions();
  if (!visualData || !visualData.contextType) return null;
  const { contextType, measurements } = visualData;
  const canvasWidth = Math.min(viewportWidth - 40, 600);
  const props = { width: canvasWidth, height: 300, measurements };
  switch (contextType) {
    case 'ladder': return <LadderDiagram {...props} />;
    case 'ramp': return <RampDiagram {...props} />;
    case 'airplane': return <AirplaneDiagram {...props} />;
    case 'roof': return <RoofDiagram {...props} />;
    case 'crane': return <CraneDiagram {...props} />;
    default: return null;
  }
}

function LadderDiagram({ width, height, measurements }) {
  const konvaTheme = useKonvaTheme();
  const { ladderLength, wallHeight, groundDistance } = measurements;
  const centerX = width / 2, centerY = height / 2;
  const maxDim = Math.max(wallHeight, groundDistance);
  const rawScale = Math.min(width - 100, height - 100) / maxDim;
  const scaledH = Math.max(wallHeight * rawScale, 80);
  const scaledG = Math.max(groundDistance * rawScale, 80);

  const groundY = centerY + scaledH / 2;
  const wallX = centerX + scaledG / 2;
  const ladderBottomX = centerX - scaledG / 2;
  const wallTopY = centerY - scaledH / 2;

  const ladderBottom = { x: ladderBottomX, y: groundY };
  const wallBase = { x: wallX, y: groundY };
  const wallTop = { x: wallX, y: wallTopY };

  const arc = calcAngleArc(ladderBottom, wallBase, wallTop);
  const ladderLabel = calcRotatedLabel(ladderBottom, wallTop, wallBase, 22);
  const thetaPos = calcAngleLabel(ladderBottom, arc.arcRotation, arc.arcAngle, arc.arcRadius);

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill={konvaTheme.canvasBackground} />
        <Line points={[30, groundY, width - 30, groundY]} stroke={konvaTheme.shapeStroke} strokeWidth={3} />
        <Line points={[wallX, wallTopY - 20, wallX, groundY]} stroke={konvaTheme.shapeStroke} strokeWidth={3} />
        <Line points={[ladderBottomX, groundY, wallX, wallTopY]} stroke={konvaTheme.angle} strokeWidth={5} />
        <Line points={[wallX, wallTopY, wallX, groundY]} stroke={konvaTheme.opposite} strokeWidth={2} dash={[5, 5]} />
        <Line points={[ladderBottomX, groundY, wallX, groundY]} stroke={konvaTheme.adjacent} strokeWidth={2} dash={[5, 5]} />

        <Arc x={ladderBottomX} y={groundY} innerRadius={0} outerRadius={35} angle={arc.arcAngle} rotation={arc.arcRotation} fill="rgba(59, 130, 246, 0.15)" stroke={konvaTheme.adjacent} strokeWidth={2} />

        <Text x={wallX + 12} y={(wallTopY + groundY) / 2 - 10} text={`height: ${wallHeight}m`} fontSize={14} fill={konvaTheme.opposite} fontStyle="bold" />
        <Text x={(ladderBottomX + wallX) / 2 - 35} y={groundY + 20} text={`distance: ${groundDistance.toFixed(1)}m`} fontSize={14} fill={konvaTheme.adjacent} fontStyle="bold" />
        <Text x={ladderLabel.x} y={ladderLabel.y} text={`ladder: ${ladderLength}m`} fontSize={15} fill={konvaTheme.angle} fontStyle="bold" rotation={ladderLabel.rotation} offsetX={55} offsetY={8} />
        <Text x={thetaPos.x} y={thetaPos.y} text={"\u03B8"} fontSize={16} fill={konvaTheme.labelText} fontStyle="bold" offsetX={6} offsetY={8} />
        {thetaPos.needsLeaderLine && (
          <Line points={[thetaPos.x, thetaPos.y, thetaPos.lineEnd.x, thetaPos.lineEnd.y]} stroke={konvaTheme.tickMark} strokeWidth={1} />
        )}
      </Layer>
    </Stage>
  );
}

function RampDiagram({ width, height, measurements }) {
  const konvaTheme = useKonvaTheme();
  const { rise, run, rampLength } = measurements;
  const centerX = width / 2, centerY = height / 2;
  const maxDim = Math.max(rise, run);
  const rawScale = Math.min(width - 120, height - 120) / maxDim;
  const scaledRise = Math.max(rise * rawScale, 80);
  const scaledRun = Math.max(run * rawScale, 80);

  const groundY = centerY + scaledRise / 2 + 20;
  const rampBottomX = centerX - scaledRun / 2;
  const rampTopX = centerX + scaledRun / 2;
  const rampTopY = groundY - scaledRise;

  const rampBottom = { x: rampBottomX, y: groundY };
  const rampRightBase = { x: rampTopX, y: groundY };
  const rampTop = { x: rampTopX, y: rampTopY };

  const arc = calcAngleArc(rampBottom, rampRightBase, rampTop);
  const rampLabel = calcRotatedLabel(rampBottom, rampTop, rampRightBase, 22);
  const thetaPos = calcAngleLabel(rampBottom, arc.arcRotation, arc.arcAngle, arc.arcRadius);

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill={konvaTheme.canvasBackground} />
        <Line points={[30, groundY, width - 30, groundY]} stroke={konvaTheme.shapeStroke} strokeWidth={3} />
        <Line points={[rampBottomX, groundY, rampTopX, rampTopY]} stroke={konvaTheme.hypotenuse} strokeWidth={5} />
        <Line points={[rampTopX, rampTopY, rampTopX, groundY]} stroke={konvaTheme.opposite} strokeWidth={2} dash={[5, 5]} />
        <Line points={[rampBottomX, groundY, rampTopX, groundY]} stroke={konvaTheme.adjacent} strokeWidth={2} dash={[5, 5]} />

        <Arc x={rampBottomX} y={groundY} innerRadius={0} outerRadius={40} angle={arc.arcAngle} rotation={arc.arcRotation} fill="rgba(245, 158, 11, 0.15)" stroke={konvaTheme.angle} strokeWidth={2} />

        <Text x={rampTopX + 12} y={(rampTopY + groundY) / 2 - 5} text={`rise: ${rise}m`} fontSize={14} fill={konvaTheme.opposite} fontStyle="bold" />
        <Text x={(rampBottomX + rampTopX) / 2 - 30} y={groundY + 20} text={`run: ${run}m`} fontSize={14} fill={konvaTheme.adjacent} fontStyle="bold" />
        <Text x={rampLabel.x} y={rampLabel.y} text={`ramp: ${rampLength}m`} fontSize={14} fill={konvaTheme.hypotenuse} fontStyle="bold" rotation={rampLabel.rotation} offsetX={50} offsetY={8} />
        <Text x={thetaPos.x} y={thetaPos.y} text={"\u03B8"} fontSize={16} fill={konvaTheme.labelText} fontStyle="bold" offsetX={6} offsetY={8} />
        {thetaPos.needsLeaderLine && (
          <Line points={[thetaPos.x, thetaPos.y, thetaPos.lineEnd.x, thetaPos.lineEnd.y]} stroke={konvaTheme.tickMark} strokeWidth={1} />
        )}
      </Layer>
    </Stage>
  );
}

function AirplaneDiagram({ width, height, measurements }) {
  const konvaTheme = useKonvaTheme();
  const { altitudeDrop, horizontalDistance } = measurements;
  const centerX = width / 2, centerY = height / 2;
  const maxDim = Math.max(altitudeDrop, horizontalDistance);
  const rawScale = Math.min(width - 120, height - 100) / maxDim;
  const scaledAlt = Math.max(altitudeDrop * rawScale, 80);
  const scaledHoriz = Math.max(horizontalDistance * rawScale, 80);

  const startX = centerX - scaledHoriz / 2;
  const endX = centerX + scaledHoriz / 2;
  const startY = centerY - scaledAlt / 2;
  const endY = centerY + scaledAlt / 2;

  const start = { x: startX, y: startY };
  const endHoriz = { x: endX, y: startY };
  const endVert = { x: endX, y: endY };

  const arc = calcAngleArc(start, endHoriz, endVert);
  const thetaPos = calcAngleLabel(start, arc.arcRotation, arc.arcAngle, arc.arcRadius);

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill={konvaTheme.canvasBackground} />
        <Line points={[startX, startY, endX, endY]} stroke={konvaTheme.adjacent} strokeWidth={4} />
        <Line points={[endX, startY, endX, endY]} stroke={konvaTheme.opposite} strokeWidth={2} dash={[5, 5]} />
        <Line points={[startX, startY, endX, startY]} stroke={konvaTheme.horizontal} strokeWidth={2} dash={[5, 5]} />

        <Arc x={startX} y={startY} innerRadius={0} outerRadius={35} angle={arc.arcAngle} rotation={arc.arcRotation} fill="rgba(245, 158, 11, 0.15)" stroke={konvaTheme.angle} strokeWidth={2} />

        <Text x={endX + 10} y={(startY + endY) / 2 - 5} text={`${altitudeDrop}km`} fontSize={14} fill={konvaTheme.opposite} fontStyle="bold" />
        <Text x={(startX + endX) / 2 - 40} y={startY - 20} text={`${horizontalDistance}km`} fontSize={14} fill={konvaTheme.horizontal} fontStyle="bold" />
        <Text x={thetaPos.x} y={thetaPos.y} text={"\u03B8"} fontSize={16} fill={konvaTheme.labelText} fontStyle="bold" offsetX={6} offsetY={8} />
        {thetaPos.needsLeaderLine && (
          <Line points={[thetaPos.x, thetaPos.y, thetaPos.lineEnd.x, thetaPos.lineEnd.y]} stroke={konvaTheme.tickMark} strokeWidth={1} />
        )}
      </Layer>
    </Stage>
  );
}

function RoofDiagram({ width, height, measurements }) {
  const konvaTheme = useKonvaTheme();
  const { rise, run } = measurements;
  const centerX = width / 2, centerY = height / 2;
  const maxDim = Math.max(rise, run);
  const rawScale = Math.min(width - 120, height - 120) / maxDim;
  const scaledRise = Math.max(rise * rawScale, 80);
  const scaledRun = Math.max(run * rawScale, 80);

  const leftX = centerX - scaledRun;
  const rightX = centerX + scaledRun;
  const baseY = centerY + scaledRise / 2 + 20;
  const peakY = centerY - scaledRise / 2;

  const leftBase = { x: leftX, y: baseY };
  const centerBase = { x: centerX, y: baseY };
  const peak = { x: centerX, y: peakY };

  const arc = calcAngleArc(leftBase, centerBase, peak);
  const thetaPos = calcAngleLabel(leftBase, arc.arcRotation, arc.arcAngle, arc.arcRadius);

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill={konvaTheme.canvasBackground} />
        <Line points={[leftX, baseY, centerX, peakY]} stroke={konvaTheme.opposite} strokeWidth={5} />
        <Line points={[centerX, peakY, rightX, baseY]} stroke={konvaTheme.opposite} strokeWidth={5} />
        <Line points={[leftX, baseY, rightX, baseY]} stroke={konvaTheme.shapeStroke} strokeWidth={3} />
        <Line points={[centerX, peakY, centerX, baseY]} stroke={konvaTheme.opposite} strokeWidth={2} dash={[5, 5]} />
        <Line points={[leftX, baseY, centerX, baseY]} stroke={konvaTheme.adjacent} strokeWidth={2} dash={[5, 5]} />

        <Arc x={leftX} y={baseY} innerRadius={0} outerRadius={35} angle={arc.arcAngle} rotation={arc.arcRotation} fill="rgba(245, 158, 11, 0.15)" stroke={konvaTheme.angle} strokeWidth={2} />

        <Text x={centerX + 10} y={(peakY + baseY) / 2 - 5} text={`rise: ${rise}`} fontSize={14} fill={konvaTheme.opposite} fontStyle="bold" />
        <Text x={(leftX + centerX) / 2 - 25} y={baseY + 20} text={`run: ${run}`} fontSize={14} fill={konvaTheme.adjacent} fontStyle="bold" />
        <Text x={thetaPos.x} y={thetaPos.y} text={"\u03B8"} fontSize={16} fill={konvaTheme.labelText} fontStyle="bold" offsetX={6} offsetY={8} />
        {thetaPos.needsLeaderLine && (
          <Line points={[thetaPos.x, thetaPos.y, thetaPos.lineEnd.x, thetaPos.lineEnd.y]} stroke={konvaTheme.tickMark} strokeWidth={1} />
        )}
      </Layer>
    </Stage>
  );
}

function CraneDiagram({ width, height, measurements }) {
  const konvaTheme = useKonvaTheme();
  const { cableLength, horizontalDistance, verticalHeight } = measurements;
  const centerX = width / 2, centerY = height / 2;
  const maxDim = Math.max(verticalHeight, horizontalDistance);
  const rawScale = Math.min(width - 120, height - 120) / maxDim;
  const scaledV = Math.max(verticalHeight * rawScale, 80);
  const scaledH = Math.max(horizontalDistance * rawScale, 80);

  const craneTopX = centerX - scaledH / 2;
  const craneTopY = centerY - scaledV / 2;
  const loadX = craneTopX + scaledH;
  const loadY = craneTopY + scaledV;

  const craneTop = { x: craneTopX, y: craneTopY };
  const vertBottom = { x: craneTopX, y: loadY };
  const load = { x: loadX, y: loadY };

  const arc = calcAngleArc(craneTop, vertBottom, load);
  const cableLabel = calcRotatedLabel(craneTop, load, vertBottom, 22);
  const thetaPos = calcAngleLabel(craneTop, arc.arcRotation, arc.arcAngle, arc.arcRadius);

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill={konvaTheme.canvasBackground} />
        <Rect x={craneTopX - 15} y={craneTopY - 30} width={30} height={30} fill={konvaTheme.shapeFill} stroke={konvaTheme.shapeStroke} strokeWidth={2} />
        <Line points={[craneTopX, craneTopY, loadX, loadY]} stroke={konvaTheme.angle} strokeWidth={4} />
        <Line points={[craneTopX, craneTopY, craneTopX, loadY]} stroke={konvaTheme.opposite} strokeWidth={2} dash={[5, 5]} />
        <Line points={[craneTopX, loadY, loadX, loadY]} stroke={konvaTheme.adjacent} strokeWidth={2} dash={[5, 5]} />
        <Circle x={loadX} y={loadY} radius={12} fill={konvaTheme.shapeFill} stroke={konvaTheme.shapeStroke} strokeWidth={2} />

        <Arc x={craneTopX} y={craneTopY} innerRadius={0} outerRadius={35} angle={arc.arcAngle} rotation={arc.arcRotation} fill="rgba(16, 185, 129, 0.15)" stroke={konvaTheme.horizontal} strokeWidth={2} />

        <Text x={craneTopX - 65} y={(craneTopY + loadY) / 2 - 5} text={`${verticalHeight.toFixed(1)}m`} fontSize={14} fill={konvaTheme.opposite} fontStyle="bold" />
        <Text x={(craneTopX + loadX) / 2 - 35} y={loadY + 20} text={`${horizontalDistance}m`} fontSize={14} fill={konvaTheme.adjacent} fontStyle="bold" />
        <Text x={cableLabel.x} y={cableLabel.y} text={`cable: ${cableLength}m`} fontSize={14} fill={konvaTheme.angle} fontStyle="bold" rotation={cableLabel.rotation} offsetX={50} offsetY={8} />
        <Text x={thetaPos.x} y={thetaPos.y} text={"\u03B8"} fontSize={16} fill={konvaTheme.labelText} fontStyle="bold" offsetX={6} offsetY={8} />
        {thetaPos.needsLeaderLine && (
          <Line points={[thetaPos.x, thetaPos.y, thetaPos.lineEnd.x, thetaPos.lineEnd.y]} stroke={konvaTheme.tickMark} strokeWidth={1} />
        )}
      </Layer>
    </Stage>
  );
}

// ============================================================================
// Styled Components (docs/LESSON_IMPLEMENTATION_GUIDE.md standard template)
// ============================================================================

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;

  @media (max-width: 1024px) {
    padding: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const QuestionSection = styled.div`
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 1024px) {
    margin-bottom: 16px;
  }
`;

const QuestionText = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 20px;
  }

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  margin-bottom: 0;
  z-index: 100;
  background: #edf2f7;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    border-color: #a0aec0;
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

const VisualSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
  background: #f7fafc;
  border-radius: 12px;
  padding: 16px;

  @media (max-width: 1024px) {
    margin: 16px 0;
    padding: 12px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    margin: 12px 0;
    padding: 8px;
  }
`;

const InteractionSection = styled.div`
  margin-top: 20px;

  @media (max-width: 1024px) {
    margin-top: 16px;
  }
`;

const AnswerInputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    margin: 12px 0;
  }
`;

const HintBox = styled.div`
  background: #fff5e6;
  border-left: 4px solid #f6ad55;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 15px;
  color: #744210;

  @media (max-width: 1024px) {
    padding: 10px;
    margin-bottom: 12px;
    font-size: 14px;
  }
`;

const ExplanationSection = styled.div`
  background: #f0fff4;
  border: 2px solid #68d391;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;

  @media (max-width: 1024px) {
    padding: 16px;
    margin-top: 12px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const ExplanationText = styled.p`
  font-size: 15px;
  line-height: 1.5;
  color: #2d3748;
  margin: 12px 0;

  @media (max-width: 1024px) {
    font-size: 14px;
    line-height: 1.4;
    margin: 10px 0;
  }
`;

export default InverseTrig;
