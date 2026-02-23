import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { useLessonState, useIsTouchDevice } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Simple Growing Patterns", instruction: "Find the pattern in the growing sequence" },
  2: { title: "Larger Patterns", instruction: "Spot the rule — numbers may increase or decrease" },
  3: { title: "Patterns with Negatives", instruction: "Find the pattern — negative numbers included" },
  4: { title: "Multiplication Patterns", instruction: "The pattern involves multiplying" },
  5: { title: "Mixed Patterns", instruction: "Could be adding, subtracting, or multiplying" },
};

// ==================== BLOCK COLORS ====================

const BLOCK_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

function getBlockColor(termIndex) {
  return BLOCK_COLORS[termIndex % BLOCK_COLORS.length];
}

// Layout helper: arrange count blocks in roughly square grid
function getBlockGrid(count) {
  if (count <= 0) return { cols: 1, rows: 1 };
  if (count <= 4) return { cols: count, rows: 1 };
  if (count <= 8) return { cols: 4, rows: Math.ceil(count / 4) };
  if (count <= 12) return { cols: 4, rows: Math.ceil(count / 4) };
  return { cols: 5, rows: Math.ceil(count / 5) };
}

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

const popInAnim = keyframes`
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1); }
`;

// ==================== VISUAL SEQUENCE COMPONENT ====================

function VisualSequence({ sequence, nextValue, showNext, phase }) {
  return (
    <SequenceRow>
      {sequence.map((val, i) => {
        const grid = getBlockGrid(val);
        const color = getBlockColor(i);
        return (
          <TermGroupWrapper key={i}>
            <TermGroup>
              <BlockGrid $cols={grid.cols}>
                {Array.from({ length: val }, (_, b) => (
                  <Block key={b} $color={color} />
                ))}
              </BlockGrid>
            </TermGroup>
            <TermLabel>{val}</TermLabel>
            {i < sequence.length - 1 && <Arrow>→</Arrow>}
          </TermGroupWrapper>
        );
      })}

      {/* Arrow before the mystery/answer term */}
      <ArrowStandalone>→</ArrowStandalone>

      {/* Mystery term */}
      <TermGroupWrapper>
        {showNext ? (
          <TermGroup $popIn>
            <BlockGrid $cols={getBlockGrid(nextValue).cols}>
              {Array.from({ length: nextValue }, (_, b) => (
                <Block key={b} $color={getBlockColor(4)} />
              ))}
            </BlockGrid>
          </TermGroup>
        ) : (
          <MissingTermBox>?</MissingTermBox>
        )}
        <TermLabel>{showNext ? nextValue : "?"}</TermLabel>
      </TermGroupWrapper>
    </SequenceRow>
  );
}

// ==================== NUMERIC SEQUENCE COMPONENT ====================

function NumericSequence({ sequence, nextValue, showNext }) {
  return (
    <NumericRow>
      {sequence.map((val, i) => (
        <NumericTermWrapper key={i}>
          <NumericTerm>{val}</NumericTerm>
          {i < sequence.length - 1 && <NumericArrow>,</NumericArrow>}
        </NumericTermWrapper>
      ))}
      <NumericTermWrapper>
        <NumericArrow>,</NumericArrow>
        {showNext ? (
          <NumericTerm $highlight>{nextValue}</NumericTerm>
        ) : (
          <NumericMissing>?</NumericMissing>
        )}
      </NumericTermWrapper>
    </NumericRow>
  );
}

// ==================== MAIN COMPONENT ====================

function PatternsLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { isTouchDevice } = useIsTouchDevice();
  const [showHint, setShowHint] = useState(false);

  // Phase state: "choose" → "type" → "complete"
  const [phase, setPhase] = useState("choose");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    sequence: rawSequence = null,
    nextValue = 0,
    patternType = "arithmetic",
    rule = "",
    ruleText = "",
    isVisual = false,
    choices: rawChoices = null,
    steps: rawSteps = null,
    verification = "",
  } = visualData;

  const sequence = rawSequence || [];
  const choices = rawChoices || [];
  const steps = rawSteps || [];
  const hint = currentProblem?.hint || "";

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (currentProblem?.answer) return currentProblem.answer;
    return [String(nextValue)];
  }, [currentProblem, nextValue]);

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Reset on problem change
  const problemKey = `${sequence.join(",")}-${level}-${currentQuestionIndex}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("choose");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("choose");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  const handleChoiceClick = useCallback((choice, idx) => {
    if (phase !== "choose" || shakingIdx !== null) return;

    if (choice.correct) {
      setSelectedChoice(idx);
      setTimeout(() => {
        setPhase("type");
      }, 800);
    } else {
      setShakingIdx(idx);
      setWrongAttempts((prev) => prev + 1);
      setTimeout(() => {
        setShakingIdx(null);
      }, 600);
    }
  }, [phase, shakingIdx]);

  const handleCorrectAnswer = useCallback(() => {
    setPhase("complete");
    revealAnswer();
  }, [revealAnswer]);

  if (sequence.length === 0) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

  return (
    <Wrapper>
      {/* Hint Button */}
      {phase === "choose" && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level Header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{levelInfo.title}</LevelTitle>
      </LevelHeader>
      <InstructionText>{levelInfo.instruction}</InstructionText>

      {/* Sequence Display */}
      <SequenceContainer>
        {isVisual ? (
          <VisualSequence
            sequence={sequence}
            nextValue={nextValue}
            showNext={phase === "complete"}
            phase={phase}
          />
        ) : (
          <NumericSequence
            sequence={sequence}
            nextValue={nextValue}
            showNext={phase === "complete"}
          />
        )}
      </SequenceContainer>

      {/* Phase 1: Choose the pattern rule */}
      {phase === "choose" && (
        <ChooseSection>
          {showHint && hint && (
            <HintBox>{hint}</HintBox>
          )}

          <ChoosePrompt>What's the pattern?</ChoosePrompt>

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
                  {isCorrectSelected && " ✓"}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        </ChooseSection>
      )}

      {/* Phase 2: Type the next number */}
      {phase === "type" && (
        <TypeSection>
          <StepDisplay>
            <StepLabel>Pattern found:</StepLabel>
            <StepEquation>{ruleText}</StepEquation>
          </StepDisplay>

          <SimplifiedDisplay>
            What comes next?
          </SimplifiedDisplay>

          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={handleCorrectAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="Enter the next number"
          />
        </TypeSection>
      )}

      {/* Phase 3: Complete — explanation */}
      {phase === "complete" && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>

          <RuleDisplay>
            Pattern: <strong>{ruleText}</strong>
          </RuleDisplay>

          <StepByStep>
            {steps.map((step, i) => (
              <StepRow key={i}>
                <StepNum>{i + 1}</StepNum>
                <StepContent>{step}</StepContent>
              </StepRow>
            ))}
          </StepByStep>

          <VerificationBox>
            {verification}
          </VerificationBox>

          <TryAnotherButton onClick={handleTryAnother}>
            Try Another Pattern
          </TryAnotherButton>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default PatternsLesson;

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
  color: ${(props) => props.theme.colors.textSecondary};
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
  margin: 0 0 8px 0;
  max-width: 700px;
`;

// ==================== SEQUENCE DISPLAY ====================

const SequenceContainer = styled.div`
  width: 100%;
  margin: 12px 0 24px 0;
  padding: 20px 16px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
  overflow-x: auto;
  display: flex;
  justify-content: center;
`;

// --- Visual blocks (L1-2) ---

const SequenceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
`;

const TermGroupWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TermGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  ${(props) =>
    props.$popIn &&
    css`
      animation: ${popInAnim} 0.4s ease;
    `}
`;

const BlockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$cols || 1}, 18px);
  gap: 3px;
`;

const Block = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 3px;
  background-color: ${(props) => props.$color || "#3B82F6"};

  @media (min-width: 768px) {
    width: 22px;
    height: 22px;
  }
`;

const TermLabel = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-top: 4px;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const Arrow = styled.span`
  font-size: 20px;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0 2px;
`;

const ArrowStandalone = styled.span`
  font-size: 20px;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0 4px;
  align-self: center;
`;

const MissingTermBox = styled.div`
  min-width: 40px;
  min-height: 40px;
  border: 3px dashed ${(props) => props.theme.colors.border};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textSecondary};

  @media (min-width: 768px) {
    min-width: 50px;
    min-height: 50px;
    font-size: 28px;
  }
`;

// --- Numeric display (L3-5) ---

const NumericRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
`;

const NumericTermWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NumericTerm = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: ${(props) => props.$highlight
    ? props.theme.colors.buttonSuccess
    : props.theme.colors.textPrimary};
  font-family: "Georgia", serif;
  letter-spacing: 1px;
  ${(props) =>
    props.$highlight &&
    css`
      animation: ${popInAnim} 0.4s ease;
    `}

  @media (min-width: 768px) {
    font-size: 40px;
  }
`;

const NumericArrow = styled.span`
  font-size: 28px;
  color: ${(props) => props.theme.colors.textSecondary};

  @media (min-width: 768px) {
    font-size: 36px;
  }
`;

const NumericMissing = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textSecondary};
  font-family: "Georgia", serif;
  border-bottom: 3px dashed ${(props) => props.theme.colors.border};
  padding: 0 8px;

  @media (min-width: 768px) {
    font-size: 40px;
  }
`;

// ==================== INTERACTION SECTIONS ====================

const ChooseSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: ${fadeInAnim} 0.3s ease;
`;

const ChoosePrompt = styled.p`
  font-size: 17px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
`;

const ChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  margin-top: 4px;
`;

const ChoiceButton = styled.button`
  width: 100%;
  padding: ${(props) => (props.$isTouchDevice ? "16px 20px" : "13px 20px")};
  font-size: ${(props) => (props.$isTouchDevice ? "17px" : "16px")};
  font-weight: 600;
  border-radius: 10px;
  border: 2px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.cardBackground};
  color: ${(props) => props.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.hoverBackground};
    border-color: ${(props) => props.theme.colors.info || "#3B82F6"};
  }

  ${(props) =>
    props.$correct &&
    css`
      background-color: ${props.theme.colors.buttonSuccess}20;
      border-color: ${props.theme.colors.buttonSuccess};
      color: ${props.theme.colors.buttonSuccess};
      cursor: default;
    `}

  ${(props) =>
    props.$wrong &&
    css`
      animation: ${shakeAnim} 0.5s ease;
      background-color: ${props.theme.colors.danger || "#E53E3E"}15;
      border-color: ${props.theme.colors.danger || "#E53E3E"};
    `}

  ${(props) =>
    props.$fadeOut &&
    css`
      opacity: 0;
      transform: scale(0.95);
      pointer-events: none;
      transition: all 0.4s ease;
    `}

  &:disabled {
    cursor: default;
  }
`;

const FeedbackText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) =>
    props.$isWrong
      ? props.theme.colors.danger || "#E53E3E"
      : props.theme.colors.buttonSuccess};
  margin: 0;
`;

const TypeSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${fadeInAnim} 0.4s ease;
`;

const StepDisplay = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-left: 4px solid ${(props) => props.theme.colors.info || "#3B82F6"};
  padding: 14px 18px;
  border-radius: 4px;
`;

const StepLabel = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.info || "#3B82F6"};
  margin: 0 0 6px 0;
`;

const StepEquation = styled.p`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
  font-family: "Georgia", serif;
  letter-spacing: 1px;

  @media (min-width: 768px) {
    font-size: 24px;
  }
`;

const SimplifiedDisplay = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: "Georgia", serif;
  letter-spacing: 1px;

  @media (min-width: 768px) {
    font-size: 28px;
  }
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${fadeInAnim} 0.4s ease;
`;

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.buttonSuccess};
  margin: 0;
`;

const RuleDisplay = styled.div`
  font-size: 18px;
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: "Georgia", serif;

  strong {
    color: ${(props) => props.theme.colors.info || "#3B82F6"};
  }
`;

const StepByStep = styled.div`
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StepRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StepNum = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.info || "#3B82F6"};
  color: ${(props) => props.theme.colors.textInverted};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
`;

const StepContent = styled.span`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textPrimary};
  line-height: 1.5;
  font-family: "Georgia", serif;

  strong {
    font-weight: 700;
  }
`;

const VerificationBox = styled.div`
  background-color: ${(props) => props.theme.colors.buttonSuccess}15;
  border: 1px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.buttonSuccess};
  font-family: "Georgia", serif;
`;

const TryAnotherButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  touch-action: manipulation;

  &:hover {
    opacity: 0.9;
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
  border-left: 4px solid ${(props) => props.theme.colors.warning || "#f6ad55"};
  padding: 14px 16px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
`;
