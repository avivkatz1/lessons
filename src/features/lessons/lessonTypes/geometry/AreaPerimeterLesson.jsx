import React, { useState, useEffect } from "react";
import { useLessonState, useWindowDimensions } from "../../../../hooks";
import styled from "styled-components";
import ExplanationModal from "./ExplanationModal";

// Level components
import Level1DraggableRectangle from "./components/areaPerimeter/Level1DraggableRectangle";
import Level2CompareRectangles from "./components/areaPerimeter/Level2CompareRectangles";
import Level3CalculateRectangle from "./components/areaPerimeter/Level3CalculateRectangle";
import Level4RightTriangle from "./components/areaPerimeter/Level4RightTriangle";
import Level5AnyTriangle from "./components/areaPerimeter/Level5AnyTriangle";
import Level6TrapezoidDecomposition from "./components/areaPerimeter/Level6TrapezoidDecomposition";
import Level7MixedShapes from "./components/areaPerimeter/Level7MixedShapes";
import Level8WordProblems from "./components/areaPerimeter/Level8WordProblems";

// ==================== MAIN COMPONENT ====================

function AreaPerimeterLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width } = useWindowDimensions();

  const [isComplete, setIsComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [modalClosedWithX, setModalClosedWithX] = useState(false);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const { level = 1 } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  // Reset state when problem changes
  useEffect(() => {
    setIsComplete(false);
    setShowHint(false);
    setModalClosedWithX(false);
  }, [currentQuestionIndex, level]);

  // Handle completion from child components
  const handleComplete = (success) => {
    console.log('[AreaPerimeterLesson] handleComplete called, success:', success, 'modalClosedWithX:', modalClosedWithX);
    // Don't show modal if it was manually closed
    if (success && !modalClosedWithX) {
      setIsComplete(true);
    }
  };

  // Handle modal close (X button) - just close without advancing
  const handleClose = () => {
    console.log('[AreaPerimeterLesson] handleClose - modal X clicked');
    setIsComplete(false);
    setModalClosedWithX(true); // User manually closed the success modal
  };

  // Handle "Try Another Problem" - close and advance
  const handleTryAnother = () => {
    console.log('[AreaPerimeterLesson] handleTryAnother - advancing to next problem');
    setIsComplete(false);
    setShowHint(false);
    setModalClosedWithX(false);
    triggerNewProblem();
  };

  // Highlight keywords (area, perimeter) in question text
  const highlightKeywords = (text) => {
    if (!text) return text;

    // Split by "area" or "perimeter" (case insensitive)
    const parts = text.split(/\b(area|perimeter)\b/gi);

    return parts.map((part, index) => {
      if (part.toLowerCase() === 'area' || part.toLowerCase() === 'perimeter') {
        return <HighlightedKeyword key={index}>{part}</HighlightedKeyword>;
      }
      return part;
    });
  };

  // Render appropriate level component
  const renderLevelComponent = () => {
    const commonProps = {
      visualData,
      onComplete: handleComplete,
      questionIndex: currentQuestionIndex,
      modalClosedWithX,
    };

    switch (level) {
      case 1:
        return <Level1DraggableRectangle {...commonProps} onNextProblem={handleTryAnother} />;
      case 2:
        return <Level2CompareRectangles {...commonProps} onNextProblem={handleTryAnother} />;
      case 3:
        return <Level3CalculateRectangle {...commonProps} onNextProblem={handleTryAnother} />;
      case 4:
        return <Level4RightTriangle {...commonProps} onNextProblem={handleTryAnother} />;
      case 5:
        return <Level5AnyTriangle {...commonProps} onNextProblem={handleTryAnother} />;
      case 6:
        return <Level6TrapezoidDecomposition {...commonProps} onNextProblem={handleTryAnother} />;
      case 7:
        return <Level7MixedShapes {...commonProps} onNextProblem={handleTryAnother} />;
      case 8:
        return <Level8WordProblems {...commonProps} />;
      default:
        return <Level1DraggableRectangle {...commonProps} />;
    }
  };

  return (
    <Wrapper>
      {/* Fixed hint button */}
      {!isComplete && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          💡 Need a hint?
        </TopHintButton>
      )}

      {/* Question only (removed level header and redundant instruction) */}
      {questionText && (
        <QuestionSection>
          <QuestionText>{highlightKeywords(questionText)}</QuestionText>
        </QuestionSection>
      )}

      {/* Hint display */}
      {showHint && !isComplete && (
        <HintBox>
          <HintTitle>💡 Hint:</HintTitle>
          <HintText>{hint}</HintText>
        </HintBox>
      )}

      {/* Level-specific content */}
      <ContentSection>
        {renderLevelComponent()}
      </ContentSection>

      {/* Explanation modal (overlay) */}
      {isComplete && (
        <ExplanationModal
          explanation={explanation}
          onClose={handleClose}
          onTryAnother={handleTryAnother}
        />
      )}
    </Wrapper>
  );
}

// ==================== STYLED COMPONENTS ====================

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 8px;
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
  min-height: 44px;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
    padding: 8px 16px;
    font-size: 13px;
  }
`;

const QuestionSection = styled.div`
  width: 100%;
  padding: 14px 20px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-left: 4px solid ${(props) => props.theme.colors.info || '#3B82F6'};
  border-radius: 8px;
  margin-bottom: 16px;

  @media (max-width: 1024px) {
    padding: 12px 16px;
    margin-bottom: 12px;
  }
`;

const QuestionText = styled.p`
  font-size: 18px;
  font-weight: 600;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 17px;
  }
`;

const HighlightedKeyword = styled.span`
  color: #F97316;
  font-weight: 700;
`;

const HintBox = styled.div`
  width: 100%;
  padding: 16px 20px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.warning || '#F59E0B'};
  border-radius: 8px;
  margin-bottom: 20px;

  @media (max-width: 1024px) {
    padding: 12px 16px;
    margin-bottom: 12px;
  }
`;

const HintTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0 0 8px 0;

  @media (max-width: 1024px) {
    font-size: 15px;
    margin: 0 0 6px 0;
  }
`;

const HintText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;

const ContentSection = styled.div`
  width: 100%;
`;

export default AreaPerimeterLesson;
