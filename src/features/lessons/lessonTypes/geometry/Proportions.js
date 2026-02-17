import React, { useState } from "react";
import { useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import styled from "styled-components";
import { Stage, Layer, Line, Text, Rect } from "react-konva";
import { AnswerInput } from "../../../../shared/components";

const randomNum = (max) => {
  return Math.floor(Math.random() * max);
};

/**
 * Proportions - Interactive exploration of proportions and cross-multiplication
 * Students solve for x in proportion equations like a/b = c/x
 * Can toggle between viewing variables or the actual equal ratios
 */
function Proportions({ triggerNewProblem }) {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const createNumbers = (randIndex) => {
    const num = randomNum(10) + 1;
    const a = randomNum(5) + 1;
    const b = randomNum(20);
    const multiplierOne = randomNum(10) + 2;
    const multiplierTwo = randomNum(10) + 2;

    const proportionNumbers = [
      [num, multiplierOne * num, num * multiplierTwo, num * multiplierTwo * multiplierOne],
      [multiplierOne * num, num, num * multiplierTwo * multiplierOne, num * multiplierTwo],
      [num * multiplierTwo, num * multiplierTwo * multiplierOne, num, multiplierOne * num],
      [num * multiplierTwo * multiplierOne, num * multiplierTwo, multiplierOne * num, num],
    ];

    const chosenProportion = proportionNumbers[randIndex];

    return chosenProportion.map((term, index) => {
      if (index === randIndex) {
        return {
          num: `${a}x-${b}`,
          numVar: term,
          xVal: Math.round(((term + b) / a) * 1000) / 1000,
        };
      }
      return { num: term, numVar: term };
    });
  };

  const [randomVar, setRandomVar] = useState(() => randomNum(4));
  const [terms, setTerms] = useState(() => createNumbers(randomVar));
  const [showAnswer, setShowAnswer] = useState(false);
  const [showRatio, setShowRatio] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleNewProportion = () => {
    const newRandom = randomNum(4);
    setRandomVar(newRandom);
    setTerms(createNumbers(newRandom));
    setShowAnswer(false);
    setShowRatio(false);
    setShowHint(false);
  };

  const toggleRatio = () => {
    setShowRatio(!showRatio);
  };

  const hint = "Solve for x in the proportion shown below. Use cross-multiplication!";

  const textCoords = [
    { x: 340, y: 124 },
    { x: 540, y: 124 },
    { x: 340, y: 194 },
    { x: 540, y: 194 },
  ];

  const canvasWidth = Math.min(width - 40, 900);
  const canvasHeight = 500;

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showAnswer && !showHint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        {/* Question text hidden until hint button clicked */}
      </QuestionSection>

      {/* 2. VisualSection - Proportion visualization */}
      <VisualSection>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            {/* Background for dark mode */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />

            {/* Horizontal line (top of fraction bar) */}
            <Line
              stroke={konvaTheme.shapeStroke}
              strokeWidth={10}
              points={[300, 176, 420, 176]}
            />

            {/* Horizontal line (bottom of fraction bar) */}
            <Line
              stroke={konvaTheme.shapeStroke}
              strokeWidth={10}
              points={[501, 176, 621, 176]}
            />

            {/* Equals sign (top line) */}
            <Line
              stroke={konvaTheme.shapeStroke}
              strokeWidth={4}
              points={[446, 170, 474, 170]}
            />

            {/* Equals sign (bottom line) */}
            <Line
              stroke={konvaTheme.shapeStroke}
              strokeWidth={4}
              points={[446, 185, 474, 185]}
            />

            {/* Proportion numbers */}
            {textCoords.map((coord, index) => {
              const displayText = index === randomVar && !showRatio
                ? terms[index].num
                : terms[index].numVar;

              const xOffset =
                index === randomVar && !showRatio
                  ? -30
                  : terms[index].numVar >= 100
                    ? -15
                    : terms[index].numVar > 10
                      ? -10
                      : 0;

              return (
                <Text
                  key={`term${index}`}
                  fontSize={50}
                  fontStyle="bold"
                  fill={konvaTheme.labelText}
                  text={String(displayText)}
                  x={coord.x + xOffset}
                  y={coord.y}
                  width={200}
                  wrap="word"
                />
              );
            })}

            {/* Answer display */}
            {showAnswer && (
              <Text
                fontSize={50}
                fontStyle="bold"
                fill="#EF4444"
                text={`x = ${terms[randomVar].xVal}`}
                x={350}
                y={350}
                wrap="word"
              />
            )}
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Answer input and controls */}
      <InteractionSection>
        {!showAnswer && (
          <>
            {showHint && (
              <HintBox>{hint}</HintBox>
            )}
            <AnswerInputContainer>
              <AnswerInput
                correctAnswer={String(terms[randomVar].xVal)}
                answerType="number"
                onCorrect={() => setShowAnswer(true)}
                onTryAnother={handleNewProportion}
                disabled={showAnswer}
                placeholder="x = ?"
              />
            </AnswerInputContainer>
          </>
        )}
        <ButtonRow>
          <ActionButton onClick={handleNewProportion}>
            New Proportion
          </ActionButton>
          <ActionButton onClick={toggleRatio} secondary>
            {showRatio ? "View with Variable" : "See Equal Ratios"}
          </ActionButton>
        </ButtonRow>
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content (shown after correct answer) */}
      {showAnswer && (
      <ExplanationSection>
        <ExplanationTitle>Understanding Proportions</ExplanationTitle>
        <ExplanationText>
          <strong>Proportions</strong> are equations that show two ratios are equal. They're written
          in the form: a/b = c/d
        </ExplanationText>
        <ExplanationText>
          <strong>Cross-Multiplication Method:</strong>
        </ExplanationText>
        <FormulaBox>
          If a/b = c/d, then a × d = b × c
        </FormulaBox>
        <ExplanationText>
          <strong>Steps to solve for x:</strong>
        </ExplanationText>
        <PropertyList>
          <li><strong>Step 1:</strong> Identify the two equal ratios (fractions)</li>
          <li><strong>Step 2:</strong> Cross-multiply: multiply diagonally</li>
          <li><strong>Step 3:</strong> Create an equation from the products</li>
          <li><strong>Step 4:</strong> Solve for x using algebra</li>
        </PropertyList>
        <ExplanationText>
          <strong>Example:</strong> If 3/6 = x/12, then 3 × 12 = 6 × x, so 36 = 6x, therefore x = 6
        </ExplanationText>
        <ExplanationText>
          Use the <strong>"See Equal Ratios"</strong> button to view the actual numbers without
          the variable, and see how the proportions are truly equal!
        </ExplanationText>
      </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default Proportions;

// Styled Components - TangentLesson 5-section layout standard

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 30px;
  }

  @media (min-width: 1024px) {
    padding: 40px;
  }
`;

const QuestionSection = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    margin-bottom: 30px;
  }
`;

const QuestionText = styled.p`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }

  @media (min-width: 1024px) {
    font-size: 26px;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    padding: 30px;
    margin-bottom: 30px;
  }

  @media (min-width: 1024px) {
    padding: 40px;
  }
`;

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 30px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;

  @media (min-width: 768px) {
    gap: 20px;
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.secondary ? '#4299e1' : '#48BB78'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${props => props.secondary ? '#3182ce' : '#38A169'};
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    font-size: 18px;
    padding: 14px 28px;
  }

  @media (min-width: 1024px) {
    font-size: 20px;
    padding: 16px 32px;
  }
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: #f0fff4;
  border-left: 4px solid #68d391;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;

  @media (min-width: 768px) {
    padding: 25px;
    margin-top: 30px;
  }

  @media (min-width: 1024px) {
    padding: 30px;
  }
`;

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #2f855a;
  margin: 0 0 15px 0;

  @media (min-width: 768px) {
    font-size: 22px;
    margin-bottom: 20px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
  }
`;

const ExplanationText = styled.p`
  font-size: 16px;
  color: #2d3748;
  line-height: 1.6;
  margin: 0 0 12px 0;

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: 768px) {
    font-size: 17px;
    margin-bottom: 15px;
  }

  @media (min-width: 1024px) {
    font-size: 18px;
  }
`;

const FormulaBox = styled.div`
  background-color: #e6fffa;
  border: 2px solid #4299e1;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  color: #2c5282;

  @media (min-width: 768px) {
    font-size: 22px;
    padding: 18px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
    padding: 20px;
  }
`;

const PropertyList = styled.ul`
  margin: 15px 0;
  padding-left: 20px;

  li {
    font-size: 16px;
    color: #2d3748;
    line-height: 1.8;
    margin-bottom: 8px;

    @media (min-width: 768px) {
      font-size: 17px;
      margin-bottom: 10px;
    }

    @media (min-width: 1024px) {
      font-size: 18px;
    }
  }
`;

const AnswerInputContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  @media (min-width: 768px) {
    margin: 15px 0;
  }
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  margin-bottom: 0;
  z-index: 100;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

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

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
    border-color: ${props => props.theme.colors.borderDark};
  }
`;

const HintBox = styled.div`
  background: #fff5e6;
  border-left: 4px solid #f6ad55;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 15px;
  color: #744210;

  @media (max-width: 1024px) {
    padding: 10px;
    margin-bottom: 12px;
    font-size: 14px;
  }
`;
