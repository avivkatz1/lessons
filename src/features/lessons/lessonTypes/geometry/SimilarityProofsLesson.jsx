import React, { useState } from 'react';
import styled from 'styled-components';
import { useLessonState } from '../../../../hooks';

export default function SimilarityProofsLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const [selectedChoice, setSelectedChoice] = useState(null);

  // Get current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const { level = 1 } = visualData;

  const questionText = currentProblem?.question?.[0]?.text || '';
  const answerText = currentProblem?.answer?.[0] || '';
  const explanation = currentProblem?.explanation || '';
  const hint = currentProblem?.hint || '';

  const choices = visualData.choices || [];

  // Event handlers
  const handleTryAnother = () => {
    setSelectedChoice(null);
    triggerNewProblem();
    hideAnswer();
  };

  const handleChoiceClick = (choiceText) => {
    if (showAnswer) return;

    setSelectedChoice(choiceText);
    const isCorrect = choiceText === answerText;

    if (isCorrect) {
      setTimeout(() => {
        revealAnswer();
        // Auto-advance after 1.5 seconds
        setTimeout(() => {
          handleTryAnother();
        }, 1500);
      }, 300);
    } else {
      setTimeout(() => {
        revealAnswer();
      }, 300);
    }
  };

  // Fallback if no data
  if (!currentProblem?.visualData) {
    return (
      <Container>
        <Title>Similarity Proofs</Title>
        <Question>Loading lesson data...</Question>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Similarity Proofs - Level {level}</Title>

      <QuestionSection>
        <Question>{questionText}</Question>
      </QuestionSection>

      <ChoicesGrid>
        {choices.map((choice, idx) => {
          const choiceText = choice.text || choice;
          const isSelected = selectedChoice === choiceText;
          const isCorrect = choiceText === answerText;

          return (
            <ChoiceButton
              key={idx}
              onClick={() => handleChoiceClick(choiceText)}
              $isSelected={isSelected}
              $showAnswer={showAnswer}
              $isCorrect={isCorrect}
              disabled={showAnswer}
            >
              {choiceText}
            </ChoiceButton>
          );
        })}
      </ChoicesGrid>

      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>
            {selectedChoice === answerText ? '✓ Correct!' : '✗ Incorrect'}
          </ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
        </ExplanationSection>
      )}

      {!showAnswer && hint && (
        <HintSection>
          <HintTitle>💡 Hint:</HintTitle>
          <HintText>{hint}</HintText>
        </HintSection>
      )}
    </Container>
  );
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  color: ${props => props.theme.colors.textPrimary};
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
  color: ${props => props.theme.colors.textPrimary};
`;

const QuestionSection = styled.div`
  margin-bottom: 32px;
`;

const Question = styled.p`
  font-size: 20px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
  text-align: center;
`;

const ChoicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 32px 0;
`;

const ChoiceButton = styled.button`
  padding: 20px;
  border: 2px solid ${props => {
    if (props.$isSelected && props.$showAnswer) {
      return props.$isCorrect
        ? props.theme.colors.buttonSuccess || '#4ade80'
        : props.theme.colors.buttonError || '#ef4444';
    }
    if (props.$isSelected) {
      return props.theme.colors.borderDark || props.theme.colors.border;
    }
    return props.theme.colors.border;
  }};
  background: ${props => {
    if (props.$isSelected && props.$showAnswer) {
      return props.$isCorrect
        ? props.theme.colors.successBackground || '#4ade8020'
        : props.theme.colors.errorBackground || '#ef444420';
    }
    if (props.$isSelected) {
      return props.theme.colors.hoverBackground;
    }
    return props.theme.colors.cardBackground;
  }};
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary};
  transition: all 0.2s;
  text-align: center;

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.borderDark || props.theme.colors.border};
    background: ${props => props.theme.colors.hoverBackground};
    transform: translateY(-2px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ExplanationSection = styled.div`
  margin-top: 32px;
  padding: 24px;
  background: ${props => props.theme.colors.cardBackground};
  border-left: 4px solid ${props => props.theme.colors.buttonSuccess || '#4ade80'};
  border-radius: 8px;
`;

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${props => props.theme.colors.textPrimary};
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
`;

const HintSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: ${props => props.theme.colors.inputBackground || '#f1efef'};
  border-left: 4px solid ${props => props.theme.colors.borderDark || '#cbd5e0'};
  border-radius: 8px;
`;

const HintTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.textPrimary};
`;

const HintText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.theme.colors.textSecondary};
`;
