import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Line, Circle, Text as KonvaText, Rect } from 'react-konva';
import { useKonvaTheme, useLessonState } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

// ==================== KONVA GRAPH (Level 1) ====================

/** Clip the line y = mx + b to the box [minV, maxV] x [minV, maxV].
 *  Returns an array of at most 2 canvas-coordinate points. */
function clipLine(m, b, minV, maxV, toCanvas) {
  const pts = [];

  const tryPush = (mathX, mathY) => {
    if (mathX >= minV - 0.001 && mathX <= maxV + 0.001 &&
        mathY >= minV - 0.001 && mathY <= maxV + 0.001) {
      const cp = toCanvas(mathX, mathY);
      if (!pts.some(p => Math.abs(p.x - cp.x) < 0.5 && Math.abs(p.y - cp.y) < 0.5)) {
        pts.push(cp);
      }
    }
  };

  // Intersect with left (x=minV) and right (x=maxV) boundaries
  tryPush(minV, m * minV + b);
  tryPush(maxV, m * maxV + b);
  // Intersect with top (y=maxV) and bottom (y=minV) boundaries
  if (Math.abs(m) > 0.001) {
    tryPush((maxV - b) / m, maxV);
    tryPush((minV - b) / m, minV);
  }

  return pts;
}

function CoordinateGraph({ visualData }) {
  const konvaTheme = useKonvaTheme();
  const SIZE = 400;
  const UNITS = 6;
  const CELL = SIZE / (UNITS * 2); // px per math unit
  const O = SIZE / 2;              // origin in px

  const toCanvas = (mx, my) => ({ x: O + mx * CELL, y: O - my * CELL });

  const line1Pts = clipLine(visualData.eq1.m, visualData.eq1.b, -UNITS, UNITS, toCanvas);
  const line2Pts = clipLine(visualData.eq2.m, visualData.eq2.b, -UNITS, UNITS, toCanvas);

  // Tick labels on axes
  const ticks = [];
  for (let i = -UNITS; i <= UNITS; i++) {
    if (i === 0) continue;
    const px = toCanvas(i, 0);
    const py = toCanvas(0, i);
    ticks.push({ x: px.x - 6, y: px.y + 2, text: String(i) });
    ticks.push({ x: py.x + 4, y: py.y - 7, text: String(i) });
  }

  const gridLines = [];
  for (let i = -UNITS; i <= UNITS; i++) {
    const v1 = toCanvas(i, -UNITS);
    const v2 = toCanvas(i, UNITS);
    gridLines.push([v1.x, v1.y, v2.x, v2.y]);
    const h1 = toCanvas(-UNITS, i);
    const h2 = toCanvas(UNITS, i);
    gridLines.push([h1.x, h1.y, h2.x, h2.y]);
  }

  const xAxisL = toCanvas(-UNITS, 0);
  const xAxisR = toCanvas(UNITS, 0);
  const yAxisT = toCanvas(0, UNITS);
  const yAxisB = toCanvas(0, -UNITS);

  const ip = visualData.type === 'unique' ? toCanvas(visualData.intersection.x, visualData.intersection.y) : null;

  return (
    <Stage width={SIZE} height={SIZE}>
      <Layer>
        {/* Background */}
        <Rect x={0} y={0} width={SIZE} height={SIZE} fill={konvaTheme.canvasBackground} />

        {/* Grid */}
        {gridLines.map((pts, i) => (
          <Line key={`g${i}`} points={pts} stroke={konvaTheme.gridRegular} strokeWidth={0.5} opacity={0.35} />
        ))}

        {/* Axes */}
        <Line points={[xAxisL.x, xAxisL.y, xAxisR.x, xAxisR.y]} stroke={konvaTheme.shapeStroke} strokeWidth={2} />
        <Line points={[yAxisT.x, yAxisT.y, yAxisB.x, yAxisB.y]} stroke={konvaTheme.shapeStroke} strokeWidth={2} />

        {/* Tick labels */}
        {ticks.map((t, i) => (
          <KonvaText key={`t${i}`} x={t.x} y={t.y} text={t.text} fill={konvaTheme.labelText} fontSize={10} />
        ))}

        {/* Axis labels */}
        <KonvaText x={xAxisR.x - 12} y={xAxisR.y - 16} text="x" fill={konvaTheme.labelText} fontSize={13} fontStyle="bold" />
        <KonvaText x={yAxisT.x + 6} y={yAxisT.y + 2} text="y" fill={konvaTheme.labelText} fontSize={13} fontStyle="bold" />

        {/* Line 1 (blue) */}
        {line1Pts.length === 2 && (
          <Line
            points={[line1Pts[0].x, line1Pts[0].y, line1Pts[1].x, line1Pts[1].y]}
            stroke={konvaTheme.adjacent}
            strokeWidth={2.5}
          />
        )}

        {/* Line 2 (red/orange) — dashed if same as line 1 */}
        {line2Pts.length === 2 && (
          <Line
            points={[line2Pts[0].x, line2Pts[0].y, line2Pts[1].x, line2Pts[1].y]}
            stroke={konvaTheme.opposite}
            strokeWidth={2.5}
            dash={visualData.type === 'infinite' ? [10, 5] : undefined}
          />
        )}

        {/* Intersection dot */}
        {ip && (
          <Circle x={ip.x} y={ip.y} radius={6} fill={konvaTheme.angle} stroke={konvaTheme.shapeStroke} strokeWidth={1.5} />
        )}
      </Layer>
    </Stage>
  );
}

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: {
    title: 'Graphical Method',
    instruction: 'Look at the graph and determine the solution to the system of equations. Enter "(x, y)", "no solution", or "infinitely many solutions".',
  },
  2: {
    title: 'Elimination Method — Easy',
    instruction: 'Both equations share the same x-coefficient. Subtract one from the other to eliminate x, then solve for y.',
  },
  3: {
    title: 'Substitution Method',
    instruction: 'One equation is already solved for y. Substitute that expression into the second equation and solve.',
  },
  4: {
    title: 'Advanced Systems',
    instruction: 'Use elimination (with multiplication) or substitution (after rearranging) to solve the system.',
  },
  5: {
    title: 'Word Problems',
    instruction: 'Set up a system of equations from the problem. Solve for both unknowns and enter them as (x, y).',
  },
};

// ==================== CORE COMPONENT ====================

function SystemOfEquationsCore({ level, triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const [showHint, setShowHint] = useState(false);

  // Get current problem from batch cache or lessonProps
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const hint = currentProblem?.hint || '';
  const explanation = currentProblem?.explanation || '';

  // Build correct answer from acceptedAnswers (string-based matching)
  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers && Array.isArray(currentProblem.acceptedAnswers)) {
      return currentProblem.acceptedAnswers;
    }
    if (currentProblem?.answer && Array.isArray(currentProblem.answer)) {
      return currentProblem.answer;
    }
    return [];
  }, [currentProblem]);

  const handleTryAnother = () => {
    setShowHint(false);
    hideAnswer();
    triggerNewProblem();
  };

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  const placeholder = visualData?.answerPlaceholder || `(${visualData?.answerLabel || 'x, y'})`;

  // Don't render until we have backend data
  if (!currentProblem || !visualData?.level) {
    return <Wrapper><div>Loading...</div></Wrapper>;
  }

  return (
    <Wrapper>
      {/* Fixed hint button */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>Need a hint?</TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{info.title}</LevelTitle>
      </LevelHeader>

      <InstructionText>{info.instruction}</InstructionText>

      {/* ---- Visual Section ---- */}
      <VisualSection>
        {level === 1 && (
          <>
            <EqRow>
              <EqChip isFirst>Eq 1: {visualData.displayEq1}</EqChip>
              <EqChip>Eq 2: {visualData.displayEq2}</EqChip>
            </EqRow>
            {visualData.type === 'infinite' && (
              <OverlapNote>Note: Line 2 overlaps Line 1 completely.</OverlapNote>
            )}
            <CoordinateGraph visualData={visualData} />
          </>
        )}

        {(level === 2 || level === 3 || level === 4) && (
          <SystemBox>
            <Brace>{'\u007B'}</Brace>
            <SystemEqStack>
              <SystemEq>{visualData.displayEq1}</SystemEq>
              <SystemEq>{visualData.displayEq2}</SystemEq>
            </SystemEqStack>
          </SystemBox>
        )}

        {level === 5 && (
          <>
            <WordText>{visualData.problem}</WordText>
            <AnswerNote>Enter your answer as ({visualData.answerLabel || 'x, y'})</AnswerNote>
          </>
        )}
      </VisualSection>

      {/* ---- Interaction Section ---- */}
      <InteractionSection>
        {!showAnswer && showHint && <HintBox>{hint}</HintBox>}

        <AnswerInput
          correctAnswer={correctAnswer}
          answerType="array"
          onCorrect={revealAnswer}
          onTryAnother={handleTryAnother}
          disabled={showAnswer}
          placeholder={placeholder}
        />
      </InteractionSection>

      {/* ---- Explanation Section ---- */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>
            {level === 1 && visualData.type === 'no_solution' && 'No Solution'}
            {level === 1 && visualData.type === 'infinite' && 'Infinitely Many Solutions'}
            {(level !== 1 || visualData.type === 'unique') &&
              `Solution: x\u202f=\u202f${visualData.X}, y\u202f=\u202f${visualData.Y}`}
          </ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>

          {/* Method reminder */}
          {level === 2 && (
            <StepsBox>
              <StepTitle>Elimination Steps</StepTitle>
              <Step>1. Identify the matching coefficient (same number in front of x)</Step>
              <Step>2. Subtract one equation from the other to eliminate x</Step>
              <Step>3. Solve for y</Step>
              <Step>4. Substitute y back into either equation to find x</Step>
            </StepsBox>
          )}
          {level === 3 && (
            <StepsBox>
              <StepTitle>Substitution Steps</StepTitle>
              <Step>1. The first equation gives y in terms of x</Step>
              <Step>2. Replace y in the second equation with that expression</Step>
              <Step>3. Solve for x</Step>
              <Step>4. Substitute x back to find y</Step>
            </StepsBox>
          )}
          {level === 4 && visualData.subtype === 'elimination' && (
            <StepsBox>
              <StepTitle>Elimination with Multiplication</StepTitle>
              <Step>1. Choose a variable to eliminate</Step>
              <Step>2. Multiply equations to make those coefficients match</Step>
              <Step>3. Add or subtract to eliminate that variable</Step>
              <Step>4. Solve, then substitute back</Step>
            </StepsBox>
          )}
          {level === 4 && visualData.subtype === 'substitution' && (
            <StepsBox>
              <StepTitle>Substitution with Rearrangement</StepTitle>
              <Step>1. Solve one equation for x (or y)</Step>
              <Step>2. Substitute into the other equation</Step>
              <Step>3. Solve the resulting single-variable equation</Step>
              <Step>4. Substitute back to find the other variable</Step>
            </StepsBox>
          )}
          {level === 5 && (
            <StepsBox>
              <StepTitle>Setting Up the System</StepTitle>
              <SystemEqSmall>{visualData.system}</SystemEqSmall>
            </StepsBox>
          )}
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

// ==================== LEVEL EXPORTS ====================

export function SystemOfEquationsL1(props) {
  return <SystemOfEquationsCore level={1} {...props} />;
}

export function SystemOfEquationsL2(props) {
  return <SystemOfEquationsCore level={2} {...props} />;
}

export function SystemOfEquationsL3(props) {
  return <SystemOfEquationsCore level={3} {...props} />;
}

export function SystemOfEquationsL4(props) {
  return <SystemOfEquationsCore level={4} {...props} />;
}

export function SystemOfEquationsL5(props) {
  return <SystemOfEquationsCore level={5} {...props} />;
}

export default SystemOfEquationsCore;

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

const LevelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  width: 100%;
  justify-content: center;
`;

const LevelBadge = styled.span`
  background-color: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
`;

const LevelTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 22px;
  }
`;

const InstructionText = styled.p`
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 20px 0;
  max-width: 700px;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 24px 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const EqRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const EqChip = styled.div`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  background-color: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-left: 5px solid ${props => props.isFirst ? props.theme.colors.adjacent || '#3B82F6' : props.theme.colors.opposite || '#EF4444'};
`;

const OverlapNote = styled.p`
  font-size: 13px;
  color: ${props => props.theme.colors.textSecondary};
  font-style: italic;
  margin: 0;
`;

const SystemBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
`;

const SystemEqStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Brace = styled.span`
  font-size: 72px;
  line-height: 1;
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 100;
  align-self: center;
`;

const SystemEq = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  font-family: 'Courier New', Courier, monospace;
  text-align: left;

  @media (max-width: 600px) {
    font-size: 20px;
  }
`;

const SystemEqSmall = styled.pre`
  font-size: 16px;
  font-family: 'Courier New', Courier, monospace;
  color: ${props => props.theme.colors.textPrimary};
  margin: 8px 0 0 0;
  white-space: pre;
`;

const WordText = styled.p`
  font-size: 18px;
  line-height: 1.75;
  color: ${props => props.theme.colors.textPrimary};
  text-align: center;
  margin: 0;
  max-width: 650px;

  @media (max-width: 600px) {
    font-size: 16px;
  }
`;

const AnswerNote = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  font-style: italic;
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
  background-color: ${props => props.theme.colors.cardBackground};
  border-left: 4px solid ${props => props.theme.colors.warning || '#f6ad55'};
  padding: 14px 16px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 20px 24px;
  margin-top: 4px;
`;

const ExplanationTitle = styled.h3`
  font-size: 19px;
  font-weight: 700;
  color: ${props => props.theme.colors.buttonSuccess};
  margin: 0 0 10px 0;
`;

const ExplanationText = styled.p`
  font-size: 15px;
  line-height: 1.65;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 12px 0;
`;

const StepsBox = styled.div`
  background-color: ${props => props.theme.colors.pageBackground};
  border-radius: 8px;
  padding: 14px 16px;
  margin-top: 12px;
`;

const StepTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const Step = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  margin: 4px 0;
  padding-left: 4px;
  line-height: 1.5;
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
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
