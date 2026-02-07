import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Line, Arc, Text, Rect } from 'react-konva';
import { useLessonState } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

/**
 * MoreTangentLesson - Advanced tangent lesson with rotated/flipped triangles
 *
 * Levels:
 * 1. Identify opposite/adjacent sides in rotated triangles (colored hints)
 * 2. Calculate tangent in rotated triangles (no color hints, labeled)
 * 3. Find missing side given angle and one side
 * 4. Find missing side (more challenging orientations)
 * 5. Find angle given two sides (inverse tangent)
 *
 * Visual: Triangles rotated/flipped in different orientations
 * - Level 1 shows colored sides as hints
 * - Levels 2+ require student to identify without color hints
 */
function MoreTangentLesson({ triggerNewProblem }) {
  // Use shared lesson state hook
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  // Keep local UI state for hint
  const [showHint, setShowHint] = useState(false);

  // Get current problem from questionAnswerArray if available
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;

  const {
    levelNum = lessonProps.levelNum,
    question = currentProblem.question,
    answer = currentProblem.answer,
    acceptedAnswers = currentProblem.acceptedAnswers,
    visualData = currentProblem.visualData,
    hint = currentProblem.hint,
    explanation = currentProblem.explanation,
    calculation = currentProblem.calculation
  } = currentProblem;

  // All levels use visual triangles in this lesson
  const isVisualLevel = levelNum <= 5;

  // Prepare answer format for AnswerInput component
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers && Array.isArray(acceptedAnswers) && acceptedAnswers.length > 0) {
      return acceptedAnswers;
    }
    if (Array.isArray(answer)) {
      return answer;
    }
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  const handleTryAnother = () => {
    setShowHint(false);
    triggerNewProblem();
    hideAnswer();
  };

  return (
    <Wrapper>
      {/* Hint button positioned at top right, inline with header */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      <QuestionSection>
        <QuestionText>{question?.[0]?.text || question}</QuestionText>
      </QuestionSection>

      {isVisualLevel && visualData && (
        <VisualSection>
          <RotatedTriangle
            visualData={visualData}
            width={500}
            height={300}
            levelNum={levelNum}
          />
        </VisualSection>
      )}

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

        {showAnswer && (
          <ExplanationSection>
            {calculation && (
              <CalculationBox>
                <CalculationStep><strong>Formula:</strong> {calculation.formula}</CalculationStep>
                <CalculationStep><strong>Substitution:</strong> {calculation.substitution}</CalculationStep>
                <CalculationStep><strong>Result:</strong> {calculation.result}</CalculationStep>
              </CalculationBox>
            )}

            {explanation && (
              <ExplanationText>{explanation}</ExplanationText>
            )}
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

/**
 * RotatedTriangle - Renders right triangles in various orientations
 * Supports 8 different orientations for more challenging identification
 */
function RotatedTriangle({ visualData, width = 500, height = 300, levelNum = 1 }) {
  if (!visualData) return null;

  const { angle, sides, rightAngle, orientation = 'bottom-left' } = visualData;
  const padding = 60;

  // Get side lengths with defaults
  const adjacentLength = sides?.adjacent?.length || 10;
  const oppositeLength = sides?.opposite?.length || 8;

  // NORMALIZE TRIANGLE DIMENSIONS FOR VISUAL APPEAL
  // Triangles are NOT drawn to scale - they're drawn to look good
  // Avoid skinny triangles by ensuring reasonable proportions

  const MIN_SIDE = 100;  // Minimum display size for any side
  const MAX_SIDE = 180;  // Maximum display size for any side
  const MIN_RATIO = 0.5; // Minimum ratio between sides (prevents too skinny)

  // Calculate the ratio between sides
  const ratio = Math.min(adjacentLength, oppositeLength) / Math.max(adjacentLength, oppositeLength);

  // If ratio is too small (triangle would be skinny), adjust to minimum ratio
  let displayAdjacent, displayOpposite;

  if (ratio < MIN_RATIO) {
    // Triangle is too skinny - normalize it
    if (adjacentLength > oppositeLength) {
      // Adjacent is longer - scale opposite up
      displayAdjacent = MAX_SIDE;
      displayOpposite = Math.max(displayAdjacent * MIN_RATIO, MIN_SIDE);
    } else {
      // Opposite is longer - scale adjacent up
      displayOpposite = MAX_SIDE;
      displayAdjacent = Math.max(displayOpposite * MIN_RATIO, MIN_SIDE);
    }
  } else {
    // Triangle has good proportions - just scale to fit nicely
    const maxActual = Math.max(adjacentLength, oppositeLength);
    const scaleFactor = MAX_SIDE / maxActual;
    displayAdjacent = adjacentLength * scaleFactor;
    displayOpposite = oppositeLength * scaleFactor;

    // Ensure both sides are at least MIN_SIDE
    if (displayAdjacent < MIN_SIDE) {
      const adjust = MIN_SIDE / displayAdjacent;
      displayAdjacent *= adjust;
      displayOpposite *= adjust;
    }
    if (displayOpposite < MIN_SIDE) {
      const adjust = MIN_SIDE / displayOpposite;
      displayAdjacent *= adjust;
      displayOpposite *= adjust;
    }
  }

  // Round to avoid sub-pixel rendering issues
  const adjScaled = Math.round(displayAdjacent);
  const oppScaled = Math.round(displayOpposite);

  // Calculate triangle coordinates based on orientation
  // Orientations: bottom-left, bottom-right, top-left, top-right,
  //               left-bottom, left-top, right-bottom, right-top
  let x1, y1, x2, y2, x3, y3;

  // Vertices: x1,y1 = acute angle | x2,y2 = right angle | x3,y3 = opposite corner
  switch (orientation) {
    case 'bottom-left':
      // Acute angle at bottom-left
      x1 = padding;
      y1 = height - padding;
      x2 = x1 + adjScaled;  // Right angle to the right
      y2 = y1;
      x3 = x2;              // Opposite corner above right angle
      y3 = y1 - oppScaled;
      break;

    case 'bottom-right':
      // Acute angle at bottom-right
      x1 = width - padding;
      y1 = height - padding;
      x2 = x1 - adjScaled;  // Right angle to the left
      y2 = y1;
      x3 = x2;              // Opposite corner above right angle
      y3 = y1 - oppScaled;
      break;

    case 'top-left':
      // Acute angle at top-left
      x1 = padding;
      y1 = padding;
      x2 = x1 + adjScaled;  // Right angle to the right
      y2 = y1;
      x3 = x2;              // Opposite corner below right angle
      y3 = y1 + oppScaled;
      break;

    case 'top-right':
      // Acute angle at top-right
      x1 = width - padding;
      y1 = padding;
      x2 = x1 - adjScaled;  // Right angle to the left
      y2 = y1;
      x3 = x2;              // Opposite corner below right angle
      y3 = y1 + oppScaled;
      break;

    case 'left-bottom':
      // Acute angle at left-bottom
      x1 = padding;
      y1 = height - padding;
      x2 = x1;              // Right angle directly above
      y2 = y1 - adjScaled;
      x3 = x1 + oppScaled;  // Opposite corner to the right
      y3 = y2;
      break;

    case 'left-top':
      // Acute angle at left-top
      x1 = padding;
      y1 = padding;
      x2 = x1;              // Right angle directly below
      y2 = y1 + adjScaled;
      x3 = x1 + oppScaled;  // Opposite corner to the right
      y3 = y2;
      break;

    case 'right-bottom':
      // Acute angle at right-bottom
      x1 = width - padding;
      y1 = height - padding;
      x2 = x1;              // Right angle directly above
      y2 = y1 - adjScaled;
      x3 = x1 - oppScaled;  // Opposite corner to the left
      y3 = y2;
      break;

    case 'right-top':
      // Acute angle at right-top
      x1 = width - padding;
      y1 = padding;
      x2 = x1;              // Right angle directly below
      y2 = y1 + adjScaled;
      x3 = x1 - oppScaled;  // Opposite corner to the left
      y3 = y2;
      break;

    default:
      // Default to bottom-left
      x1 = padding;
      y1 = height - padding;
      x2 = x1 + adjScaled;
      y2 = y1;
      x3 = x2;
      y3 = y1 - oppScaled;
  }

  // Level 1 shows colored sides, later levels use neutral gray
  const showColors = levelNum === 1;
  const oppositeColor = showColors && sides?.opposite?.color ? sides.opposite.color : '#666';
  const adjacentColor = showColors && sides?.adjacent?.color ? sides.adjacent.color : '#666';
  const hypotenuseColor = sides?.hypotenuse?.color || '#9CA3AF';

  // Calculate dynamic arc radius
  const minSide = Math.min(adjScaled, oppScaled);
  const arcRadius = Math.min(minSide * 0.4, 50, adjScaled * 0.6);

  const angleValue = angle?.value || 0;

  // DYNAMIC CALCULATION: Arc rotation for ANY orientation
  // The arc should sweep from the adjacent side to the hypotenuse, staying INSIDE the triangle

  // Calculate the angle of the adjacent side (from acute angle to right angle vertex)
  const adjacentAngle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  // Calculate the angle of the hypotenuse (from acute angle to third vertex)
  const hypotenuseAngle = Math.atan2(y3 - y1, x3 - x1) * (180 / Math.PI);

  // Calculate the angular difference (direction from adjacent to hypotenuse)
  let angleDiff = hypotenuseAngle - adjacentAngle;

  // Normalize to [-180, 180] range to get the shortest angular path
  if (angleDiff > 180) angleDiff -= 360;
  if (angleDiff < -180) angleDiff += 360;

  // Determine arc rotation and sweep direction
  // If angleDiff is positive, sweep counterclockwise from adjacent
  // If angleDiff is negative, sweep counterclockwise from hypotenuse (which goes toward adjacent)
  let arcRotation, arcAngle;
  if (angleDiff > 0) {
    // Sweep counterclockwise from adjacent toward hypotenuse
    arcRotation = adjacentAngle;
    arcAngle = angleDiff;
  } else {
    // Sweep counterclockwise from hypotenuse toward adjacent (angleDiff is negative)
    arcRotation = hypotenuseAngle;
    arcAngle = -angleDiff;
  }

  // Note: hypotenuseAngle already calculated above in arc rotation logic

  // Right angle position is always at x2, y2
  const rightAngleX = x2;
  const rightAngleY = y2;

  // Dynamic right angle indicator size
  const rightAngleSize = angleValue > 75 ? 12 : angleValue > 60 ? 15 : 20;

  // DYNAMIC CALCULATION: Right angle square position
  // The square should be positioned INSIDE the triangle at the right angle corner
  // Calculate unit vectors along the two sides forming the right angle

  // Vector from right angle vertex toward acute angle vertex
  const toAcuteX = x1 - x2;
  const toAcuteY = y1 - y2;
  const toAcuteLen = Math.sqrt(toAcuteX * toAcuteX + toAcuteY * toAcuteY);
  const toAcuteUnitX = toAcuteX / toAcuteLen;
  const toAcuteUnitY = toAcuteY / toAcuteLen;

  // Vector from right angle vertex toward third vertex
  const toThirdX = x3 - x2;
  const toThirdY = y3 - y2;
  const toThirdLen = Math.sqrt(toThirdX * toThirdX + toThirdY * toThirdY);
  const toThirdUnitX = toThirdX / toThirdLen;
  const toThirdUnitY = toThirdY / toThirdLen;

  // Position the square by moving from the right angle vertex along both sides
  // This ensures the square is INSIDE the triangle
  const rightAngleOffsetX = toAcuteUnitX * rightAngleSize + toThirdUnitX * rightAngleSize;
  const rightAngleOffsetY = toAcuteUnitY * rightAngleSize + toThirdUnitY * rightAngleSize;

  // ANGLE LABEL COLLISION DETECTION
  // Calculate where the angle text would be positioned inside the arc
  // The arc midpoint is at arcRotation + arcAngle/2
  const arcMidAngleRad = (arcRotation + arcAngle / 2) * (Math.PI / 180);
  const angleTextX = x1 + arcRadius * 0.65 * Math.cos(arcMidAngleRad);
  const angleTextY = y1 + arcRadius * 0.65 * Math.sin(arcMidAngleRad);

  // Check for overlaps with right angle square
  const distanceToRightAngle = Math.sqrt(Math.pow(angleTextX - x2, 2) + Math.pow(angleTextY - y2, 2));
  const hasRightAngleOverlap = distanceToRightAngle < 45;

  // Check if arc is too small for text
  const arcTooSmall = arcAngle < 30;
  const arcTooLarge = arcAngle > 75;

  // Check distance to triangle sides - text should be at least 25px from any side
  // For dynamic orientations, calculate perpendicular distance to each side
  const distToAdjacentLine = Math.abs((y2 - y1) * angleTextX - (x2 - x1) * angleTextY + x2 * y1 - y2 * x1) /
                              Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
  const distToOppositeLine = Math.abs((y3 - y2) * angleTextX - (x3 - x2) * angleTextY + x3 * y2 - y3 * x2) /
                              Math.sqrt((y3 - y2) ** 2 + (x3 - x2) ** 2);
  const tooCloseToSides = distToAdjacentLine < 25 || distToOppositeLine < 25;

  // Determine if external label is needed
  const hasOverlap = hasRightAngleOverlap || arcTooSmall || arcTooLarge || tooCloseToSides;
  const needsExternalLabel = hasOverlap;

  // Position external label away from triangle - choose position based on acute angle position
  // Place it offset from the acute angle vertex
  let externalLabelX, externalLabelY;
  if (x1 < width / 2) {
    // Acute angle on left side - place label to the left
    externalLabelX = x1 - 80;
  } else {
    // Acute angle on right side - place label to the right
    externalLabelX = x1 + 20;
  }

  if (y1 < height / 2) {
    // Acute angle on top - place label above
    externalLabelY = y1 - 40;
  } else {
    // Acute angle on bottom - place label below or to side
    externalLabelY = y1 + 20;
  }

  // Ensure external label stays within bounds
  externalLabelX = Math.max(10, Math.min(externalLabelX, width - 80));
  externalLabelY = Math.max(10, Math.min(externalLabelY, height - 30));

  // Only show text inside if there's no overlap
  const showTextInside = !hasOverlap;

  // DYNAMIC SIDE LABEL POSITIONING
  // Calculate perpendicular offsets for each side to position labels correctly for any orientation

  // For opposite side (x2,y2 to x3,y3)
  const oppositeDx = x3 - x2;
  const oppositeDy = y3 - y2;
  const oppositeLen = Math.sqrt(oppositeDx * oppositeDx + oppositeDy * oppositeDy);
  // Perpendicular vector (rotate 90 degrees counterclockwise)
  const oppositePerpX = -oppositeDy / oppositeLen;
  const oppositePerpY = oppositeDx / oppositeLen;
  // Check if perpendicular points away from acute angle (outside triangle)
  const oppositeTestX = (x2 + x3) / 2 + oppositePerpX * 10;
  const oppositeTestY = (y2 + y3) / 2 + oppositePerpY * 10;
  const oppositeDistToAcute = Math.sqrt((oppositeTestX - x1) ** 2 + (oppositeTestY - y1) ** 2);
  const oppositeDistMidToAcute = Math.sqrt(((x2 + x3) / 2 - x1) ** 2 + ((y2 + y3) / 2 - y1) ** 2);
  // If test point is closer to acute angle, flip the perpendicular
  const oppositeFlip = oppositeDistToAcute < oppositeDistMidToAcute ? -1 : 1;
  const oppositeLabelOffset = 20;
  const oppositeLabelX = (x2 + x3) / 2 + oppositeFlip * oppositePerpX * oppositeLabelOffset;
  const oppositeLabelY = (y2 + y3) / 2 + oppositeFlip * oppositePerpY * oppositeLabelOffset;

  // For adjacent side (x1,y1 to x2,y2)
  const adjacentDx = x2 - x1;
  const adjacentDy = y2 - y1;
  const adjacentLen = Math.sqrt(adjacentDx * adjacentDx + adjacentDy * adjacentDy);
  // Perpendicular vector (rotate 90 degrees counterclockwise)
  const adjacentPerpX = -adjacentDy / adjacentLen;
  const adjacentPerpY = adjacentDx / adjacentLen;
  // Check if perpendicular points away from third vertex (outside triangle)
  const adjacentTestX = (x1 + x2) / 2 + adjacentPerpX * 10;
  const adjacentTestY = (y1 + y2) / 2 + adjacentPerpY * 10;
  const adjacentDistToThird = Math.sqrt((adjacentTestX - x3) ** 2 + (adjacentTestY - y3) ** 2);
  const adjacentDistMidToThird = Math.sqrt(((x1 + x2) / 2 - x3) ** 2 + ((y1 + y2) / 2 - y3) ** 2);
  // If test point is closer to third vertex, flip the perpendicular
  const adjacentFlip = adjacentDistToThird < adjacentDistMidToThird ? -1 : 1;
  const adjacentLabelOffset = 20;
  const adjacentLabelX = (x1 + x2) / 2 + adjacentFlip * adjacentPerpX * adjacentLabelOffset;
  const adjacentLabelY = (y1 + y2) / 2 + adjacentFlip * adjacentPerpY * adjacentLabelOffset;

  // For hypotenuse (x1,y1 to x3,y3)
  const hypotenuseDx = x3 - x1;
  const hypotenuseDy = y3 - y1;
  const hypotenuseLen = Math.sqrt(hypotenuseDx * hypotenuseDx + hypotenuseDy * hypotenuseDy);
  // Perpendicular vector (rotate 90 degrees counterclockwise)
  const hypotenusePerpX = -hypotenuseDy / hypotenuseLen;
  const hypotenusePerpY = hypotenuseDx / hypotenuseLen;
  // Check if perpendicular points away from right angle (outside triangle)
  const hypotenuseTestX = (x1 + x3) / 2 + hypotenusePerpX * 10;
  const hypotenuseTestY = (y1 + y3) / 2 + hypotenusePerpY * 10;
  const hypotenuseDistToRight = Math.sqrt((hypotenuseTestX - x2) ** 2 + (hypotenuseTestY - y2) ** 2);
  const hypotenuseDistMidToRight = Math.sqrt(((x1 + x3) / 2 - x2) ** 2 + ((y1 + y3) / 2 - y2) ** 2);
  // If test point is closer to right angle, flip the perpendicular
  const hypotenuseFlip = hypotenuseDistToRight < hypotenuseDistMidToRight ? -1 : 1;
  const hypotenuseLabelOffset = 25;
  const hypotenuseLabelX = (x1 + x3) / 2 + hypotenuseFlip * hypotenusePerpX * hypotenuseLabelOffset;
  const hypotenuseLabelY = (y1 + y3) / 2 + hypotenuseFlip * hypotenusePerpY * hypotenuseLabelOffset;

  return (
    <Stage width={width} height={height}>
      <Layer>
        {/* Draw the three sides of the triangle */}

        {/* Adjacent side */}
        <Line
          points={[x1, y1, x2, y2]}
          stroke={adjacentColor}
          strokeWidth={4}
        />

        {/* Opposite side */}
        <Line
          points={[x2, y2, x3, y3]}
          stroke={oppositeColor}
          strokeWidth={4}
        />

        {/* Hypotenuse */}
        <Line
          points={[x1, y1, x3, y3]}
          stroke={hypotenuseColor}
          strokeWidth={4}
        />

        {/* Right angle indicator (small square drawn with lines for any orientation) */}
        {rightAngle && (
          <>
            {/* Draw right angle square using lines so it works for any triangle orientation */}
            {/* Calculate the 4 corners of the square inside the triangle */}
            {(() => {
              // Start at right angle vertex, move along both sides by squareSize
              const corner1X = rightAngleX;
              const corner1Y = rightAngleY;

              const corner2X = rightAngleX + toAcuteUnitX * rightAngleSize;
              const corner2Y = rightAngleY + toAcuteUnitY * rightAngleSize;

              const corner3X = rightAngleX + toAcuteUnitX * rightAngleSize + toThirdUnitX * rightAngleSize;
              const corner3Y = rightAngleY + toAcuteUnitY * rightAngleSize + toThirdUnitY * rightAngleSize;

              const corner4X = rightAngleX + toThirdUnitX * rightAngleSize;
              const corner4Y = rightAngleY + toThirdUnitY * rightAngleSize;

              return (
                <Line
                  points={[
                    corner2X, corner2Y,  // Start at one side
                    corner3X, corner3Y,  // Go to opposite corner
                    corner4X, corner4Y,  // Go to other side
                  ]}
                  stroke="#666"
                  strokeWidth={2}
                  closed={false}
                />
              );
            })()}
          </>
        )}

        {/* Angle arc */}
        {angle?.showValue && (
          <>
            <Arc
              x={x1}
              y={y1}
              innerRadius={0}
              outerRadius={arcRadius}
              angle={arcAngle}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3B82F6"
              strokeWidth={2}
              rotation={arcRotation}
            />
            {needsExternalLabel ? (
              // Text outside with arrow pointing to angle (when overlap detected)
              <>
                <Line
                  points={[
                    externalLabelX + 35,
                    externalLabelY + 10,
                    angleTextX,
                    angleTextY
                  ]}
                  stroke="#333"
                  strokeWidth={1.5}
                  dash={[4, 4]}
                />
                <Text
                  x={externalLabelX}
                  y={externalLabelY}
                  text={angle.label || `${angleValue}°`}
                  fontSize={20}
                  fill="#333"
                  fontStyle="bold"
                />
              </>
            ) : showTextInside ? (
              // Text inside the arc at the midpoint angle
              <Text
                x={angleTextX}
                y={angleTextY}
                text={angle.label || `${angleValue}°`}
                fontSize={18}
                fill="#333"
                fontStyle="bold"
                offsetX={12}
                offsetY={8}
              />
            ) : (
              // Fallback: text outside without arrow (arc too small)
              <Text
                x={externalLabelX}
                y={externalLabelY}
                text={angle.label || `${angleValue}°`}
                fontSize={20}
                fill="#333"
                fontStyle="bold"
              />
            )}
          </>
        )}

        {/* Side labels - dynamically positioned for all orientations */}
        {sides?.opposite?.showLabel && (
          <Text
            x={oppositeLabelX}
            y={oppositeLabelY}
            text={
              sides.opposite.label && sides.opposite.showLength
                ? `${sides.opposite.label}: ${sides.opposite.length}`
                : sides.opposite.label
                ? sides.opposite.label
                : sides.opposite.showLength
                ? String(sides.opposite.length)
                : ''
            }
            fontSize={16}
            fill={oppositeColor}
            fontStyle="bold"
            offsetX={10}
            offsetY={8}
          />
        )}

        {sides?.adjacent?.showLabel && (
          <Text
            x={adjacentLabelX}
            y={adjacentLabelY}
            text={
              sides.adjacent.label && sides.adjacent.showLength
                ? `${sides.adjacent.label}: ${sides.adjacent.length}`
                : sides.adjacent.label
                ? sides.adjacent.label
                : sides.adjacent.showLength
                ? String(sides.adjacent.length)
                : ''
            }
            fontSize={16}
            fill={adjacentColor}
            fontStyle="bold"
            offsetX={10}
            offsetY={8}
          />
        )}

        {sides?.hypotenuse?.showLabel && (
          <Text
            x={hypotenuseLabelX}
            y={hypotenuseLabelY}
            text={
              sides.hypotenuse.label && sides.hypotenuse.showLength
                ? `${sides.hypotenuse.label}: ${sides.hypotenuse.length}`
                : sides.hypotenuse.label
                ? sides.hypotenuse.label
                : sides.hypotenuse.showLength
                ? String(sides.hypotenuse.length)
                : ''
            }
            fontSize={16}
            fill={hypotenuseColor}
            fontStyle="bold"
            offsetX={10}
            offsetY={8}
          />
        )}
      </Layer>
    </Stage>
  );
}

export default MoreTangentLesson;

// Styled Components

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

const HintButton = styled.button`
  background: #edf2f7;
  border: 2px solid #cbd5e0;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;

  @media (max-width: 1024px) {
    padding: 8px 16px;
    font-size: 14px;
    margin-bottom: 12px;
  }

  &:hover {
    background: #e2e8f0;
    border-color: #a0aec0;
  }
`;

const TopHintButton = styled(HintButton)`
  position: fixed;
  top: 15px;
  right: 20px;
  margin-bottom: 0;
  z-index: 100;

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

const CalculationBox = styled.div`
  background: white;
  border: 1px solid #c6f6d5;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;

  @media (max-width: 1024px) {
    padding: 12px;
    margin-bottom: 10px;
  }
`;

const CalculationStep = styled.div`
  font-size: 15px;
  color: #2d3748;
  margin: 6px 0;
  font-family: 'Courier New', monospace;

  @media (max-width: 1024px) {
    font-size: 14px;
    margin: 5px 0;
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
