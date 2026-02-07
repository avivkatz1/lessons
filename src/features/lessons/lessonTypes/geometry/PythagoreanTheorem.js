import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { useLessonState } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, Line, Text, Rect } from "react-konva";

// Pythagorean triples for clean integer answers
const PYTHAGOREAN_TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [6, 8, 10],
  [8, 15, 17],
  [7, 24, 25],
  [9, 12, 15],
  [12, 16, 20],
  [15, 20, 25],
];

// Problem types for Level 3
const PROBLEM_TYPES = ["ladder", "rectangle", "distance"];

// Generate a problem based on level
const generateProblem = (level) => {
  const triple = PYTHAGOREAN_TRIPLES[Math.floor(Math.random() * PYTHAGOREAN_TRIPLES.length)];
  const [a, b, c] = triple;

  if (level === 1) {
    // Level 1: Find hypotenuse (given two legs)
    return {
      sideA: a,
      sideB: b,
      sideC: c,
      hiddenSide: "c",
      answer: c,
      problemType: "basic",
    };
  } else if (level === 2) {
    // Level 2: Find a leg (given hypotenuse and one leg)
    const hideA = Math.random() < 0.5;
    return {
      sideA: hideA ? a : null,
      sideB: hideA ? null : b,
      sideC: c,
      hiddenSide: hideA ? "a" : "b",
      answer: hideA ? a : b,
      problemType: "basic",
    };
  } else {
    // Level 3: Real-world applications
    const problemType = PROBLEM_TYPES[Math.floor(Math.random() * PROBLEM_TYPES.length)];
    const hideWhich = Math.floor(Math.random() * 3); // Can hide any of the three sides

    let hiddenSide, answer;
    if (hideWhich === 0) {
      hiddenSide = "a";
      answer = a;
    } else if (hideWhich === 1) {
      hiddenSide = "b";
      answer = b;
    } else {
      hiddenSide = "c";
      answer = c;
    }

    return {
      sideA: hideWhich === 0 ? null : a,
      sideB: hideWhich === 1 ? null : b,
      sideC: hideWhich === 2 ? null : c,
      hiddenSide,
      answer,
      problemType,
    };
  }
};

// Get problem text for Level 3
const getProblemText = (problem) => {
  const { problemType, sideA, sideB, sideC, hiddenSide } = problem;

  if (problemType === "ladder") {
    if (hiddenSide === "a") {
      return `A ${sideC}-foot ladder reaches ${sideB} feet up a wall. How far is the base of the ladder from the wall?`;
    } else if (hiddenSide === "b") {
      return `A ${sideC}-foot ladder leans against a wall. The base is ${sideA} feet from the wall. How high up the wall does the ladder reach?`;
    } else {
      return `A ladder reaches ${sideB} feet up a wall. The base is ${sideA} feet from the wall. How long is the ladder?`;
    }
  } else if (problemType === "rectangle") {
    if (hiddenSide === "a") {
      return `A rectangle has width ${sideB} inches and diagonal ${sideC} inches. What is the length?`;
    } else if (hiddenSide === "b") {
      return `A rectangle has length ${sideA} inches and diagonal ${sideC} inches. What is the width?`;
    } else {
      return `A rectangle has length ${sideA} inches and width ${sideB} inches. What is the length of the diagonal?`;
    }
  } else {
    // distance
    if (hiddenSide === "a") {
      return `You walk ${sideB} meters north and end up ${sideC} meters from your starting point. How far east did you walk?`;
    } else if (hiddenSide === "b") {
      return `A drone flies ${sideA} blocks east and ends up ${sideC} blocks from its starting point. How far north did it fly?`;
    } else {
      return `You walk ${sideA} meters east and ${sideB} meters north. How far are you from your starting point in a straight line?`;
    }
  }
};

// Render triangle visualization
const TriangleVisualization = ({ problem, level }) => {
  const { sideA, sideB, sideC, hiddenSide, problemType } = problem;
  const width = typeof window !== "undefined" ? window.innerWidth : 800;
  const centerX = width / 2;
  const centerY = 250;

  // Scale factor for visualization
  const scale = 15;

  // Calculate triangle points (right angle at bottom-left)
  const p1 = { x: centerX - (sideB || 50) * scale * 0.5, y: centerY + (sideA || 50) * scale * 0.5 }; // bottom-left (right angle)
  const p2 = { x: centerX + (sideB || 50) * scale * 0.5, y: centerY + (sideA || 50) * scale * 0.5 }; // bottom-right
  const p3 = { x: centerX - (sideB || 50) * scale * 0.5, y: centerY - (sideA || 50) * scale * 0.5 }; // top-left

  // Label positions
  const labelA = { x: p3.x - 60, y: (p1.y + p3.y) / 2 - 10 }; // left side (a)
  const labelB = { x: (p1.x + p2.x) / 2 - 15, y: p1.y + 20 }; // bottom side (b)
  const labelC = { x: (p2.x + p3.x) / 2 + 10, y: (p2.y + p3.y) / 2 }; // hypotenuse (c)

  if (level === 3 && problemType === "rectangle") {
    // Draw rectangle with diagonal for Level 3 rectangle problems
    const rectWidth = (sideA || 50) * scale;
    const rectHeight = (sideB || 50) * scale;
    const rectX = centerX - rectWidth / 2;
    const rectY = centerY - rectHeight / 2;

    return (
      <Layer>
        {/* Rectangle */}
        <Rect
          x={rectX}
          y={rectY}
          width={rectWidth}
          height={rectHeight}
          stroke="black"
          strokeWidth={3}
        />
        {/* Diagonal */}
        <Line
          points={[rectX, rectY + rectHeight, rectX + rectWidth, rectY]}
          stroke="blue"
          strokeWidth={2}
          dash={[5, 5]}
        />
        {/* Labels */}
        <Text
          text={sideA !== null ? `${sideA}"` : "?"}
          fontSize={30}
          fontStyle="bold"
          fill={sideA !== null ? "black" : "red"}
          x={rectX + rectWidth / 2 - 20}
          y={rectY + rectHeight + 10}
        />
        <Text
          text={sideB !== null ? `${sideB}"` : "?"}
          fontSize={30}
          fontStyle="bold"
          fill={sideB !== null ? "black" : "red"}
          x={rectX - 50}
          y={rectY + rectHeight / 2 - 15}
        />
        <Text
          text={sideC !== null ? `${sideC}"` : "?"}
          fontSize={30}
          fontStyle="bold"
          fill={sideC !== null ? "blue" : "red"}
          x={rectX + rectWidth / 2 + 10}
          y={rectY + rectHeight / 2 - 30}
        />
      </Layer>
    );
  } else if (level === 3 && problemType === "ladder") {
    // Draw ladder against wall
    const wallHeight = (sideB || 50) * scale;
    const groundDist = (sideA || 50) * scale;
    const wallX = centerX - groundDist / 2;
    const wallY = centerY;

    return (
      <Layer>
        {/* Wall (vertical line) */}
        <Line
          points={[wallX, wallY + 50, wallX, wallY - wallHeight]}
          stroke="brown"
          strokeWidth={8}
        />
        {/* Ground (horizontal line) */}
        <Line
          points={[wallX - 20, wallY + 50, wallX + groundDist + 20, wallY + 50]}
          stroke="green"
          strokeWidth={6}
        />
        {/* Ladder (hypotenuse) */}
        <Line
          points={[wallX + groundDist, wallY + 50, wallX, wallY - wallHeight + 50]}
          stroke="orange"
          strokeWidth={6}
        />
        {/* Right angle indicator */}
        <Rect
          x={wallX - 15}
          y={wallY + 35}
          width={15}
          height={15}
          stroke="black"
          strokeWidth={2}
        />
        {/* Labels */}
        <Text
          text={sideB !== null ? `${sideB} ft` : "? ft"}
          fontSize={28}
          fontStyle="bold"
          fill={sideB !== null ? "black" : "red"}
          x={wallX - 80}
          y={wallY - wallHeight / 2 + 30}
        />
        <Text
          text={sideA !== null ? `${sideA} ft` : "? ft"}
          fontSize={28}
          fontStyle="bold"
          fill={sideA !== null ? "black" : "red"}
          x={wallX + groundDist / 2 - 30}
          y={wallY + 60}
        />
        <Text
          text={sideC !== null ? `${sideC} ft` : "? ft"}
          fontSize={28}
          fontStyle="bold"
          fill={sideC !== null ? "orange" : "red"}
          x={wallX + groundDist / 2 - 10}
          y={wallY - wallHeight / 2 + 10}
        />
      </Layer>
    );
  } else {
    // Draw standard right triangle
    return (
      <Layer>
        {/* Triangle lines */}
        <Line points={[p1.x, p1.y, p2.x, p2.y]} stroke="black" strokeWidth={3} />
        <Line points={[p1.x, p1.y, p3.x, p3.y]} stroke="black" strokeWidth={3} />
        <Line points={[p2.x, p2.y, p3.x, p3.y]} stroke="blue" strokeWidth={3} />

        {/* Right angle indicator */}
        <Rect x={p1.x - 15} y={p1.y - 15} width={15} height={15} stroke="black" strokeWidth={2} />

        {/* Labels */}
        <Text
          text={sideA !== null ? `a = ${sideA}` : "a = ?"}
          fontSize={30}
          fontStyle="bold"
          fill={hiddenSide === "a" ? "red" : "black"}
          x={labelA.x}
          y={labelA.y}
        />
        <Text
          text={sideB !== null ? `b = ${sideB}` : "b = ?"}
          fontSize={30}
          fontStyle="bold"
          fill={hiddenSide === "b" ? "red" : "black"}
          x={labelB.x}
          y={labelB.y}
        />
        <Text
          text={sideC !== null ? `c = ${sideC}` : "c = ?"}
          fontSize={30}
          fontStyle="bold"
          fill={hiddenSide === "c" ? "red" : "blue"}
          x={labelC.x}
          y={labelC.y}
        />
      </Layer>
    );
  }
};

function PythagoreanTheorem() {
  const { showAnswer, revealAnswer, hideAnswer } = useLessonState();
  const levelNum = useSelector((state) => state.lesson.lessonProps.levelNum);
  const level = levelNum ? parseInt(levelNum) : 1;

  // Initialize problem
  const getInitialState = () => generateProblem(level);
  const [initialState] = useState(getInitialState);
  const [problem, setProblem] = useState(initialState);

  const handleNextProblem = () => {
    hideAnswer();
    setProblem(generateProblem(level));
  };

  // Memoize correct answer
  const correctAnswer = useMemo(() => {
    return problem.answer.toString();
  }, [problem]);

  // Get placeholder text based on level
  const getPlaceholder = () => {
    if (level === 1) return "c = ?";
    if (level === 2) return problem.hiddenSide === "a" ? "a = ?" : "b = ?";
    return "Answer";
  };

  const width = typeof window !== "undefined" ? window.innerWidth : 800;

  return (
    <Wrapper>
      <div className="practice-container">
        <AnswerInput
          correctAnswer={correctAnswer}
          answerType="number"
          onCorrect={revealAnswer}
          onTryAnother={handleNextProblem}
          disabled={showAnswer}
          placeholder={getPlaceholder()}
        />

        {level === 3 && (
          <div className="problem-text">{getProblemText(problem)}</div>
        )}

        <Stage width={width} height={500}>
          <TriangleVisualization problem={problem} level={level} />
        </Stage>

        {level === 1 && !showAnswer && (
          <div className="hint-text">
            Use the formula: a² + b² = c²
          </div>
        )}

        {level === 2 && !showAnswer && (
          <div className="hint-text">
            Rearrange the formula: {problem.hiddenSide === "a" ? "a² = c² - b²" : "b² = c² - a²"}
          </div>
        )}

        {showAnswer && (
          <div className="success-message">
            {level === 1 && `Excellent! c = ${problem.answer}. Remember: ${problem.sideA}² + ${problem.sideB}² = ${problem.answer}² (${problem.sideA * problem.sideA} + ${problem.sideB * problem.sideB} = ${problem.answer * problem.answer})`}
            {level === 2 && `Great work! ${problem.hiddenSide} = ${problem.answer}. You correctly rearranged the Pythagorean formula!`}
            {level === 3 && `Perfect! The answer is ${problem.answer}. You successfully applied the Pythagorean Theorem to a real-world problem!`}
          </div>
        )}
      </div>
    </Wrapper>
  );
}

export default PythagoreanTheorem;

const Wrapper = styled.div`
  .practice-container {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .problem-text {
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    margin: 20px 0;
    padding: 0 20px;
    max-width: 800px;
    line-height: 1.5;
  }

  .hint-text {
    font-size: 20px;
    font-weight: 500;
    color: #555;
    margin-top: 10px;
    font-style: italic;
  }

  .success-message {
    font-size: 20px;
    font-weight: 600;
    color: #4caf50;
    margin-top: 20px;
    padding: 15px;
    background-color: #e8f5e9;
    border-radius: 8px;
    max-width: 800px;
    text-align: center;
  }

  @media (max-width: 768px) {
    .problem-text {
      font-size: 20px;
    }

    .hint-text {
      font-size: 18px;
    }

    .success-message {
      font-size: 18px;
    }
  }
`;
