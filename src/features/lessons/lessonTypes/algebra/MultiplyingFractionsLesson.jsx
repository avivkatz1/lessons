/**
 * Multiplying Fractions - Lesson Component
 *
 * Five-level progression teaching fraction multiplication:
 * L1 — Simple fractions: Small numbers to build confidence (with interactive visuals)
 * L2 — Larger fractions: Practice the technique (with interactive visuals)
 * L3 — Simplifying results: Introduce simplification
 * L4 — Mixed difficulty: Fluency with varied problems
 * L5 — Word problems: Real-world application
 */

import React, { useState, useMemo, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { useLessonState } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: 'Simple Fractions', instruction: 'Multiply the numerators, then multiply the denominators.' },
  2: { title: 'Larger Fractions', instruction: 'Multiply across: numerators together, denominators together.' },
  3: { title: 'Simplifying Results', instruction: 'Multiply, then simplify your answer.' },
  4: { title: 'Mixed Practice', instruction: 'Multiply and simplify if needed.' },
  5: { title: 'Word Problems', instruction: 'Read carefully and multiply the fractions.' },
};

// ==================== INTERACTIVE VISUAL COMPONENT ====================

function InteractiveFractionMultiply({ fraction1, fraction2, result, showResult, onSlide }) {
  const [numeratorDropped, setNumeratorDropped] = useState(false);
  const [denominatorDropped, setDenominatorDropped] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Parse fractions from string like "3/4"
  const parseFraction = (str) => {
    if (!str) return { num: 1, den: 1 };
    const parts = String(str).split('/');
    return { num: parseInt(parts[0]) || 1, den: parseInt(parts[1]) || 1 };
  };

  const f1 = parseFraction(fraction1);
  const f2 = parseFraction(fraction2);

  // Always calculate the multiplication directly (don't simplify)
  const res = {
    num: f1.num * f2.num,
    den: f1.den * f2.den
  };

  // Drag handlers
  const handleDragStart = (type) => (e) => {
    setDraggedItem(type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropNumerator = (e) => {
    e.preventDefault();
    if (draggedItem === 'numerator') {
      setNumeratorDropped(true);
      setDraggedItem(null);
      if (onSlide) onSlide(1);
    }
  };

  const handleDropDenominator = (e) => {
    e.preventDefault();
    if (draggedItem === 'denominator') {
      setDenominatorDropped(true);
      setDraggedItem(null);
      if (onSlide) onSlide(2);
    }
  };

  const bothDropped = numeratorDropped && denominatorDropped;

  return (
    <VisualContainer>
      {/* Initial fractions with draggable tiles */}
      <FractionsGrid>
        {/* First Fraction */}
        <FractionColumn>
          <NumberTile
            color="#3B82F6"
            draggable={!numeratorDropped}
            onDragStart={handleDragStart('numerator')}
            isDragging={draggedItem === 'numerator'}
            disappeared={numeratorDropped}
          >
            {f1.num}
          </NumberTile>
          <FractionLineDiv />
          <NumberTile
            color="#8B5CF6"
            draggable={!denominatorDropped}
            onDragStart={handleDragStart('denominator')}
            isDragging={draggedItem === 'denominator'}
            disappeared={denominatorDropped}
          >
            {f1.den}
          </NumberTile>
        </FractionColumn>

        <MultiplySign>·</MultiplySign>

        {/* Second Fraction with drop zones */}
        <FractionColumn>
          <DropZone
            onDragOver={handleDragOver}
            onDrop={handleDropNumerator}
            isActive={draggedItem === 'numerator'}
            hasDropped={numeratorDropped}
          >
            <NumberTile color="#3B82F6">{f2.num}</NumberTile>
          </DropZone>
          <FractionLineDiv />
          <DropZone
            onDragOver={handleDragOver}
            onDrop={handleDropDenominator}
            isActive={draggedItem === 'denominator'}
            hasDropped={denominatorDropped}
          >
            <NumberTile color="#8B5CF6">{f2.den}</NumberTile>
          </DropZone>
        </FractionColumn>

        <EqualsSymbol style={{ fontSize: '48px', margin: '0 10px' }}>=</EqualsSymbol>

        {/* Result area */}
        <FractionColumn>
          {numeratorDropped ? (
            <NumberTile color="#10B981" result>
              {res.num}
            </NumberTile>
          ) : (
            <EmptyTile>?</EmptyTile>
          )}
          <FractionLineDiv />
          {denominatorDropped ? (
            <NumberTile color="#10B981" result>
              {res.den}
            </NumberTile>
          ) : (
            <EmptyTile>?</EmptyTile>
          )}
        </FractionColumn>
      </FractionsGrid>

      {/* Show final result when both dropped */}
      {bothDropped && showResult && (
        <ResultSection>
          <FinalAnswer>
            <InlineMath>{`\\frac{${res.num}}{${res.den}}`}</InlineMath>
          </FinalAnswer>
        </ResultSection>
      )}

      {/* Instruction hint */}
      {!numeratorDropped && !denominatorDropped && (
        <InstructionHint>
          Drag the blue tile to the blue tile, then drag the purple tile to the purple tile
        </InstructionHint>
      )}
      {numeratorDropped && !denominatorDropped && (
        <InstructionHint>
          Great! Now drag the purple tile to the purple tile
        </InstructionHint>
      )}
    </VisualContainer>
  );
}

// ==================== MAIN COMPONENT ====================

function MultiplyingFractionsLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const [showHint, setShowHint] = useState(false);
  const [, setSlideStage] = useState(0);
  const [showVisualHelper, setShowVisualHelper] = useState(true);

  // Hide visual helper after question 4 (index 3) unless explicitly shown
  useEffect(() => {
    if (currentQuestionIndex >= 4) {
      setShowVisualHelper(false);
    }
  }, [currentQuestionIndex]);

  // Current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const {
    question,
    answer,
    acceptedAnswers,
    hint,
    explanation,
    visualData,
    level,
    levelNum: levelNumStr
  } = currentProblem;

  // Get level number
  const levelNum = parseInt(levelNumStr || level || '1', 10);

  // Question text
  const questionText = question?.[0]?.text || question || '';

  // Parse fractions from question for visual display
  const fractionMatch = questionText.match(/(\d+\/\d+)\s*[×x]\s*(\d+\/\d+)/);
  const fraction1 = fractionMatch ? fractionMatch[1] : null;
  const fraction2 = fractionMatch ? fractionMatch[2] : null;

  // Format answer
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers?.length > 0) return acceptedAnswers;
    if (Array.isArray(answer)) return answer;
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  // Format question text with KaTeX
  const formattedQuestion = useMemo(() => {
    if (!questionText) return '';

    // For level 5 (word problems), only format fractions, not the whole thing
    if (levelNum === 5) {
      return questionText;
    }

    // For levels 3-4, replace fractions and multiplication symbols with KaTeX
    return questionText
      .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
      .replace(/×/g, '\\cdot')
      .replace(/x/g, '\\cdot');
  }, [questionText, levelNum]);

  // For level 5, parse and format only fractions within the text
  const renderWordProblem = (text) => {
    if (!text) return null;

    // Split by fractions and render inline KaTeX only for fractions
    const parts = [];
    let lastIndex = 0;
    const fractionRegex = /(\d+)\/(\d+)/g;
    let match;

    while ((match = fractionRegex.exec(text)) !== null) {
      // Add text before the fraction
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add the fraction as KaTeX
      parts.push(
        <InlineMath key={match.index}>
          {`\\frac{${match[1]}}{${match[2]}}`}
        </InlineMath>
      );
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Determine if visual helper should be shown
  const shouldShowVisual = (levelNum === 1 || levelNum === 2) &&
                          (currentQuestionIndex < 4 || showVisualHelper);

  // Event handlers
  const handleTryAnother = () => {
    setShowHint(false);
    setSlideStage(0);
    hideAnswer();
    triggerNewProblem();
  };

  const handleCorrectAnswer = () => {
    revealAnswer();
  };

  const handleSlide = (stage) => {
    setSlideStage(stage);
  };

  const handleShowHint = () => {
    setShowHint(true);
    setShowVisualHelper(true); // Show visual helper when hint is requested
  };

  const info = LEVEL_INFO[levelNum] || LEVEL_INFO[1];
  const needsSimplify = visualData?.needsSimplify;

  if (!currentProblem) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {/* Hint button - fixed top right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={handleShowHint}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {levelNum}</LevelBadge>
        <LevelTitle>{info.title}</LevelTitle>
      </LevelHeader>

      <InstructionText>{info.instruction}</InstructionText>

      {/* Question */}
      <QuestionSection>
        {levelNum === 5 ? (
          <QuestionTextWrapped>
            {renderWordProblem(questionText)}
          </QuestionTextWrapped>
        ) : (
          <QuestionTextKatex>
            <InlineMath>{formattedQuestion || questionText}</InlineMath>
          </QuestionTextKatex>
        )}
      </QuestionSection>

      {/* Interactive component for L1 & L2 (conditional after 4 questions) */}
      {(levelNum === 1 || levelNum === 2) && fraction1 && fraction2 && shouldShowVisual && (
        <InteractiveFractionMultiply
          key={currentQuestionIndex}
          fraction1={fraction1}
          fraction2={fraction2}
          result={answer}
          showResult={showAnswer}
          onSlide={handleSlide}
        />
      )}

      {/* Visual helper for simplification */}
      {needsSimplify && !showAnswer && levelNum >= 3 && (
        <HelperSection>
          <HelperCard>
            <HelperTitle>Remember:</HelperTitle>
            <HelperText>Simplify your answer by finding the greatest common divisor (GCD)</HelperText>
          </HelperCard>
        </HelperSection>
      )}

      {/* Interaction Section */}
      <InteractionSection>
        {showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}

        {!showAnswer && (
          <AnswerInputContainer>
            <AnswerInput
              correctAnswer={correctAnswer}
              answerType="array"
              onCorrect={handleCorrectAnswer}
              onTryAnother={handleTryAnother}
              disabled={showAnswer}
              placeholder="Enter fraction (e.g. 3/4)"
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

export default MultiplyingFractionsLesson;

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

  @media (max-width: 1024px) {
    padding: 16px;
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
  margin-bottom: 6px;
  width: 100%;
  justify-content: center;
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
`;

const InstructionText = styled.p`
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 12px 0;
  max-width: 700px;
`;

const QuestionSection = styled.div`
  margin-bottom: 24px;
  text-align: center;
  width: 100%;
  max-width: 700px;

  @media (max-width: 1024px) {
    margin-bottom: 20px;
  }
`;

const QuestionTextKatex = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.5;
  margin: 0;

  .katex {
    font-size: 1.1em;
  }

  @media (min-width: 768px) {
    font-size: 30px;
  }

  @media (max-width: 1024px) {
    font-size: 24px;
  }
`;

const QuestionTextWrapped = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin: 0;
  max-width: 100%;
  word-wrap: break-word;
  white-space: normal;

  .katex {
    font-size: 1.1em;
  }

  @media (min-width: 768px) {
    font-size: 22px;
  }

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const HelperSection = styled.div`
  width: 100%;
  max-width: 650px;
  margin-bottom: 20px;
`;

const HelperCard = styled.div`
  background-color: ${props => props.theme.colors.info}15;
  border-left: 4px solid ${props => props.theme.colors.info};
  border-radius: 8px;
  padding: 14px 18px;
`;

const HelperTitle = styled.h4`
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.colors.info};
`;

const HelperText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.5;
`;

const InteractionSection = styled.div`
  width: 100%;
  max-width: 650px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  @media (max-width: 1024px) {
    gap: 16px;
  }
`;

const HintBox = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.warning}18;
  border-left: 4px solid ${props => props.theme.colors.warning};
  padding: 16px;
  border-radius: 8px;
  font-size: 15px;
  color: ${props => props.theme.colors.textPrimary};

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
  background: ${props => props.theme.colors.buttonSuccess}18;
  border: 2px solid ${props => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 24px;

  @media (max-width: 1024px) {
    padding: 20px;
  }
`;

const ExplanationTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  color: ${props => props.theme.colors.buttonSuccess};
  font-weight: 700;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 20px 0;
  text-align: center;

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

// ==================== INTERACTIVE VISUAL STYLED COMPONENTS ====================

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const popIn = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const VisualContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 16px;
  padding: 30px;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const FractionsGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  min-height: 200px;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const FractionColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: ${props => props.theme.colors.inputBackground};
  border: 3px solid ${props => props.theme.colors.border};
  border-radius: 16px;
  animation: ${fadeIn} 0.5s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 15px;
    gap: 10px;
  }
`;

const NumberTile = styled.div`
  background: ${props => props.color || props.theme.colors.buttonSuccess};
  color: white;
  font-size: ${props => props.large ? '48px' : '36px'};
  font-weight: 800;
  padding: ${props => props.large ? '20px 30px' : '15px 25px'};
  border-radius: 12px;
  min-width: ${props => props.large ? '80px' : '70px'};
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: ${props => props.draggable ? 'grab' : 'default'};
  opacity: ${props => props.disappeared ? 0 : props.isDragging ? 0.4 : 1};
  transform: ${props => props.isDragging ? 'scale(1.05)' : 'scale(1)'};
  animation: ${props => props.result ? popIn : 'none'} 0.6s ease-in-out;
  transition: all 0.3s ease;
  user-select: none;

  &:active {
    cursor: ${props => props.draggable ? 'grabbing' : 'default'};
  }

  &:hover {
    ${props => props.draggable && `
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    `}
  }

  @media (max-width: 768px) {
    font-size: ${props => props.large ? '40px' : '30px'};
    padding: ${props => props.large ? '16px 24px' : '12px 20px'};
    min-width: ${props => props.large ? '70px' : '60px'};
  }
`;

const DropZone = styled.div`
  position: relative;
  padding: 5px;
  border-radius: 14px;
  border: ${props => props.isActive ? '3px dashed #10B981' : '3px dashed transparent'};
  background: ${props => props.isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent'};
  transition: all 0.3s ease;

  ${props => props.hasDropped && `
    border-color: #10B981;
    background: rgba(16, 185, 129, 0.15);
  `}
`;

const EmptyTile = styled.div`
  background: ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 36px;
  font-weight: 800;
  padding: 15px 25px;
  border-radius: 12px;
  min-width: 70px;
  text-align: center;
  opacity: 0.3;

  @media (max-width: 768px) {
    font-size: 30px;
    padding: 12px 20px;
    min-width: 60px;
  }
`;

const FractionLineDiv = styled.div`
  width: ${props => props.large ? '100px' : '80px'};
  height: 4px;
  background: ${props => props.theme.colors.textPrimary};
  margin: ${props => props.large ? '8px 0' : '4px 0'};
  border-radius: 2px;

  @media (max-width: 768px) {
    width: ${props => props.large ? '80px' : '65px'};
  }
`;

const MultiplySign = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: ${props => props.theme.colors.textSecondary};

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const InstructionHint = styled.div`
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.info};
  padding: 15px 20px;
  background: ${props => props.theme.colors.info}15;
  border-radius: 8px;
  margin-top: 20px;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px 16px;
  }
`;

const FinalAnswer = styled.div`
  font-size: 48px;
  animation: ${popIn} 0.8s ease-out;

  .katex {
    font-size: 1.2em;
  }

  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

const EqualsSymbol = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 36px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 30px;
  }
`;

const ResultSection = styled.div`
  margin: 30px 0;
  padding: 25px;
  background: ${props => props.theme.colors.buttonSuccess}18;
  border: 3px solid ${props => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;
