import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import katex from 'katex';
import { useLessonState } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: {
    title: 'Order of Operations',
    instruction: 'Click the operation that should be done first.',
  },
  2: {
    title: 'Parentheses & Operations',
    instruction: 'Click the operations in the correct PEMDAS order.',
  },
  3: {
    title: 'Exponents & More',
    instruction: 'Click the operations in the correct PEMDAS order.',
  },
  4: {
    title: 'Evaluate the Expression',
    instruction: 'Find the value of the expression using PEMDAS.',
  },
};

// ==================== HELPERS ====================

function getDisplayOp(op) {
  const map = { '+': '+', '-': '\u2212', '*': '\u00D7', '/': '\u00F7', '^': '^' };
  return map[op] || op;
}

function getOperatorIndexInTokens(tokens, absoluteIndex) {
  let count = 0;
  for (let i = 0; i < absoluteIndex; i++) {
    if (tokens[i].type === 'operator') count++;
  }
  return count;
}

function tokensToKatex(tokens) {
  return tokens.map(t => {
    if (t.type === 'operator') {
      if (t.value === '*') return ' \\times ';
      if (t.value === '/') return ' \\div ';
      if (t.value === '^') return '^';
      return ` ${t.value} `;
    }
    if (t.type === 'paren') {
      return t.value === '(' ? '\\left(' : '\\right)';
    }
    return t.value;
  }).join('');
}

// ==================== KATEX COMPONENT (Level 4) ====================

function KaTeXExpression({ expression, tokens }) {
  const containerRef = useRef();
  useEffect(() => {
    if (containerRef.current) {
      const tex = tokens ? tokensToKatex(tokens) : expression;
      katex.render(tex, containerRef.current, {
        throwOnError: false,
        displayMode: true,
      });
    }
  }, [expression, tokens]);
  return <KaTeXContainer ref={containerRef} />;
}

// ==================== INTERACTIVE TOKEN DISPLAY (Levels 1-3) ====================

function TokenDisplay({ tokens, steps, currentStep, isComplete, isAnimating, onOperatorClick, shakeOpIndex }) {
  // Group tokens for rendering, handling exponents specially
  const elements = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    // Check for exponent pattern: number ^ number
    if (
      token.type === 'number' &&
      tokens[i + 1]?.type === 'operator' && tokens[i + 1]?.value === '^' &&
      tokens[i + 2]?.type === 'number'
    ) {
      const opIdx = getOperatorIndexInTokens(tokens, i + 1);
      const isShaking = shakeOpIndex === opIdx;
      const isClickable = !isComplete && !isAnimating;

      elements.push(
        <ExponentGroup
          key={`exp-${i}`}
          onClick={() => isClickable && onOperatorClick(opIdx)}
          $clickable={isClickable}
          $shake={isShaking}
          title="Click to evaluate this exponent"
        >
          {token.value}<sup>{tokens[i + 2].value}</sup>
        </ExponentGroup>
      );
      i += 3;
      continue;
    }

    if (token.type === 'number') {
      elements.push(<NumberToken key={`num-${i}`}>{token.value}</NumberToken>);
    } else if (token.type === 'paren') {
      elements.push(<ParenToken key={`paren-${i}`}>{token.value}</ParenToken>);
    } else if (token.type === 'operator') {
      const opIdx = getOperatorIndexInTokens(tokens, i);
      const isShaking = shakeOpIndex === opIdx;
      const isClickable = !isComplete && !isAnimating;

      elements.push(
        <OperatorButton
          key={`op-${i}`}
          onClick={() => isClickable && onOperatorClick(opIdx)}
          $shake={isShaking}
          $clickable={isClickable}
          $opType={token.value}
          title={`Click to evaluate this operation`}
        >
          {getDisplayOp(token.value)}
        </OperatorButton>
      );
    }
    i++;
  }

  return <TokenRow>{elements}</TokenRow>;
}

// ==================== CORE COMPONENT ====================

function OrderOfOperations({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const { level, mode, tokens, steps, finalAnswer } = visualData;
  const hint = currentProblem?.hint || '';
  const explanation = currentProblem?.explanation || '';

  // Interactive state (L1-L3)
  const [currentStep, setCurrentStep] = useState(0);
  const [displayTokens, setDisplayTokens] = useState([]);
  const [shakeOpIndex, setShakeOpIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Reset when problem changes
  useEffect(() => {
    if (tokens) {
      setDisplayTokens(tokens.map(t => ({ ...t })));
    }
    setCurrentStep(0);
    setShakeOpIndex(null);
    setIsAnimating(false);
    setIsComplete(false);
    setShowHint(false);
    setCompletedSteps([]);
  }, [currentProblem]);

  // Level 4 answer
  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (Array.isArray(currentProblem?.answer)) return currentProblem.answer;
    return [String(finalAnswer || '')];
  }, [currentProblem, finalAnswer]);

  const handleOperatorClick = useCallback((clickedOpIndex) => {
    if (isAnimating || isComplete || !steps || currentStep >= steps.length) return;

    const step = steps[currentStep];

    if (clickedOpIndex === step.correctOpIndex) {
      // Correct!
      setIsAnimating(true);
      setCompletedSteps(prev => [...prev, step]);

      setTimeout(() => {
        setDisplayTokens(step.tokensAfter.map(t => ({ ...t })));
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setIsAnimating(false);

        if (nextStep >= steps.length) {
          setIsComplete(true);
          revealAnswer();
        }
      }, 400);
    } else {
      // Wrong
      setShakeOpIndex(clickedOpIndex);
      setTimeout(() => setShakeOpIndex(null), 600);
    }
  }, [isAnimating, isComplete, steps, currentStep, revealAnswer]);

  const handleTryAnother = () => {
    setShowHint(false);
    hideAnswer();
    triggerNewProblem();
  };

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  if (!currentProblem || !visualData?.level) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

  const isInteractive = mode === 'interactive';

  return (
    <Wrapper>
      {/* Hint button */}
      {!showAnswer && !isComplete && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>Need a hint?</TopHintButton>
      )}

      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{info.title}</LevelTitle>
      </LevelHeader>

      <InstructionText>{info.instruction}</InstructionText>

      {/* Expression Section */}
      <VisualSection>
        {isInteractive ? (
          <>
            <StaticExpression>
              <KaTeXExpression tokens={tokens} />
            </StaticExpression>

            <TokenDisplay
              tokens={displayTokens}
              steps={steps}
              currentStep={currentStep}
              isComplete={isComplete}
              isAnimating={isAnimating}
              onOperatorClick={handleOperatorClick}
              shakeOpIndex={shakeOpIndex}
            />

            {/* Step progress */}
            {steps && steps.length > 0 && !isComplete && (
              <ProgressText>
                Step {currentStep + 1} of {steps.length}
              </ProgressText>
            )}

            {/* Completed steps log */}
            {completedSteps.length > 0 && !isComplete && (
              <StepLog>
                {completedSteps.map((s, i) => (
                  <StepLogItem key={i}>
                    {s.operandLeft} {getDisplayOp(s.operator)} {s.operandRight} = {s.result}
                  </StepLogItem>
                ))}
              </StepLog>
            )}

            {/* Success message */}
            {isComplete && (
              <SuccessBanner>
                = {finalAnswer}
              </SuccessBanner>
            )}
          </>
        ) : (
          /* Level 4: KaTeX display */
          <KaTeXExpression expression={visualData.expression} tokens={tokens} />
        )}
      </VisualSection>

      {/* Interaction Section */}
      <InteractionSection>
        {!showAnswer && !isComplete && showHint && <HintBox>{hint}</HintBox>}

        {/* Level 4: Type answer */}
        {!isInteractive && (
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="Enter the final answer"
          />
        )}

        {/* Interactive levels: Try Another after completion */}
        {isInteractive && isComplete && (
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another Problem
          </TryAnotherButton>
        )}
      </InteractionSection>

      {/* Explanation Section */}
      {(showAnswer || isComplete) && (
        <ExplanationSection>
          <ExplanationTitle>Solution Steps</ExplanationTitle>
          {steps && steps.map((step, i) => (
            <StepRow key={i}>
              <StepNumber>Step {i + 1}:</StepNumber>
              <StepText>{step.explanation}</StepText>
            </StepRow>
          ))}

          <PEMDASBox>
            <PEMDASTitle>PEMDAS Rule</PEMDASTitle>
            <PEMDASItem><PEMDASLetter>P</PEMDASLetter> Parentheses first</PEMDASItem>
            <PEMDASItem><PEMDASLetter>E</PEMDASLetter> Exponents</PEMDASItem>
            <PEMDASItem><PEMDASLetter>MD</PEMDASLetter> Multiply and Divide (left to right)</PEMDASItem>
            <PEMDASItem><PEMDASLetter>AS</PEMDASLetter> Add and Subtract (left to right)</PEMDASItem>
          </PEMDASBox>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default OrderOfOperations;

// ==================== ANIMATIONS ====================

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  15%, 45%, 75% { transform: translateX(-4px); }
  30%, 60%, 90% { transform: translateX(4px); }
`;

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
  padding: 30px 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 60px;
`;

const NumberToken = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  padding: 8px 12px;
  border-radius: 8px;
  background-color: ${props => props.theme.colors.pageBackground};
  font-family: 'Courier New', Courier, monospace;

  @media (max-width: 600px) {
    font-size: 22px;
    padding: 6px 8px;
  }
`;

const OperatorButton = styled.button`
  font-size: 26px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 10px;
  border: 2px solid transparent;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.15s ease;
  font-family: 'Courier New', Courier, monospace;
  background-color: ${props => {
    if (props.$opType === '*' || props.$opType === '/') return (props.theme.colors.info || '#3B82F6') + '18';
    if (props.$opType === '+' || props.$opType === '-') return (props.theme.colors.buttonSuccess || '#48BB78') + '18';
    return props.theme.colors.pageBackground;
  }};
  color: ${props => {
    if (props.$opType === '*' || props.$opType === '/') return props.theme.colors.info || '#3B82F6';
    if (props.$opType === '+' || props.$opType === '-') return props.theme.colors.buttonSuccess || '#48BB78';
    return props.theme.colors.textPrimary;
  }};
  border-color: ${props => {
    if (props.$opType === '*' || props.$opType === '/') return (props.theme.colors.info || '#3B82F6') + '40';
    if (props.$opType === '+' || props.$opType === '-') return (props.theme.colors.buttonSuccess || '#48BB78') + '40';
    return props.theme.colors.border;
  }};

  ${props => props.$clickable && css`
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  `}

  ${props => props.$shake && css`
    animation: ${shakeAnimation} 0.5s ease;
    background-color: ${props.theme.colors.danger || '#E53E3E'}20;
    border-color: ${props.theme.colors.danger || '#E53E3E'};
    color: ${props.theme.colors.danger || '#E53E3E'};
  `}

  @media (max-width: 600px) {
    font-size: 20px;
    padding: 6px 10px;
  }
`;

const ExponentGroup = styled.button`
  font-size: 28px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 10px;
  border: 2px solid ${props => (props.theme.colors.warning || '#9F7AEA') + '40'};
  background-color: ${props => (props.theme.colors.warning || '#9F7AEA') + '18'};
  color: ${props => props.theme.colors.warning || '#9F7AEA'};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.15s ease;
  font-family: 'Courier New', Courier, monospace;

  sup {
    font-size: 18px;
    vertical-align: super;
    line-height: 0;
  }

  ${props => props.$clickable && css`
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  `}

  ${props => props.$shake && css`
    animation: ${shakeAnimation} 0.5s ease;
    background-color: ${props.theme.colors.danger || '#E53E3E'}20;
    border-color: ${props.theme.colors.danger || '#E53E3E'};
    color: ${props.theme.colors.danger || '#E53E3E'};
  `}

  @media (max-width: 600px) {
    font-size: 22px;
    padding: 6px 10px;
    sup { font-size: 14px; }
  }
`;

const ParenToken = styled.span`
  font-size: 32px;
  font-weight: 300;
  color: ${props => props.theme.colors.textSecondary};
  padding: 0 2px;
  font-family: 'Courier New', Courier, monospace;

  @media (max-width: 600px) {
    font-size: 24px;
  }
`;

const ProgressText = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const StepLog = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
`;

const StepLogItem = styled.span`
  font-size: 13px;
  color: ${props => props.theme.colors.buttonSuccess};
  background-color: ${props => (props.theme.colors.buttonSuccess || '#48BB78') + '15'};
  padding: 4px 10px;
  border-radius: 12px;
  font-family: 'Courier New', Courier, monospace;
`;

const SuccessBanner = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${props => props.theme.colors.buttonSuccess};
  padding: 8px 0;
`;

const StaticExpression = styled.div`
  opacity: 0.6;
  margin-bottom: 4px;

  .katex { font-size: 22px; }

  @media (max-width: 600px) {
    .katex { font-size: 18px; }
  }
`;

const KaTeXContainer = styled.div`
  .katex { font-size: 28px; }
  color: ${props => props.theme.colors.textPrimary};

  @media (max-width: 600px) {
    .katex { font-size: 22px; }
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

const TryAnotherButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  transition: opacity 0.2s;

  &:hover { opacity: 0.9; }
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
  margin: 0 0 12px 0;
`;

const StepRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  align-items: baseline;
`;

const StepNumber = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
`;

const StepText = styled.span`
  font-size: 15px;
  line-height: 1.5;
  color: ${props => props.theme.colors.textPrimary};
`;

const PEMDASBox = styled.div`
  background-color: ${props => props.theme.colors.pageBackground};
  border-radius: 8px;
  padding: 14px 16px;
  margin-top: 16px;
`;

const PEMDASTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const PEMDASItem = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PEMDASLetter = styled.span`
  font-weight: 800;
  color: ${props => props.theme.colors.info || '#3B82F6'};
  min-width: 28px;
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
