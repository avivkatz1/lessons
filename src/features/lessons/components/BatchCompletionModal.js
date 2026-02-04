import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { loadMorePractice, exitBatch } from "../../../store/lessonSlice";
import { trackBatchUsage } from "../../../services/monitoring";

/**
 * BatchCompletionModal Component
 * Phase 2.5: Shows completion stats after finishing a batch
 *
 * Displays:
 * - Total questions answered
 * - Accuracy percentage
 * - Encouraging message based on performance
 * - Options: "More Practice" or "Back to Lessons"
 */
const BatchCompletionModal = () => {
  const dispatch = useDispatch();
  const { showCompletionModal, batchAccuracy, questionAnswerArray, lessonProps } = useSelector(
    (state) => state.lesson
  );

  // Production Monitoring: Track batch completion when modal appears
  useEffect(() => {
    if (showCompletionModal && questionAnswerArray.length > 0) {
      trackBatchUsage(lessonProps.lessonName, questionAnswerArray.length, batchAccuracy);
    }
  }, [showCompletionModal, lessonProps.lessonName, questionAnswerArray.length, batchAccuracy]);

  if (!showCompletionModal) {
    return null;
  }

  const totalQuestions = questionAnswerArray.length;
  const correctAnswers = batchAccuracy.correct;
  // Guard against division by zero or empty batch
  const accuracyPercentage =
    totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Determine message and emoji based on accuracy
  const getMessage = () => {
    if (accuracyPercentage >= 90) {
      return {
        emoji: "🌟",
        title: "Outstanding!",
        message: "You've mastered this topic! Ready for the next challenge?",
        color: "#4CAF50",
      };
    } else if (accuracyPercentage >= 70) {
      return {
        emoji: "👍",
        title: "Great Job!",
        message: "You're doing well! A bit more practice will make you an expert.",
        color: "#2196F3",
      };
    } else if (accuracyPercentage >= 50) {
      return {
        emoji: "💪",
        title: "Good Effort!",
        message: "You're making progress! Keep practicing to improve.",
        color: "#FF9800",
      };
    } else {
      return {
        emoji: "📚",
        title: "Keep Practicing!",
        message: "This topic is challenging. Let's review and try again!",
        color: "#F44336",
      };
    }
  };

  const feedback = getMessage();

  const handleMorePractice = () => {
    dispatch(loadMorePractice());
    // Trigger fetching new batch (handled by parent component)
  };

  const handleExit = () => {
    dispatch(exitBatch());
    // Navigate back to lessons (handled by parent component)
    window.location.href = "/";
  };

  return (
    <Overlay>
      <Modal>
        <Emoji>{feedback.emoji}</Emoji>
        <Title color={feedback.color}>{feedback.title}</Title>

        <StatsContainer>
          <StatBox>
            <StatValue>
              {correctAnswers}/{totalQuestions}
            </StatValue>
            <StatLabel>Correct</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue color={feedback.color}>{accuracyPercentage}%</StatValue>
            <StatLabel>Accuracy</StatLabel>
          </StatBox>
        </StatsContainer>

        <Message>{feedback.message}</Message>

        <ButtonContainer>
          <PrimaryButton onClick={handleMorePractice}>More Practice</PrimaryButton>
          <SecondaryButton onClick={handleExit}>Back to Lessons</SecondaryButton>
        </ButtonContainer>
      </Modal>
    </Overlay>
  );
};

export default BatchCompletionModal;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
`;

const Modal = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Emoji = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: bold;
  color: ${(props) => props.color || "#333"};
  margin-bottom: 30px;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
`;

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: ${(props) => props.color || "#333"};
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Message = styled.p`
  font-size: 16px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
`;

const SecondaryButton = styled(Button)`
  background-color: #f0f0f0;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }
`;
