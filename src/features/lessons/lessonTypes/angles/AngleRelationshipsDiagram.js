import React, { useState } from "react";
import styled from "styled-components";
import { Stage, Layer, Line, Text, Rect } from "react-konva";
import { useParams } from "react-router-dom";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import numbers from "../../../../shared/helpers/numbers";
import AngleRelationshipPointsCalculated from "../../../../shared/helpers/AngleRelationshipPointsCalculated";
import { AnswerInput } from "../../../../shared/components";

const lessonList = [
  "complementary_angles",
  "supplementary_angles",
  "vertical_angles",
  "corresponding_angles",
  "alternate_interior_angles",
  "same_side_interior_angles",
];

/**
 * AngleRelationshipsDiagram - Interactive angle relationships with visual diagrams
 * Students solve for x in angle relationship problems with dynamic geometric visualizations
 * Covers complementary, supplementary, vertical, and parallel line angle relationships
 */
const AngleRelationshipsDiagram = ({ triggerNewProblem }) => {
  const params = useParams();
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const { showAnswer, revealAnswer, hideAnswer } = useLessonState();

  // Calculate initial values only once
  const getInitialState = () => {
    const initialLesson =
      params.lesson === "all_angles"
        ? lessonList[Math.floor(Math.random() * lessonList.length)]
        : params.lesson;
    const initialQuestionAndPoints = AngleRelationshipPointsCalculated({
      lesson: initialLesson,
      newNum: Math.random(),
      xPosition: Math.random(),
    });
    const initialXVal =
      initialLesson === "complementary_angles" ? numbers(1, 80, 5)[0] : numbers(1, 160, 10)[0];
    return {
      lesson: initialLesson,
      xVal: initialXVal,
      points: initialQuestionAndPoints.points,
      textPosition: initialQuestionAndPoints.setTextPosition,
      displayedQuestion: initialQuestionAndPoints.displayedQuestion,
      swapLabels: initialQuestionAndPoints.swapLabels,
    };
  };

  const [initialState] = useState(getInitialState);
  const [lesson, setLesson] = useState(initialState.lesson);
  const [xVal, setXVal] = useState(initialState.xVal);
  const [points, setPoints] = useState(initialState.points);
  const [textPosition, setTextPosition] = useState(initialState.textPosition);
  const [displayedQuestion, setDisplayedQuestion] = useState(initialState.displayedQuestion);
  const [swapLabels, setSwapLabels] = useState(initialState.swapLabels);
  const [showHint, setShowHint] = useState(false);

  const handleNextProblem = () => {
    hideAnswer();
    setShowHint(false);
    const newLesson =
      params.lesson === "all_angles"
        ? lessonList[Math.floor(Math.random() * lessonList.length)]
        : params.lesson;
    setLesson(newLesson);

    const newQuestionsAndPoints = AngleRelationshipPointsCalculated({
      lesson: newLesson,
      newNum: Math.random(),
      xPosition: Math.random(),
    });
    setPoints(newQuestionsAndPoints.points);
    setTextPosition(newQuestionsAndPoints.setTextPosition);
    setDisplayedQuestion(newQuestionsAndPoints.displayedQuestion);
    setSwapLabels(newQuestionsAndPoints.swapLabels);

    const newXVal =
      newLesson === "complementary_angles" ? numbers(1, 80, 5)[0] : numbers(1, 160, 10)[0];
    setXVal(newXVal);
  };

  // Calculate correct answer based on lesson type
  const getCorrectAnswer = () => {
    if (lesson === "same_side_interior_angles" || lesson === "supplementary_angles") {
      return 180 - xVal;
    } else if (
      lesson === "alternate_interior_angles" ||
      lesson === "corresponding_angles" ||
      lesson === "vertical_angles"
    ) {
      return xVal;
    } else {
      // complementary
      return 90 - xVal;
    }
  };

  // Render lines based on lesson type
  const renderLines = () => {
    const lines = [];
    const strokeWidth = 3;
    const strokeColor = konvaTheme.shapeStroke;

    if (lesson === "complementary_angles") {
      // Vertex is at points[1]
      // Draw rays from vertex to each endpoint
      lines.push(
        <Line
          key="ray1"
          points={[points[1].x, points[1].y, points[0].x, points[0].y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />,
        <Line
          key="ray2"
          points={[points[1].x, points[1].y, points[2].x, points[2].y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />,
        <Line
          key="ray3"
          points={[points[1].x, points[1].y, points[3].x, points[3].y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      );
      // Draw right angle symbol
      const size = 20;
      lines.push(
        <Line
          key="rightAngle"
          points={[
            points[1].x + size,
            points[1].y,
            points[1].x + size,
            points[1].y - size,
            points[1].x,
            points[1].y - size,
          ]}
          stroke={strokeColor}
          strokeWidth={2}
        />
      );
    } else if (lesson === "supplementary_angles") {
      // Straight line from points[0] to points[1], vertex at points[2], ray to points[3]
      lines.push(
        <Line
          key="baseline"
          points={[points[0].x, points[0].y, points[1].x, points[1].y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />,
        <Line
          key="ray"
          points={[points[2].x, points[2].y, points[3].x, points[3].y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      );
    } else if (lesson === "vertical_angles") {
      // Two intersecting lines
      lines.push(
        <Line
          key="line1"
          points={[points[0].x, points[0].y, points[1].x, points[1].y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />,
        <Line
          key="line2"
          points={[points[2].x, points[2].y, points[3].x, points[3].y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      );
    } else if (
      lesson === "corresponding_angles" ||
      lesson === "alternate_interior_angles" ||
      lesson === "same_side_interior_angles"
    ) {
      // Two parallel lines + transversal
      lines.push(
        <Line
          key="topLine"
          points={[points[0].x, points[0].y, points[1].x, points[1].y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />,
        <Line
          key="bottomLine"
          points={[points[2].x, points[2].y, points[3].x, points[3].y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />,
        <Line
          key="transversal"
          points={[points[6].x, points[6].y, points[7].x, points[7].y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      );
      // Add parallel line arrows (positioned dynamically based on line midpoints)
      const topLineMidX = (points[0].x + points[1].x) / 2;
      const topLineMidY = (points[0].y + points[1].y) / 2;
      const bottomLineMidX = (points[2].x + points[3].x) / 2;
      const bottomLineMidY = (points[2].y + points[3].y) / 2;

      lines.push(
        <Text
          key="arrow1"
          text=">"
          x={topLineMidX - 12}
          y={topLineMidY - 18}
          fontSize={24}
          fill={strokeColor}
        />,
        <Text
          key="arrow2"
          text=">"
          x={bottomLineMidX - 12}
          y={bottomLineMidY - 18}
          fontSize={24}
          fill={strokeColor}
        />
      );
    }

    return lines;
  };

  // Get friendly lesson name
  const getLessonName = () => {
    const names = {
      complementary_angles: "Complementary Angles",
      supplementary_angles: "Supplementary Angles",
      vertical_angles: "Vertical Angles",
      corresponding_angles: "Corresponding Angles",
      alternate_interior_angles: "Alternate Interior Angles",
      same_side_interior_angles: "Same-Side Interior Angles",
    };
    return names[lesson] || "Angle Relationships";
  };

  // Get explanation content based on lesson type
  const getExplanation = () => {
    const explanations = {
      complementary_angles: {
        definition: "Two angles are complementary if they add up to 90°.",
        formula: "Angle A + Angle B = 90°",
        example: "If one angle is 30°, its complement is 60° (30° + 60° = 90°)",
        properties: [
          "The sum is always 90° (a right angle)",
          "Both angles must be acute (less than 90°)",
          "They don't need to be adjacent (next to each other)",
          "Common in right triangles and perpendicular lines",
        ],
      },
      supplementary_angles: {
        definition: "Two angles are supplementary if they add up to 180°.",
        formula: "Angle A + Angle B = 180°",
        example: "If one angle is 120°, its supplement is 60° (120° + 60° = 180°)",
        properties: [
          "The sum is always 180° (a straight angle)",
          "Found along straight lines (linear pairs)",
          "Can be two acute angles, two obtuse angles, or one acute and one obtuse",
          "Essential for understanding straight lines and polygons",
        ],
      },
      vertical_angles: {
        definition: "When two lines intersect, the opposite angles formed are called vertical angles and are always equal.",
        formula: "Angle A = Angle B",
        example: "Vertical angles are congruent (equal in measure)",
        properties: [
          "Formed by two intersecting lines",
          "Opposite angles are always equal",
          "The proof uses supplementary angles",
          "Used in geometry proofs and constructions",
        ],
      },
      corresponding_angles: {
        definition: "When a transversal crosses parallel lines, corresponding angles are in the same relative position and are equal.",
        formula: "Angle A = Angle B",
        example: "Corresponding angles are congruent when lines are parallel",
        properties: [
          "Only equal when lines are parallel",
          "In the same position at each intersection",
          "Can be used to prove lines are parallel",
          "Form an 'F' pattern when visualized",
        ],
      },
      alternate_interior_angles: {
        definition: "When a transversal crosses parallel lines, alternate interior angles are on opposite sides of the transversal and are equal.",
        formula: "Angle A = Angle B",
        example: "These angles are between the parallel lines, on opposite sides of the transversal",
        properties: [
          "Only equal when lines are parallel",
          "Between the parallel lines (interior)",
          "On opposite sides of the transversal (alternate)",
          "Form a 'Z' pattern when visualized",
        ],
      },
      same_side_interior_angles: {
        definition: "When a transversal crosses parallel lines, same-side interior angles are supplementary (add to 180°).",
        formula: "Angle A + Angle B = 180°",
        example: "These angles are between parallel lines, on the same side of the transversal",
        properties: [
          "Always supplementary when lines are parallel",
          "Between the parallel lines (interior)",
          "On the same side of the transversal",
          "Form a 'C' or 'U' pattern when visualized",
        ],
      },
    };
    return explanations[lesson] || explanations.supplementary_angles;
  };

  const explanation = getExplanation();
  const canvasWidth = Math.min(width - 40, 500);
  const hint = `Solve for x using ${getLessonName().toLowerCase()}!`;

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* 1. QuestionSection - Instructions */}
      <QuestionSection>
        {/* Question text now hidden - shown in hint */}
      </QuestionSection>

      {/* 2. VisualSection - Interactive diagram */}
      <VisualSection>
        <Stage width={canvasWidth} height={400}>
          <Layer>
            {/* Canvas background */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={400}
              fill={konvaTheme.canvasBackground}
            />

            {/* Question text inside canvas */}
            <Text
              x={10}
              y={10}
              fontSize={16}
              fill={konvaTheme.labelText}
              text={displayedQuestion || ""}
              width={canvasWidth - 20}
            />

            {/* Render geometric lines */}
            {points && points.length > 0 && renderLines()}

            {/* Angle labels - swapLabels determines which label goes at which position */}
            {textPosition && textPosition.length >= 2 && (
              <>
                <Text
                  fontSize={18}
                  fill={swapLabels ? konvaTheme.horizontal : konvaTheme.adjacent}
                  fontStyle="bold"
                  text={swapLabels ? `${xVal}°` : "x°"}
                  x={textPosition[0].x}
                  y={textPosition[0].y}
                />
                <Text
                  fontSize={18}
                  fill={swapLabels ? konvaTheme.adjacent : konvaTheme.horizontal}
                  fontStyle="bold"
                  text={swapLabels ? "x°" : `${xVal}°`}
                  x={textPosition[1].x}
                  y={textPosition[1].y}
                />
              </>
            )}

            {/* Show answer inside canvas */}
            {showAnswer && (
              <Text
                x={10}
                y={360}
                text={`Answer: x = ${getCorrectAnswer()}°`}
                fontSize={24}
                fill={konvaTheme.opposite}
                fontStyle="bold"
              />
            )}
          </Layer>
        </Stage>
      </VisualSection>

      {/* 3. InteractionSection - Answer input */}
      <InteractionSection>
        {!showAnswer && showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}

        <AnswerInput
          correctAnswer={getCorrectAnswer()}
          answerType="number"
          onCorrect={revealAnswer}
          onTryAnother={handleNextProblem}
          disabled={showAnswer}
          placeholder="x = ?"
        />
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content (shown after correct answer) */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Understanding {getLessonName()}</ExplanationTitle>
          <ExplanationText>
            <strong>Definition:</strong> {explanation.definition}
          </ExplanationText>
          <FormulaBox>
            {explanation.formula}
          </FormulaBox>
          <ExplanationText>
            <strong>Example:</strong> {explanation.example}
          </ExplanationText>
          <ExplanationText>
            <strong>Key Properties:</strong>
          </ExplanationText>
          <PropertyList>
            {explanation.properties.map((prop, idx) => (
              <li key={idx}>{prop}</li>
            ))}
          </PropertyList>
          <ExplanationText>
            <strong>Your answer:</strong> x = {getCorrectAnswer()}°
          </ExplanationText>
        </ExplanationSection>
      )}
    </Wrapper>
  );
};

export default AngleRelationshipsDiagram;

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
