import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useLessonState } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: {
    title: 'Whole Number Rounding',
    instruction: 'Round the number to the given place value.',
  },
  2: {
    title: 'Decimal Rounding',
    instruction: 'Round the decimal number to the given place value.',
  },
  3: {
    title: 'Mixed Rounding',
    instruction: 'Round whole numbers or decimals to the given place value.',
  },
  4: {
    title: 'Word Problems',
    instruction: 'Read the problem and round the number as asked.',
  },
};

// ==================== HELPERS ====================

function formatNumber(num) {
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// ==================== NUMBER LINE VISUALIZATION ====================

function NumberLineVisual({ visualData, theme }) {
  if (visualData?.lowerBound == null || visualData?.upperBound == null) return null;

  const { originalNumber, lowerBound, upperBound } = visualData;
  const range = upperBound - lowerBound;
  if (range === 0) return null;

  const positionPercent = ((originalNumber - lowerBound) / range) * 100;
  const clampedPercent = Math.max(8, Math.min(92, positionPercent));

  return (
    <NumberLineContainer>
      <NumberLineTrack>
        <BoundLabel $pos="left">{formatNumber(lowerBound)}</BoundLabel>
        <BoundLabel $pos="right">{formatNumber(upperBound)}</BoundLabel>
        <MidpointLine />
        <NumberMarker style={{ left: `${clampedPercent}%` }}>
          <MarkerLabel>{formatNumber(originalNumber)}</MarkerLabel>
          <MarkerDot />
        </NumberMarker>
      </NumberLineTrack>
    </NumberLineContainer>
  );
}

// ==================== CORE COMPONENT ====================

function Rounding({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const [showHint, setShowHint] = useState(false);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const hint = currentProblem?.hint || '';
  const explanation = currentProblem?.explanation || '';
  const level = visualData?.level || 1;

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) {
      return currentProblem.acceptedAnswers;
    }
    if (Array.isArray(currentProblem?.answer)) return currentProblem.answer;
    return [String(currentProblem?.answer || '')];
  }, [currentProblem]);

  const handleTryAnother = () => {
    setShowHint(false);
    hideAnswer();
    triggerNewProblem();
  };

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  if (!currentProblem || !visualData?.level) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
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

      {/* Visual Section */}
      <VisualSection>
        <QuestionText>
          {currentProblem?.question?.[0]?.text || ''}
        </QuestionText>

        {!showAnswer && <NumberLineVisual visualData={visualData} />}
      </VisualSection>

      {/* Interaction Section */}
      <InteractionSection>
        {!showAnswer && showHint && <HintBox>{hint}</HintBox>}

        <AnswerInput
          correctAnswer={correctAnswer}
          answerType="array"
          onCorrect={revealAnswer}
          onTryAnother={handleTryAnother}
          disabled={showAnswer}
          placeholder="Enter the rounded number"
        />
      </InteractionSection>

      {/* Explanation Section */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>
            Answer: {formatNumber(visualData.roundedAnswer)}
          </ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>

          <StepsBox>
            <StepTitle>Rounding Rule</StepTitle>
            <Step>1. Find the place value you are rounding to</Step>
            <Step>2. Look at the digit one place to the right</Step>
            <Step>3. If that digit is 5 or more, round up</Step>
            <Step>4. If that digit is 4 or less, round down</Step>
          </StepsBox>

          <NumberLineVisual visualData={visualData} />
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default Rounding;

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

const LoadingText = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.textSecondary};
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

const QuestionText = styled.p`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  text-align: center;
  margin: 0;
  line-height: 1.6;
  max-width: 650px;

  @media (min-width: 768px) {
    font-size: 22px;
  }
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
  }
`;

// ==================== NUMBER LINE STYLED COMPONENTS ====================

const NumberLineContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 12px auto;
  padding: 36px 20px 24px;
`;

const NumberLineTrack = styled.div`
  position: relative;
  height: 4px;
  background: ${props => props.theme.colors.border};
  border-radius: 2px;
  margin: 20px 0;
`;

const BoundLabel = styled.span`
  position: absolute;
  top: 12px;
  ${props => props.$pos === 'left' ? 'left: 0;' : 'right: 0;'}
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
`;

const NumberMarker = styled.div`
  position: absolute;
  bottom: -8px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MarkerDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.theme.colors.info || '#3B82F6'};
  border: 3px solid ${props => props.theme.colors.pageBackground};
  box-shadow: 0 0 0 2px ${props => props.theme.colors.info || '#3B82F6'};
`;

const MarkerLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.colors.info || '#3B82F6'};
  margin-bottom: 4px;
  white-space: nowrap;
`;

const MidpointLine = styled.div`
  position: absolute;
  left: 50%;
  top: -6px;
  height: 16px;
  width: 2px;
  background: ${props => props.theme.colors.textDisabled || '#ccc'};
  transform: translateX(-50%);
`;
