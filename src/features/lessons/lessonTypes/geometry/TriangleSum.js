import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, Line, Text, Rect } from "react-konva";

// Generate three angles that sum to 180
const generateAngles = () => {
  const angle1 = numbers(1, 120, 20)[0]; // 20-140 degrees
  const angle2 = numbers(1, Math.min(120, 160 - angle1), 20)[0]; // ensure room for angle3
  const angle3 = 180 - angle1 - angle2;
  return [angle1, angle2, angle3];
};

// Generate random triangle points with varied shapes, sizes, and positions
const generatePoints = () => {
  // Random center position
  const centerX = 200 + Math.random() * 200; // 200-400
  const centerY = 200 + Math.random() * 100; // 200-300

  // Random size (scale factor)
  const scale = 0.7 + Math.random() * 0.5; // 0.7-1.2x

  // Random rotation
  const rotation = Math.random() * Math.PI * 2; // 0-360 degrees

  // Random triangle shape (acute, obtuse, or right-ish)
  const shapeType = Math.floor(Math.random() * 3);
  let baseTriangle;

  if (shapeType === 0) {
    // Acute triangle
    baseTriangle = [
      [0, -120],
      [-100, 80],
      [100, 80],
    ];
  } else if (shapeType === 1) {
    // Obtuse triangle
    baseTriangle = [
      [-140, -40],
      [-80, 100],
      [120, 60],
    ];
  } else {
    // Right-ish triangle
    baseTriangle = [
      [-110, -80],
      [-110, 90],
      [110, 90],
    ];
  }

  // Apply scale, rotation, and translation
  const rotatedPoints = baseTriangle.map(([x, y]) => {
    // Scale
    const scaledX = x * scale;
    const scaledY = y * scale;
    // Rotate
    const rotatedX = scaledX * Math.cos(rotation) - scaledY * Math.sin(rotation);
    const rotatedY = scaledX * Math.sin(rotation) + scaledY * Math.cos(rotation);
    // Translate to center
    return [centerX + rotatedX, centerY + rotatedY];
  });

  // Close the triangle by repeating first point
  return [...rotatedPoints, rotatedPoints[0]];
};

// Phase 2 - Stage 4: Memoized triangle line component to prevent unnecessary re-renders
const TriangleLine = React.memo(({ points, stroke }) => (
  <Line stroke={stroke} strokeWidth={3} points={points.flat()} />
));

function TriangleSum({ triggerNewProblem }) {
  // Phase 2 - Stage 5: Use shared lesson state hook
  const { showAnswer, revealAnswer, hideAnswer } = useLessonState();
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  // Initialize state only once
  const getInitialState = () => {
    return {
      terms: generateAngles(),
      coeff: Math.floor(Math.random() * 4) + 1,
      points: generatePoints(),
    };
  };

  const [initialState] = useState(getInitialState);
  const [terms, setTerms] = useState(initialState.terms);
  const [coeff, setCoeff] = useState(initialState.coeff);
  const [points, setPoints] = useState(initialState.points);
  const [showHint, setShowHint] = useState(false);

  const handleNextProblem = () => {
    hideAnswer();
    setTerms(generateAngles());
    setCoeff(Math.floor(Math.random() * 4) + 1);
    setPoints(generatePoints());
    setShowHint(false);
  };

  // Phase 2 - Stage 4: Memoize correct answer to prevent recalculation on every render
  const correctAnswer = useMemo(() => {
    return (terms[2] / coeff).toFixed(1);
  }, [terms, coeff]);

  // Phase 2 - Stage 4: Memoize centroid calculation
  const centroid = useMemo(() => {
    const sumX = points[0][0] + points[1][0] + points[2][0];
    const sumY = points[0][1] + points[1][1] + points[2][1];
    return [sumX / 3, sumY / 3];
  }, [points]);

  // Phase 2 - Stage 4: Memoize label positions to avoid recalculating for each angle
  const labelPositions = useMemo(() => {
    return points.slice(0, 3).map((vertex) => {
      // Position label 30% of the way from vertex to centroid (inside triangle)
      const offsetRatio = 0.3;
      const x = vertex[0] + (centroid[0] - vertex[0]) * offsetRatio;
      const y = vertex[1] + (centroid[1] - vertex[1]) * offsetRatio;
      return { x: x - 20, y: y - 15 }; // Offset for text centering
    });
  }, [points, centroid]);

  const hint = "Find the value of x. (Remember: The sum of angles in a triangle is 180°)";

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Section 2: QuestionSection - Centered question text */}
      <QuestionSection>
        {/* Question text hidden until hint button clicked */}
      </QuestionSection>

      {/* Section 3: VisualSection - Light background container for triangle */}
      <VisualSection>
        <Stage width={Math.min(width - 40, 600)} height={500}>
          <Layer>
            {/* Background for dark mode */}
            <Rect
              x={0}
              y={0}
              width={600}
              height={500}
              fill={konvaTheme.canvasBackground}
            />
            <TriangleLine points={points} stroke={konvaTheme.shapeStroke} />
          </Layer>
          <Layer>
            {terms.map((term, index) => {
              const labelPos = labelPositions[index];
              if (index === 2 && showAnswer)
                return (
                  <Text
                    key={`dk${index * 23423}`}
                    fontSize={32}
                    fontStyle={"bold"}
                    fill={konvaTheme.labelText}
                    text={`x = ${(term / coeff).toFixed(1)}`}
                    x={labelPos.x}
                    y={labelPos.y}
                  />
                );
              else if (index === 2 && !showAnswer)
                return (
                  <Text
                    key={`dk${index * 23423}`}
                    fontSize={40}
                    fontStyle={"bold"}
                    fill={konvaTheme.labelText}
                    text={`${coeff}x`}
                    x={labelPos.x}
                    y={labelPos.y}
                  />
                );
              else
                return (
                  <Text
                    key={`dk${index * 23423}`}
                    fontSize={40}
                    fontStyle={"bold"}
                    fill={konvaTheme.labelText}
                    text={`${term}°`}
                    x={labelPos.x}
                    y={labelPos.y}
                  />
                );
            })}
          </Layer>
        </Stage>
      </VisualSection>

      {/* Section 4: InteractionSection - Answer input */}
      <InteractionSection>
        {!showAnswer && (
          <>
            {showHint && hint && (
              <HintBox>{hint}</HintBox>
            )}

            <AnswerInputContainer>
              <AnswerInput
                correctAnswer={correctAnswer}
                answerType="number"
                onCorrect={revealAnswer}
                onTryAnother={handleNextProblem}
                disabled={showAnswer}
                placeholder="x = ?"
              />
            </AnswerInputContainer>
          </>
        )}

        {/* Section 5: ExplanationSection - Green background on answer reveal */}
        {showAnswer && (
          <ExplanationSection>
            <ExplanationText>
              <strong>Solution:</strong> Since the sum of angles in a triangle equals 180°, we can write:
              {terms[0]}° + {terms[1]}° + {coeff}x = 180°
            </ExplanationText>
            <ExplanationText>
              Simplifying: {terms[0] + terms[1]}° + {coeff}x = 180°
            </ExplanationText>
            <ExplanationText>
              Solving for x: {coeff}x = {180 - terms[0] - terms[1]}°
            </ExplanationText>
            <ExplanationText>
              Therefore: x = {correctAnswer}°
            </ExplanationText>
          </ExplanationSection>
        )}
      </InteractionSection>
    </Wrapper>
  );
}

export default TriangleSum;

// Styled Components

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

const AnswerInputContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 20px;
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
