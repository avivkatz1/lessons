import React, { useState } from "react";
import { Stage, Layer, Circle, Line, Text, Arc } from "react-konva";
import { useParams } from "react-router-dom";
import { useLessonState } from "../../../../hooks";

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

const AngleRelationshipsDiagram = ({ triggerNewProblem }) => {
  const params = useParams();

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

  // Phase 2 - Stage 5: Use shared lesson state hook
  const { showAnswer, revealAnswer, hideAnswer } = useLessonState();
  const [lesson, setLesson] = useState(initialState.lesson);
  const [xVal, setXVal] = useState(initialState.xVal);
  const [points, setPoints] = useState(initialState.points);
  const [textPosition, setTextPosition] = useState(initialState.textPosition);
  const [displayedQuestion, setDisplayedQuestion] = useState(initialState.displayedQuestion);
  const [swapLabels, setSwapLabels] = useState(initialState.swapLabels);

  const handleNextProblem = () => {
    hideAnswer();
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
    const strokeColor = "black";

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
      // Calculate midpoints for each parallel line
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

  return (
    <div>
      <div className="practice-container">
        <AnswerInput
          correctAnswer={getCorrectAnswer()}
          answerType="number"
          onCorrect={revealAnswer}
          onTryAnother={handleNextProblem}
          disabled={showAnswer}
          placeholder="x = ?"
        />

        <Stage width={Math.min((typeof window !== "undefined" ? window.innerWidth : 800) - 20, 500)} height={400}>
          <Layer>
            {/* Question text */}
            <Text
              x={10}
              y={10}
              fontSize={16}
              fill="black"
              text={displayedQuestion || ""}
              width={Math.min((typeof window !== "undefined" ? window.innerWidth : 800) - 40, 480)}
            />

            {/* Render lines */}
            {points && points.length > 0 && renderLines()}

            {/* Angle labels - swapLabels determines which label goes at which position */}
            {textPosition && textPosition.length >= 2 && (
              <>
                <Text
                  fontSize={18}
                  fill={swapLabels ? "green" : "blue"}
                  fontStyle="bold"
                  text={swapLabels ? `${xVal}°` : "x°"}
                  x={textPosition[0].x}
                  y={textPosition[0].y}
                />
                <Text
                  fontSize={18}
                  fill={swapLabels ? "blue" : "green"}
                  fontStyle="bold"
                  text={swapLabels ? "x°" : `${xVal}°`}
                  x={textPosition[1].x}
                  y={textPosition[1].y}
                />
              </>
            )}

            {/* Show answer */}
            {showAnswer && (
              <Text
                x={10}
                y={360}
                text={`Answer: x = ${getCorrectAnswer()}°`}
                fontSize={24}
                fill="red"
                fontStyle="bold"
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default AngleRelationshipsDiagram;
