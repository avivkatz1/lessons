/**
 * Subtracting Integers - Interactive Lesson Component
 *
 * Five-level progression with "Keep, Change, Change" method:
 * L1 — Keep Change Change (Positive - Positive): Marker visualization
 * L2 — Subtracting Negatives (Positive - Negative): Shows double negative
 * L3 — Negative Minus Positive: Result more negative
 * L4 — Negative Minus Negative: Trickiest case
 * L5 — Word Problems: Real-world scenarios
 */

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { useLessonState, useKonvaTheme, useWindowDimensions } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// ==================== KEEP CHANGE CHANGE INTERACTIVE COMPONENT ====================

function KeepChangeChange({ visualData, konvaTheme, width, height, onClearDrawing, tool, onToolChange }) {
  const { step1 } = visualData;
  const [lines, setLines] = React.useState([]);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const katexRef = React.useRef(null);

  const stageRef = React.useRef(null);

  // Render KaTeX expression
  React.useEffect(() => {
    if (katexRef.current && step1) {
      // Convert expression to LaTeX format (e.g., "7 - 1" becomes "7 - 1")
      const latex = step1.replace(/\s/g, '\\,'); // Add proper spacing
      katex.render(latex, katexRef.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [step1]);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];

    lastLine.points = lastLine.points.concat([point.x, point.y]);

    setLines(lines.slice(0, lines.length - 1).concat([lastLine]));
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Clear callback - expose the clear function to parent
  React.useImperativeHandle(onClearDrawing, () => ({
    clear: () => setLines([])
  }), []);

  return (
    <CanvasContainer>
      <Stage
        width={width}
        height={height}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {/* Canvas background */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={konvaTheme.canvasBackground}
          />

          {/* User's drawings */}
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.tool === 'eraser' ? '#FFFFFF' : '#EF4444'}
              strokeWidth={line.tool === 'eraser' ? 30 : 5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage>

      {/* KaTeX overlay - positioned on top of canvas */}
      <KaTeXOverlay ref={katexRef} />
    </CanvasContainer>
  );
}

// ==================== MAIN COMPONENT ====================

function SubtractingIntegersLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const konvaTheme = useKonvaTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [showHint, setShowHint] = useState(false);
  const [tool, setTool] = useState('marker');
  const clearDrawingRef = React.useRef(null);

  // Current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const { question, answer, acceptedAnswers, hint, explanation, visualData, level, levelNum: levelNumStr } = currentProblem;

  // Get level number - parse from string or use level field
  const levelNum = parseInt(levelNumStr || level || '1', 10);

  // Question text
  const questionText = question?.[0]?.text || question || '';

  // Format answer
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers?.length > 0) return acceptedAnswers;
    if (Array.isArray(answer)) return answer;
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  // Event handlers
  const handleTryAnother = () => {
    setShowHint(false);
    if (clearDrawingRef.current) {
      clearDrawingRef.current.clear();
    }
    triggerNewProblem();
    hideAnswer();
  };

  const handleClearDrawing = () => {
    if (clearDrawingRef.current) {
      clearDrawingRef.current.clear();
    }
  };

  const handleCorrectAnswer = () => {
    if (clearDrawingRef.current) {
      clearDrawingRef.current.clear();
    }
    revealAnswer();
  };

  // Canvas sizing
  const canvasWidth = useMemo(() => {
    return Math.min(windowWidth - 40, 600);
  }, [windowWidth]);

  const canvasHeight = useMemo(() => {
    if (levelNum >= 1 && levelNum <= 4) return 250; // Keep Change Change
    if (levelNum === 5) return 0; // Word problems (no visual unless hint)
    return 0;
  }, [levelNum]);

  // Clear drawing when level changes
  React.useEffect(() => {
    if (clearDrawingRef.current) {
      clearDrawingRef.current.clear();
    }
  }, [levelNum]);

  return (
    <Wrapper>
      {/* Hint button - fixed top right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {levelNum}</LevelBadge>
        <LevelTitle>
          {levelNum === 1 && 'Keep, Change, Change Method'}
          {levelNum === 2 && 'Subtracting Negatives'}
          {levelNum === 3 && 'Negative Minus Positive'}
          {levelNum === 4 && 'Negative Minus Negative'}
          {levelNum === 5 && 'Word Problems'}
        </LevelTitle>
      </LevelHeader>

      {/* Question */}
      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      {/* Visual Component - Show for first 4 questions, then only if hint is shown */}
      {visualData && visualData.type === 'keepChangeChange' && (currentQuestionIndex < 4 || showHint) && (
        <VisualSection>
          <KeepChangeChange
            visualData={visualData}
            konvaTheme={konvaTheme}
            width={canvasWidth}
            height={canvasHeight}
            tool={tool}
            onToolChange={setTool}
            onClearDrawing={clearDrawingRef}
          />
        </VisualSection>
      )}

      {/* Interaction Section */}
      <InteractionSection>
        {showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}

        {/* Drawing tools - below canvas like Symmetry lesson */}
        {visualData && visualData.type === 'keepChangeChange' && (currentQuestionIndex < 4 || showHint) && (
          <ButtonContainer>
            <ToolButton
              active={tool === 'marker'}
              onClick={() => setTool('marker')}
            >
              🖊️ Marker
            </ToolButton>
            <ToolButton
              active={tool === 'eraser'}
              onClick={() => setTool('eraser')}
            >
              🧹 Eraser
            </ToolButton>
            <ActionButton onClick={handleClearDrawing}>
              Clear Drawing
            </ActionButton>
          </ButtonContainer>
        )}

        {!showAnswer && (
          <AnswerInputContainer>
            <AnswerInput
              correctAnswer={correctAnswer}
              answerType="array"
              onCorrect={handleCorrectAnswer}
              onTryAnother={handleTryAnother}
              disabled={showAnswer}
              placeholder="Enter your answer"
            />
          </AnswerInputContainer>
        )}

        {showAnswer && explanation && (
          <ExplanationSection>
            <ExplanationTitle>Explanation</ExplanationTitle>
            <ExplanationText>{explanation}</ExplanationText>
            <TryAnotherButton onClick={handleTryAnother}>
              Try Another Problem
            </TryAnotherButton>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default SubtractingIntegersLesson;

// ==================== STYLED COMPONENTS ====================

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 1024px) {
    padding: 16px;
  }
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
`;

const LevelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 1024px) {
    gap: 8px;
    margin-bottom: 12px;
  }
`;

const LevelBadge = styled.div`
  background: ${props => props.theme.colors.info};
  color: ${props => props.theme.colors.textInverted};
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
  color: ${props => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const QuestionSection = styled.div`
  margin-bottom: 24px;
  text-align: center;

  @media (max-width: 1024px) {
    margin-bottom: 20px;
  }
`;

const QuestionText = styled.p`
  font-size: 20px;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.5;

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;

  @media (max-width: 1024px) {
    margin-bottom: 16px;
  }
`;

const CanvasContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const KaTeXOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  user-select: none;

  .katex {
    font-size: 72px;
    color: ${props => props.theme.colors.info};
  }

  .katex-display {
    margin: 0;
  }

  @media (max-width: 1024px) {
    .katex {
      font-size: 60px;
    }
  }

  @media (max-width: 768px) {
    .katex {
      font-size: 48px;
    }
  }
`;

const InteractionSection = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  @media (max-width: 1024px) {
    margin-top: 24px;
    gap: 16px;
  }
`;

const HintBox = styled.div`
  background-color: ${props => props.theme.colors.warning}18;
  border-left: 4px solid ${props => props.theme.colors.warning};
  padding: 16px;
  border-radius: 8px;
  font-size: 15px;
  color: ${props => props.theme.colors.textPrimary};
  max-width: 600px;

  @media (max-width: 1024px) {
    padding: 12px;
    font-size: 14px;
  }
`;

const AnswerInputContainer = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: center;
`;

const ExplanationSection = styled.div`
  background: ${props => props.theme.colors.buttonSuccess}18;
  border: 2px solid ${props => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  width: 100%;

  @media (max-width: 1024px) {
    padding: 20px;
  }
`;

const ExplanationTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  color: ${props => props.theme.colors.buttonSuccess};

  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 20px 0;

  @media (max-width: 1024px) {
    font-size: 15px;
    margin-bottom: 16px;
  }
`;

const TryAnotherButton = styled.button`
  background: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
    font-size: 15px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;

  @media (max-width: 1024px) {
    gap: 8px;
    margin-bottom: 16px;
  }
`;

const ToolButton = styled.button`
  background: ${props => props.active ? props.theme.colors.info : props.theme.colors.cardBackground};
  color: ${props => props.active ? props.theme.colors.textInverted : props.theme.colors.textPrimary};
  border: 2px solid ${props => props.active ? props.theme.colors.info : props.theme.colors.border};
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
    font-size: 14px;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.theme.colors.info};
  color: ${props => props.theme.colors.textInverted};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
    font-size: 14px;
  }
`;
