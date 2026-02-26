import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { useLessonState, useIsTouchDevice } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Multiply & Add", instruction: "Solve equations like ax + b = c" },
  2: { title: "Multiply & Add/Subtract", instruction: "Solve equations like ax ± b = c" },
  3: { title: "Divide & Add/Subtract", instruction: "Solve equations like x ÷ a ± b = c" },
  4: { title: "Mixed Equations", instruction: "Solve two-step equations with any operations" },
  5: { title: "Challenge", instruction: "Solve two-step equations — watch for negatives!" },
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

// ==================== MAIN COMPONENT ====================

function TwoStepEquations({ triggerNewProblem }) {
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

  // Phase state: "choose1" → "choose2" → "type" → "complete"
  const [phase, setPhase] = useState("choose1");
  const [selected1, setSelected1] = useState(null);
  const [selected2, setSelected2] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    equation = "",
    answer: xAnswer = 0,
    step1Choices: rawStep1Choices = null,
    step1CorrectText = "",
    intermediateStep = "",
    intermediateEquation = "",
    step2Choices: rawStep2Choices = null,
    step2CorrectText = "",
    finalStep = "",
    simplifiedEquation = "",
    verification = "",
  } = visualData;

  const step1Choices = rawStep1Choices || [];
  const step2Choices = rawStep2Choices || [];
  const hint = currentProblem?.hint || "";

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (currentProblem?.answer) return currentProblem.answer;
    return [String(xAnswer)];
  }, [currentProblem, xAnswer]);

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Reset on problem change
  const problemKey = `${equation}-${level}-${currentQuestionIndex}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("choose1");
    setSelected1(null);
    setSelected2(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("choose1");
    setSelected1(null);
    setSelected2(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  const handleStep1Click = useCallback((choice, idx) => {
    if (phase !== "choose1" || shakingIdx !== null) return;

    if (choice.correct) {
      setSelected1(idx);
      setTimeout(() => {
        setPhase("choose2");
      }, 800);
    } else {
      setShakingIdx(idx);
      setWrongAttempts((prev) => prev + 1);
      setTimeout(() => {
        setShakingIdx(null);
      }, 600);
    }
  }, [phase, shakingIdx]);

  const handleStep2Click = useCallback((choice, idx) => {
    if (phase !== "choose2" || shakingIdx !== null) return;

    if (choice.correct) {
      setSelected2(idx);
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

  if (!equation) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

  // Which choices and handler to show
  const isChoose1 = phase === "choose1";
  const isChoose2 = phase === "choose2";
  const currentChoices = isChoose1 ? step1Choices : step2Choices;
  const currentSelected = isChoose1 ? selected1 : selected2;
  const currentHandler = isChoose1 ? handleStep1Click : handleStep2Click;

  return (
    <Wrapper>
      {/* Hint Button */}
      {(isChoose1 || isChoose2) && !showHint && hint && (
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

      {/* Equation Display */}
      <EquationDisplay>{equation}</EquationDisplay>

      {/* Step 1 result shown during choose2 and later */}
      {!isChoose1 && (
        <CompletedStep>
          <StepLabel $color="info">Step 1: {step1CorrectText}</StepLabel>
          <StepEquation>{intermediateStep}</StepEquation>
          <StepResult>{intermediateEquation}</StepResult>
        </CompletedStep>
      )}

      {/* Phase: Choose 1 or Choose 2 */}
      {(isChoose1 || isChoose2) && (
        <ChooseSection>
          {showHint && hint && (
            <HintBox>{hint}</HintBox>
          )}

          <ChoosePrompt>
            {isChoose1 ? "What's the first step?" : "What's the next step?"}
          </ChoosePrompt>

          {wrongAttempts > 0 && shakingIdx === null && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}

          <ChoiceGrid>
            {currentChoices.map((choice, idx) => {
              const isSelected = currentSelected === idx;
              const isCorrectSelected = isSelected && choice.correct;
              const isShaking = shakingIdx === idx;
              const isFaded = currentSelected !== null && !isSelected;

              return (
                <ChoiceButton
                  key={idx}
                  $correct={isCorrectSelected}
                  $wrong={isShaking}
                  $fadeOut={isFaded}
                  $isTouchDevice={isTouchDevice}
                  onClick={() => currentHandler(choice, idx)}
                  disabled={currentSelected !== null || isShaking}
                >
                  {choice.text}
                  {isCorrectSelected && " ✓"}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        </ChooseSection>
      )}

      {/* Phase: Type the answer */}
      {phase === "type" && (
        <TypeSection>
          <CompletedStep>
            <StepLabel $color="success">Step 2: {step2CorrectText}</StepLabel>
            <StepEquation>{finalStep}</StepEquation>
          </CompletedStep>

          <SimplifiedDisplay>
            x = ?
          </SimplifiedDisplay>

          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={handleCorrectAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="Enter the value of x"
          />
        </TypeSection>
      )}

      {/* Phase: Complete — explanation */}
      {phase === "complete" && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>

          <StepByStep>
            <StepRow>
              <StepNum>1</StepNum>
              <StepContent>Start with: <strong>{equation}</strong></StepContent>
            </StepRow>
            <StepRow>
              <StepNum>2</StepNum>
              <StepContent>{step1CorrectText}</StepContent>
            </StepRow>
            <StepRow>
              <StepNum>3</StepNum>
              <StepContent>{intermediateStep} → <strong>{intermediateEquation}</strong></StepContent>
            </StepRow>
            <StepRow>
              <StepNum>4</StepNum>
              <StepContent>{step2CorrectText}</StepContent>
            </StepRow>
            <StepRow>
              <StepNum>5</StepNum>
              <StepContent>{finalStep} → <strong>{simplifiedEquation}</strong></StepContent>
            </StepRow>
          </StepByStep>

          <VerificationBox>
            Check: {verification}
          </VerificationBox>

          <TryAnotherButton onClick={handleTryAnother}>
            Try Another Problem
          </TryAnotherButton>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default TwoStepEquations;

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

const EquationDisplay = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  margin: 12px 0 20px 0;
  padding: 20px 32px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 12px;
  font-family: "Georgia", serif;
  letter-spacing: 2px;

  @media (min-width: 768px) {
    font-size: 40px;
    padding: 24px 40px;
  }
`;

const CompletedStep = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-left: 4px solid ${(props) => props.theme.colors.info || "#3B82F6"};
  padding: 12px 18px;
  border-radius: 4px;
  margin-bottom: 12px;
  animation: ${fadeInAnim} 0.3s ease;
`;

const StepLabel = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) =>
    props.$color === "success"
      ? props.theme.colors.buttonSuccess
      : props.theme.colors.info || "#3B82F6"};
  margin: 0 0 4px 0;
`;

const StepEquation = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
  font-family: "Georgia", serif;
  letter-spacing: 1px;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const StepResult = styled.p`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 6px 0 0 0;
  font-family: "Georgia", serif;
  letter-spacing: 1px;

  @media (min-width: 768px) {
    font-size: 22px;
  }
`;

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
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 420px;
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

const SimplifiedDisplay = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: "Georgia", serif;
  letter-spacing: 2px;

  @media (min-width: 768px) {
    font-size: 32px;
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

const StepByStep = styled.div`
  width: 100%;
  max-width: 500px;
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
