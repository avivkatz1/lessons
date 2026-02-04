import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { useLessonState } from "../../../../hooks";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, Line, Text } from "react-konva";

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
const TriangleLine = React.memo(({ points }) => (
  <Line stroke="black" strokeWidth={3} points={points.flat()} />
));

function TriangleSum({ triggerNewProblem }) {
  // Phase 2 - Stage 5: Use shared lesson state hook
  const { showAnswer, revealAnswer, hideAnswer } = useLessonState();

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

  const handleNextProblem = () => {
    hideAnswer();
    setTerms(generateAngles());
    setCoeff(Math.floor(Math.random() * 4) + 1);
    setPoints(generatePoints());
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

  return (
    <Wrapper>
      <div className="practice-container">
        <AnswerInput
          correctAnswer={correctAnswer}
          answerType="number"
          onCorrect={revealAnswer}
          onTryAnother={handleNextProblem}
          disabled={showAnswer}
          placeholder="x = ?"
        />
        <Stage width={window.innerWidth} height={500} fill={"lightgreen"}>
          <Layer>
            <TriangleLine points={points} />
          </Layer>
          <Layer>
            {terms.map((term, index) => {
              const labelPos = labelPositions[index];
              if (index == 2 && showAnswer)
                return (
                  <Text
                    key={`dk${index * 23423}`}
                    fontSize={32}
                    fontStyle={"bold"}
                    fill={"red"}
                    text={`x = ${(term / coeff).toFixed(1)}`}
                    x={labelPos.x}
                    y={labelPos.y}
                  />
                );
              else if (index == 2 && !showAnswer)
                return (
                  <Text
                    key={`dk${index * 23423}`}
                    fontSize={40}
                    fontStyle={"bold"}
                    fill={"red"}
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
                    fill={"red"}
                    text={`${term}°`}
                    x={labelPos.x}
                    y={labelPos.y}
                  />
                );
            })}
          </Layer>
        </Stage>
      </div>
    </Wrapper>
  );
}

export default TriangleSum;

const Wrapper = styled.div``;
