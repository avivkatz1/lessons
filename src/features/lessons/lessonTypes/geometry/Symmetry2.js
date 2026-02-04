import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text, Arrow } from "react-konva";
import { halfwayPoint } from "../../../../shared/helpers";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

const PointX = randomNum(60) + 5;
const PointY = randomNum(10) + 5;
const OriginH = randomNum(10) + 5;
const OriginV = randomNum(10) + 10;

function Symmetry2(props) {
  const { showAnswer, setShowAnswer, triggerNewProblem, newProblem } = props;
  const [points, setPoints] = useState([
    { id: 0, x: 300, y: 200 },
    { id: 1, x: 450, y: 20 },
  ]);
  const [answer, setAnswer] = useState(390);
  const [showX, setShowX] = useState(false);
  const [showY, setShowY] = useState(false);
  const [xVal, setXVal] = useState(points[0].x);

  const changePosition = (e) => {
    const newPoints = points.map((point) => {
      if (point.id != e.target.attrs.id) return point;
      point.x = e.target.attrs.x;
      point.y = e.target.attrs.y;
      return point;
    });
    setPoints(newPoints);
    setAnswer(Math.abs(Math.floor(390 - e.target.attrs.x)));
  };

  const handleShowAnswer = (e) => {
    setShowY(!showY);
  };

  const mirrorX1 = points[1].x - points[0].x + 60 + points[1].x;

  const mirrorX2 = points[1].x - points[0].x - 60 + points[1].x;

  const mirrorAnswer =
    points[0].x - 60 >= points[1].x
      ? points[1].x - points[0].x + 60 + points[1].x
      : points[1].x + 60 - (points[0].x - points[1].x);
  return (
    <Wrapper>
      <div className="practice-container">
        {/* <button onClick={newProblem}>Reset Graph</button> */}
        <div>
          <Stage width={window.innerWidth} height={600}>
            <Layer>
              <Circle
                radius={10}
                stroke={"black"}
                strokeWidth={2}
                opacity={0.7}
                x={mirrorX1}
                y={points[0].y}
                fill={"red"}
              />
              <Circle
                radius={10}
                stroke={"black"}
                strokeWidth={2}
                opacity={0.7}
                x={mirrorX2}
                y={points[0].y}
                fill={"blue"}
              />
              <Circle
                id={0}
                radius={60}
                stroke={"black"}
                strokeWidth={2}
                opacity={0.2}
                x={
                  points[0].x <= points[1].x
                    ? points[1].x - points[0].x + points[1].x
                    : points[1].x - (points[0].x - points[1].x)
                }
                y={points[0].y}
                fill={"lightblue"}
              />
              <Arrow
                stroke="blue"
                strokeWidth={6}
                opacity={0.4}
                points={[mirrorX2, points[0].y - 40, points[1].x, points[0].y - 40]}
                pointerAtBeginning={true}
                lineCap="round"
                dash={[13, 10]}
              />
              <Arrow
                stroke="green"
                strokeWidth={6}
                opacity={0.4}
                points={[
                  points[1].x - (mirrorX2 - points[1].x),
                  points[0].y - 40,
                  points[1].x,
                  points[0].y - 40,
                ]}
                pointerAtBeginning={true}
                lineCap="round"
                dash={[13, 10]}
              />
              {/* <Arrow
                stroke="blue"
                strokeWidth={6}
                opacity={0.4}
                points={[
                 points[1].x,
                  points[0].y - 40,
                  mirrorX1,
                  points[0].y - 40,
                ]}
                pointerAtBeginning={true}
                lineCap="round"
                dash={[13, 10]}
              /> */}
              <Text
                x={mirrorX2 >= 450 ? (mirrorX1 + points[0].x) / 2 : points[1].x - 80}
                y={points[0].y - 100}
                fontSize={30}
                fill={"blue"}
                stroke={"blue"}
                text={answer}
              />
              <Text
                x={mirrorX2 >= 330 ? (mirrorX1 + points[0].x) / 2 : points[1].x - 80}
                y={points[0].y + 60}
                fontSize={30}
                fill={"red"}
                stroke={"red"}
                text={mirrorX2 <= 450 ? Math.abs(answer - 122) : answer + 122}
              />

              <Arrow
                stroke="red"
                strokeWidth={6}
                opacity={0.4}
                points={[mirrorX1, points[0].y + 40, points[1].x, points[0].y + 40]}
                pointerAtBeginning={true}
                lineCap="round"
                dash={[13, 10]}
              />
              <Arrow
                stroke="orange"
                strokeWidth={6}
                opacity={0.4}
                points={[
                  points[1].x - (mirrorX1 - points[1].x),
                  points[0].y + 40,
                  points[1].x,
                  points[0].y + 40,
                ]}
                pointerAtBeginning={true}
                lineCap="round"
                dash={[13, 10]}
              />
              {/* <Arrow
              stroke="blue"
              strokeWidth={6}
              opacity={0.4}
              points={[ points[0].x + 60 >= points[1].x
                ? points[1].x - points[0].x - 60 + points[1].x
                : points[1].x - 60 - (points[0].x - points[1].x),points[0].y,points[1].x,points[0].y]}
              /> */}
            </Layer>
            <Layer>
              <Circle
                radius={10}
                stroke={"black"}
                strokeWidth={2}
                x={points[0].x - 60}
                y={points[0].y}
                fill={"red"}
                draggable={true}
              />
              <Circle
                radius={10}
                stroke={"black"}
                strokeWidth={2}
                x={points[0].x + 60}
                y={points[0].y}
                fill={"blue"}
                draggable={true}
              />
            </Layer>
            <Layer>
              <Circle
                id={0}
                radius={60}
                stroke={"black"}
                strokeWidth={2}
                opacity={0.5}
                x={points[0].x}
                y={points[0].y}
                fill={"yellow"}
                draggable={true}
                onDragMove={changePosition}
              />
              <Text
                x={points[1].x - 200}
                y={points[1].y - 20}
                fontSize={30}
                fill={"blue"}
                stroke={"blue"}
                text={"find the value of x and y, click to see answer."}
              />
              <Line
                id={1}
                stroke={xVal < -199 && xVal > -201 ? "green" : "lightblue"}
                strokeWidth={xVal < -199 && xVal > -201 ? 14 : 8}
                points={[points[1].x, points[1].y + 10, points[1].x, points[1].y + 400]}
              />

              <Text
                x={mirrorX2 < 330 ? (mirrorX1 + points[0].x) / 2 : points[1].x - 80}
                y={points[0].y + 60}
                fontSize={30}
                stroke={"orange"}
                fill={"orange"}
                text={showY ? (mirrorX2 <= 450 ? Math.abs(answer - 122) : answer + 122) : "y"}
                onClick={handleShowAnswer}
              />
              <Text
                x={mirrorX2 < 450 ? (mirrorX1 + points[0].x) / 2 : points[1].x - 80}
                y={points[0].y - 100}
                fontSize={30}
                fill={"green"}
                stroke={"green"}
                text={showX ? answer : "x"}
                onClick={() => setShowX(!showX)}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </Wrapper>
  );
}

export default Symmetry2;

const Wrapper = styled.div`
  margin-top: 20px;
  button {
    background-color: lightgreen;
    height: 50px;
    border-radius: 7px;
    font-size: 24px;
  }

  .practice-container {
    margin-top: 100px;
    display: flex;
    justify-content: center;
  }
  .problem-text {
    font-size: x-large;
    font-weight: 700;
    text-transform: lowercase;
  }
`;

//not really working yet, loop for react element

{
  /* <Rect
    key={9}
    fill='red'
    width={30}
    height={10}
    stroke='black'
    strokeWidth={1}
    x={100*4}
    y={100}
    /> */
}
