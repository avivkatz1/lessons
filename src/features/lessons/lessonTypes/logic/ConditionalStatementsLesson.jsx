import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLessonState, useWindowDimensions } from '../../../../hooks';
import { AnswerInput } from '../../../../shared/components';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 16px;
  text-align: center;
`;

const QuestionSection = styled.div`
  margin-bottom: 24px;
  text-align: center;
`;

const Question = styled.p`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 16px;
`;

const OriginalStatement = styled.div`
  padding: 20px;
  background: ${props => props.theme.colors.cardBackground || '#f8fafc'};
  border-left: 4px solid ${props => props.theme.colors.primary || '#3B82F6'};
  border-radius: 8px;
  margin: 20px 0;
`;

const StatementText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0;
`;

const BuildArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
  min-height: 150px;
`;

const StatementBuilder = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: ${props => props.theme.colors.inputBackground || '#f1f5f9'};
  border: 2px dashed ${props => props.theme.colors.borderDark || '#cbd5e0'};
  border-radius: 12px;
  flex-wrap: wrap;
  min-height: 80px;
  justify-content: center;
`;

const TemplateText = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 4px;
`;

const DropZone = styled.div`
  min-width: 200px;
  min-height: 50px;
  padding: 12px 16px;
  background: ${props => props.$hasItem
    ? (props.$isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)')
    : 'white'};
  border: 2px dashed ${props => props.$hasItem
    ? (props.$isCorrect ? '#10B981' : '#3B82F6')
    : '#cbd5e0'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: ${props => props.$hasItem ? 'pointer' : 'default'};

  &:hover {
    background: ${props => props.$hasItem ? 'rgba(59, 130, 246, 0.15)' : 'rgba(203, 213, 224, 0.1)'};
  }
`;

const PartsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 24px 0;
  min-height: 80px;
`;

const DraggablePart = styled.div`
  padding: 12px 20px;
  background: ${props => props.$isDragging ? '#e2e8f0' : (props.theme.colors.primary || '#3B82F6')};
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: grab;
  user-select: none;
  transition: all 0.2s;
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  &:active {
    cursor: grabbing;
  }
`;

const MatchingArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
`;

const MatchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${props => props.theme.colors.cardBackground || '#f8fafc'};
  border-radius: 8px;
  flex-wrap: wrap;
`;

const StatementBox = styled.div`
  flex: 1;
  min-width: 250px;
  padding: 12px 16px;
  background: white;
  border: 2px solid ${props => props.theme.colors.borderDark || '#cbd5e0'};
  border-radius: 8px;
  font-size: 16px;
  color: ${props => props.theme.colors.textPrimary};
`;

const LabelDropZone = styled.div`
  min-width: 150px;
  padding: 12px 16px;
  background: ${props => props.$hasLabel
    ? (props.$isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)')
    : 'white'};
  border: 2px dashed ${props => props.$hasLabel
    ? (props.$isCorrect ? '#10B981' : '#3B82F6')
    : '#cbd5e0'};
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$hasLabel ? props.theme.colors.textPrimary : props.theme.colors.textSecondary};
  cursor: ${props => props.$hasLabel ? 'pointer' : 'default'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$hasLabel ? 'rgba(59, 130, 246, 0.15)' : 'rgba(203, 213, 224, 0.1)'};
  }
`;

const CheckButton = styled.button`
  padding: 14px 32px;
  background: ${props => props.theme.colors.primary || '#3B82F6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin: 24px 0;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FeedbackText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$correct ? '#10B981' : '#EF4444'};
  text-align: center;
  margin: 16px 0;
`;

const HintSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: ${props => props.theme.colors.inputBackground || '#f1efef'};
  border-left: 4px solid ${props => props.theme.colors.borderDark || '#cbd5e0'};
  border-radius: 8px;
`;

const HintText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const ExplanationSection = styled.div`
  margin-top: 32px;
  padding: 24px;
  background: ${props => props.theme.colors.cardBackground};
  border-left: 4px solid ${props => props.theme.colors.buttonSuccess || '#4ade80'};
  border-radius: 8px;
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0;
  white-space: pre-line;
`;

// ==================== MAIN COMPONENT ====================

export default function ConditionalStatementsLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width } = useWindowDimensions();

  // Get current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    interactionType,
    parts = [],
    template,
    correctOrder = [],
    originalStatement,
    options = [],
    matchType,
    buildType,
    statements = [],
    labels = []
  } = visualData;

  const questionText = currentProblem?.question?.[0]?.text || '';
  const hint = currentProblem?.hint || '';
  const explanation = currentProblem?.explanation || '';

  // State
  const [placedParts, setPlacedParts] = useState({});
  const [availableParts, setAvailableParts] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [matchedOption, setMatchedOption] = useState(null);
  const [labelPlacements, setLabelPlacements] = useState({});
  const [availableLabels, setAvailableLabels] = useState([]);

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPlacedParts({});
    setAvailableParts(parts);
    setMatchedOption(null);
    setLabelPlacements({});
    setAvailableLabels(labels);
    setIsCorrect(null);
  }

  // Initialize available parts/labels
  useEffect(() => {
    if (interactionType === 'drag-labels') {
      setAvailableLabels(labels);
    } else {
      setAvailableParts(parts);
    }
  }, [parts, labels, interactionType]);

  // Handle drag start
  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  // Handle drop on zone
  const handleDrop = (zoneId) => {
    if (!draggedItem) return;

    // Remove from current location
    setPlacedParts(prev => {
      const newPlaced = { ...prev };
      // Remove from any previous zone
      Object.keys(newPlaced).forEach(key => {
        if (newPlaced[key]?.id === draggedItem.id) {
          delete newPlaced[key];
        }
      });
      // Place in new zone
      newPlaced[zoneId] = draggedItem;
      return newPlaced;
    });

    setAvailableParts(prev => prev.filter(p => p.id !== draggedItem.id));
    setDraggedItem(null);
  };

  // Handle click on placed part (remove it)
  const handleRemovePart = (zoneId) => {
    const part = placedParts[zoneId];
    if (!part) return;

    setPlacedParts(prev => {
      const newPlaced = { ...prev };
      delete newPlaced[zoneId];
      return newPlaced;
    });

    setAvailableParts(prev => [...prev, part]);
  };

  // Handle label drop
  const handleLabelDrop = (statementId) => {
    if (!draggedItem) return;

    setLabelPlacements(prev => {
      const newPlacements = { ...prev };
      // Remove from previous statement
      Object.keys(newPlacements).forEach(key => {
        if (newPlacements[key] === draggedItem) {
          delete newPlacements[key];
        }
      });
      newPlacements[statementId] = draggedItem;
      return newPlacements;
    });

    setAvailableLabels(prev => prev.filter(l => l !== draggedItem));
    setDraggedItem(null);
  };

  // Handle remove label
  const handleRemoveLabel = (statementId) => {
    const label = labelPlacements[statementId];
    if (!label) return;

    setLabelPlacements(prev => {
      const newPlacements = { ...prev };
      delete newPlacements[statementId];
      return newPlacements;
    });

    setAvailableLabels(prev => [...prev, label]);
  };

  // Check answer
  const checkAnswer = () => {
    if (interactionType === 'drag-to-build') {
      const isMatch = correctOrder.every((correctId, idx) =>
        placedParts[`slot${idx}`]?.id === correctId
      );
      setIsCorrect(isMatch);
      if (isMatch) {
        revealAnswer();
        setTimeout(() => {
          setIsCorrect(null);
          setPlacedParts({});
          setAvailableParts(parts);
          hideAnswer();
          triggerNewProblem();
        }, 2500);
      }
    } else if (interactionType === 'drag-to-match') {
      const isMatch = matchedOption?.isCorrect === true;
      setIsCorrect(isMatch);
      if (isMatch) {
        revealAnswer();
        setTimeout(() => {
          setIsCorrect(null);
          setMatchedOption(null);
          hideAnswer();
          triggerNewProblem();
        }, 2500);
      }
    } else if (interactionType === 'drag-labels') {
      const allCorrect = statements.every(stmt =>
        labelPlacements[stmt.id] === stmt.correctLabel
      );
      setIsCorrect(allCorrect);
      if (allCorrect) {
        revealAnswer();
        setTimeout(() => {
          setIsCorrect(null);
          setLabelPlacements({});
          setAvailableLabels(labels);
          hideAnswer();
          triggerNewProblem();
        }, 2500);
      }
    }
  };

  // Render based on interaction type
  const renderContent = () => {
    if (interactionType === 'drag-to-build') {
      return (
        <>
          {originalStatement && (
            <OriginalStatement>
              <StatementText>Original: {originalStatement}</StatementText>
            </OriginalStatement>
          )}

          <BuildArea>
            <StatementBuilder>
              <TemplateText>{template?.prefix}</TemplateText>
              <DropZone
                $hasItem={!!placedParts['slot0']}
                $isCorrect={showAnswer && placedParts['slot0']?.id === correctOrder[0]}
                onClick={() => handleRemovePart('slot0')}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop('slot0')}
              >
                {placedParts['slot0']?.text || 'Drop here'}
              </DropZone>
              <TemplateText>{template?.middle}</TemplateText>
              <DropZone
                $hasItem={!!placedParts['slot1']}
                $isCorrect={showAnswer && placedParts['slot1']?.id === correctOrder[1]}
                onClick={() => handleRemovePart('slot1')}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop('slot1')}
              >
                {placedParts['slot1']?.text || 'Drop here'}
              </DropZone>
              <TemplateText>{template?.suffix}</TemplateText>
            </StatementBuilder>
          </BuildArea>

          <PartsContainer>
            {availableParts.map((part) => (
              <DraggablePart
                key={part.id}
                draggable
                onDragStart={() => handleDragStart(part)}
                $isDragging={draggedItem?.id === part.id}
              >
                {part.text}
              </DraggablePart>
            ))}
          </PartsContainer>
        </>
      );
    }

    if (interactionType === 'drag-to-match') {
      return (
        <>
          <OriginalStatement>
            <StatementText>Original: {originalStatement}</StatementText>
          </OriginalStatement>

          <MatchingArea>
            {options.map((option) => (
              <MatchRow key={option.id}>
                <StatementBox
                  onClick={() => setMatchedOption(option)}
                  style={{
                    cursor: 'pointer',
                    border: matchedOption?.id === option.id ? '3px solid #3B82F6' : '2px solid #cbd5e0',
                    background: matchedOption?.id === option.id ? 'rgba(59, 130, 246, 0.1)' : 'white'
                  }}
                >
                  {option.text}
                </StatementBox>
              </MatchRow>
            ))}
          </MatchingArea>
        </>
      );
    }

    if (interactionType === 'drag-labels') {
      return (
        <>
          <OriginalStatement>
            <StatementText>Original: {originalStatement}</StatementText>
          </OriginalStatement>

          <MatchingArea>
            {statements.map((stmt) => (
              <MatchRow key={stmt.id}>
                <StatementBox>{stmt.text}</StatementBox>
                <LabelDropZone
                  $hasLabel={!!labelPlacements[stmt.id]}
                  $isCorrect={showAnswer && labelPlacements[stmt.id] === stmt.correctLabel}
                  onClick={() => handleRemoveLabel(stmt.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleLabelDrop(stmt.id)}
                >
                  {labelPlacements[stmt.id] || 'Drop label here'}
                </LabelDropZone>
              </MatchRow>
            ))}
          </MatchingArea>

          <PartsContainer>
            {availableLabels.map((label) => (
              <DraggablePart
                key={label}
                draggable
                onDragStart={() => handleDragStart(label)}
                $isDragging={draggedItem === label}
              >
                {label}
              </DraggablePart>
            ))}
          </PartsContainer>
        </>
      );
    }

    return null;
  };

  return (
    <Container>
      <Title>Conditional Statements - Level {level}</Title>

      <QuestionSection>
        <Question>{questionText}</Question>
      </QuestionSection>

      {renderContent()}

      {!showAnswer && (
        <CheckButton onClick={checkAnswer} disabled={
          (interactionType === 'drag-to-build' && (!placedParts['slot0'] || !placedParts['slot1'])) ||
          (interactionType === 'drag-to-match' && !matchedOption) ||
          (interactionType === 'drag-labels' && Object.keys(labelPlacements).length < statements.length)
        }>
          Check Answer
        </CheckButton>
      )}

      {isCorrect !== null && (
        <FeedbackText $correct={isCorrect}>
          {isCorrect ? '✓ Correct!' : '✗ Not quite. Try again!'}
        </FeedbackText>
      )}

      {hint && (
        <HintSection>
          <HintText><strong>Hint:</strong> {hint}</HintText>
        </HintSection>
      )}

      {showAnswer && explanation && (
        <ExplanationSection>
          <ExplanationText><strong>Explanation:</strong> {explanation}</ExplanationText>
        </ExplanationSection>
      )}
    </Container>
  );
}
