import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

function CompositeShape(props) {
  const { showAnswer, newProblem, seeAnswer } = props;
  const [adding, setAdding] = useState(randomNum(301));
  const [widths, setWidths] = useState(numbers(2, 300));
  const [view, setView] = useState(false);
  const [randomNums, setRandomNums] = useState(numbers(2, 100));
  const [points, setPoints] = useState({ x: 300 + adding, y: 170 + 12 });

  const newShape = () => {
    setAdding(randomNum(301));
    setRandomNums(numbers(2, 100));
    setWidths(numbers(2, 300));
    setPoints({ x: 300 + adding, y: 170 + 12 });
  };

  const movingShapes = (e) => {
    setView(!view);
  };
  const handlePractice = () => {
    newShape();
  };
  const handleNextProblem = () => {
    seeAnswer();
    handlePractice();
    newProblem();
    setView(false);
  };
  const changePoints = (e) => {
    let xValue = e.target.attrs.x;
    if (e.target.attrs.x + widths[1] > 600 + widths[0]) xValue = 600 + widths[0] - widths[1];

    if (e.target.attrs.x < 300) xValue = 300;
    setPoints({ x: xValue, y: e.target.attrs.y });
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <AnswerInput
          correctAnswer={Math.round(points.x - 300)}
          answerType="number"
          onCorrect={seeAnswer}
          onTryAnother={handleNextProblem}
          disabled={showAnswer}
          placeholder="x = ?"
        />
        <div>
          <Stage width={window.innerWidth} height={500}>
            <Layer>
              {randomNums[0] > 50 && (
                <Text
                  y={20}
                  x={20}
                  text={`slide the rectangle to make x = ${randomNums[1]}`}
                  fontSize={40}
                  width={300}
                />
              )}
              <Rect
                stroke={view ? "black" : "red"}
                strokeWidth={12}
                width={400 + widths[0]}
                height={120}
                x={300}
                y={50}
                fill={"red"}
                opacity={0.4}
                draggable={false}
                onDragStart={movingShapes}
                onDragEnd={movingShapes}
                onClick={() => setView(!view)}
              />
              <Rect
                stroke={view ? "black" : "red"}
                strokeWidth={12}
                width={100 + widths[1]}
                height={200}
                x={points.x}
                y={points.y}
                fill={"red"}
                opacity={0.4}
                draggable={randomNums[0] > 50 ? true : false}
                onDragStart={movingShapes}
                onDragEnd={movingShapes}
                onDragMove={changePoints}
                onClick={() => setView(!view)}
              />

              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"lightgreen"}
                text={showAnswer ? Math.round(points.x - 300) : "x"}
                x={points.x - 100}
                y={180}
                width={200}
                wrap={"word"}
              />

              {view && (
                <>
                  <Line
                    stroke={"black"}
                    strokeWidth={10}
                    points={[300 - 6, 170, 700 + 6 + widths[0], 170]}
                  />
                  <Line
                    stroke={"red"}
                    strokeWidth={10}
                    points={[points.x - 6, 170 + 6, points.x + 100 + 6 + widths[1], 170 + 6]}
                  />
                  <Line
                    stroke={"red"}
                    strokeWidth={10}
                    points={[
                      points.x - 6,
                      points.y + 200,
                      points.x + 100 + 6 + widths[1],
                      points.y + 200,
                    ]}
                  />
                  <Line
                    stroke={"lightgreen"}
                    strokeWidth={10}
                    points={[300 - 6, 170 + 6, points.x - 6, 170 + 6]}
                  />
                  <Line
                    stroke={"lightblue"}
                    strokeWidth={10}
                    points={[points.x + 100 + 6 + widths[1], 170 + 6, 706 + widths[0], 170 + 6]}
                  />
                  <Text
                    fontSize={40}
                    fontStyle={"bold"}
                    fill={"black"}
                    text={400 + 12 + widths[0]}
                    x={(900 + widths[0]) / 2}
                    y={130}
                    width={200}
                    wrap={"word"}
                    draggable={true}
                  />
                  <Text
                    fontSize={40}
                    fontStyle={"bold"}
                    fill={"red"}
                    text={112 + widths[1]}
                    x={points.x + 15 + widths[1] / 2}
                    y={180}
                    width={200 + widths[1]}
                    wrap={"word"}
                    draggable={true}
                  />
                </>
              )}
              <Line
                stroke={"lightblue"}
                strokeWidth={10}
                points={[points.x + 100 + 6 + widths[1], 170 + 6, 706 + widths[0], 170 + 6]}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"black"}
                text={400 + 12 + widths[0]}
                x={(900 + widths[0]) / 2}
                y={10}
                width={200}
                wrap={"word"}
                draggable={true}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"red"}
                text={112 + widths[1]}
                x={points.x + 15 + widths[1] / 2}
                y={points.y + 210}
                width={200 + widths[1]}
                wrap={"word"}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"lightblue"}
                text={Math.abs(Math.round(500 - points.x + 100) + widths[0] - widths[1])}
                x={
                  500 - points.x + 100 + widths[0] - widths[1] > 0
                    ? points.x + widths[1] + 150
                    : points.x + widths[1] + 70
                }
                y={
                  500 - points.x + 100 + widths[0] - widths[1] < 0
                    ? 130
                    : 500 - points.x + 100 + widths[0] - widths[1] > 0 && points.x <= 519
                      ? 180
                      : 200
                }
                width={200}
                wrap={"word"}
              />
              {points.x > 519 && (
                <Line
                  stroke={"lightblue"}
                  strokeWidth={10}
                  points={[points.x + 100 + 6 + widths[1], 170 + 6, 706 + widths[0], 170 + 6]}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>
    </Wrapper>
  );
}

export default CompositeShape;

const Wrapper = styled.div``;

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
