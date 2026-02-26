import React, { useState } from 'react';
import styled from 'styled-components';
import { AnswerInput } from '../../../../shared/components';
import { useLessonState } from '../../../../hooks';

const Container = styled.div`
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
  color: ${props => props.theme.colors.textPrimary};
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  color: ${props => props.theme.colors.textPrimary};
`;

const Question = styled.p`
  font-size: 18px;
  margin-bottom: 20px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
`;

const FlowChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin: 30px 0;
  padding: 20px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const FlowChartRow = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ShapeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ShapeLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  min-height: 20px;
`;

const Arrow = styled.div`
  width: 40px;
  height: 2px;
  background: ${props => props.theme.colors.textSecondary};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: -4px;
    width: 0;
    height: 0;
    border-left: 8px solid ${props => props.theme.colors.textSecondary};
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
  }
`;

const ChoicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
`;

const ChoiceButton = styled.button`
  padding: 15px;
  border: 2px solid ${props => {
    if (props.$isSelected && props.$showAnswer) {
      return props.$isCorrect ? (props.theme.colors.buttonSuccess || '#4ade80') : (props.theme.colors.buttonError || '#ef4444');
    }
    if (props.$isSelected) {
      return props.theme.colors.borderDark || props.theme.colors.border;
    }
    return props.theme.colors.border;
  }};
  background: ${props => {
    if (props.$isSelected && props.$showAnswer) {
      return props.$isCorrect ? (props.theme.colors.successBackground || '#4ade8020') : (props.theme.colors.errorBackground || '#ef444420');
    }
    if (props.$isSelected) {
      return props.theme.colors.hoverBackground;
    }
    return props.theme.colors.cardBackground;
  }};
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  color: ${props => props.theme.colors.textPrimary};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.borderDark || props.theme.colors.border};
    background: ${props => props.theme.colors.hoverBackground};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Explanation = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: ${props => props.theme.colors.cardBackground};
  border-left: 4px solid ${props => props.theme.colors.borderDark || props.theme.colors.border};
  border-radius: 4px;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.6;
`;

const InputContainer = styled.div`
  margin: 20px 0;
`;

export default function FlowChartsLesson({ triggerNewProblem }) {
  // Standard hook pattern
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  // Local UI state
  const [selectedChoice, setSelectedChoice] = useState(null);

  // Get current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const { level = 1 } = visualData;

  const questionText = currentProblem?.question?.[0]?.text || '';
  const answerText = currentProblem?.answer?.[0] || '';
  const explanation = currentProblem?.explanation || '';

  // Extract visualData properties
  const symbol = visualData.symbol;
  const choices = visualData.choices || [];
  const flowChart = visualData.flowChart || [];

  // Event handlers
  const handleTryAnother = () => {
    setSelectedChoice(null);
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
        // Auto-advance for MC levels after 1.5 seconds
        if ([1, 2, 3, 5].includes(level)) {
          setTimeout(() => {
            handleTryAnother();
          }, 1500);
        }
      }, 300);
    } else {
      setTimeout(() => {
        revealAnswer();
      }, 300);
    }
  };


  const renderFlowShape = (shape, label, isMissing = false) => {
    const shapeStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '100px',
      minHeight: '60px',
      padding: '10px',
      fontSize: '14px',
      color: isMissing ? 'transparent' : 'inherit',
      border: isMissing ? '2px dashed' : '2px solid',
      borderColor: 'currentColor',
    };

    switch (shape) {
      case 'oval':
        return (
          <ShapeContainer>
            <svg width="120" height="70">
              <ellipse
                cx="60"
                cy="35"
                rx="55"
                ry="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={isMissing ? "5,5" : "0"}
              />
              <text
                x="60"
                y="40"
                textAnchor="middle"
                fill="currentColor"
                fontSize="14"
                opacity={isMissing ? 0 : 1}
              >
                {label}
              </text>
            </svg>
            <ShapeLabel>{isMissing ? '?' : ''}</ShapeLabel>
          </ShapeContainer>
        );

      case 'rectangle':
        return (
          <ShapeContainer>
            <svg width="120" height="70">
              <rect
                x="10"
                y="10"
                width="100"
                height="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={isMissing ? "5,5" : "0"}
              />
              <text
                x="60"
                y="40"
                textAnchor="middle"
                fill="currentColor"
                fontSize="14"
                opacity={isMissing ? 0 : 1}
              >
                {label}
              </text>
            </svg>
            <ShapeLabel>{isMissing ? '?' : ''}</ShapeLabel>
          </ShapeContainer>
        );

      case 'diamond':
        return (
          <ShapeContainer>
            <svg width="120" height="80">
              <polygon
                points="60,10 110,40 60,70 10,40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={isMissing ? "5,5" : "0"}
              />
              <text
                x="60"
                y="45"
                textAnchor="middle"
                fill="currentColor"
                fontSize="14"
                opacity={isMissing ? 0 : 1}
              >
                {label}
              </text>
            </svg>
            <ShapeLabel>{isMissing ? '?' : ''}</ShapeLabel>
          </ShapeContainer>
        );

      case 'parallelogram':
        return (
          <ShapeContainer>
            <svg width="120" height="70">
              <polygon
                points="20,10 110,10 100,60 10,60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={isMissing ? "5,5" : "0"}
              />
              <text
                x="60"
                y="40"
                textAnchor="middle"
                fill="currentColor"
                fontSize="14"
                opacity={isMissing ? 0 : 1}
              >
                {label}
              </text>
            </svg>
            <ShapeLabel>{isMissing ? '?' : ''}</ShapeLabel>
          </ShapeContainer>
        );

      default:
        return (
          <ShapeContainer>
            <div style={shapeStyle}>{label}</div>
            <ShapeLabel>{isMissing ? '?' : ''}</ShapeLabel>
          </ShapeContainer>
        );
    }
  };

  const renderLevel1 = () => (
    <>
      <Question>{questionText}</Question>

      <FlowChartContainer>
        {renderFlowShape(symbol, symbol || 'Symbol')}
      </FlowChartContainer>

      <ChoicesGrid>
        {choices.map((choice, idx) => {
          const choiceText = choice.text || choice;
          return (
            <ChoiceButton
              key={idx}
              onClick={() => handleChoiceClick(choiceText)}
              $isSelected={selectedChoice === choiceText}
              $showAnswer={showAnswer}
              $isCorrect={choiceText === answerText}
              disabled={showAnswer}
            >
              {choiceText}
            </ChoiceButton>
          );
        })}
      </ChoicesGrid>

      {showAnswer && (
        <Explanation>
          <strong>{selectedChoice === answerText ? '✓ Correct!' : '✗ Incorrect'}</strong>
          <br />
          {explanation}
        </Explanation>
      )}
    </>
  );

  const getShapeForType = (type) => {
    const typeMap = {
      start: 'oval',
      end: 'oval',
      input: 'parallelogram',
      output: 'parallelogram',
      process: 'rectangle',
      decision: 'diamond',
    };
    return typeMap[type] || 'rectangle';
  };

  const renderLevel2 = () => (
    <>
      <Question>{questionText}</Question>

      <FlowChartContainer>
        {flowChart && flowChart.map((step, idx) => (
          <React.Fragment key={idx}>
            <FlowChartRow>
              {renderFlowShape(getShapeForType(step.type), step.text)}
            </FlowChartRow>
            {idx < flowChart.length - 1 && <Arrow />}
          </React.Fragment>
        ))}
      </FlowChartContainer>

      <ChoicesGrid>
        {choices.map((choice, idx) => {
          const choiceText = choice.text || choice;
          return (
            <ChoiceButton
              key={idx}
              onClick={() => handleChoiceClick(choiceText)}
              $isSelected={selectedChoice === choiceText}
              $showAnswer={showAnswer}
              $isCorrect={choiceText === answerText}
              disabled={showAnswer}
            >
              {choiceText}
            </ChoiceButton>
          );
        })}
      </ChoicesGrid>

      {showAnswer && (
        <Explanation>
          <strong>{selectedChoice === answerText ? '✓ Correct!' : '✗ Incorrect'}</strong>
          <br />
          {explanation}
        </Explanation>
      )}
    </>
  );

  const renderLevel3 = () => (
    <>
      <Question>{questionText}</Question>

      <FlowChartContainer>
        {flowChart && flowChart.map((step, idx) => (
          <React.Fragment key={idx}>
            <FlowChartRow>
              {renderFlowShape(getShapeForType(step.type), step.text, step.missing)}
            </FlowChartRow>
            {idx < flowChart.length - 1 && <Arrow />}
          </React.Fragment>
        ))}
      </FlowChartContainer>

      <ChoicesGrid>
        {choices.map((choice, idx) => {
          const choiceText = choice.text || choice;
          return (
            <ChoiceButton
              key={idx}
              onClick={() => handleChoiceClick(choiceText)}
              $isSelected={selectedChoice === choiceText}
              $showAnswer={showAnswer}
              $isCorrect={choiceText === answerText}
              disabled={showAnswer}
            >
              {choiceText}
            </ChoiceButton>
          );
        })}
      </ChoicesGrid>

      {showAnswer && (
        <Explanation>
          <strong>{selectedChoice === answerText ? '✓ Correct!' : '✗ Incorrect'}</strong>
          <br />
          {explanation}
        </Explanation>
      )}
    </>
  );

  const renderLevel4 = () => {
    const correctAnswer = [answerText];

    return (
      <>
        <Question>{questionText}</Question>

        <FlowChartContainer>
          {flowChart && flowChart.map((step, idx) => (
            <React.Fragment key={idx}>
              <FlowChartRow>
                {renderFlowShape(getShapeForType(step.type), step.text)}
              </FlowChartRow>
              {idx < flowChart.length - 1 && <Arrow />}
            </React.Fragment>
          ))}
        </FlowChartContainer>

        <InputContainer>
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="Enter your answer"
          />
        </InputContainer>

        {showAnswer && explanation && (
          <Explanation>
            {explanation}
          </Explanation>
        )}
      </>
    );
  };

  const renderLevel5 = () => (
    <>
      <Question>{questionText}</Question>

      <FlowChartContainer>
        {flowChart && flowChart.map((step, idx) => (
          <React.Fragment key={idx}>
            <FlowChartRow>
              {renderFlowShape(getShapeForType(step.type), step.text)}
            </FlowChartRow>
            {idx < flowChart.length - 1 && <Arrow />}
          </React.Fragment>
        ))}
      </FlowChartContainer>

      <ChoicesGrid>
        {choices.map((choice, idx) => {
          const choiceText = choice.text || choice;
          return (
            <ChoiceButton
              key={idx}
              onClick={() => handleChoiceClick(choiceText)}
              $isSelected={selectedChoice === choiceText}
              $showAnswer={showAnswer}
              $isCorrect={choiceText === answerText}
              disabled={showAnswer}
            >
              {choiceText}
            </ChoiceButton>
          );
        })}
      </ChoicesGrid>

      {showAnswer && (
        <Explanation>
          <strong>{selectedChoice === answerText ? '✓ Correct!' : '✗ Incorrect'}</strong>
          <br />
          {explanation}
        </Explanation>
      )}
    </>
  );

  // Fallback if no data
  if (!currentProblem?.visualData) {
    return (
      <Container>
        <Title>Flow Charts</Title>
        <Question>Loading lesson data...</Question>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Flow Charts - Level {level}</Title>

      {level === 1 && renderLevel1()}
      {level === 2 && renderLevel2()}
      {level === 3 && renderLevel3()}
      {level === 4 && renderLevel4()}
      {level === 5 && renderLevel5()}
    </Container>
  );
}
