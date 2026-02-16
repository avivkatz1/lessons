import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Line, Text, Rect, Circle, Arc } from 'react-konva';
import { useLessonState, useWindowDimensions } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

/**
 * PythagoreanTheorem - Redux-First 5-Level Implementation
 *
 * Level 1: Identification - Identify hypotenuse in labeled triangle
 * Level 2: Find Hypotenuse - Given two legs, find c (a² + b² = c²)
 * Level 3: Find Leg - Given hypotenuse and one leg, find other leg
 * Level 4: Mixed - Random Level 2 or 3 problems
 * Level 5: Word Problems - Real-world applications (ladder, rectangle, distance)
 *
 * Architecture: Redux-First (all data from backend via questionAnswerArray)
 */
function PythagoreanTheorem({ triggerNewProblem }) {
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
  const showIdentification = visualData?.showIdentification;
  const showBasicTriangle = visualData?.showBasicTriangle;
  const showWordProblem = visualData?.showWordProblem;

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
      {showIdentification && visualData && (
        <VisualSection>
          <IdentificationTriangle visualData={visualData} />
        </VisualSection>
      )}

      {showBasicTriangle && visualData && (
        <VisualSection>
          <BasicTriangle visualData={visualData} />
        </VisualSection>
      )}

      {showWordProblem && visualData && (
        <VisualSection>
          <WordProblemDiagram visualData={visualData} />
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
                placeholder="Enter your answer"
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
// Level 1: Identification Triangle
// ============================================================================

function IdentificationTriangle({ visualData }) {
  if (!visualData || !visualData.triangle) return null;

  const { sideA, sideB, sideC } = visualData.triangle;
  const { vertices, canvasWidth, canvasHeight } = visualData;

  // If no oriented vertices, fall back to old fixed position
  if (!vertices) {
    return <IdentificationTriangleLegacy visualData={visualData} />;
  }

  const { A, B, C } = vertices;
  const labelOffset = 25;

  // Calculate label positions for each side
  // Side A (opposite vertex A, connects B to C)
  const sideA_mid = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
  const sideA_angle = Math.atan2(C.y - B.y, C.x - B.x);
  const sideA_perpAngle = sideA_angle + Math.PI / 2;

  // Determine which direction to offset (away from vertex A)
  const testX = sideA_mid.x + Math.cos(sideA_perpAngle) * labelOffset;
  const testY = sideA_mid.y + Math.sin(sideA_perpAngle) * labelOffset;
  const distToA1 = Math.sqrt((testX - A.x) ** 2 + (testY - A.y) ** 2);
  const distToA2 = Math.sqrt((sideA_mid.x - Math.cos(sideA_perpAngle) * labelOffset - A.x) ** 2 +
                             (sideA_mid.y - Math.sin(sideA_perpAngle) * labelOffset - A.y) ** 2);
  const sideA_label = distToA1 > distToA2 ?
    { x: testX, y: testY } :
    { x: sideA_mid.x - Math.cos(sideA_perpAngle) * labelOffset, y: sideA_mid.y - Math.sin(sideA_perpAngle) * labelOffset };

  // Side B (opposite vertex B, connects A to C)
  const sideB_mid = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const sideB_angle = Math.atan2(C.y - A.y, C.x - A.x);
  const sideB_perpAngle = sideB_angle + Math.PI / 2;

  const testXB = sideB_mid.x + Math.cos(sideB_perpAngle) * labelOffset;
  const testYB = sideB_mid.y + Math.sin(sideB_perpAngle) * labelOffset;
  const distToB1 = Math.sqrt((testXB - B.x) ** 2 + (testYB - B.y) ** 2);
  const distToB2 = Math.sqrt((sideB_mid.x - Math.cos(sideB_perpAngle) * labelOffset - B.x) ** 2 +
                             (sideB_mid.y - Math.sin(sideB_perpAngle) * labelOffset - B.y) ** 2);
  const sideB_label = distToB1 > distToB2 ?
    { x: testXB, y: testYB } :
    { x: sideB_mid.x - Math.cos(sideB_perpAngle) * labelOffset, y: sideB_mid.y - Math.sin(sideB_perpAngle) * labelOffset };

  // Side C - Hypotenuse (opposite vertex C, connects A to B)
  const sideC_mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
  const sideC_angle = Math.atan2(B.y - A.y, B.x - A.x);
  const sideC_perpAngle = sideC_angle + Math.PI / 2;

  const testXC = sideC_mid.x + Math.cos(sideC_perpAngle) * labelOffset;
  const testYC = sideC_mid.y + Math.sin(sideC_perpAngle) * labelOffset;
  const distToC1 = Math.sqrt((testXC - C.x) ** 2 + (testYC - C.y) ** 2);
  const distToC2 = Math.sqrt((sideC_mid.x - Math.cos(sideC_perpAngle) * labelOffset - C.x) ** 2 +
                             (sideC_mid.y - Math.sin(sideC_perpAngle) * labelOffset - C.y) ** 2);
  const sideC_label = distToC1 > distToC2 ?
    { x: testXC, y: testYC } :
    { x: sideC_mid.x - Math.cos(sideC_perpAngle) * labelOffset, y: sideC_mid.y - Math.sin(sideC_perpAngle) * labelOffset };

  return (
    <Stage width={canvasWidth || 500} height={canvasHeight || 320}>
      <Layer>
        {/* Triangle sides */}
        <Line points={[B.x, B.y, C.x, C.y]} stroke="#666" strokeWidth={3} />
        <Line points={[A.x, A.y, C.x, C.y]} stroke="#666" strokeWidth={3} />
        <Line points={[A.x, A.y, B.x, B.y]} stroke="#DC2626" strokeWidth={4} />

        {/* Right angle indicator at vertex C */}
        <RightAngleIndicator vertex={C} point1={A} point2={B} size={15} />

        {/* Side labels - all text horizontal (no rotation) */}
        <Text
          x={sideA_label.x}
          y={sideA_label.y}
          text={`${sideA}`}
          fontSize={20}
          fontStyle="bold"
          fill="#333"
          offsetX={10}
          offsetY={10}
        />
        <Text
          x={sideB_label.x}
          y={sideB_label.y}
          text={`${sideB}`}
          fontSize={20}
          fontStyle="bold"
          fill="#333"
          offsetX={10}
          offsetY={10}
        />
        <Text
          x={sideC_label.x}
          y={sideC_label.y}
          text={`${sideC}`}
          fontSize={20}
          fontStyle="bold"
          fill="#DC2626"
          offsetX={10}
          offsetY={10}
        />
      </Layer>
    </Stage>
  );
}

// Legacy fallback for backward compatibility
function IdentificationTriangleLegacy({ visualData }) {
  const { width: viewportWidth } = useWindowDimensions();
  const { sideA, sideB, sideC } = visualData.triangle;

  const canvasWidth = Math.min(viewportWidth - 40, 600);
  const canvasHeight = 280;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const maxSide = Math.max(sideA, sideB);
  const scale = Math.min(70, (canvasWidth - 150) / (maxSide * 2));
  const scaledAdj = Math.max(sideB * scale, 80);
  const scaledOpp = Math.max(sideA * scale, 80);

  const bottomLeft = { x: centerX - scaledAdj / 2, y: centerY + scaledOpp / 2 };
  const bottomRight = { x: centerX + scaledAdj / 2, y: centerY + scaledOpp / 2 };
  const topRight = { x: centerX + scaledAdj / 2, y: centerY - scaledOpp / 2 };

  const hypLabel = calcRotatedLabel(bottomLeft, topRight, bottomRight, 25);

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        <Line points={[bottomLeft.x, bottomLeft.y, bottomRight.x, bottomRight.y]} stroke="#666" strokeWidth={3} />
        <Line points={[bottomRight.x, bottomRight.y, topRight.x, topRight.y]} stroke="#666" strokeWidth={3} />
        <Line points={[bottomLeft.x, bottomLeft.y, topRight.x, topRight.y]} stroke="#DC2626" strokeWidth={4} />
        <Rect x={bottomRight.x - 12} y={bottomRight.y - 12} width={12} height={12} stroke="#666" strokeWidth={2} />
        <Text x={topRight.x + 15} y={(bottomRight.y + topRight.y) / 2 - 10} text={`${sideA}`} fontSize={20} fontStyle="bold" fill="#333" />
        <Text x={(bottomLeft.x + bottomRight.x) / 2 - 20} y={bottomLeft.y + 15} text={`${sideB}`} fontSize={20} fontStyle="bold" fill="#333" />
        <Text x={hypLabel.x} y={hypLabel.y} text={`${sideC}`} fontSize={20} fontStyle="bold" fill="#DC2626" rotation={hypLabel.rotation} offsetX={20} offsetY={8} />
      </Layer>
    </Stage>
  );
}

// ============================================================================
// Levels 2-4: Basic Triangle
// ============================================================================

function BasicTriangle({ visualData }) {
  if (!visualData || !visualData.triangle) return null;

  const { sideA, sideB, sideC, hiddenSide } = visualData.triangle;
  const { vertices, canvasWidth, canvasHeight } = visualData;

  // If no oriented vertices, fall back to old fixed position
  if (!vertices) {
    return <BasicTriangleLegacy visualData={visualData} />;
  }

  const { A, B, C } = vertices;
  const labelOffset = 25;

  // Calculate label positions for each side (same logic as IdentificationTriangle)
  // Side A (opposite vertex A, connects B to C)
  const sideA_mid = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
  const sideA_angle = Math.atan2(C.y - B.y, C.x - B.x);
  const sideA_perpAngle = sideA_angle + Math.PI / 2;

  const testX = sideA_mid.x + Math.cos(sideA_perpAngle) * labelOffset;
  const testY = sideA_mid.y + Math.sin(sideA_perpAngle) * labelOffset;
  const distToA1 = Math.sqrt((testX - A.x) ** 2 + (testY - A.y) ** 2);
  const distToA2 = Math.sqrt((sideA_mid.x - Math.cos(sideA_perpAngle) * labelOffset - A.x) ** 2 +
                             (sideA_mid.y - Math.sin(sideA_perpAngle) * labelOffset - A.y) ** 2);
  const sideA_label = distToA1 > distToA2 ?
    { x: testX, y: testY } :
    { x: sideA_mid.x - Math.cos(sideA_perpAngle) * labelOffset, y: sideA_mid.y - Math.sin(sideA_perpAngle) * labelOffset };

  // Side B (opposite vertex B, connects A to C)
  const sideB_mid = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const sideB_angle = Math.atan2(C.y - A.y, C.x - A.x);
  const sideB_perpAngle = sideB_angle + Math.PI / 2;

  const testXB = sideB_mid.x + Math.cos(sideB_perpAngle) * labelOffset;
  const testYB = sideB_mid.y + Math.sin(sideB_perpAngle) * labelOffset;
  const distToB1 = Math.sqrt((testXB - B.x) ** 2 + (testYB - B.y) ** 2);
  const distToB2 = Math.sqrt((sideB_mid.x - Math.cos(sideB_perpAngle) * labelOffset - B.x) ** 2 +
                             (sideB_mid.y - Math.sin(sideB_perpAngle) * labelOffset - B.y) ** 2);
  const sideB_label = distToB1 > distToB2 ?
    { x: testXB, y: testYB } :
    { x: sideB_mid.x - Math.cos(sideB_perpAngle) * labelOffset, y: sideB_mid.y - Math.sin(sideB_perpAngle) * labelOffset };

  // Side C - Hypotenuse (opposite vertex C, connects A to B)
  const sideC_mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
  const sideC_angle = Math.atan2(B.y - A.y, B.x - A.x);
  const sideC_perpAngle = sideC_angle + Math.PI / 2;

  const testXC = sideC_mid.x + Math.cos(sideC_perpAngle) * labelOffset;
  const testYC = sideC_mid.y + Math.sin(sideC_perpAngle) * labelOffset;
  const distToC1 = Math.sqrt((testXC - C.x) ** 2 + (testYC - C.y) ** 2);
  const distToC2 = Math.sqrt((sideC_mid.x - Math.cos(sideC_perpAngle) * labelOffset - C.x) ** 2 +
                             (sideC_mid.y - Math.sin(sideC_perpAngle) * labelOffset - C.y) ** 2);
  const sideC_label = distToC1 > distToC2 ?
    { x: testXC, y: testYC } :
    { x: sideC_mid.x - Math.cos(sideC_perpAngle) * labelOffset, y: sideC_mid.y - Math.sin(sideC_perpAngle) * labelOffset };

  return (
    <Stage width={canvasWidth || 500} height={canvasHeight || 320}>
      <Layer>
        {/* Triangle sides */}
        <Line points={[B.x, B.y, C.x, C.y]} stroke="#3B82F6" strokeWidth={3} />
        <Line points={[A.x, A.y, C.x, C.y]} stroke="#3B82F6" strokeWidth={3} />
        <Line points={[A.x, A.y, B.x, B.y]} stroke="#8B5CF6" strokeWidth={3} />

        {/* Right angle indicator at vertex C */}
        <RightAngleIndicator vertex={C} point1={A} point2={B} size={15} />

        {/* Side labels - show value or "?" based on hiddenSide - all text horizontal (no rotation) */}
        <Text
          x={sideA_label.x}
          y={sideA_label.y}
          text={hiddenSide === "a" ? "?" : `${sideA}`}
          fontSize={20}
          fontStyle="bold"
          fill={hiddenSide === "a" ? "#DC2626" : "#333"}
          offsetX={10}
          offsetY={10}
        />
        <Text
          x={sideB_label.x}
          y={sideB_label.y}
          text={hiddenSide === "b" ? "?" : `${sideB}`}
          fontSize={20}
          fontStyle="bold"
          fill={hiddenSide === "b" ? "#DC2626" : "#333"}
          offsetX={10}
          offsetY={10}
        />
        <Text
          x={sideC_label.x}
          y={sideC_label.y}
          text={hiddenSide === "c" ? "?" : `${sideC}`}
          fontSize={20}
          fontStyle="bold"
          fill={hiddenSide === "c" ? "#DC2626" : "#8B5CF6"}
          offsetX={10}
          offsetY={10}
        />
      </Layer>
    </Stage>
  );
}

// Legacy fallback for backward compatibility
function BasicTriangleLegacy({ visualData }) {
  const { width: viewportWidth } = useWindowDimensions();
  const { sideA, sideB, sideC, hiddenSide } = visualData.triangle;

  const canvasWidth = Math.min(viewportWidth - 40, 600);
  const canvasHeight = 280;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const maxSide = Math.max(sideA || 5, sideB || 5);
  const scale = Math.min(70, (canvasWidth - 150) / (maxSide * 2));
  const scaledAdj = Math.max((sideB || 5) * scale, 80);
  const scaledOpp = Math.max((sideA || 5) * scale, 80);

  const bottomLeft = { x: centerX - scaledAdj / 2, y: centerY + scaledOpp / 2 };
  const bottomRight = { x: centerX + scaledAdj / 2, y: centerY + scaledOpp / 2 };
  const topRight = { x: centerX + scaledAdj / 2, y: centerY - scaledOpp / 2 };

  const hypLabel = calcRotatedLabel(bottomLeft, topRight, bottomRight, 25);

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        <Line points={[bottomLeft.x, bottomLeft.y, bottomRight.x, bottomRight.y]} stroke="#3B82F6" strokeWidth={3} />
        <Line points={[bottomRight.x, bottomRight.y, topRight.x, topRight.y]} stroke="#3B82F6" strokeWidth={3} />
        <Line points={[bottomLeft.x, bottomLeft.y, topRight.x, topRight.y]} stroke="#8B5CF6" strokeWidth={3} />
        <Rect x={bottomRight.x - 12} y={bottomRight.y - 12} width={12} height={12} stroke="#666" strokeWidth={2} />
        <Text x={topRight.x + 15} y={(bottomRight.y + topRight.y) / 2 - 10} text={hiddenSide === "a" ? "?" : `${sideA}`} fontSize={20} fontStyle="bold" fill={hiddenSide === "a" ? "#DC2626" : "#333"} />
        <Text x={(bottomLeft.x + bottomRight.x) / 2 - 20} y={bottomLeft.y + 15} text={hiddenSide === "b" ? "?" : `${sideB}`} fontSize={20} fontStyle="bold" fill={hiddenSide === "b" ? "#DC2626" : "#333"} />
        <Text x={hypLabel.x} y={hypLabel.y} text={hiddenSide === "c" ? "?" : `${sideC}`} fontSize={20} fontStyle="bold" fill={hiddenSide === "c" ? "#DC2626" : "#8B5CF6"} rotation={hypLabel.rotation} offsetX={10} offsetY={8} />
      </Layer>
    </Stage>
  );
}

// ============================================================================
// Level 5: Word Problem Diagrams
// ============================================================================

function WordProblemDiagram({ visualData }) {
  const { width: viewportWidth } = useWindowDimensions();
  if (!visualData || !visualData.wordProblemContext) return null;

  const { wordProblemContext, measurements } = visualData;

  const canvasWidth = Math.min(viewportWidth - 40, 600);
  const props = { width: canvasWidth, height: 300, measurements, visualData };

  switch (wordProblemContext) {
    case 'ladder':
      return <LadderDiagram {...props} />;
    case 'rectangle':
      return <RectangleDiagram {...props} />;
    case 'distance':
      return <DistanceDiagram {...props} />;
    default:
      return null;
  }
}

function LadderDiagram({ width, height, measurements, visualData }) {
  const { ladderLength, wallHeight, groundDistance, hiddenValue } = measurements;
  const centerX = width / 2;
  const centerY = height / 2;

  const maxDim = Math.max(wallHeight, groundDistance);
  const scale = Math.min(width - 100, height - 100) / maxDim;
  const scaledH = Math.max(wallHeight * scale, 80);
  const scaledG = Math.max(groundDistance * scale, 80);

  const groundY = centerY + scaledH / 2;
  const wallX = centerX + scaledG / 2;
  const ladderBottomX = centerX - scaledG / 2;
  const wallTopY = centerY - scaledH / 2;

  const ladderBottom = { x: ladderBottomX, y: groundY };
  const wallTop = { x: wallX, y: wallTopY };
  const wallBase = { x: wallX, y: groundY };

  const ladderLabel = calcRotatedLabel(ladderBottom, wallTop, wallBase, 22);

  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* Ground */}
        <Line points={[30, groundY, width - 30, groundY]} stroke="#64748B" strokeWidth={3} />

        {/* Wall */}
        <Line points={[wallX, wallTopY - 20, wallX, groundY]} stroke="#8B4513" strokeWidth={6} />

        {/* Ladder */}
        <Line points={[ladderBottomX, groundY, wallX, wallTopY]} stroke="#FF8C00" strokeWidth={5} />

        {/* Right angle indicator */}
        <Rect x={wallX - 12} y={groundY - 12} width={12} height={12} stroke="#666" strokeWidth={2} />

        {/* Labels */}
        <Text
          x={wallX + 12}
          y={(wallTopY + groundY) / 2 - 10}
          text={hiddenValue === "wallHeight" ? "? ft" : `${wallHeight} ft`}
          fontSize={16}
          fill={hiddenValue === "wallHeight" ? "#DC2626" : "#333"}
          fontStyle="bold"
        />
        <Text
          x={(ladderBottomX + wallX) / 2 - 40}
          y={groundY + 20}
          text={hiddenValue === "groundDistance" ? "? ft" : `${groundDistance} ft`}
          fontSize={16}
          fill={hiddenValue === "groundDistance" ? "#DC2626" : "#333"}
          fontStyle="bold"
        />
        <Text
          x={ladderLabel.x}
          y={ladderLabel.y}
          text={hiddenValue === "ladderLength" ? "? ft" : `${ladderLength} ft ladder`}
          fontSize={16}
          fill={hiddenValue === "ladderLength" ? "#DC2626" : "#FF8C00"}
          fontStyle="bold"
          rotation={ladderLabel.rotation}
          offsetX={60}
          offsetY={8}
        />
      </Layer>
    </Stage>
  );
}

function RectangleDiagram({ width, height, measurements, visualData }) {
  const { length, width: rectWidth, diagonal, hiddenValue } = measurements;
  const centerX = width / 2;
  const centerY = height / 2;

  const maxDim = Math.max(length, rectWidth);
  const scale = Math.min(width - 120, height - 120) / maxDim;
  const scaledL = Math.max(length * scale, 100);
  const scaledW = Math.max(rectWidth * scale, 80);

  const rectX = centerX - scaledL / 2;
  const rectY = centerY - scaledW / 2;

  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* Rectangle */}
        <Rect
          x={rectX}
          y={rectY}
          width={scaledL}
          height={scaledW}
          stroke="#3B82F6"
          strokeWidth={3}
        />

        {/* Diagonal */}
        <Line
          points={[rectX, rectY + scaledW, rectX + scaledL, rectY]}
          stroke="#8B5CF6"
          strokeWidth={3}
          dash={[5, 5]}
        />

        {/* Right angle indicator */}
        <Rect x={rectX + scaledL - 12} y={rectY + scaledW - 12} width={12} height={12} stroke="#666" strokeWidth={2} />

        {/* Labels */}
        <Text
          x={rectX + scaledL / 2 - 35}
          y={rectY + scaledW + 15}
          text={hiddenValue === "length" ? "? in" : `${length} in`}
          fontSize={16}
          fill={hiddenValue === "length" ? "#DC2626" : "#333"}
          fontStyle="bold"
        />
        <Text
          x={rectX - 55}
          y={rectY + scaledW / 2 - 8}
          text={hiddenValue === "width" ? "? in" : `${rectWidth} in`}
          fontSize={16}
          fill={hiddenValue === "width" ? "#DC2626" : "#333"}
          fontStyle="bold"
        />
        <Text
          x={rectX + scaledL / 2 + 10}
          y={rectY + scaledW / 2 - 30}
          text={hiddenValue === "diagonal" ? "? in" : `${diagonal} in`}
          fontSize={16}
          fill={hiddenValue === "diagonal" ? "#DC2626" : "#8B5CF6"}
          fontStyle="bold"
        />
      </Layer>
    </Stage>
  );
}

function DistanceDiagram({ width, height, measurements, visualData }) {
  const { eastDistance, northDistance, totalDistance, hiddenValue } = measurements;
  const centerX = width / 2;
  const centerY = height / 2;

  const maxDim = Math.max(eastDistance, northDistance);
  const scale = Math.min(width - 120, height - 120) / maxDim;
  const scaledE = Math.max(eastDistance * scale, 80);
  const scaledN = Math.max(northDistance * scale, 80);

  const startX = centerX - scaledE / 2;
  const startY = centerY + scaledN / 2;
  const endX = centerX + scaledE / 2;
  const endY = centerY - scaledN / 2;

  const start = { x: startX, y: startY };
  const endHoriz = { x: endX, y: startY };
  const end = { x: endX, y: endY };

  const distLabel = calcRotatedLabel(start, end, endHoriz, 22);

  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* Starting point */}
        <Circle x={startX} y={startY} radius={6} fill="#10B981" stroke="#fff" strokeWidth={2} />
        <Text x={startX - 40} y={startY + 15} text="Start" fontSize={14} fill="#10B981" fontStyle="bold" />

        {/* Ending point */}
        <Circle x={endX} y={endY} radius={6} fill="#DC2626" stroke="#fff" strokeWidth={2} />
        <Text x={endX + 10} y={endY - 20} text="End" fontSize={14} fill="#DC2626" fontStyle="bold" />

        {/* East path */}
        <Line points={[startX, startY, endX, startY]} stroke="#3B82F6" strokeWidth={3} dash={[5, 5]} />

        {/* North path */}
        <Line points={[endX, startY, endX, endY]} stroke="#F59E0B" strokeWidth={3} dash={[5, 5]} />

        {/* Total distance */}
        <Line points={[startX, startY, endX, endY]} stroke="#8B5CF6" strokeWidth={3} />

        {/* Right angle indicator */}
        <Rect x={endX - 12} y={startY - 12} width={12} height={12} stroke="#666" strokeWidth={2} />

        {/* Labels */}
        <Text
          x={(startX + endX) / 2 - 30}
          y={startY + 20}
          text={hiddenValue === "eastDistance" ? "? m East" : `${eastDistance} m East`}
          fontSize={14}
          fill={hiddenValue === "eastDistance" ? "#DC2626" : "#3B82F6"}
          fontStyle="bold"
        />
        <Text
          x={endX + 12}
          y={(startY + endY) / 2 - 8}
          text={hiddenValue === "northDistance" ? "? m North" : `${northDistance} m North`}
          fontSize={14}
          fill={hiddenValue === "northDistance" ? "#DC2626" : "#F59E0B"}
          fontStyle="bold"
        />
        <Text
          x={distLabel.x}
          y={distLabel.y}
          text={hiddenValue === "totalDistance" ? "? m" : `${totalDistance} m`}
          fontSize={14}
          fill={hiddenValue === "totalDistance" ? "#DC2626" : "#8B5CF6"}
          fontStyle="bold"
          rotation={distLabel.rotation}
          offsetX={25}
          offsetY={8}
        />
      </Layer>
    </Stage>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Right angle indicator (small square) that works for any triangle orientation
 * Uses unit vectors to create a square at the right angle vertex
 */
function RightAngleIndicator({ vertex, point1, point2, size = 15 }) {
  // Calculate unit vectors along each side from the vertex
  const dx1 = point1.x - vertex.x;
  const dy1 = point1.y - vertex.y;
  const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const ux1 = (dx1 / len1) * size;
  const uy1 = (dy1 / len1) * size;

  const dx2 = point2.x - vertex.x;
  const dy2 = point2.y - vertex.y;
  const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
  const ux2 = (dx2 / len2) * size;
  const uy2 = (dy2 / len2) * size;

  // Four corners of the square
  const corner1 = { x: vertex.x, y: vertex.y };
  const corner2 = { x: vertex.x + ux1, y: vertex.y + uy1 };
  const corner3 = { x: vertex.x + ux1 + ux2, y: vertex.y + uy1 + uy2 };
  const corner4 = { x: vertex.x + ux2, y: vertex.y + uy2 };

  return (
    <Line
      points={[
        corner1.x, corner1.y,
        corner2.x, corner2.y,
        corner3.x, corner3.y,
        corner4.x, corner4.y,
        corner1.x, corner1.y,
      ]}
      stroke="#666"
      strokeWidth={2}
      closed={false}
    />
  );
}

function calcRotatedLabel(start, end, thirdVertex, offset) {
  const rotation = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const perpX = -dy / len;
  const perpY = dx / len;
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const testDist = Math.sqrt((midX + perpX * 10 - thirdVertex.x) ** 2 + (midY + perpY * 10 - thirdVertex.y) ** 2);
  const midDist = Math.sqrt((midX - thirdVertex.x) ** 2 + (midY - thirdVertex.y) ** 2);
  const flip = testDist < midDist ? -1 : 1;
  return { x: midX + flip * perpX * offset, y: midY + flip * perpY * offset, rotation };
}

// ============================================================================
// Styled Components
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

export default PythagoreanTheorem;
