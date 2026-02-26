import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group, Circle, Transformer } from 'react-konva';
import useImage from 'use-image';
import { useLessonState, useWindowDimensions, useKonvaTheme } from '../../../../hooks';

// ==================== DRAGGABLE OBJECT COMPONENT ====================

function DraggableObject({ obj, index, onDragEnd, onTransform, isSelected, onSelect, konvaTheme }) {
  const imageRef = useRef();
  const trRef = useRef();

  // Load image from public folder
  const imagePath = `/${obj.type}.png`;
  const [image] = useImage(imagePath);

  // Size configuration for each object type (2x larger)
  const getObjectSize = (type) => {
    const sizes = {
      person: { width: 80, height: 160 },
      tree: { width: 120, height: 160 },
      building: { width: 160, height: 200 },
      flag: { width: 100, height: 140 },
      pole: { width: 40, height: 140 },
      shadow: { width: 200, height: 30 },
      light_pole: { width: 60, height: 160 },
      water_tower: { width: 120, height: 180 },
    };
    return sizes[type] || { width: 100, height: 140 };
  };

  const size = getObjectSize(obj.type);

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      // Attach transformer to the image
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      {/* Display the image */}
      {image ? (
        <KonvaImage
          ref={imageRef}
          image={image}
          x={obj.x}
          y={obj.y}
          width={size.width * (obj.scaleX || 1)}
          height={size.height * (obj.scaleY || 1)}
          rotation={obj.rotation || 0}
          draggable
          opacity={obj.type === 'shadow' ? 0.5 : 1}
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={(e) => {
            onDragEnd(index, e.target.x(), e.target.y(), e.target.rotation(), e.target.scaleX(), e.target.scaleY());
          }}
          onTransformEnd={(e) => {
            const node = imageRef.current;
            onTransform(index, node.x(), node.y(), node.rotation(), node.scaleX(), node.scaleY());
          }}
        />
      ) : (
        // Fallback while image loads
        <Rect
          x={obj.x}
          y={obj.y}
          width={size.width}
          height={size.height}
          fill="#CCCCCC"
          stroke={konvaTheme.borderDark}
          strokeWidth={1}
        />
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize to prevent too small images
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

// ==================== MAIN COMPONENT ====================

export default function SimilarTrianglesWordProblemsLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const windowDimensions = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const [selectedChoice, setSelectedChoice] = useState(null);
  const [canvasObjects, setCanvasObjects] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState(null);

  // Get current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const { level = 1 } = visualData;

  const questionText = currentProblem?.question?.[0]?.text || '';
  const answerText = currentProblem?.answer?.[0] || '';
  const explanation = currentProblem?.explanation || '';
  const hint = currentProblem?.hint || '';

  const choices = visualData.choices || [];

  // Level 6 interactive handlers
  const handleAddObject = (objectType) => {
    const newObject = {
      type: objectType,
      x: 100 + canvasObjects.length * 60,
      y: 200,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      id: Date.now() + Math.random(),
    };
    setCanvasObjects([...canvasObjects, newObject]);
    setSelectedObjectId(newObject.id);
  };

  const handleDragEnd = (index, newX, newY, rotation, scaleX, scaleY) => {
    const updated = [...canvasObjects];
    updated[index].x = newX;
    updated[index].y = newY;
    if (rotation !== undefined) updated[index].rotation = rotation;
    if (scaleX !== undefined) updated[index].scaleX = scaleX;
    if (scaleY !== undefined) updated[index].scaleY = scaleY;
    setCanvasObjects(updated);
  };

  const handleTransform = (index, newX, newY, rotation, scaleX, scaleY) => {
    const updated = [...canvasObjects];
    updated[index].x = newX;
    updated[index].y = newY;
    updated[index].rotation = rotation;
    updated[index].scaleX = scaleX;
    updated[index].scaleY = scaleY;
    setCanvasObjects(updated);
  };

  const handleSelectObject = (id) => {
    setSelectedObjectId(id);
  };

  const handleClearCanvas = () => {
    setCanvasObjects([]);
    setSelectedObjectId(null);
  };

  const handleCheckScene = () => {
    // Simple validation: check if required objects are present
    const requiredObjects = visualData.requiredObjects || [];
    const objectTypes = canvasObjects.map(obj => obj.type);

    const hasAllRequired = requiredObjects.every(req =>
      objectTypes.includes(req)
    );

    if (hasAllRequired && canvasObjects.length === requiredObjects.length) {
      revealAnswer();
      setTimeout(() => {
        handleTryAnother();
      }, 2000);
    } else {
      // Show hint or error
      alert(`You need: ${requiredObjects.join(', ')}`);
    }
  };

  // Event handlers
  const handleTryAnother = () => {
    setSelectedChoice(null);
    setCanvasObjects([]);
    setSelectedObjectId(null);
    triggerNewProblem();
    hideAnswer();
  };

  const handleChoiceClick = (choiceText) => {
    if (showAnswer) return;

    setSelectedChoice(choiceText);
    const isCorrect = choiceText === answerText;

    if (isCorrect) {
      setTimeout(() => {
        revealAnswer();
        // Auto-advance after 1.5 seconds
        setTimeout(() => {
          handleTryAnother();
        }, 1500);
      }, 300);
    } else {
      setTimeout(() => {
        revealAnswer();
      }, 300);
    }
  };

  // Fallback if no data
  if (!currentProblem?.visualData) {
    return (
      <Container>
        <Title>Similar Triangles: Word Problems</Title>
        <Question>Loading lesson data...</Question>
      </Container>
    );
  }

  // Level 1 Interactive Mode
  if (level === 1 && visualData.interactiveMode) {
    const canvasWidth = Math.min(windowDimensions.width - 40, 700);
    const canvasHeight = 400;
    const availableObjects = visualData.availableObjects || [];

    return (
      <Container>
        <Title>Similar Triangles: Scene Builder - Level {level}</Title>

        <QuestionSection>
          <Question>{questionText}</Question>
        </QuestionSection>

        {/* Object buttons */}
        <ObjectButtonsSection>
          <ObjectButtonsTitle>Add Objects to Canvas:</ObjectButtonsTitle>
          <ObjectButtonsGrid>
            {availableObjects.map((objType) => (
              <ObjectButton
                key={objType}
                onClick={() => handleAddObject(objType)}
                disabled={showAnswer}
              >
                + {objType.replace('_', ' ')}
              </ObjectButton>
            ))}
          </ObjectButtonsGrid>
        </ObjectButtonsSection>

        {/* Canvas */}
        <CanvasContainer>
          <Stage width={canvasWidth} height={canvasHeight}>
            <Layer>
              {/* Background */}
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill={konvaTheme.canvasBackground || (konvaTheme.textPrimary === '#FFFFFF' || konvaTheme.textPrimary === '#F9FAFB' ? '#9CA3AF' : '#FFFFFF')}
                stroke={konvaTheme.border}
                strokeWidth={1}
                onClick={() => setSelectedObjectId(null)}
                onTap={() => setSelectedObjectId(null)}
              />
              {/* Ground line */}
              <Rect
                x={0}
                y={canvasHeight - 50}
                width={canvasWidth}
                height={2}
                fill={konvaTheme.textSecondary}
              />
              {/* Objects */}
              {canvasObjects.map((obj, idx) => (
                <DraggableObject
                  key={obj.id}
                  obj={obj}
                  index={idx}
                  onDragEnd={handleDragEnd}
                  onTransform={handleTransform}
                  isSelected={obj.id === selectedObjectId}
                  onSelect={() => handleSelectObject(obj.id)}
                  konvaTheme={konvaTheme}
                />
              ))}
            </Layer>
          </Stage>
        </CanvasContainer>

        {/* Control buttons */}
        <ControlButtonsSection>
          <ControlButton onClick={handleClearCanvas} disabled={showAnswer}>
            Clear Canvas
          </ControlButton>
          <ControlButton
            onClick={handleCheckScene}
            disabled={showAnswer || canvasObjects.length === 0}
            $primary
          >
            Check Scene
          </ControlButton>
        </ControlButtonsSection>

        {showAnswer && (
          <ExplanationSection>
            <ExplanationTitle>✓ Great job!</ExplanationTitle>
            <ExplanationText>{explanation}</ExplanationText>
          </ExplanationSection>
        )}

        {!showAnswer && hint && (
          <HintSection>
            <HintTitle>💡 Hint:</HintTitle>
            <HintText>{hint}</HintText>
          </HintSection>
        )}
      </Container>
    );
  }

  // Levels 1-5: Multiple Choice
  return (
    <Container>
      <Title>Similar Triangles: Word Problems - Level {level}</Title>

      <QuestionSection>
        <Question>{questionText}</Question>
      </QuestionSection>

      <ChoicesGrid>
        {choices.map((choice, idx) => {
          const choiceText = choice.text || choice;
          const isSelected = selectedChoice === choiceText;
          const isCorrect = choiceText === answerText;

          return (
            <ChoiceButton
              key={idx}
              onClick={() => handleChoiceClick(choiceText)}
              $isSelected={isSelected}
              $showAnswer={showAnswer}
              $isCorrect={isCorrect}
              disabled={showAnswer}
            >
              {choiceText}
            </ChoiceButton>
          );
        })}
      </ChoicesGrid>

      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>
            {selectedChoice === answerText ? '✓ Correct!' : '✗ Incorrect'}
          </ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          {selectedChoice !== answerText && (
            <TryAgainButton onClick={handleTryAnother}>
              Try Another Problem
            </TryAgainButton>
          )}
        </ExplanationSection>
      )}

      {!showAnswer && hint && (
        <HintSection>
          <HintTitle>💡 Hint:</HintTitle>
          <HintText>{hint}</HintText>
        </HintSection>
      )}
    </Container>
  );
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  color: ${props => props.theme.colors.textPrimary};
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
  color: ${props => props.theme.colors.textPrimary};
`;

const QuestionSection = styled.div`
  margin-bottom: 32px;
  padding: 20px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  border-left: 4px solid ${props => props.theme.colors.primary || '#3B82F6'};
`;

const Question = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
`;

const ChoicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 32px 0;
`;

const ChoiceButton = styled.button`
  padding: 20px;
  border: 2px solid ${props => {
    if (props.$isSelected && props.$showAnswer) {
      return props.$isCorrect
        ? props.theme.colors.buttonSuccess || '#4ade80'
        : props.theme.colors.buttonError || '#ef4444';
    }
    if (props.$isSelected) {
      return props.theme.colors.borderDark || props.theme.colors.border;
    }
    return props.theme.colors.border;
  }};
  background: ${props => {
    if (props.$isSelected && props.$showAnswer) {
      return props.$isCorrect
        ? props.theme.colors.successBackground || '#4ade8020'
        : props.theme.colors.errorBackground || '#ef444420';
    }
    if (props.$isSelected) {
      return props.theme.colors.hoverBackground;
    }
    return props.theme.colors.cardBackground;
  }};
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary};
  transition: all 0.2s;
  text-align: center;

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.borderDark || props.theme.colors.border};
    background: ${props => props.theme.colors.hoverBackground};
    transform: translateY(-2px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ExplanationSection = styled.div`
  margin-top: 32px;
  padding: 24px;
  background: ${props => props.theme.colors.cardBackground};
  border-left: 4px solid ${props => props.theme.colors.buttonSuccess || '#4ade80'};
  border-radius: 8px;
`;

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${props => props.theme.colors.textPrimary};
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 16px;
`;

const TryAgainButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.theme.colors.primary || '#3B82F6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const HintSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: ${props => props.theme.colors.inputBackground || '#f1efef'};
  border-left: 4px solid ${props => props.theme.colors.borderDark || '#cbd5e0'};
  border-radius: 8px;
`;

const HintTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.textPrimary};
`;

const HintText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.theme.colors.textSecondary};
`;

// Level 6 Interactive Components
const ObjectButtonsSection = styled.div`
  margin: 24px 0;
  padding: 16px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
`;

const ObjectButtonsTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${props => props.theme.colors.textPrimary};
`;

const ObjectButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
`;

const ObjectButton = styled.button`
  padding: 10px 16px;
  background: ${props => props.theme.colors.primary || '#3B82F6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: capitalize;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CanvasContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 24px 0;
  padding: 16px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
`;

const ControlButtonsSection = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin: 24px 0;
`;

const ControlButton = styled.button`
  padding: 12px 32px;
  background: ${props => props.$primary
    ? props.theme.colors.primary || '#3B82F6'
    : props.theme.colors.buttonSecondary || '#6B7280'
  };
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
