/**
 * ASA (Angle-Side-Angle) Congruent Triangles Lesson
 *
 * Teaches the ASA congruence criterion:
 * Two triangles are congruent if two angles and the INCLUDED side are equal.
 * The included side is the side that IS between the two known angles.
 *
 * Distinction from AAS:
 * - ASA: The side IS between the two angles (included side)
 * - AAS: The side is NOT between the two angles (non-included side)
 *
 * 5 Levels:
 * L1 — Recognition (Binary Choice)
 * L2 — Identify Parts (Classification)
 * L3 — Find Congruent Pair (Grid Selection)
 * L4 — Find Missing Measurement (Input)
 * L5 — Word Problems (Multiple Choice)
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Line, Circle, Rect, Arc, Text } from 'react-konva';
import {
  useLessonState,
  useWindowDimensions,
  useKonvaTheme,
  useIsTouchDevice,
} from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';
import ExplanationModal from './ExplanationModal';

// ==================== CONSTANTS ====================

const LEVEL_INFO = {
  1: { title: 'ASA Recognition', description: 'Identify ASA congruence' },
  2: { title: 'ASA Parts', description: 'Match ASA components' },
  3: { title: 'Find Congruent Pair', description: 'Select congruent triangles' },
  4: { title: 'Find Measurement', description: 'Calculate missing values' },
  5: { title: 'Word Problems', description: 'Real-world applications' },
};

// ==================== TRIANGLE DIAGRAM COMPONENT ====================

function TriangleDiagram({
  triangle,
  konvaTheme,
  offsetX = 0,
  offsetY = 0,
  label = '',
}) {
  if (!triangle || !triangle.vertices) return null;

  const { vertices, sides, angles } = triangle;

  return (
    <>
      {/* Triangle outline */}
      <Line
        points={[
          vertices[0].x + offsetX,
          vertices[0].y + offsetY,
          vertices[1].x + offsetX,
          vertices[1].y + offsetY,
          vertices[2].x + offsetX,
          vertices[2].y + offsetY,
          vertices[0].x + offsetX,
          vertices[0].y + offsetY,
        ]}
        stroke={konvaTheme.shapeStroke}
        strokeWidth={3}
        lineCap="round"
        lineJoin="round"
      />

      {/* Vertices */}
      {vertices.map((v, i) => (
        <Circle
          key={`vertex-${i}`}
          x={v.x + offsetX}
          y={v.y + offsetY}
          radius={4}
          fill={konvaTheme.point || '#ef4444'}
        />
      ))}

      {/* Vertex labels (A, B, C, D, E, F) */}
      {angles && angles.map((angle, i) => {
        if (!angle.vertexLabel) return null;
        const vertexIdx = angle.vertex;
        const v = vertices[vertexIdx];
        if (!v) return null;

        // Position label outside the triangle
        // Calculate centroid to determine outward direction
        const centroidX = (vertices[0].x + vertices[1].x + vertices[2].x) / 3;
        const centroidY = (vertices[0].y + vertices[1].y + vertices[2].y) / 3;
        const dx = v.x - centroidX;
        const dy = v.y - centroidY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offsetDist = 18; // Distance from vertex
        const labelOffsetX = (dx / dist) * offsetDist;
        const labelOffsetY = (dy / dist) * offsetDist;

        return (
          <Text
            key={`vertex-label-${i}`}
            x={v.x + offsetX + labelOffsetX - 6}
            y={v.y + offsetY + labelOffsetY - 8}
            text={angle.vertexLabel}
            fill={konvaTheme.labelText}
            fontSize={16}
            fontStyle="bold"
          />
        );
      })}

      {/* Side labels and tick marks */}
      {sides && sides.map((side, i) => {
        const v1 = vertices[i];
        const v2 = vertices[(i + 1) % vertices.length];
        const midX = (v1.x + v2.x) / 2 + offsetX;
        const midY = (v1.y + v2.y) / 2 + offsetY;

        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const perpX = (-dy / len) * 15;
        const perpY = (dx / len) * 15;

        return (
          <React.Fragment key={`side-${i}`}>
            {side.showLabel && (
              <Text
                x={midX + perpX - 10}
                y={midY + perpY - 8}
                text={side.label || String(side.length)}
                fill={side.color || konvaTheme.labelText}
                fontSize={14}
                fontStyle="bold"
              />
            )}
            {side.showQuestion && (
              <Text
                x={midX + perpX - 6}
                y={midY + perpY - 8}
                text="?"
                fill={konvaTheme.angle || '#F59E0B'}
                fontSize={18}
                fontStyle="bold"
              />
            )}
            {/* Tick marks for congruent sides */}
            {side.tickMarks > 0 && Array.from({ length: side.tickMarks }).map((_, tickIdx) => {
              const tickSpacing = 6;
              const tickLength = 8;
              const totalWidth = (side.tickMarks - 1) * tickSpacing;
              const tickOffset = tickIdx * tickSpacing - totalWidth / 2;

              const perpTickX = -dy / len;
              const perpTickY = dx / len;
              const parTickX = dx / len;
              const parTickY = dy / len;

              return (
                <Line
                  key={`tick-${i}-${tickIdx}`}
                  points={[
                    midX + parTickX * tickOffset - perpTickX * tickLength / 2,
                    midY + parTickY * tickOffset - perpTickY * tickLength / 2,
                    midX + parTickX * tickOffset + perpTickX * tickLength / 2,
                    midY + parTickY * tickOffset + perpTickY * tickLength / 2,
                  ]}
                  stroke={konvaTheme.shapeStroke}
                  strokeWidth={2}
                  lineCap="round"
                />
              );
            })}
          </React.Fragment>
        );
      })}

      {/* Angle indicators */}
      {angles && angles.map((angle, i) => {
        const vertexIndex = angle.vertex !== undefined ? angle.vertex : i;
        const vertex = vertices[vertexIndex];
        const v1 = vertices[(vertexIndex - 1 + vertices.length) % vertices.length];
        const v2 = vertices[(vertexIndex + 1) % vertices.length];

        const angle1 = Math.atan2(v1.y - vertex.y, v1.x - vertex.x);
        const angle2 = Math.atan2(v2.y - vertex.y, v2.x - vertex.x);

        let startAngle = angle1 * (180 / Math.PI);
        let endAngle = angle2 * (180 / Math.PI);

        if (endAngle < startAngle) {
          endAngle += 360;
        }
        if (endAngle - startAngle > 180) {
          [startAngle, endAngle] = [endAngle, startAngle + 360];
        }

        const arcRadius = 20;
        const isIncluded = angle.isIncluded;

        const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
        const labelRadius = arcRadius + 15;
        const labelX = vertex.x + offsetX + Math.cos(midAngle) * labelRadius - 10;
        const labelY = vertex.y + offsetY + Math.sin(midAngle) * labelRadius - 6;

        return (
          <React.Fragment key={`angle-${i}`}>
            {angle.show && (
              <>
                {/* Angle arc */}
                <Arc
                  x={vertex.x + offsetX}
                  y={vertex.y + offsetY}
                  innerRadius={0}
                  outerRadius={arcRadius}
                  angle={endAngle - startAngle}
                  rotation={startAngle}
                  stroke={konvaTheme.labelText}
                  strokeWidth={2}
                  opacity={0.6}
                />
                {/* Angle label */}
                {angle.showLabel && (
                  <Text
                    x={labelX}
                    y={labelY}
                    text={angle.label || `${angle.value}°`}
                    fill={konvaTheme.labelText}
                    fontSize={13}
                    fontStyle="bold"
                  />
                )}
                {angle.showQuestion && (
                  <Text
                    x={labelX}
                    y={labelY}
                    text="?"
                    fill={konvaTheme.angle || '#F59E0B'}
                    fontSize={16}
                    fontStyle="bold"
                  />
                )}
                {/* Arc marks for congruent angles */}
                {angle.arcMark > 0 && Array.from({ length: angle.arcMark }).map((_, arcIdx) => {
                  const markRadius = arcRadius - 6 - arcIdx * 4;
                  return (
                    <Arc
                      key={`arc-mark-${i}-${arcIdx}`}
                      x={vertex.x + offsetX}
                      y={vertex.y + offsetY}
                      innerRadius={0}
                      outerRadius={markRadius}
                      angle={endAngle - startAngle}
                      rotation={startAngle}
                      stroke={konvaTheme.angle || '#F59E0B'}
                      strokeWidth={2}
                    />
                  );
                })}
              </>
            )}
          </React.Fragment>
        );
      })}

      {/* Triangle label */}
      {label && (
        <Text
          x={vertices[0].x + offsetX - 15}
          y={vertices[0].y + offsetY - 30}
          text={label}
          fill={konvaTheme.labelText}
          fontSize={16}
          fontStyle="bold"
        />
      )}
    </>
  );
}

// ==================== MAIN COMPONENT ====================

function ASACongruentTrianglesLesson({ triggerNewProblem }) {
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
  const [modalClosedWithX, setModalClosedWithX] = useState(false);

  // Phase state
  const [phase, setPhase] = useState('interact');
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);

  // L2: Classification state
  const [classifications, setClassifications] = useState({});

  // L3: Grid selection state
  const [selectedTriangles, setSelectedTriangles] = useState([]);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    mode = 'side-by-side',
    triangleA,
    triangleB,
    triangles,
    correctIndices,
    choices: rawChoices = [],
    parts,
    problem,
  } = visualData;

  // Level comes from top-level of currentProblem, not from visualData
  const level = currentProblem?.level || 1;

  const choices = rawChoices || [];
  const hint = currentProblem?.hint || '';
  const explanation = currentProblem?.explanation || '';
  const questionText = currentProblem?.question?.[0]?.text || '';

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Canvas sizing
  const canvasWidth = useMemo(() => {
    const baseMax = Math.min(windowWidth - 40, 500);
    if (windowWidth <= 1024) return Math.min(baseMax, 400);
    return baseMax;
  }, [windowWidth]);

  const canvasHeight = useMemo(() => {
    const designHeight = 360;
    const designWidth = 400;
    const scale = canvasWidth / designWidth;
    return mode === 'grid' ? designHeight * scale : Math.min(designHeight * scale, 450);
  }, [canvasWidth, mode]);

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${triangleA?.sides?.[0]?.length || 0}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase('interact');
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
    setClassifications({});
    setSelectedTriangles([]);
    setModalClosedWithX(false);
    setModalClosedWithX(false);
  }

  const handleClose = () => {
    setPhase('interact');
    setModalClosedWithX(true);
  };

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase('interact');
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setClassifications({});
    setSelectedTriangles([]);
    setModalClosedWithX(false);
    setModalClosedWithX(false);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  // L3: Triangle selection handler
  const handleTriangleClick = useCallback((index) => {
    if (phase !== 'interact') return;

    setSelectedTriangles((prev) => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else if (prev.length < 2) {
        const newSelection = [...prev, index];

        if (newSelection.length === 2) {
          const sorted = [...newSelection].sort((a, b) => a - b);
          const correctSorted = [...correctIndices].sort((a, b) => a - b);
          const isCorrect = sorted[0] === correctSorted[0] && sorted[1] === correctSorted[1];

          if (isCorrect) {
            setTimeout(() => {
              if (!modalClosedWithX) {
                setPhase('complete');
              }
              revealAnswer();
            }, 600);
          } else {
            setWrongAttempts((prev) => prev + 1);
            setTimeout(() => {
              setSelectedTriangles([]);
    setModalClosedWithX(false);
    setModalClosedWithX(false);
            }, 800);
          }
        }

        return newSelection;
      }
      return prev;
    });
  }, [phase, correctIndices, revealAnswer]);

  // L1, L5: Choice click handler
  const handleChoiceClick = useCallback((choice, idx) => {
    if (phase !== 'interact' || shakingIdx !== null) return;

    if (choice.correct) {
      setSelectedChoice(idx);
      setTimeout(() => {
        if (!modalClosedWithX) {
          setPhase('complete');
        }
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
      return classifications[p.labelA] === p.correctMatch;
    });

    if (allCorrect) {
      if (!modalClosedWithX) {
        setPhase('complete');
      }
      revealAnswer();
    } else {
      setWrongAttempts((prev) => prev + 1);
    }
  }, [parts, classifications, revealAnswer]);

  // L4: Answer format
  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (Array.isArray(currentProblem?.answer)) return currentProblem.answer;
    return [String(currentProblem?.answer || '')];
  }, [currentProblem]);

  // Check if all L2 parts are classified
  const allPartsClassified = useMemo(() => {
    if (!parts || parts.length === 0) return false;
    return parts.every((p) => classifications[p.labelA] !== undefined);
  }, [parts, classifications]);

  return (
    <Wrapper>
      {/* Fixed hint button */}
      {!phase.startsWith('complete') && !showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{levelInfo.title}</LevelTitle>
      </LevelHeader>

      {/* Question text */}
      <QuestionText>{questionText}</QuestionText>

      {/* Side-by-side mode (L1, L2, L4) */}
      {mode === 'side-by-side' && triangleA && triangleB && (
        <CanvasWrapper>
          <Stage width={canvasWidth} height={canvasHeight}>
            <Layer>
              {/* Background */}
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill={konvaTheme.canvasBackground}
              />

              {/* Two triangles side-by-side */}
              {(() => {
                const designWidth = 400;
                const designHeight = 360;
                const scaleX = canvasWidth / designWidth;
                const scaleY = canvasHeight / designHeight;
                const scale = Math.min(scaleX, scaleY);

                return (
                  <>
                    <TriangleDiagram
                      triangle={{
                        ...triangleA,
                        vertices: triangleA.vertices.map(v => ({
                          x: v.x * scale,
                          y: v.y * scale,
                        })),
                      }}
                      konvaTheme={konvaTheme}
                      offsetX={0}
                      offsetY={0}
                      label=""
                    />
                    <TriangleDiagram
                      triangle={{
                        ...triangleB,
                        vertices: triangleB.vertices.map(v => ({
                          x: v.x * scale,
                          y: v.y * scale,
                        })),
                      }}
                      konvaTheme={konvaTheme}
                      offsetX={0}
                      offsetY={0}
                      label=""
                    />
                  </>
                );
              })()}
            </Layer>
          </Stage>
        </CanvasWrapper>
      )}

      {/* Grid mode for L3 - 4 individual triangles */}
      {mode === 'grid' && triangles && (
        <CanvasWrapper>
          <Stage width={canvasWidth} height={canvasHeight}>
            <Layer>
              {/* Background */}
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill={konvaTheme.canvasBackground}
              />

              {/* Grid quadrant backgrounds with subtle borders */}
              {[0, 1, 2, 3].map((idx) => {
                const col = idx % 2;
                const row = Math.floor(idx / 2);
                const cellWidth = canvasWidth / 2;
                const cellHeight = canvasHeight / 2;

                return (
                  <Rect
                    key={`cell-${idx}`}
                    x={col * cellWidth}
                    y={row * cellHeight}
                    width={cellWidth}
                    height={cellHeight}
                    stroke={konvaTheme.gridLine || konvaTheme.border || '#CBD5E0'}
                    strokeWidth={2}
                    fill="transparent"
                  />
                );
              })}

              {/* Main grid dividers */}
              <Line
                points={[canvasWidth / 2, 0, canvasWidth / 2, canvasHeight]}
                stroke={konvaTheme.gridLine || konvaTheme.border || '#CBD5E0'}
                strokeWidth={3}
              />
              <Line
                points={[0, canvasHeight / 2, canvasWidth, canvasHeight / 2]}
                stroke={konvaTheme.gridLine || konvaTheme.border || '#CBD5E0'}
                strokeWidth={3}
              />

              {/* 4 individual triangles in 2x2 grid */}
              {(() => {
                const designWidth = 400;
                const designHeight = 360;
                const scaleX = canvasWidth / designWidth;
                const scaleY = canvasHeight / designHeight;
                const scale = Math.min(scaleX, scaleY);

                const cellWidth = canvasWidth / 2;
                const cellHeight = canvasHeight / 2;

                return triangles.map((triangle, idx) => {
                  const col = idx % 2;
                  const row = Math.floor(idx / 2);
                  const cellOffsetX = col * cellWidth;
                  const cellOffsetY = row * cellHeight;

                  const isSelected = selectedTriangles.includes(idx);

                  return (
                    <React.Fragment key={`triangle-${idx}`}>
                      {/* Selection highlight rectangle */}
                      {isSelected && (
                        <Rect
                          x={cellOffsetX + 5}
                          y={cellOffsetY + 5}
                          width={cellWidth - 10}
                          height={cellHeight - 10}
                          stroke={konvaTheme.buttonSuccess || '#10B981'}
                          strokeWidth={4}
                          cornerRadius={8}
                        />
                      )}

                      {/* Clickable area for selection */}
                      <Rect
                        x={cellOffsetX}
                        y={cellOffsetY}
                        width={cellWidth}
                        height={cellHeight}
                        fill="transparent"
                        onClick={() => handleTriangleClick(idx)}
                        onTap={() => handleTriangleClick(idx)}
                        style={{ cursor: phase === 'interact' ? 'pointer' : 'default' }}
                      />

                      {/* Triangle */}
                      <TriangleDiagram
                        triangle={{
                          ...triangle,
                          vertices: triangle.vertices.map(v => ({
                            x: v.x * scale,
                            y: v.y * scale,
                          })),
                        }}
                        konvaTheme={konvaTheme}
                        offsetX={0}
                        offsetY={0}
                      />
                    </React.Fragment>
                  );
                });
              })()}
            </Layer>
          </Stage>
        </CanvasWrapper>
      )}

      {/* Word problem mode (L5) - Text already shown in QuestionText above, no need to duplicate */}

      {/* Level 1: Binary Choice with Yes/No buttons (like shapes lesson) */}
      {level === 1 && phase === 'interact' && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && shakingIdx === null && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}
          <ButtonRow>
            {[...choices]
              .sort((a, b) => {
                const aIsNot = a.text.toLowerCase().includes("not") || a.text.toLowerCase().includes("no");
                const bIsNot = b.text.toLowerCase().includes("not") || b.text.toLowerCase().includes("no");
                if (aIsNot && !bIsNot) return 1;
                if (!aIsNot && bIsNot) return -1;
                return 0;
              })
              .map((choice, sortedIdx) => {
                const originalIdx = choices.indexOf(choice);
                const isGreenButton = !choice.text.toLowerCase().includes("not") && !choice.text.toLowerCase().includes("no");
                const ButtonComponent = isGreenButton ? YesButton : NoButton;
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

      {/* Level 5: Multiple Choice */}
      {level === 5 && phase === 'interact' && (
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
                  {isCorrectSelected && ' ✓'}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        </ChooseSection>
      )}

      {/* Level 2: Classification */}
      {level === 2 && phase === 'interact' && (
        <ClassificationSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && (
            <FeedbackText $isWrong>Not quite — check which parts prove ASA!</FeedbackText>
          )}
          <InstructionText>
            Match the corresponding parts that prove these triangles are congruent by ASA:
          </InstructionText>
          {parts && parts.map((part, idx) => (
            <ClassifyRow key={idx}>
              <PartLabel>{part.labelA} = {part.labelB}</PartLabel>
              <ToggleGroup>
                <ToggleButton
                  $active={classifications[part.labelA] === 1}
                  onClick={() => handleClassifyToggle(part.labelA, 1)}
                >
                  Angle 1
                </ToggleButton>
                <ToggleButton
                  $active={classifications[part.labelA] === 2}
                  onClick={() => handleClassifyToggle(part.labelA, 2)}
                >
                  Angle 2
                </ToggleButton>
                <ToggleButton
                  $active={classifications[part.labelA] === 3}
                  onClick={() => handleClassifyToggle(part.labelA, 3)}
                >
                  The Side
                </ToggleButton>
              </ToggleGroup>
            </ClassifyRow>
          ))}
          <CheckButton
            onClick={handleCheckClassify}
            disabled={!allPartsClassified}
          >
            Check Answer
          </CheckButton>
        </ClassificationSection>
      )}

      {/* Level 3: Grid Selection */}
      {level === 3 && phase === 'interact' && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && (
            <FeedbackText $isWrong>Not quite — try selecting different triangles!</FeedbackText>
          )}
          <InstructionText style={{ marginTop: '12px', fontSize: '14px' }}>
            {selectedTriangles.length === 0 && 'Tap any triangle to select it'}
            {selectedTriangles.length === 1 && 'Tap one more triangle'}
            {selectedTriangles.length === 2 && 'Checking your answer...'}
          </InstructionText>
        </ChooseSection>
      )}

      {/* Level 4: Answer Input */}
      {level === 4 && phase === 'interact' && (
        <InteractionSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={() => {
              setTimeout(() => {
                if (!modalClosedWithX) {
                  setPhase('complete');
                }
                revealAnswer();
              }, 300);
            }}
            onTryAnother={handleTryAnother}
            disabled={phase === 'complete'}
            placeholder="Enter the measurement"
          />
        </InteractionSection>
      )}

      {/* Phase: Complete */}
      {phase === 'complete' && (
        <ExplanationModal
          onClose={handleClose}
          explanation={explanation}
          onTryAnother={handleTryAnother}
        />
      )}
    </Wrapper>
  );
}

export default ASACongruentTrianglesLesson;

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

  @media (max-width: 1024px) {
    padding: 12px;
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
`;

const LevelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  width: 100%;

  @media (max-width: 1024px) {
    gap: 8px;
    margin-bottom: 12px;
  }
`;

const LevelBadge = styled.div`
  background: ${(props) => props.theme.colors.info};
  color: ${(props) => props.theme.colors.textInverted};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;

  @media (max-width: 1024px) {
    padding: 4px 10px;
    font-size: 12px;
  }
`;

const LevelTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: ${(props) => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const QuestionText = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  margin-bottom: 20px;
  max-width: 700px;

  @media (max-width: 1024px) {
    font-size: 14px;
    margin-bottom: 12px;
  }
`;

const CanvasWrapper = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    padding: 12px;
    margin-bottom: 12px;
  }
`;

const ProblemSection = styled.div`
  width: 100%;
  max-width: 700px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    padding: 16px;
    margin-bottom: 12px;
  }
`;

const ProblemText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const ChooseSection = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 1024px) {
    gap: 12px;
  }
`;

const HintBox = styled.div`
  background-color: ${(props) => props.theme.colors.warning}18;
  border-left: 4px solid ${(props) => props.theme.colors.warning};
  padding: 16px;
  border-radius: 8px;
  font-size: 15px;
  color: ${(props) => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    padding: 12px;
    font-size: 14px;
  }
`;

const FeedbackText = styled.div`
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
  text-align: center;
  background-color: ${(props) =>
    props.$isWrong ? props.theme.colors.buttonDanger + '18' : props.theme.colors.buttonSuccess + '18'};
  color: ${(props) =>
    props.$isWrong ? props.theme.colors.buttonDanger : props.theme.colors.buttonSuccess};

  @media (max-width: 1024px) {
    padding: 10px;
    font-size: 14px;
  }
`;

const InstructionText = styled.p`
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;

const ChoiceGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 1024px) {
    gap: 10px;
  }
`;

const ChoiceButton = styled.button`
  padding: 16px 20px;
  font-size: 16px;
  border-radius: 8px;
  border: 2px solid ${(props) => {
    if (props.$correct) return props.theme.colors.buttonSuccess;
    if (props.$wrong) return props.theme.colors.buttonDanger;
    return props.theme.colors.border;
  }};
  background-color: ${(props) => {
    if (props.$correct) return props.theme.colors.buttonSuccess + '18';
    if (props.$fadeOut) return props.theme.colors.pageBackground;
    return props.theme.colors.cardBackground;
  }};
  color: ${(props) => {
    if (props.$correct) return props.theme.colors.buttonSuccess;
    if (props.$wrong) return props.theme.colors.buttonDanger;
    return props.theme.colors.textPrimary;
  }};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  opacity: ${(props) => (props.$fadeOut ? 0.3 : 1)};
  animation: ${(props) => (props.$wrong ? 'shake 0.5s' : 'none')};
  min-height: 44px;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.hoverBackground};
    transform: translateY(-2px);
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }

  @media (max-width: 1024px) {
    padding: 12px 16px;
    font-size: 15px;
  }
`;

const ClassificationSection = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 1024px) {
    gap: 12px;
  }
`;

const ClassifyRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: 1024px) {
    padding: 12px;
    gap: 8px;
  }
`;

const PartLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    gap: 6px;
  }
`;

const ToggleButton = styled.button`
  padding: 10px 16px;
  font-size: 14px;
  border-radius: 6px;
  border: 2px solid ${(props) =>
    props.$active ? props.theme.colors.info : props.theme.colors.border};
  background-color: ${(props) =>
    props.$active ? props.theme.colors.info + '18' : props.theme.colors.cardBackground};
  color: ${(props) =>
    props.$active ? props.theme.colors.info : props.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
  flex: 1;
  min-width: 80px;

  &:hover {
    background-color: ${(props) =>
      props.$active ? props.theme.colors.info + '28' : props.theme.colors.hoverBackground};
  }

  @media (max-width: 1024px) {
    padding: 8px 12px;
    font-size: 13px;
  }
`;

const CheckButton = styled.button`
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  min-height: 44px;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  @media (max-width: 1024px) {
    padding: 12px 24px;
    font-size: 15px;
  }
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
  min-height: 44px;

  &:hover:not(:disabled) {
    background-color: #10B981;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @media (max-width: 1024px) {
    padding: 12px 32px;
    font-size: 16px;
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
  min-height: 44px;

  &:hover:not(:disabled) {
    background-color: #EF4444;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @media (max-width: 1024px) {
    padding: 12px 32px;
    font-size: 16px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
`;

const InteractionSection = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 1024px) {
    gap: 12px;
  }
`;
