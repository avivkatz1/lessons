import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

function CompositeShape3(props) {
  const { showAnswer, newProblem, seeAnswer } = props;
  const [widthTwo, setWidthTwo] = useState(numbers(1, 135, 65)[0]);
  const [heightTwo, setHeightTwo] = useState(numbers(1, 135, 65)[0]);
  const [widthOne, setWidthOne] = useState(numbers(1, 200, widthTwo + 50)[0]);
  const [heightOne, setHeightOne] = useState(numbers(1, 100, heightTwo + 50)[0]);
  const [view, setView] = useState(false);
  const [randomNums, setRandomNums] = useState(numbers(2, 100));

  const [points, setPoints] = useState({
    x: numbers(1, widthOne - widthTwo, 200)[0],
    y: numbers(1, heightOne - heightTwo, 50)[0],
  });

  const newShape = () => {
    const tempWidthTwo = numbers(1, 135, 65)[0];
    const tempHeightTwo = numbers(1, 135, 65)[0];
    const tempWidthOne = numbers(1, 200, tempWidthTwo + 50)[0];
    const tempHeightOne = numbers(1, 100, tempHeightTwo + 50)[0];
    setWidthTwo(tempWidthTwo);
    setHeightTwo(tempHeightTwo);
    setWidthOne(tempWidthOne);
    setHeightOne(tempHeightOne);
    setRandomNums(numbers(2, 100));
    setPoints({
      x: numbers(1, tempWidthOne - tempWidthTwo, 200)[0],
      y: numbers(1, tempHeightOne - tempHeightTwo, 50)[0],
    });
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
    if (e.target.attrs.x + heightTwo > 600 + heightOne) xValue = 600 + heightOne - heightTwo;

    if (e.target.attrs.x < 300) xValue = 300;
    setPoints({ x: xValue, y: e.target.attrs.y });
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <AnswerInput
          correctAnswer={widthOne * heightOne - widthTwo * heightTwo}
          answerType="number"
          onCorrect={seeAnswer}
          onTryAnother={handleNextProblem}
          disabled={showAnswer}
          placeholder="Area = ?"
        />
        <div>
          <Stage width={window.innerWidth} height={500}>
            <Layer>
              <Rect
                stroke={view ? "black" : "red"}
                strokeWidth={12}
                width={widthOne}
                height={heightOne}
                x={200}
                y={50}
                fill={"red"}
                opacity={0.4}
                draggable={false}
                onDragStart={movingShapes}
                onDragEnd={movingShapes}
                onClick={() => setView(!view)}
              />

              <Rect
                width={widthTwo}
                height={heightTwo}
                x={points.x}
                y={points.y}
                fill={
                  points.x + widthTwo > 206 + widthOne || points.y + heightTwo > 56 + heightOne
                    ? "green"
                    : "white"
                }
                opacity={
                  points.x + widthTwo > 206 + widthOne || points.y + heightTwo > 56 + heightOne
                    ? 0.5
                    : 1
                }
                draggable={true}
                onDragStart={movingShapes}
                onDragEnd={movingShapes}
                onDragMove={changePoints}
                onClick={() => setView(!view)}
              />

              {view && (
                <>
                  {/* <Line
                    stroke={"black"}
                    strokeWidth={10}
                    points={[200, 44, 200, 300 + heightOne + 56]}
                  />
                  <Line
                    stroke={"red"}
                    strokeWidth={10}
                    points={[712, points.y - 6, 712, points.y + 56 + heightTwo]}
                  />
                  <Line
                    stroke={"red"}
                    strokeWidth={10}
                    points={[600, points.y - 6, 600, points.y + 56 + heightTwo]}
                  />
                  <Line
                    stroke={"lightblue"}
                    strokeWidth={10}
                    points={[600, 44, 600, points.y - 6]}
                  />
                  <Line
                    stroke={"lightgreen"}
                    strokeWidth={10}
                    points={[
                      600,
                      points.y + 56 + heightTwo,
                      600,
                      50 + 306 + heightOne,
                    ]}
                  />
                  <Line
                    stroke={"red"}
                    strokeWidth={10}
                    points={[206, points.y - 6, 206, points.y + 56 + heightTwo]}
                  />
                  <Line
                    stroke={"lightblue"}
                    strokeWidth={10}
                    points={[206, 44, 206, points.y - 6]}
                  /> */}

                  {/* todo */}
                  {/* make onMouseDown to change x position and slide it over */}
                  {/* <Line
                    stroke={"lightgreen"}
                    strokeWidth={10}
                    points={[
                      206,
                      points.y + 56 + heightTwo,
                      206,
                      50 + 306 + heightOne,
                    ]}
                  /> */}
                </>
              )}

              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"black"}
                text={heightOne + 12}
                x={120}
                y={(100 + heightOne) / 2}
                width={200}
                wrap={"word"}
                draggable={true}
              />
              <Text
                fontSize={20}
                fontStyle={"bold"}
                fill={"black"}
                text={heightTwo}
                x={points.x}
                y={(points.y + (points.y + heightTwo)) / 2}
                width={200 + heightTwo}
                wrap={"word"}
              />
              <Text
                fontSize={20}
                fontStyle={"bold"}
                fill={"red"}
                text={widthTwo}
                x={(points.x + (points.x + widthTwo)) / 2 - 10}
                y={points.y}
                width={200}
                wrap={"word"}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"lightblue"}
                text={widthOne + 12}
                x={(400 + widthOne) / 2 - 30}
                y={heightOne + 55}
                width={200}
                wrap={"word"}
              />
              <Text
                fontSize={30}
                fontStyle={"bold"}
                fill={"black"}
                text={"what is the area of the shaded region?"}
                x={30}
                y={10}
                wrap={"word"}
              />
              {showAnswer && (
                <Text
                  fontSize={30}
                  fontStyle={"bold"}
                  fill={"red"}
                  text={(heightOne + 12) * (widthOne + 12) - heightTwo * widthTwo}
                  x={50}
                  y={50}
                  wrap={"word"}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>
    </Wrapper>
  );
}

export default CompositeShape3;

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
