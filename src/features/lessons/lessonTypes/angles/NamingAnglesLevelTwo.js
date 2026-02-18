import React, { useState } from "react";
import styled from "styled-components";
import { useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { Stage, Layer, Circle, Line, Text, Rect, Arc } from "react-konva";

// Multiple line configurations for diagram variety
// Each configuration includes lines, points, and valid angle combinations
const lineConfigurations = [
  {
    // Configuration 1: X pattern - two lines crossing
    lines: [
      [100, 150, 700, 150],  // Horizontal
      [200, 80, 600, 380],   // Diagonal down
      [200, 380, 600, 80],   // Diagonal up
    ],
    points: [
      { x: 100, y: 150, xText: 80, yText: 125 },   // 0
      { x: 300, y: 150, xText: 285, yText: 125 },  // 1 - intersection
      { x: 500, y: 150, xText: 485, yText: 125 },  // 2 - intersection
      { x: 700, y: 150, xText: 720, yText: 125 },  // 3
      { x: 200, y: 80, xText: 185, yText: 55 },    // 4
      { x: 350, y: 190, xText: 335, yText: 195 },  // 5 - on diagonal
      { x: 450, y: 270, xText: 435, yText: 275 },  // 6 - on diagonal
      { x: 600, y: 380, xText: 585, yText: 390 },  // 7
      { x: 200, y: 380, xText: 185, yText: 390 },  // 8
      { x: 350, y: 270, xText: 335, yText: 275 },  // 9 - on diagonal
      { x: 450, y: 190, xText: 435, yText: 195 },  // 10 - on diagonal
      { x: 600, y: 80, xText: 585, yText: 55 },    // 11
    ],
    // Valid angles: [point1_index, vertex_index, point2_index]
    validAngles: [
      [0, 1, 4],   // horizontal-diagonal at left intersection
      [0, 1, 5],
      [4, 1, 3],
      [5, 1, 3],
      [0, 2, 10],  // horizontal-diagonal at right intersection
      [0, 2, 11],
      [10, 2, 3],
      [11, 2, 3],
      [4, 1, 8],   // diagonals crossing at left
      [4, 1, 9],
      [8, 1, 5],
      [9, 1, 5],
      [10, 2, 7],  // diagonals crossing at right
      [10, 2, 6],
      [7, 2, 11],
      [6, 2, 11],
    ]
  },
  {
    // Configuration 2: Star pattern - 4 lines from center
    lines: [
      [400, 250, 150, 100],  // to upper left
      [400, 250, 650, 100],  // to upper right
      [400, 250, 650, 400],  // to lower right
      [400, 250, 150, 400],  // to lower left
    ],
    points: [
      { x: 400, y: 250, xText: 410, yText: 220 },  // 0 - center
      { x: 150, y: 100, xText: 130, yText: 80 },   // 1
      { x: 275, y: 175, xText: 255, yText: 180 },  // 2
      { x: 650, y: 100, xText: 670, yText: 80 },   // 3
      { x: 525, y: 175, xText: 545, yText: 180 },  // 4
      { x: 650, y: 400, xText: 670, yText: 420 },  // 5
      { x: 525, y: 325, xText: 545, yText: 330 },  // 6
      { x: 150, y: 400, xText: 130, yText: 420 },  // 7
      { x: 275, y: 325, xText: 255, yText: 330 },  // 8
    ],
    validAngles: [
      [1, 0, 3],   // upper angle
      [2, 0, 4],
      [3, 0, 5],   // right angle
      [4, 0, 6],
      [5, 0, 7],   // lower angle
      [6, 0, 8],
      [7, 0, 1],   // left angle
      [8, 0, 2],
      [1, 0, 5],   // diagonal
      [3, 0, 7],
      [2, 0, 6],
      [4, 0, 8],
    ]
  },
  {
    // Configuration 3: Parallel lines with transversal
    lines: [
      [100, 150, 700, 150],  // Top horizontal
      [100, 300, 700, 300],  // Bottom horizontal
      [200, 80, 500, 380],   // Transversal
    ],
    points: [
      { x: 100, y: 150, xText: 80, yText: 125 },   // 0
      { x: 300, y: 150, xText: 285, yText: 125 },  // 1 - top intersection
      { x: 500, y: 150, xText: 485, yText: 125 },  // 2
      { x: 700, y: 150, xText: 720, yText: 125 },  // 3
      { x: 100, y: 300, xText: 80, yText: 325 },   // 4
      { x: 375, y: 300, xText: 360, yText: 325 },  // 5 - bottom intersection
      { x: 550, y: 300, xText: 535, yText: 325 },  // 6
      { x: 700, y: 300, xText: 720, yText: 325 },  // 7
      { x: 200, y: 80, xText: 185, yText: 55 },    // 8
      { x: 250, y: 115, xText: 235, yText: 120 },  // 9 - on transversal
      { x: 425, y: 265, xText: 410, yText: 270 },  // 10 - on transversal
      { x: 500, y: 380, xText: 485, yText: 390 },  // 11
    ],
    validAngles: [
      [0, 1, 8],   // top intersection angles
      [0, 1, 9],
      [8, 1, 3],
      [9, 1, 3],
      [2, 1, 8],
      [2, 1, 9],
      [4, 5, 10],  // bottom intersection angles
      [4, 5, 11],
      [10, 5, 7],
      [11, 5, 7],
      [6, 5, 10],
      [6, 5, 11],
    ]
  },
  {
    // Configuration 4: Triangle with extra lines
    lines: [
      [200, 100, 600, 100],  // Top
      [200, 100, 400, 380],  // Left side
      [600, 100, 400, 380],  // Right side
      [200, 100, 650, 380],  // Extra diagonal
    ],
    points: [
      { x: 200, y: 100, xText: 180, yText: 75 },   // 0 - top left vertex
      { x: 400, y: 100, xText: 385, yText: 75 },   // 1 - on top
      { x: 600, y: 100, xText: 620, yText: 75 },   // 2 - top right vertex
      { x: 300, y: 240, xText: 280, yText: 245 },  // 3 - on left side
      { x: 500, y: 240, xText: 520, yText: 245 },  // 4 - on right side
      { x: 400, y: 380, xText: 385, yText: 395 },  // 5 - bottom vertex
      { x: 425, y: 240, xText: 445, yText: 245 },  // 6 - on extra diagonal
      { x: 650, y: 380, xText: 670, yText: 395 },  // 7 - end of extra diagonal
    ],
    validAngles: [
      [1, 0, 3],   // top left vertex angles
      [1, 0, 5],
      [2, 0, 6],
      [2, 0, 7],
      [0, 2, 1],   // top right vertex angles
      [0, 2, 4],
      [1, 2, 5],
      [4, 2, 5],
      [3, 5, 4],   // bottom vertex angles
      [3, 5, 0],
      [4, 5, 2],
      [0, 5, 2],
    ]
  },
];

const varLetters = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "m",
  "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z",
];

/**
 * NamingAnglesLevelTwo - Interactive angle naming practice
 * Students click on three points to name an angle using three-letter notation
 * Demonstrates proper angle naming convention with vertex in the middle
 */
function NamingAnglesLevelTwo({ triggerNewProblem }) {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  // Create shuffled letters and initialize angle/points with random diagram
  const generateProblem = () => {
    // Randomly select a line configuration
    const configIndex = Math.floor(Math.random() * lineConfigurations.length);
    const selectedConfig = lineConfigurations[configIndex];

    const shuffledLetters = varLetters
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    // Pick a random valid angle from this configuration
    const validAngle = selectedConfig.validAngles[
      Math.floor(Math.random() * selectedConfig.validAngles.length)
    ];

    const angle = validAngle.map((angIndex) => shuffledLetters[angIndex]);

    const points = selectedConfig.points.map((pOnLine, index) => {
      return { ...pOnLine, fill: konvaTheme.shapeStroke, text: shuffledLetters[index] };
    });

    // Calculate arc parameters for visual indicator
    const [idx1, idxVertex, idx2] = validAngle;
    const p1 = selectedConfig.points[idx1];
    const vertex = selectedConfig.points[idxVertex];
    const p2 = selectedConfig.points[idx2];

    const dx1 = p1.x - vertex.x;
    const dy1 = p1.y - vertex.y;
    const dx2 = p2.x - vertex.x;
    const dy2 = p2.y - vertex.y;

    const angle1 = Math.atan2(dy1, dx1) * (180 / Math.PI);
    const angle2 = Math.atan2(dy2, dx2) * (180 / Math.PI);

    let arcAngle = angle2 - angle1;
    if (arcAngle < 0) arcAngle += 360;
    if (arcAngle > 180) arcAngle = 360 - arcAngle;

    const arcInfo = {
      x: vertex.x,
      y: vertex.y,
      radius: 40,
      angle: arcAngle,
      rotation: Math.min(angle1, angle2)
    };

    return { angle, points, lines: selectedConfig.lines, arcInfo };
  };

  const [problem, setProblem] = useState(() => generateProblem());
  const [angleAnswer] = useState(problem.angle);
  const [pointsOnLines, setPointsOnLines] = useState(problem.points);
  const [currentLines, setCurrentLines] = useState(problem.lines);
  const [arcInfo, setArcInfo] = useState(problem.arcInfo);
  const [answerArray, setAnswerArray] = useState([]);
  const [correct, setCorrect] = useState(true);
  const [showSuccessArc, setShowSuccessArc] = useState(false);

  const handlePoint = (e) => {
    const { id } = e.target.attrs;

    // Check if clicked point is valid for current position in answer
    const isInvalid =
      !angleAnswer.includes(id) ||
      (answerArray.length === 1 && id !== angleAnswer[1]) ||
      (answerArray.length === 0 && id === angleAnswer[1]) ||
      (answerArray.length === 2 && id === angleAnswer[1]);

    if (isInvalid) {
      // Wrong answer - show feedback and reset
      setCorrect(false);
      const resetPoints = pointsOnLines.map((p) => ({
        ...p,
        fill: konvaTheme.shapeStroke,
      }));
      setPointsOnLines(resetPoints);

      setTimeout(() => {
        setCorrect(true);
        setAnswerArray([]);
      }, 2000);
    } else {
      // Correct point - add to answer and highlight
      const newAnswerArray = [...answerArray, id];
      setAnswerArray(newAnswerArray);
      const updatedPoints = pointsOnLines.map((p) => {
        if (p.text !== id) return p;
        return { ...p, fill: konvaTheme.opposite };
      });
      setPointsOnLines(updatedPoints);

      // Check if all 3 points clicked correctly
      if (newAnswerArray.length === 3) {
        setShowSuccessArc(true);
      }
    }
  };

  const handleNextProblem = () => {
    const newProblem = generateProblem();
    setProblem(newProblem);
    setPointsOnLines(newProblem.points);
    setCurrentLines(newProblem.lines);
    setArcInfo(newProblem.arcInfo);
    setAnswerArray([]);
    setShowSuccessArc(false);
    setCorrect(true);
  };

  const canvasWidth = Math.min(width - 40, 900);
  const canvasHeight = 500;

  return (
    <Wrapper>
      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        <QuestionText>
          {showSuccessArc
            ? `Nice work naming ∠${angleAnswer.join("")}!`
            : correct
              ? `Click three points to name ∠${angleAnswer.join("")}`
              : `Incorrect - Try again!`}
        </QuestionText>
        {showSuccessArc && (
          <FeedbackText>
            ✓ Perfect! The vertex ({angleAnswer[1]}) is in the middle!
          </FeedbackText>
        )}
      </QuestionSection>

      {/* 2. VisualSection - Interactive angle diagram */}
      <VisualSection>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />

            {/* Draw all lines */}
            {currentLines.map((eachLine, index) => (
              <Line
                key={index}
                stroke={konvaTheme.shapeStroke}
                strokeWidth={2}
                points={eachLine}
              />
            ))}

            {/* Draw all points with labels */}
            {pointsOnLines.map((linePoint, index) => {
              const { x, y, xText, yText, text, fill } = linePoint;
              return (
                <React.Fragment key={index}>
                 
                  <Circle
                    id={text}
                    x={x}
                    y={y}
                    radius={10}
                    fill={fill}
                    stroke={konvaTheme.shapeStroke}
                    strokeWidth={2}
                    onClick={correct && !showSuccessArc ? handlePoint : undefined}
                    onTap={correct && !showSuccessArc ? handlePoint : undefined}
                    style={{ cursor: correct && !showSuccessArc ? 'pointer' : 'default' }}
                  />
                  <Text
                    id={text}
                    x={xText}
                    y={yText}
                    fill={konvaTheme.labelText}
                    text={text}
                    fontSize={40}
                    fontStyle="bold"
                    fill = "red"
                  />

                </React.Fragment>
              );
            })}

            {/* Draw green success arc after all 3 points clicked correctly */}
            {showSuccessArc && arcInfo && (
              <Arc
                x={arcInfo.x}
                y={arcInfo.y}
                innerRadius={arcInfo.radius - 10}
                outerRadius={arcInfo.radius}
                angle={arcInfo.angle}
                rotation={arcInfo.rotation}
                fill="#48BB78"
                opacity={0.8}
              />
            )}
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Answer input and controls */}
      <InteractionSection>
        {showSuccessArc && (
          <TryAnotherButton onClick={handleNextProblem}>
            Try Another Problem
          </TryAnotherButton>
        )}
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content */}
      <ExplanationSection>
        <ExplanationTitle>How to Name Angles with Three Letters</ExplanationTitle>
        <ExplanationText>
          <strong>Three-letter angle notation</strong> uses three points to name an angle precisely,
          which is essential when multiple angles share the same vertex.
        </ExplanationText>
        <ExplanationText>
          <strong>The Key Rule:</strong>
        </ExplanationText>
        <FormulaBox>
          The vertex must always be in the middle!
        </FormulaBox>
        <ExplanationText>
          <strong>Steps to name an angle:</strong>
        </ExplanationText>
        <PropertyList>
          <li>
            <strong>Step 1:</strong> Identify the vertex (the point where two rays meet)
          </li>
          <li>
            <strong>Step 2:</strong> Pick a point on one ray (either ray works)
          </li>
          <li>
            <strong>Step 3:</strong> Name: Point on ray → Vertex → Point on other ray
          </li>
          <li>
            <strong>Step 4:</strong> The order matters! The vertex letter MUST be in the middle
          </li>
        </PropertyList>
        <ExplanationText>
          <strong>Example:</strong> If the angle has vertex B and points A and C on the rays, you can
          name it either ∠ABC or ∠CBA (both are correct), but NEVER ∠BAC or ∠ACB.
        </ExplanationText>
        <ExplanationText>
          <strong>In this activity:</strong>
        </ExplanationText>
        <PropertyList>
          <li>Click on three points in the correct order to highlight the angle</li>
          <li>The points will turn color as you select them</li>
          <li>A shaded region appears when you correctly name the angle</li>
          <li>If you make a mistake, the diagram resets and you can try again</li>
          <li>You can also type the angle name in the input box above</li>
        </PropertyList>
      </ExplanationSection>
    </Wrapper>
  );
}

export default NamingAnglesLevelTwo;

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
  margin: 0 0 10px 0;

  @media (min-width: 768px) {
    font-size: 24px;
  }

  @media (min-width: 1024px) {
    font-size: 26px;
  }
`;

const FeedbackText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: #48BB78;
  margin: 10px 0 0 0;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (min-width: 768px) {
    font-size: 20px;
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

const TryAnotherButton = styled.button`
  background-color: #48BB78;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;

  &:hover {
    background-color: #38A169;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    font-size: 22px;
    padding: 18px 36px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
    padding: 20px 40px;
  }
`;
