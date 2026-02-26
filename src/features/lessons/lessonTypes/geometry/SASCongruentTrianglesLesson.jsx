import React, { useState, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Stage, Layer, Line, Circle, Rect, Text, Arc } from 'react-konva';
import { useLessonState, useIsTouchDevice, useWindowDimensions, useKonvaTheme } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';
import ExplanationModal from './ExplanationModal';

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: {
    title: 'SAS Recognition',
    instruction: 'Look at the two triangles and determine if they are congruent by SAS.',
  },
  2: {
    title: 'Match Corresponding Parts',
    instruction: 'Identify which parts (sides and angles) from Triangle ABC match Triangle DEF.',
  },
  3: {
    title: 'Find the Congruent Pair',
    instruction: 'Which pair of triangles is congruent by SAS?',
  },
  4: {
    title: 'Find the Missing Measurement',
    instruction: 'Use SAS congruence to find the missing side or angle.',
  },
  5: {
    title: 'Real-World Application',
    instruction: 'Apply SAS congruence to solve the problem.',
  },
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

      {/* Side labels */}
      {sides && sides.map((side, i) => {
        const v1 = vertices[i];
        const v2 = vertices[(i + 1) % vertices.length];
        const midX = (v1.x + v2.x) / 2 + offsetX;
        const midY = (v1.y + v2.y) / 2 + offsetY;

        // Calculate perpendicular offset for label
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
                text={String(side.length)}
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

              // Perpendicular direction for tick marks
              const perpTickX = -dy / len;
              const perpTickY = dx / len;

              // Parallel direction for spacing
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

        // Calculate angle for arc
        const angle1 = Math.atan2(v1.y - vertex.y, v1.x - vertex.x);
        const angle2 = Math.atan2(v2.y - vertex.y, v2.x - vertex.x);

        let startAngle = angle1 * (180 / Math.PI);
        let endAngle = angle2 * (180 / Math.PI);

        // Ensure we draw the smaller arc
        if (endAngle < startAngle) {
          endAngle += 360;
        }
        if (endAngle - startAngle > 180) {
          [startAngle, endAngle] = [endAngle, startAngle + 360];
        }

        const arcRadius = 20;
        const isIncluded = angle.isIncluded;

        // Calculate label position (middle of arc, slightly outward)
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
                  stroke={isIncluded ? (konvaTheme.angle || '#F59E0B') : konvaTheme.labelText}
                  strokeWidth={isIncluded ? 3 : 2}
                  opacity={isIncluded ? 1 : 0.6}
                />
                {/* Angle label */}
                {angle.showLabel && (
                  <Text
                    x={labelX}
                    y={labelY}
                    text={angle.label || `${angle.value}°`}
                    fill={isIncluded ? (konvaTheme.angle || '#F59E0B') : konvaTheme.labelText}
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

function SASCongruentTrianglesLesson({ triggerNewProblem }) {
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
    level = 1,
    mode = 'side-by-side',
    triangleA,
    triangleB,
    trianglePairs,
    triangles, // L3: individual triangles
    correctIndices, // L3: which 2 triangles are congruent
    choices: rawChoices = [],
    parts,
  } = visualData;

  const choices = rawChoices || [];
  const hint = currentProblem?.hint || '';
  const explanation = currentProblem?.explanation || '';
  const questionText = currentProblem?.question?.[0]?.text || '';

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Canvas sizing - full width with margins
  const canvasWidth = useMemo(() => {
    return windowWidth - 40; // 20px margin on each side
  }, [windowWidth]);

  const canvasHeight = useMemo(() => {
    const designHeight = 360;
    const designWidth = 400;
    const scale = canvasWidth / designWidth;
    // Maintain 400:360 aspect ratio to match design space
    // Cap at 450px for side-by-side to prevent too tall on wide screens
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
        // Deselect
        return prev.filter(i => i !== index);
      } else if (prev.length < 2) {
        // Select (max 2)
        const newSelection = [...prev, index];

        // Check if selection is complete and correct
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

  // L1, L3, L5: Choice click handler
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
  const allClassified = parts && parts.length > 0 && parts.every((p) => classifications[p.labelA]);

  if (!currentProblem?.visualData) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

  return (
    <Wrapper>
      {/* Hint Button */}
      {phase !== 'complete' && !showHint && hint && (
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
        {questionText}
      </InstructionText>

      {/* Konva Canvas */}
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

              {/* Triangles - scaled to fit canvas with padding */}
              {(() => {
                // Backend generates for ~400px width x 360px height
                const designWidth = 400;
                const designHeight = 360;
                const padding = 20;

                // Calculate scale to fit both width and height with padding
                const scaleX = (canvasWidth - padding * 2) / designWidth;
                const scaleY = (canvasHeight - padding * 2) / designHeight;
                const scale = Math.min(scaleX, scaleY); // Use smaller scale to fit

                // Center the content
                const scaledWidth = designWidth * scale;
                const scaledHeight = designHeight * scale;
                const offsetX = (canvasWidth - scaledWidth) / 2;
                const offsetY = (canvasHeight - scaledHeight) / 2;

                return (
                  <>
                    <TriangleDiagram
                      triangle={{
                        ...triangleA,
                        vertices: triangleA.vertices.map(v => ({
                          x: v.x * scale + offsetX,
                          y: v.y * scale + offsetY,
                        })),
                      }}
                      konvaTheme={konvaTheme}
                      offsetX={0}
                      offsetY={0}
                      label="△ABC"
                    />
                    <TriangleDiagram
                      triangle={{
                        ...triangleB,
                        vertices: triangleB.vertices.map(v => ({
                          x: v.x * scale + offsetX,
                          y: v.y * scale + offsetY,
                        })),
                      }}
                      konvaTheme={konvaTheme}
                      offsetX={0}
                      offsetY={0}
                      label="△DEF"
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

              {/* Main grid dividers (thicker, more prominent) */}
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
                // Backend positions triangles in 400x360 design space
                // Frontend scales entire space to fit canvas
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

                      {/* Triangle - backend already positioned, just scale */}
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

      {/* ===== Level 1: Binary Choice ===== */}
      {level === 1 && phase === 'interact' && choices.length > 0 && (
        <ChooseSection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && shakingIdx === null && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}
          <ButtonRow>
            {choices.map((choice, idx) => {
              const isSelected = selectedChoice === idx;
              const isCorrectSelected = isSelected && choice.correct;
              const isShaking = shakingIdx === idx;
              const isYesButton = choice.text.toLowerCase().includes('yes');
              const ButtonComponent = isYesButton ? YesButton : NoButton;
              return (
                <ButtonComponent
                  key={idx}
                  $correct={isCorrectSelected}
                  $wrong={isShaking}
                  onClick={() => handleChoiceClick(choice, idx)}
                  disabled={selectedChoice !== null || isShaking}
                >
                  {choice.text}
                  {isCorrectSelected && ' ✓'}
                </ButtonComponent>
              );
            })}
          </ButtonRow>
        </ChooseSection>
      )}

      {/* ===== Level 2: Classify Corresponding Parts ===== */}
      {level === 2 && phase === 'interact' && parts && (
        <ClassifySection>
          {showHint && hint && <HintBox>{hint}</HintBox>}
          {wrongAttempts > 0 && (
            <FeedbackText $isWrong>Some matches are incorrect — check again!</FeedbackText>
          )}
          {parts.map((part) => (
            <ClassifyRow key={part.labelA}>
              <PartLabel>{part.labelA} matches:</PartLabel>
              <ToggleGroup>
                {[1, 2, 3].map((matchNum) => (
                  <ToggleButton
                    key={matchNum}
                    $active={classifications[part.labelA] === matchNum}
                    $isTouchDevice={isTouchDevice}
                    onClick={() => handleClassifyToggle(part.labelA, matchNum)}
                  >
                    Match {matchNum}
                  </ToggleButton>
                ))}
              </ToggleGroup>
            </ClassifyRow>
          ))}
          <CheckButton
            onClick={handleCheckClassify}
            disabled={!allClassified}
            $dimmed={!allClassified}
          >
            Check Matches
          </CheckButton>
        </ClassifySection>
      )}

      {/* ===== Level 3: Grid Selection ===== */}
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

      {/* ===== Level 4: Answer Input ===== */}
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

      {/* ===== Level 5: Word Problem Multiple Choice ===== */}
      {level === 5 && phase === 'interact' && choices.length > 0 && (
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

      {/* ===== Phase: Complete ===== */}
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

export default SASCongruentTrianglesLesson;

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

  @media (max-width: 1024px) {
    gap: 8px;
    margin-bottom: 4px;
  }
`;

const LevelBadge = styled.span`
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;

  @media (max-width: 1024px) {
    padding: 2px 10px;
    font-size: 12px;
  }
`;

const LevelTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 18px;
  }

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

  @media (max-width: 1024px) {
    font-size: 14px;
    margin: 0 0 8px 0;
  }
`;

const CanvasWrapper = styled.div`
  margin: 12px 0 20px 0;
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 1024px) {
    margin: 8px 0 12px 0;
    border-radius: 10px;
  }
`;

const ChooseSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: ${fadeInAnim} 0.3s ease;

  @media (max-width: 1024px) {
    gap: 8px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin-top: 4px;

  @media (max-width: 1024px) {
    gap: 10px;
  }
`;

const ChoiceGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 420px;
  margin-top: 4px;

  @media (max-width: 1024px) {
    gap: 8px;
  }
`;

const ChoiceButton = styled.button`
  width: 100%;
  padding: ${(props) => (props.$isTouchDevice ? '16px 20px' : '13px 20px')};
  font-size: ${(props) => (props.$isTouchDevice ? '17px' : '16px')};
  font-weight: 600;
  border-radius: 10px;
  border: 2px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => {
    if (props.$correct) return props.theme.colors.buttonSuccess + '20';
    return props.theme.colors.cardBackground;
  }};
  color: ${(props) => {
    if (props.$correct) return props.theme.colors.buttonSuccess;
    return props.theme.colors.textPrimary;
  }};
  border-color: ${(props) => {
    if (props.$correct) return props.theme.colors.buttonSuccess;
    if (props.$wrong) return props.theme.colors.danger || '#E53E3E';
    return props.theme.colors.border;
  }};
  cursor: pointer;
  transition: all 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.hoverBackground};
    border-color: ${(props) => props.theme.colors.info || '#3B82F6'};
  }

  ${(props) =>
    props.$wrong &&
    `
    animation: ${shakeAnim} 0.5s ease;
  `}

  ${(props) =>
    props.$fadeOut &&
    `
    opacity: 0;
    transform: scale(0.95);
    pointer-events: none;
    transition: all 0.4s ease;
  `}

  &:disabled {
    cursor: default;
  }

  @media (max-width: 1024px) {
    padding: ${(props) => (props.$isTouchDevice ? '14px 16px' : '11px 16px')};
    font-size: ${(props) => (props.$isTouchDevice ? '16px' : '15px')};
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
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover:not(:disabled) {
    background-color: #10B981;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  ${(props) =>
    props.$correct &&
    `
    background-color: #10B981;
    color: white;
  `}

  ${(props) =>
    props.$wrong &&
    `
    animation: ${shakeAnim} 0.5s ease;
  `}

  @media (max-width: 1024px) {
    padding: 12px 32px;
    font-size: 17px;
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
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover:not(:disabled) {
    background-color: #EF4444;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  ${(props) =>
    props.$correct &&
    `
    background-color: #EF4444;
    color: white;
  `}

  ${(props) =>
    props.$wrong &&
    `
    animation: ${shakeAnim} 0.5s ease;
  `}

  @media (max-width: 1024px) {
    padding: 12px 32px;
    font-size: 17px;
  }
`;

const FeedbackText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) =>
    props.$isWrong
      ? props.theme.colors.danger || '#E53E3E'
      : props.theme.colors.buttonSuccess};
  margin: 0;
`;

const ClassifySection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  animation: ${fadeInAnim} 0.3s ease;
  max-width: 500px;

  @media (max-width: 1024px) {
    gap: 10px;
  }
`;

const ClassifyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 10px 12px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 10px;

  @media (max-width: 1024px) {
    gap: 12px;
    padding: 8px 10px;
  }
`;

const PartLabel = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  min-width: 90px;

  @media (max-width: 1024px) {
    font-size: 15px;
    min-width: 80px;
  }
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 10px;
  flex: 1;

  @media (max-width: 1024px) {
    gap: 8px;
  }
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: ${(props) => (props.$isTouchDevice ? '16px 20px' : '13px 20px')};
  font-size: ${(props) => (props.$isTouchDevice ? '17px' : '16px')};
  font-weight: 600;
  border-radius: 10px;
  border: 2px solid ${(props) =>
    props.$active ? props.theme.colors.info || '#3B82F6' : props.theme.colors.border};
  background-color: ${(props) =>
    props.$active
      ? (props.theme.colors.info || '#3B82F6') + '20'
      : props.theme.colors.cardBackground};
  color: ${(props) =>
    props.$active ? props.theme.colors.info || '#3B82F6' : props.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background-color: ${(props) =>
      props.$active
        ? (props.theme.colors.info || '#3B82F6') + '30'
        : props.theme.colors.hoverBackground};
    border-color: ${(props) => props.theme.colors.info || '#3B82F6'};
  }

  @media (max-width: 1024px) {
    padding: ${(props) => (props.$isTouchDevice ? '14px 16px' : '11px 16px')};
    font-size: ${(props) => (props.$isTouchDevice ? '16px' : '15px')};
  }
`;

const CheckButton = styled.button`
  padding: 14px 32px;
  font-size: 17px;
  font-weight: 700;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.info || '#3B82F6'};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  touch-action: manipulation;
  opacity: ${(props) => (props.$dimmed ? 0.5 : 1)};

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @media (max-width: 1024px) {
    padding: 12px 28px;
    font-size: 16px;
  }
`;

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 8px;

  @media (max-width: 1024px) {
    gap: 8px;
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
  border-left: 4px solid ${(props) => props.theme.colors.warning || '#f6ad55'};
  padding: 14px 16px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    padding: 12px 14px;
    font-size: 14px;
  }
`;
