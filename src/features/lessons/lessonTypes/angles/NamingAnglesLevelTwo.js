import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Stage, Layer, Shape, Circle, Line, Text } from "react-konva";
import { potentialAnglesNamingAnglesTwo as anglePick } from "../../../../shared/helpers/potentialAngles";
import { perpendicular } from "../../../../shared/images";
import { AnswerInput } from "../../../../shared/components";

const longLines = [
  [30, 150, 800, 120],
  [26, 200, 820, 300],
  [200, 100, 86, 450],
  [300, 90, 330, 420],
  [300, 90, 600, 437],
  [30, 450, 800, 120],
];
const varLetters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "m",
  "n",
  "p",
  "q",
  "r",
  "s",
  "t",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const varNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const iPointsOnLines = [
  { x: 199, y: 102, xText: 210, yText: 75, fill: "black" },
  { x: 186, y: 143, xText: 193, yText: 144, fill: "black" },
  { x: 161, y: 216, xText: 165, yText: 224, fill: "black" },
  { x: 95, y: 424, xText: 110, yText: 369, fill: "black" },
  { x: 85, y: 452, xText: 82, yText: 457, fill: "black" },
  { x: 300, y: 90, xText: 283, yText: 51, fill: "black" },
  { x: 304, y: 139, xText: 275, yText: 143, fill: "black" },
  { x: 313, y: 235, xText: 282, yText: 240, fill: "black" },
  { x: 321, y: 325, xText: 291, yText: 333, fill: "black" },
  { x: 330, y: 418, xText: 316, yText: 425, fill: "black" },
  { x: 343, y: 138, xText: 347, yText: 100, fill: "black" },
  { x: 440, y: 252, xText: 439, yText: 211, fill: "black" },
  { x: 454, y: 270, xText: 435, yText: 276, fill: "black" },
  { x: 600, y: 438, xText: 602, yText: 434, fill: "black" },
  { x: 798, y: 120, xText: 805, yText: 101, fill: "black" },
  { x: 821, y: 300, xText: 829, yText: 286, fill: "black" },
  { x: 28, y: 150, xText: 19, yText: 108, fill: "black" },
  { x: 26, y: 199, xText: 16, yText: 208, fill: "black" },
  { x: 32, y: 448, xText: 18, yText: 406, fill: "black" },
];

let varLet;
const createPoints = () => {
  varLet = varLetters
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

const NamingAnglesLevelTwo = (props) => {
  const { showAnswer, newProblem, seeAnswer } = props;

  // Initialize state - call createPoints() once to set up varLet consistently
  const initialData = React.useMemo(() => {
    createPoints();
    const angle = anglePick[Math.floor(Math.random() * anglePick.length)].map(
      (angIndex) => varLet[angIndex]
    );
    const points = iPointsOnLines.map((pOnLine, index) => {
      return { ...pOnLine, text: varLet[index] };
    });
    return { angle, points };
  }, []);

  const [angleAnswer, setAngleAnswer] = useState(initialData.angle);
  const [pointsOnLines, setPointsOnLines] = useState(initialData.points);
  const [answerArray, setAnswerArray] = useState([]);
  const [correct, setCorrect] = useState(true);
  const [redLine, setRedLine] = useState([]);
  const [corresponding, setCorresponding] = useState(false);

  useEffect(() => {
    const newLine = answerArray
      .map((char, id) => {
        return pointsOnLines.find((p) => p.text === char);
      })
      .map((newPoints, i) => {
        return [newPoints.x, newPoints.y];
      });
    setRedLine(newLine);
  }, [answerArray]);

  const handlePoint = (e) => {
    const { id } = e.target.attrs;
    if (
      !angleAnswer.includes(id) ||
      (answerArray.length == 1 && id !== angleAnswer[1]) ||
      (answerArray.length === 0 && id == angleAnswer[1]) ||
      (answerArray.length == 2 && id == angleAnswer[1])
    ) {
      setCorrect(false);
      setRedLine([]);
      let tempPoints = [...pointsOnLines];
      tempPoints = tempPoints.map((p, i) => {
        return { ...p, fill: "black" };
      });
      setPointsOnLines(tempPoints);
      setTimeout(() => {
        setCorrect(true);
        setAnswerArray([]);
      }, 2000);
    } else {
      setAnswerArray([...answerArray, id]);
      let tempPoints = [...pointsOnLines];
      tempPoints = tempPoints.map((p, i) => {
        if (p.text !== id) return p;
        else return { ...p, fill: "red" };
      });
      setPointsOnLines(tempPoints);
    }
  };

  const handleNextProblem = () => {
    createPoints();
    const newPoints = iPointsOnLines.map((pOnLine, index) => {
      return { ...pOnLine, fill: "black", text: varLet[index] };
    });

    setPointsOnLines(newPoints);
    setAnswerArray([]);
    setRedLine([]);
    const newA = anglePick[Math.floor(Math.random() * anglePick.length)].map(
      (angIndex, index) => varLet[angIndex]
    );
    setAngleAnswer(newA);
  };
  const handleButtonClick = () => {
    setCorresponding(!corresponding);
  };

  return (
    <div>
      <div className="practice-container">
        <AnswerInput
          correctAnswer={angleAnswer.join("")}
          answerType="text"
          onCorrect={seeAnswer}
          onTryAnother={handleNextProblem}
          disabled={showAnswer}
          placeholder="Enter angle name"
        />
        {/* <button className="problem-button" onClick={newAngle}>
          new angle
        </button> */}
        <Stage width={typeof window !== "undefined" ? window.innerWidth : 800} height={500}>
          <Layer>
            <Text
              fill={"black"}
              width={800}
              x={180}
              y={0}
              fontSize={30}
              text={
                correct && answerArray.length == 3
                  ? `Nice work highlighting ∠${angleAnswer.join(
                      ""
                    )}!  Try again or go to another lesson`
                  : correct
                    ? `Find ∠${angleAnswer.join("")}`
                    : `Try again!`
              }
            />
            {longLines.map((eachLine, index) => {
              return <Line stroke="black" strokeWidth={2} points={eachLine} />;
            })}
            {pointsOnLines.map((linePoint, index) => {
              const { x, y, xText, yText, text, fill } = linePoint;
              return (
                <>
                  <Text
                    id={text}
                    x={xText}
                    y={yText}
                    fill={"red"}
                    text={`${text}`}
                    fontSize={40}
                    draggable={true}
                  />
                  <Circle
                    id={text}
                    x={x}
                    y={y}
                    radius={10}
                    fill={fill}
                    stoke={"black"}
                    onClick={correct ? handlePoint : ""}
                    onTap={correct ? handlePoint : ""}
                  />
                </>
              );
            })}
            {redLine.length >= 2 && <Line stroke="red" strokeWidth={6} points={redLine.flat()} />}
            {redLine.length > 2 && (
              <Shape
                sceneFunc={(context, shape) => {
                  const x1 = (redLine[0][0] + redLine[1][0]) / 2;
                  const y1 = (redLine[0][1] + redLine[1][1]) / 2;
                  const x2 = redLine[1][0];
                  const y2 = redLine[1][1];
                  const x3 = (redLine[2][0] + redLine[1][0]) / 2;
                  const y3 = (redLine[2][1] + redLine[1][1]) / 2;
                  context.beginPath();
                  context.moveTo(x1, y1);
                  context.lineTo(x2, y2);
                  context.lineTo(x3, y3);
                  context.lineTo(x1, y1);
                  context.closePath();
                  context.fillStrokeShape(shape);
                }}
                stroke={"red"}
                fill={"red"}
                strokeWidth={1}
                opacity={0.4}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default NamingAnglesLevelTwo;
