import React, { useState } from "react";
import { useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import styled from "styled-components";
import { Stage, Layer, Circle, Line, Text, Rect } from "react-konva";
import { AnswerInput } from "../../../../shared/components";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

const GRID_SPACING = 15;
const GRID_OFFSET_X = 310;
const GRID_OFFSET_Y = 10;

/**
 * SlopeTriangle - Interactive visualization of slope using triangles
 * Students explore rise/run relationships by viewing randomly generated slope triangles
 * and revealing the Δy and Δx values to calculate slope.
 */
function SlopeTriangle() {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const generateProblem = () => {
    return {
      originH: 20,
      originV: 15,
      pointX: randomNum(20) + 20,
      pointY: randomNum(5) + 5
    };
  };

  const [problem, setProblem] = useState(generateProblem());
  const [showY, setShowY] = useState(false);
  const [showX, setShowX] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleNewTriangle = () => {
    setProblem(generateProblem());
    setShowY(false);
    setShowX(false);
    setShowAnswer(false);
    setShowHint(false);
  };

  const toggleY = () => {
    setShowY(!showY);
  };

  const toggleX = () => {
    setShowX(!showX);
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const deltaY = problem.originH - problem.pointY;
  const deltaX = -1 * (problem.originV - problem.pointX);
  const slope = deltaY / deltaX;
  const hint = "Click on Δy and Δx to reveal the rise and run, then calculate and enter the slope below.";

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

      {/* 2. VisualSection - Grid and slope triangle */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 1300)} height={500}>
          {/* Grid Layer */}
          <Layer>
            {/* Background for dark mode */}
            <Rect
              x={0}
              y={0}
              width={1300}
              height={500}
              fill={konvaTheme.canvasBackground}
            />

            {/* Horizontal grid lines */}
            {[...Array(30)].map((_, indexH) => {
              const isOrigin = indexH === problem.originH;
              return (
                <Line
                  key={`y${indexH}`}
                  points={[0, 0, 1300, 0]}
                  stroke={isOrigin ? konvaTheme.gridStroke : konvaTheme.gridStrokeLight}
                  strokeWidth={isOrigin ? 2 : 1}
                  x={0}
                  y={indexH * GRID_SPACING + GRID_OFFSET_Y}
                />
              );
            })}

            {/* Vertical grid lines */}
            {[...Array(100)].map((_, indexV) => {
              const isOrigin = indexV === problem.originV + 20;
              return (
                <Line
                  key={`x${indexV}`}
                  points={[0, 0, 0, 500]}
                  stroke={isOrigin ? konvaTheme.gridStroke : konvaTheme.gridStrokeLight}
                  strokeWidth={isOrigin ? 2 : 1}
                  x={indexV * GRID_SPACING + GRID_OFFSET_Y}
                  y={0}
                />
              );
            })}
          </Layer>

          {/* Slope Triangle Layer */}
          <Layer>
            {/* Hypotenuse - red line */}
            <Line
              points={[
                problem.originV * GRID_SPACING + GRID_OFFSET_X,
                problem.originH * GRID_SPACING + GRID_OFFSET_Y,
                problem.pointX * GRID_SPACING + GRID_OFFSET_X,
                problem.pointY * GRID_SPACING + GRID_OFFSET_Y,
              ]}
              stroke="red"
              strokeWidth={3}
            />

            {/* Vertical side (rise) - blue */}
            <Line
              points={[
                problem.pointX * GRID_SPACING + GRID_OFFSET_X,
                problem.pointY * GRID_SPACING + GRID_OFFSET_Y,
                problem.pointX * GRID_SPACING + GRID_OFFSET_X,
                problem.originH * GRID_SPACING + GRID_OFFSET_Y,
              ]}
              stroke="blue"
              strokeWidth={15}
              opacity={0.4}
            />

            {/* Horizontal side (run) - green */}
            <Line
              points={[
                problem.originV * GRID_SPACING + GRID_OFFSET_X,
                problem.originH * GRID_SPACING + GRID_OFFSET_Y,
                problem.pointX * GRID_SPACING + GRID_OFFSET_X,
                problem.originH * GRID_SPACING + GRID_OFFSET_Y,
              ]}
              stroke="green"
              strokeWidth={15}
              opacity={0.4}
            />

            {/* Point markers */}
            <Circle
              x={problem.pointX * GRID_SPACING + GRID_OFFSET_X}
              y={problem.pointY * GRID_SPACING + GRID_OFFSET_Y}
              fill={konvaTheme.shapeStroke}
              radius={8}
            />
            <Circle
              x={problem.originV * GRID_SPACING + GRID_OFFSET_X}
              y={problem.originH * GRID_SPACING + GRID_OFFSET_Y}
              fill={konvaTheme.shapeStroke}
              opacity={0.5}
              radius={3}
            />

            {/* Δy Label (rise) */}
            <Text
              fontSize={50}
              fontStyle="bold"
              fill="blue"
              text={showY ? `${deltaY}` : `Δy`}
              x={problem.pointX * GRID_SPACING + GRID_OFFSET_X + 10}
              y={(problem.pointY * GRID_SPACING + GRID_OFFSET_Y + problem.originH * GRID_SPACING + GRID_OFFSET_Y) / 2}
              opacity={0.6}
              onClick={toggleY}
            />

            {/* Δx Label (run) */}
            <Text
              fontSize={50}
              fontStyle="bold"
              fill="green"
              text={showX ? `${deltaX}` : `Δx`}
              x={(problem.originV * GRID_SPACING + GRID_OFFSET_X + problem.pointX * GRID_SPACING + GRID_OFFSET_X) / 2 - 25}
              y={problem.originH * GRID_SPACING + GRID_OFFSET_Y + 10}
              opacity={0.6}
              onClick={toggleX}
            />

            {/* Slope Answer */}
            {showAnswer && (
              <Text
                fontSize={40}
                fontStyle="bold"
                fill="red"
                text={`Slope = ${deltaY}/${deltaX} = ${slope.toFixed(2)}`}
                x={problem.pointX * GRID_SPACING + GRID_OFFSET_X - 200}
                y={problem.pointY * GRID_SPACING + GRID_OFFSET_Y - 60}
                opacity={0.8}
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
                correctAnswer={slope.toFixed(2)}
                answerType="number"
                onCorrect={() => setShowAnswer(true)}
                onTryAnother={handleNewTriangle}
                disabled={showAnswer}
                placeholder="slope = ?"
              />
            </AnswerInputContainer>
          </>
        )}
        <ButtonRow>
          <ActionButton onClick={handleNewTriangle}>
            New Slope Triangle
          </ActionButton>
        </ButtonRow>
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content (shown after correct answer) */}
      {showAnswer && (
      <ExplanationSection>
        <ExplanationTitle>Understanding Slope Triangles</ExplanationTitle>
        <ExplanationText>
          <strong>Slope</strong> measures the steepness of a line and is calculated using the
          rise-over-run formula.
        </ExplanationText>
        <ExplanationText>
          <strong>Formula:</strong>
        </ExplanationText>
        <FormulaBox>
          slope = rise / run = Δy / Δx
        </FormulaBox>
        <ExplanationText>
          <strong>In this visualization:</strong>
        </ExplanationText>
        <PropertyList>
          <li><strong style={{ color: "red" }}>Red line:</strong> The hypotenuse of the slope triangle</li>
          <li><strong style={{ color: "blue" }}>Blue line (Δy):</strong> The vertical change (rise)</li>
          <li><strong style={{ color: "green" }}>Green line (Δx):</strong> The horizontal change (run)</li>
        </PropertyList>
        <ExplanationText>
          <strong>How to use this tool:</strong>
        </ExplanationText>
        <PropertyList>
          <li>Click on <strong>Δy</strong> to reveal the vertical change (rise)</li>
          <li>Click on <strong>Δx</strong> to reveal the horizontal change (run)</li>
          <li>Click <strong>Show Answer</strong> to see the calculated slope</li>
          <li>Click <strong>New Slope Triangle</strong> to practice with a different triangle</li>
        </PropertyList>
      </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default SlopeTriangle;

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
  background-color: ${props => props.secondary ? props.theme.colors.buttonSecondary : props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    font-size: 20px;
    padding: 16px 32px;
  }

  @media (min-width: 1024px) {
    font-size: 22px;
    padding: 18px 36px;
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
  color: ${props => props.theme.colors.textSecondary};
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
    color: ${props => props.theme.colors.textSecondary};
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
