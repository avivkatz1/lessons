import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

/**
 * ProgressTracker Component
 * Phase 2.5: Shows progress through batch of questions
 *
 * Displays:
 * - Current question number (e.g., "Question 3 of 10")
 * - Progress bar visualization
 * - Accuracy percentage
 */
const ProgressTracker = () => {
  const { questionAnswerArray, currentQuestionIndex, batchAccuracy } = useSelector(
    (state) => state.lesson
  );

  // Don't show if not in batch mode
  if (!questionAnswerArray || questionAnswerArray.length === 0) {
    return null;
  }

  const totalQuestions = questionAnswerArray.length;
  const currentQuestion = currentQuestionIndex + 1; // 1-indexed for display
  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  // Calculate accuracy percentage
  const accuracyPercentage =
    batchAccuracy.total > 0 ? Math.round((batchAccuracy.correct / batchAccuracy.total) * 100) : 0;

  return (
    <Wrapper>
      <ProgressInfo>
        <QuestionNumber>
          Question {currentQuestion} of {totalQuestions}
        </QuestionNumber>
        {batchAccuracy.total > 0 && (
          <AccuracyBadge>
            {batchAccuracy.correct}/{batchAccuracy.total} correct ({accuracyPercentage}%)
          </AccuracyBadge>
        )}
      </ProgressInfo>

      <ProgressBarContainer>
        <ProgressBarFill style={{ width: `${progressPercentage}%` }} />
      </ProgressBarContainer>
    </Wrapper>
  );
};

export default ProgressTracker;

const Wrapper = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
`;

const QuestionNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const AccuracyBadge = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #28a745;
  background-color: #d4edda;
  padding: 4px 12px;
  border-radius: 12px;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4caf50 0%, #81c784 100%);
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
`;
