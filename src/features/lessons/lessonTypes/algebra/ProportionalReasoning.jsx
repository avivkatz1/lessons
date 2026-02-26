import React, { useState, useMemo } from "react";
import { useLessonState } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";
import styled from "styled-components";

/**
 * Proportional Reasoning Lesson - 5 Levels
 * L1: Visual Ratios (MC)
 * L2: Ratio Tables (input)
 * L3: Unit Rates (input)
 * L4: Proportional vs Non-Proportional (MC)
 * L5: Real-World Applications (input)
 */

function ProportionalReasoning({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const [showHint, setShowHint] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const { question, answer, acceptedAnswers, hint, explanation, visualData } = currentProblem;

  const questionText = question?.[0]?.text || question || "";
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers?.length > 0) return acceptedAnswers;
    if (Array.isArray(answer)) return answer;
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  const level = visualData?.level || 1;

  const handleTryAnother = () => {
    setShowHint(false);
    setSelectedChoice(null);
    setIsCorrect(null);
    triggerNewProblem();
    hideAnswer();
  };

  const handleChoiceClick = (choice) => {
    if (showAnswer) return;
    setSelectedChoice(choice.text || choice);
    const isCorrectAnswer = choice.correct || correctAnswer.includes(choice.text || choice);
    setIsCorrect(isCorrectAnswer);
    if (isCorrectAnswer) {
      setTimeout(() => {
        revealAnswer();
        // For MC levels (1, 4), auto-advance to next question after showing correct feedback
        if (level === 1 || level === 4) {
          setTimeout(() => {
            handleTryAnother();
          }, 1500); // Show correct feedback for 1.5 seconds, then advance
        }
      }, 300);
    }
  };

  // Render visual ratios (Level 1)
  const renderVisualRatios = () => {
    const { baseRatio, colors, choices } = visualData;
    if (!baseRatio || !colors || !choices) return null;

    // Calculate feedback for incorrect answers
    const getFeedback = (ratio, isCorrect) => {
      if (isCorrect) {
        return "Correct! ✓";
      }
      // For incorrect, explain why
      const baseMultiplier = baseRatio.a > 0 ? ratio.a / baseRatio.a : 0;
      const expectedB = Math.round(baseRatio.b * baseMultiplier * 10) / 10;
      if (Math.abs(expectedB - ratio.b) > 0.1) {
        return `No - if we multiply ${baseRatio.a} by ${baseMultiplier.toFixed(1)} to get ${ratio.a}, we should multiply ${baseRatio.b} by ${baseMultiplier.toFixed(1)} to get ${expectedB}, not ${ratio.b}.`;
      }
      return "No - the ratios don't match.";
    };

    return (
      <VisualSection>
        <VisualTitle>Base Ratio: {baseRatio.a} {colors[0].name} to {baseRatio.b} {colors[1].name}</VisualTitle>
        <BaseRatioDisplay>
          {Array.from({ length: baseRatio.a }).map((_, i) => (
            <ColorBlock key={`base-a-${i}`} color={colors[0].color} />
          ))}
          <Divider />
          {Array.from({ length: baseRatio.b }).map((_, i) => (
            <ColorBlock key={`base-b-${i}`} color={colors[1].color} />
          ))}
        </BaseRatioDisplay>

        <ChoicesTitle>Which of these shows the same ratio?</ChoicesTitle>
        <ChoicesGrid>
          {choices.map((choice, idx) => {
            const ratio = choice.ratio;
            const isSelected = selectedChoice === `${ratio.a} to ${ratio.b}`;
            const showResult = isSelected && isCorrect !== null;

            return (
              <ChoiceCard
                key={idx}
                onClick={() => handleChoiceClick({ text: `${ratio.a} to ${ratio.b}`, correct: choice.correct })}
                isSelected={isSelected}
                isCorrect={showResult ? isCorrect : null}
                disabled={showAnswer}
              >
                <RatioDisplay>
                  {Array.from({ length: ratio.a }).map((_, i) => (
                    <SmallColorBlock key={`${idx}-a-${i}`} color={colors[0].color} />
                  ))}
                  <SmallDivider />
                  {Array.from({ length: ratio.b }).map((_, i) => (
                    <SmallColorBlock key={`${idx}-b-${i}`} color={colors[1].color} />
                  ))}
                </RatioDisplay>
                <RatioLabel>{ratio.a} : {ratio.b}</RatioLabel>
                {showResult && (
                  <FeedbackText isCorrect={isCorrect}>
                    {getFeedback(ratio, isCorrect)}
                  </FeedbackText>
                )}
              </ChoiceCard>
            );
          })}
        </ChoicesGrid>
      </VisualSection>
    );
  };

  // Render ratio table (Level 2)
  const renderRatioTable = () => {
    const { context, tableData } = visualData;
    if (!context || !tableData) return null;

    return (
      <TableSection>
        <TableTitle>{context.unit} and {context.measure}</TableTitle>
        <StyledTable>
          <thead>
            <tr>
              <TableHeader>{context.unit}</TableHeader>
              {tableData.map((d, i) => (
                <TableData key={i}>{d.x}</TableData>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <TableHeader>{context.measure}</TableHeader>
              {tableData.map((d, i) => (
                <TableData key={i} isHidden={d.isHidden}>
                  {d.y}
                </TableData>
              ))}
            </tr>
          </tbody>
        </StyledTable>
      </TableSection>
    );
  };

  // Render proportional vs non-proportional table (Level 4)
  const renderProportionalCheck = () => {
    const { tableData, choices } = visualData;
    if (!tableData || !choices) return null;

    return (
      <TableSection>
        <TableDisplay>
          {tableData.map((d, i) => (
            <TablePair key={i}>
              <PairLabel>x: {d.x}</PairLabel>
              <PairLabel>y: {d.y}</PairLabel>
            </TablePair>
          ))}
        </TableDisplay>
        <ChoicesContainer>
          {choices.map((choice, idx) => {
            const isSelected = selectedChoice === choice.text;
            const showResult = isSelected && isCorrect !== null;

            return (
              <ChoiceButton
                key={idx}
                onClick={() => handleChoiceClick(choice)}
                isSelected={isSelected}
                isCorrect={showResult ? isCorrect : null}
                disabled={showAnswer}
              >
                {choice.text}
              </ChoiceButton>
            );
          })}
        </ChoicesContainer>
      </TableSection>
    );
  };

  return (
    <Wrapper>
      {/* TopHintButton */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* 1. QuestionSection */}
      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      {/* 2. VisualSection - Level-specific rendering */}
      {level === 1 && renderVisualRatios()}
      {level === 2 && renderRatioTable()}
      {level === 4 && renderProportionalCheck()}

      {/* 3. InteractionSection */}
      <InteractionSection>
        {!showAnswer && (
          <>
            {showHint && <HintBox>{hint}</HintBox>}

            {/* Input-based levels (2, 3, 5) */}
            {(level === 2 || level === 3 || level === 5) && (
              <AnswerInputContainer>
                <AnswerInput
                  correctAnswer={correctAnswer}
                  answerType="array"
                  onCorrect={revealAnswer}
                  onTryAnother={handleTryAnother}
                  disabled={showAnswer}
                  placeholder="Enter your answer"
                />
              </AnswerInputContainer>
            )}
          </>
        )}

        {/* Explanation after correct answer */}
        {showAnswer && explanation && (
          <ExplanationSection>
            <ExplanationText>{explanation}</ExplanationText>
            {visualData.educationalNote && (
              <EducationalNote>{visualData.educationalNote}</EducationalNote>
            )}
            <TryAnotherButton onClick={handleTryAnother}>
              Try Another
            </TryAnotherButton>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default ProportionalReasoning;

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

  @media (max-width: 768px) {
    padding: 12px;
  }
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

  @media (max-width: 768px) {
    top: 10px;
    right: 12px;
    padding: 6px 12px;
    font-size: 13px;
  }

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
    border-color: ${props => props.theme.colors.borderDark || props.theme.colors.border};
  }
`;

const QuestionSection = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const QuestionText = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.5;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 20px;
  }
`;

const VisualTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 20px 0;
  text-align: center;
`;

const BaseRatioDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const ColorBlock = styled.div`
  width: 50px;
  height: 50px;
  background-color: ${props => props.color};
  border-radius: 8px;
  border: 2px solid ${props => props.theme.colors.border};
`;

const SmallColorBlock = styled.div`
  width: 30px;
  height: 30px;
  background-color: ${props => props.color};
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const Divider = styled.div`
  width: 3px;
  height: 50px;
  background-color: ${props => props.theme.colors.textSecondary};
  margin: 0 10px;
`;

const SmallDivider = styled.div`
  width: 2px;
  height: 30px;
  background-color: ${props => props.theme.colors.textSecondary};
  margin: 0 8px;
`;

const ChoicesTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 15px 0;
  text-align: center;
`;

const ChoicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const ChoiceCard = styled.button`
  background-color: ${props =>
    props.isCorrect === true ? '#d4edda' :
    props.isCorrect === false ? '#f8d7da' :
    props.isSelected ? props.theme.colors.inputBackground :
    props.theme.colors.cardBackground};
  border: 2px solid ${props =>
    props.isCorrect === true ? '#28a745' :
    props.isCorrect === false ? '#dc3545' :
    props.isSelected ? props.theme.colors.buttonSuccess || '#4ade80' :
    props.theme.colors.border};
  border-radius: 12px;
  padding: 15px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  &:hover {
    ${props => !props.disabled && `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `}
  }

  &:disabled {
    opacity: 0.7;
  }
`;

const RatioDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
`;

const RatioLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
`;

const FeedbackText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isCorrect ? '#155724' : '#721c24'};
  background-color: ${props => props.isCorrect ? '#d4edda' : '#f8d7da'};
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 10px;
  text-align: center;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 6px 10px;
  }
`;

const TableSection = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 20px;
  }
`;

const TableTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 20px 0;
  text-align: center;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
`;

const TableHeader = styled.th`
  background-color: ${props => props.theme.colors.inputBackground};
  color: ${props => props.theme.colors.textPrimary};
  padding: 12px;
  text-align: center;
  font-weight: 600;
  border: 2px solid ${props => props.theme.colors.border};
`;

const TableData = styled.td`
  background-color: ${props => props.isHidden ?
    props.theme.colors.buttonSuccess || '#4ade80' :
    props.theme.colors.pageBackground};
  color: ${props => props.isHidden ? '#fff' : props.theme.colors.textPrimary};
  padding: 12px;
  text-align: center;
  font-size: 18px;
  font-weight: ${props => props.isHidden ? '700' : '500'};
  border: 2px solid ${props => props.theme.colors.border};
`;

const TableDisplay = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
  flex-wrap: wrap;
`;

const TablePair = styled.div`
  background-color: ${props => props.theme.colors.inputBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PairLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
`;

const ChoicesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
`;

const ChoiceButton = styled.button`
  background-color: ${props =>
    props.isCorrect === true ? '#d4edda' :
    props.isCorrect === false ? '#f8d7da' :
    props.isSelected ? props.theme.colors.buttonSuccess || '#4ade80' :
    props.theme.colors.cardBackground};
  color: ${props =>
    props.isCorrect === true ? '#155724' :
    props.isCorrect === false ? '#721c24' :
    props.isSelected ? '#fff' :
    props.theme.colors.textPrimary};
  border: 2px solid ${props =>
    props.isCorrect === true ? '#28a745' :
    props.isCorrect === false ? '#dc3545' :
    props.isSelected ? props.theme.colors.buttonSuccess || '#4ade80' :
    props.theme.colors.border};
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: all 0.2s;
  min-width: 120px;

  &:hover {
    ${props => !props.disabled && `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `}
  }

  &:disabled {
    opacity: 0.7;
  }
`;

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const HintBox = styled.div`
  background: #fff5e6;
  border-left: 4px solid #f6ad55;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 15px;
  color: #744210;
  width: 100%;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px 12px;
  }
`;

const AnswerInputContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 15px 0;
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: #f0fff4;
  border-left: 4px solid #68d391;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const ExplanationText = styled.p`
  font-size: 16px;
  color: #2d3748;
  line-height: 1.6;
  margin: 0 0 12px 0;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const EducationalNote = styled.p`
  font-size: 15px;
  color: #2f855a;
  font-style: italic;
  line-height: 1.6;
  margin: 12px 0;
  padding: 12px;
  background-color: #e6fffa;
  border-radius: 6px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const TryAnotherButton = styled.button`
  background-color: ${props => props.theme.colors.buttonSuccess || '#48BB78'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${props => props.theme.colors.buttonSuccessHover || '#38A169'};
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;
