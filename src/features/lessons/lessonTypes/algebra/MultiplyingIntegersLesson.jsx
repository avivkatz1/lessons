/**
 * Multiplying Integers - Lesson Component
 *
 * Six-level progression with sign rules:
 * L1 — Positive · Positive: Basic multiplication
 * L2 — Positive · Negative: One negative gives negative result
 * L3 — Negative · Positive: Commutative property, still negative
 * L4 — Negative · Negative: Two negatives make positive
 * L5 — Sign Prediction: Predict if answer is positive or negative
 * L6 — Word Problems: Real-world scenarios
 */

import React, { useState, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { useLessonState } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

// ==================== MAIN COMPONENT ====================

function MultiplyingIntegersLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const [showHint, setShowHint] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [shakingIdx, setShakingIdx] = useState(null);
  const [phase, setPhase] = useState('interact'); // Level 5 phase state

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

  // Get choices for Level 5
  const choices = visualData?.choices || [];

  // Event handlers
  const handleTryAnother = () => {
    setShowHint(false);
    setSelectedChoice(null);
    setShakingIdx(null);
    setPhase('interact');
    hideAnswer();
    triggerNewProblem();
  };

  const handleCorrectAnswer = () => {
    revealAnswer();
  };

  const handleChoiceClick = (choice, idx) => {
    // Level 5: Check phase before allowing interaction
    if (levelNum === 5 && phase !== 'interact') return;
    if (selectedChoice !== null) return; // Already selected

    const isCorrect = correctAnswer.includes(choice.toLowerCase());

    if (isCorrect) {
      setSelectedChoice(idx);
      setTimeout(() => {
        if (levelNum === 5) {
          setPhase('complete');
        }
        handleCorrectAnswer();
      }, 600);
    } else {
      setShakingIdx(idx);
      setTimeout(() => setShakingIdx(null), 500);
    }
  };

  // Reset Level 5 state when question changes
  React.useEffect(() => {
    setSelectedChoice(null);
    setShakingIdx(null);
    setPhase('interact');
  }, [currentQuestionIndex]);

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
          {levelNum === 1 && 'Positive · Positive'}
          {levelNum === 2 && 'Positive · Negative'}
          {levelNum === 3 && 'Negative · Positive'}
          {levelNum === 4 && 'Negative · Negative'}
          {levelNum === 5 && 'Sign Prediction'}
          {levelNum === 6 && 'Word Problems'}
        </LevelTitle>
      </LevelHeader>

      {/* Question */}
      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      {/* Interaction Section */}
      <InteractionSection>
        {showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}

        {levelNum === 5 && phase === 'interact' && (
          <ChoiceGrid>
            {choices.map((choice, idx) => {
              const isSelected = selectedChoice === idx;
              const isCorrectSelected = isSelected && correctAnswer.includes(choice.toLowerCase());
              const isShaking = shakingIdx === idx;
              const isFaded = selectedChoice !== null && !isSelected;
              const isPositive = choice.toLowerCase() === 'positive';

              return (
                <ChoiceButton
                  key={idx}
                  $correct={isCorrectSelected}
                  $wrong={isShaking}
                  $faded={isFaded}
                  $isPositive={isPositive}
                  onClick={() => handleChoiceClick(choice, idx)}
                  disabled={selectedChoice !== null}
                >
                  {choice.charAt(0).toUpperCase() + choice.slice(1)}
                  {isCorrectSelected && " ✓"}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        )}

        {!showAnswer && levelNum !== 5 && (
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

        {levelNum === 5 && phase === 'complete' && (
          <ExplanationSection>
            <ExplanationTitle>Correct!</ExplanationTitle>
            <AnswerDisplay>{visualData?.expression} = {visualData?.result}</AnswerDisplay>
            <TryAnotherButton onClick={handleTryAnother}>
              Try Another Problem
            </TryAnotherButton>
          </ExplanationSection>
        )}

        {showAnswer && levelNum !== 5 && explanation && (
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

export default MultiplyingIntegersLesson;

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

const AnswerDisplay = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  text-align: center;
  margin: 20px 0;
  padding: 20px;
  background: ${props => props.theme.colors.hoverBackground};
  border-radius: 12px;

  @media (max-width: 1024px) {
    font-size: 28px;
    padding: 16px;
    margin: 16px 0;
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

const ChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  max-width: 500px;
  margin-top: 4px;

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const ChoiceButton = styled.button`
  width: 100%;
  padding: 16px 20px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 10px;
  border: 2px solid ${props => props.$isPositive ? '#10B981' : '#EF4444'};
  background-color: ${props => props.$isPositive ? '#10B98120' : '#EF444420'};
  color: ${props => props.$isPositive ? '#10B981' : '#EF4444'};
  cursor: pointer;
  transition: all 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover:not(:disabled) {
    background-color: ${props => props.$isPositive ? '#10B98140' : '#EF444440'};
    border-color: ${props => props.$isPositive ? '#059669' : '#DC2626'};
  }

  ${props =>
    props.$correct &&
    css`
      background-color: ${props.$isPositive ? '#10B981' : '#EF4444'};
      border-color: ${props.$isPositive ? '#059669' : '#DC2626'};
      color: white;
      cursor: default;
    `}

  ${props =>
    props.$wrong &&
    css`
      animation: shake 0.4s;
      opacity: 0.6;
    `}

  ${props =>
    props.$faded &&
    css`
      opacity: 0.3;
      cursor: default;
    `}

  &:disabled {
    cursor: default;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }

  @media (max-width: 1024px) {
    padding: 13px 20px;
    font-size: 16px;
  }
`;
