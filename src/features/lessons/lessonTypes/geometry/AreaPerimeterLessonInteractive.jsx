/**
 * Area & Perimeter Interactive Lesson - Main Orchestrator
 *
 * Five-level progression teaching area and perimeter concepts:
 * L1 — Click-to-Count Grid: Visual understanding through counting
 * L2 — Formula Introduction: Button selection + multi-stage workflow
 * L3 — Reverse Problems: Multi-stage sequential solving
 * L4 — Dual Calculations: Area and perimeter together
 * L5 — Word Problems: Real-world application with keyword highlighting
 *
 * Follows INTERACTIVE_LESSON_PATTERNS.md and LESSON_STYLE_GUIDE.md
 */

import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useLessonState, useWindowDimensions } from '../../../../hooks';
import { setUserAnswer, setAnswerFeedback, recordAnswer } from '../../../../store/lessonSlice';
import { validateAnswer } from '../../../../shared/helpers/validateAnswer';
import { AnswerInput, DrawingCanvas } from '../../../../shared/components';

// Import level components
import Level1GridCounter from './components/Level1GridCounter';
import Level2FormulaIntro from './components/Level2FormulaIntro';
import Level3ReverseSolver from './components/Level3ReverseSolver';
import Level4DualCalculator from './components/Level4DualCalculator';
import Level5WordProblem from './components/Level5WordProblem';
import FormulaHelper from './components/FormulaHelper';

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: {
    title: 'Visual Counting',
    instruction: 'Click on each grid cell to count all the squares inside the shape.',
  },
  2: {
    title: 'Formula Introduction',
    instruction: 'Select the correct formula, then calculate area and perimeter.',
  },
  3: {
    title: 'Reverse Problems',
    instruction: 'Use the formula backward to find the missing dimension.',
  },
  4: {
    title: 'Dual Calculations',
    instruction: 'Calculate both area and perimeter for the shape.',
  },
  5: {
    title: 'Word Problems',
    instruction: 'Read carefully and determine what the problem is asking for.',
  },
};

// ==================== MAIN COMPONENT ====================

function AreaPerimeterLessonInteractive({ triggerNewProblem }) {
  const dispatch = useDispatch();
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width } = useWindowDimensions();

  // Redux selectors
  const userAnswer = useSelector((state) => state.lesson.userAnswer);
  const lessonName = useSelector((state) => state.lesson.lessonProps.lessonName);
  const isUsingBatch = useSelector(
    (state) => state.lesson.questionAnswerArray && state.lesson.questionAnswerArray.length > 0
  );

  // Local UI state
  const [showHint, setShowHint] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Current question data
  const currentQuestion = useMemo(
    () => questionAnswerArray?.[currentQuestionIndex] || lessonProps,
    [questionAnswerArray, currentQuestionIndex, lessonProps]
  );

  const {
    question,
    answer,
    acceptedAnswers,
    hint,
    explanation,
    visualData,
  } = currentQuestion;

  // Get level from visualData
  const level = visualData?.level || 1;
  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Format question text
  const questionText = question?.[0]?.text || question || '';

  // Format correct answer
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers?.length > 0) return acceptedAnswers;
    if (Array.isArray(answer)) return answer;
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  // Reset on question change
  useEffect(() => {
    setShowHint(false);
    setShowCanvas(false);
    setIsComplete(false);
  }, [currentQuestionIndex]);

  // Event handlers
  const handleCorrectAnswer = () => {
    setIsComplete(true);
    revealAnswer();
  };

  const handleTryAnother = () => {
    setShowHint(false);
    setShowCanvas(false);
    setIsComplete(false);
    hideAnswer();
    triggerNewProblem();
  };

  const handleCanvasSubmit = () => {
    if (!userAnswer.trim()) return;

    const isCorrect = validateAnswer(userAnswer, correctAnswer, 'array', lessonName);
    dispatch(setAnswerFeedback(isCorrect ? 'correct' : 'incorrect'));

    if (isUsingBatch) {
      dispatch(recordAnswer({ isCorrect }));
    }

    if (isCorrect) {
      handleCorrectAnswer();
    }
  };

  if (!visualData) {
    return (
      <Wrapper>
        <LoadingText>Loading lesson...</LoadingText>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {/* Fixed hint button */}
      {!isComplete && !showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{info.title}</LevelTitle>
      </LevelHeader>

      <InstructionText>{info.instruction}</InstructionText>

      {/* Question display */}
      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      {/* Level-specific interactive components */}
      {level === 1 && (
        <Level1GridCounter
          visualData={visualData}
          onCorrect={handleCorrectAnswer}
          disabled={showAnswer || isComplete}
        />
      )}

      {level === 2 && (
        <Level2FormulaIntro
          visualData={visualData}
          questionIndex={currentQuestionIndex}
          onCanvasOpen={() => setShowCanvas(true)}
          disabled={showAnswer || isComplete}
        />
      )}

      {level === 3 && (
        <Level3ReverseSolver
          visualData={visualData}
          questionIndex={currentQuestionIndex}
          onCanvasOpen={() => setShowCanvas(true)}
          disabled={showAnswer || isComplete}
        />
      )}

      {level === 4 && (
        <Level4DualCalculator
          visualData={visualData}
          questionText={questionText}
          questionIndex={currentQuestionIndex}
          correctAnswer={correctAnswer}
          onCorrect={handleCorrectAnswer}
          disabled={showAnswer || isComplete}
        />
      )}

      {level === 5 && (
        <Level5WordProblem
          visualData={visualData}
          questionText={questionText}
          questionIndex={currentQuestionIndex}
          currentQuestionIndex={currentQuestionIndex}
          onCanvasOpen={() => setShowCanvas(true)}
          disabled={showAnswer || isComplete}
        />
      )}

      {/* Formula Helper (levels 2-4) */}
      {level >= 2 && level <= 4 && !isComplete && (
        <FormulaHelper shapeType={visualData.shapeType} />
      )}

      {/* Hint section */}
      <InteractionSection>
        {showHint && hint && <HintBox>{hint}</HintBox>}

        {/* Answer input (levels that need it) */}
        {!showAnswer && !isComplete && (level === 2 || level === 3 || level === 5) && (
          <AnswerInputContainer>
            <AnswerInput
              correctAnswer={correctAnswer}
              answerType="array"
              onCorrect={handleCorrectAnswer}
              onTryAnother={handleTryAnother}
              disabled={showAnswer || isComplete}
              placeholder={
                level === 4
                  ? 'Enter area, perimeter (e.g., 24, 20)'
                  : 'Enter your answer'
              }
            />
          </AnswerInputContainer>
        )}

        {/* Explanation after correct answer */}
        {(showAnswer || isComplete) && explanation && (
          <ExplanationSection>
            <ExplanationTitle>Excellent! ✓</ExplanationTitle>
            <ExplanationText>{explanation}</ExplanationText>
            <TryAnotherButton onClick={handleTryAnother}>
              Try Another Problem
            </TryAnotherButton>
          </ExplanationSection>
        )}
      </InteractionSection>

      {/* Drawing Canvas (levels 2-5) */}
      {showCanvas && level >= 2 && (
        <DrawingCanvas
          equation={questionText}
          questionIndex={currentQuestionIndex}
          visible={showCanvas}
          onClose={() => setShowCanvas(false)}
          disabled={showAnswer || isComplete}
          onAnswerRecognized={(text) => dispatch(setUserAnswer(text))}
          onSubmit={handleCanvasSubmit}
        />
      )}
    </Wrapper>
  );
}

export default AreaPerimeterLessonInteractive;

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

const LoadingText = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textSecondary};
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
  margin-bottom: 6px;
  width: 100%;
  justify-content: center;

  @media (max-width: 1024px) {
    gap: 8px;
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
`;

const LevelTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 22px;
  }

  @media (max-width: 1024px) {
    font-size: 18px;
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
    margin-bottom: 8px;
  }
`;

const QuestionSection = styled.div`
  margin-bottom: 20px;
  text-align: center;
  width: 100%;
  max-width: 700px;

  @media (max-width: 1024px) {
    margin-bottom: 16px;
  }
`;

const QuestionText = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 22px;
  }

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const InteractionSection = styled.div`
  width: 100%;
  max-width: 650px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 1024px) {
    gap: 16px;
    margin-top: 16px;
  }
`;

const HintBox = styled.div`
  width: 100%;
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

const AnswerInputContainer = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: center;
`;

const ExplanationSection = styled.div`
  width: 100%;
  background: ${(props) => props.theme.colors.buttonSuccess}18;
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 24px;
  text-align: center;

  @media (max-width: 1024px) {
    padding: 20px;
  }
`;

const ExplanationTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  color: ${(props) => props.theme.colors.buttonSuccess};
  font-weight: 700;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0 0 20px 0;

  @media (max-width: 1024px) {
    font-size: 15px;
    margin-bottom: 16px;
  }
`;

const TryAnotherButton = styled.button`
  background: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  max-width: 300px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
    font-size: 15px;
  }
`;
