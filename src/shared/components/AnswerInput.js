import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { setUserAnswer, setAnswerFeedback, recordAnswer } from "../../store/lessonSlice";
import { validateAnswer } from "../helpers/validateAnswer";
import { useIsTouchDevice } from "../../hooks";
import MathKeypad from "./MathKeypad";

const AnswerInput = ({
  correctAnswer,
  answerType = "number",
  onCorrect,
  onTryAnother,
  placeholder = "Enter your answer",
  disabled = false,
  tryAnotherText = "Try Another Problem",
}) => {
  const dispatch = useDispatch();
  const userAnswer = useSelector((state) => state.lesson.userAnswer);
  const answerFeedback = useSelector((state) => state.lesson.answerFeedback);
  const lessonName = useSelector((state) => state.lesson.lessonProps.lessonName);
  // Phase 2.5: Check if we're in batch mode to track accuracy
  const isUsingBatch = useSelector(
    (state) => state.lesson.questionAnswerArray && state.lesson.questionAnswerArray.length > 0
  );
  const { isTouchDevice } = useIsTouchDevice();
  const [localInput, setLocalInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [keypadOpen, setKeypadOpen] = useState(false);
  const inputRef = useRef(null);

  // Sync local input with Redux state
  useEffect(() => {
    setLocalInput(userAnswer);
  }, [userAnswer]);

  // Reset local input and attempts when feedback is cleared (new problem)
  useEffect(() => {
    if (answerFeedback === null) {
      setLocalInput("");
    }
  }, [answerFeedback]);

  // Reset attempts when correctAnswer changes (new problem)
  useEffect(() => {
    setAttempts(0);
  }, [correctAnswer]);

  // Scroll input into view when keypad opens on touch devices
  useEffect(() => {
    if (keypadOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350); // Wait for keypad slide-up animation
    }
  }, [keypadOpen]);

  // Auto-clear wrong answers after 2 seconds
  useEffect(() => {
    if (answerFeedback === "incorrect") {
      const timer = setTimeout(() => {
        setLocalInput("");
        dispatch(setUserAnswer(""));
        dispatch(setAnswerFeedback(null));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [answerFeedback, dispatch]);

  const handleInputChange = (e) => {
    setLocalInput(e.target.value);
    dispatch(setUserAnswer(e.target.value));
  };

  const handleKeypadChange = (newValue) => {
    setLocalInput(newValue);
    dispatch(setUserAnswer(newValue));
  };

  const handleSubmit = () => {
    if (!localInput.trim()) return;

    const isCorrect = validateAnswer(localInput, correctAnswer, answerType, lessonName);
    setAttempts((prev) => prev + 1);
    dispatch(setAnswerFeedback(isCorrect ? "correct" : "incorrect"));

    // Phase 2.5: Record answer for batch accuracy tracking
    if (isUsingBatch) {
      dispatch(recordAnswer({ isCorrect }));
    }

    if (isCorrect && onCorrect) {
      onCorrect();
    }
  };

  const handleRetry = () => {
    // Clear input and feedback for retry
    setLocalInput("");
    dispatch(setUserAnswer(""));
    dispatch(setAnswerFeedback(null));
  };

  const handleTryAnother = () => {
    setLocalInput("");
    setAttempts(0);
    dispatch(setUserAnswer(""));
    dispatch(setAnswerFeedback(null));
    if (onTryAnother) {
      onTryAnother();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (answerFeedback === "incorrect") {
        handleRetry();
      } else if (answerFeedback !== "correct") {
        handleSubmit();
      }
    }
  };

  const isInTryAgainMode = answerFeedback === "correct" && onTryAnother;
  const isInRetryMode = answerFeedback === "incorrect";

  const handleButtonClick = () => {
    if (isInTryAgainMode) {
      handleTryAnother();
    } else if (isInRetryMode) {
      handleRetry();
    } else {
      handleSubmit();
    }
  };

  const getButtonText = () => {
    if (isInTryAgainMode) return tryAnotherText;
    if (isInRetryMode) return "Retry";
    return "Submit";
  };

  const getButtonClass = () => {
    if (isInTryAgainMode) return "try-again-button";
    if (isInRetryMode) return "retry-button";
    return "submit-button";
  };

  return (
    <Wrapper feedback={answerFeedback}>
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={localInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || answerFeedback === "correct"}
          className="answer-input"
          {...(isTouchDevice
            ? {
                readOnly: true,
                inputMode: "none",
                onFocus: () => setKeypadOpen(true),
              }
            : {})}
        />
        <button
          onClick={handleButtonClick}
          // disabled={disabled || (isInTryAgainMode && !isInRetryMode && !localInput.trim())}
          className={getButtonClass()}
        >
          {getButtonText()}
        </button>
      </div>
      {answerFeedback === "incorrect" && <div className="feedback incorrect">Try again</div>}
      {answerFeedback === "correct" && (
        <div className="feedback correct">
          Correct! {attempts > 1 ? `(${attempts} attempts)` : "(1st try!)"}
        </div>
      )}
      {isTouchDevice && (
        <MathKeypad
          visible={keypadOpen && !disabled && answerFeedback !== "correct"}
          value={localInput}
          onChange={handleKeypadChange}
          onSubmit={handleSubmit}
          onClose={() => setKeypadOpen(false)}
        />
      )}
    </Wrapper>
  );
};

export default AnswerInput;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 8px;
  margin-bottom: 10px;

  .input-container {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }

  .answer-input {
    height: 50px;
    border-radius: 7px;
    font-size: 20px;
    padding: 0 15px;
    min-width: 200px;
    color: ${props => props.theme.colors.textPrimary};
    border: 2px solid
      ${(props) =>
        props.feedback === "correct"
          ? props.theme.colors.success
          : props.feedback === "incorrect"
            ? props.theme.colors.error
            : props.theme.colors.border};
    background-color: ${(props) =>
      props.feedback === "correct"
        ? props.theme.colors.successLight
        : props.feedback === "incorrect"
          ? props.theme.colors.errorLight
          : props.theme.colors.pageBackground};
    outline: none;
    transition:
      border-color 0.3s,
      background-color 0.3s;

    &:focus {
      border-color: ${(props) =>
        props.feedback === "correct"
          ? props.theme.colors.success
          : props.feedback === "incorrect"
            ? props.theme.colors.error
            : props.theme.colors.info};
    }

    &:disabled {
      background-color: ${(props) =>
        props.feedback === "correct"
          ? props.theme.colors.successLight
          : props.theme.colors.cardBackground};
      cursor: not-allowed;
    }
  }

  .submit-button {
    background-color: ${props => props.theme.colors.info};
    color: ${props => props.theme.colors.textInverted};
    height: 50px;
    border-radius: 7px;
    font-size: 20px;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    padding: 0 20px;
    min-width: 100px;
    transition: opacity 0.2s;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }

    &:disabled {
      background-color: ${props => props.theme.colors.textDisabled};
      cursor: not-allowed;
    }
  }

  .try-again-button {
    background-color: ${props => props.theme.colors.buttonSuccess};
    color: ${props => props.theme.colors.textInverted};
    height: 50px;
    border-radius: 7px;
    font-size: 20px;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    padding: 0 20px;
    min-width: 100px;
    transition: opacity 0.2s;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }

    &:disabled {
      background-color: ${props => props.theme.colors.textDisabled};
      cursor: not-allowed;
    }
  }

  .retry-button {
    background-color: ${props => props.theme.colors.warning};
    color: ${props => props.theme.colors.textInverted};
    height: 50px;
    border-radius: 7px;
    font-size: 20px;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    padding: 0 20px;
    min-width: 100px;
    transition: opacity 0.2s;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }

    &:disabled {
      background-color: ${props => props.theme.colors.textDisabled};
      cursor: not-allowed;
    }
  }

  .feedback {
    font-size: 18px;
    font-weight: bold;
    padding: 5px 15px;
    border-radius: 5px;

    &.correct {
      color: ${props => props.theme.colors.success};
      background-color: ${props => props.theme.colors.successLight};
    }

    &.incorrect {
      color: ${props => props.theme.colors.error};
      background-color: ${props => props.theme.colors.errorLight};
    }
  }

  @media (max-width: 480px) {
    .input-container {
      flex-direction: column;
    }

    .answer-input {
      min-width: 180px;
      font-size: 18px;
    }

    .submit-button,
    .try-again-button,
    .retry-button {
      width: 100%;
      min-width: 180px;
    }
  }
`;
