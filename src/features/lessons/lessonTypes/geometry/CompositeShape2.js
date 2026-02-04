import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

function CompositeShape2(props) {
  const { showAnswer, newProblem, seeAnswer } = props;
  const [adding, setAdding] = useState(randomNum(301));
  const [widths, setWidths] = useState(numbers(2, 300));
  const [view, setView] = useState(false);
  const [randomNums, setRandomNums] = useState(numbers(2, 100));
  const [points, setPoints] = useState({ x: 600, y: 50 + adding });

  const newShape = () => {
    setAdding(randomNum(301));
    setRandomNums(numbers(2, 100));
    setWidths(numbers(2, 100));
    setPoints({ x: 612, y: 50 + adding });
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
          correctAnswer={Math.round(points.y - 50)}
          answerType="number"
          onCorrect={seeAnswer}
          onTryAnother={handleNextProblem}
          disabled={showAnswer}
          placeholder="x = ?"
        />
        <div>
          <Stage width={window.innerWidth} height={600}>
            <Layer>
              {randomNums[0] > 50 && (
                <Text
                  y={20}
                  x={20}
                  text={`slide the rectangle to make y = ${randomNums[1]}`}
                  fontSize={40}
                  width={170}
                />
              )}
              <Rect
                stroke={view ? "black" : "red"}
                strokeWidth={12}
                width={400}
                height={300 + widths[0]}
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
                stroke={view ? "black" : "red"}
                strokeWidth={12}
                width={100}
                height={50 + widths[1]}
                x={612}
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
                fill={"red"}
                text={widths[1] + 12 + 50}
                x={730}
                y={points.y + widths[1] / 2}
                width={200}
                wrap={"word"}
              />

              {view && (
                <>
                  <Line
                    stroke={"black"}
                    strokeWidth={10}
                    points={[200, 44, 200, 300 + widths[0] + 56]}
                  />
                  <Line
                    stroke={"red"}
                    strokeWidth={10}
                    points={[712, points.y - 6, 712, points.y + 56 + widths[1]]}
                  />
                  <Line
                    stroke={"red"}
                    strokeWidth={10}
                    points={[600, points.y - 6, 600, points.y + 56 + widths[1]]}
                  />
                  <Line
                    stroke={"lightblue"}
                    strokeWidth={10}
                    points={[600, 44, 600, points.y - 6]}
                  />
                  <Line
                    stroke={"lightgreen"}
                    strokeWidth={10}
                    points={[600, points.y + 56 + widths[1], 600, 50 + 306 + widths[0]]}
                  />
                  <Line
                    stroke={"red"}
                    strokeWidth={10}
                    points={[206, points.y - 6, 206, points.y + 56 + widths[1]]}
                  />
                  <Line
                    stroke={"lightblue"}
                    strokeWidth={10}
                    points={[206, 44, 206, points.y - 6]}
                  />

                  {/* todo */}
                  {/* make onMouseDown to change x position and slide it over */}
                  <Line
                    stroke={"lightgreen"}
                    strokeWidth={10}
                    points={[206, points.y + 56 + widths[1], 206, 50 + 306 + widths[0]]}
                  />
                </>
              )}

              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"black"}
                text={300 + widths[0] + 12}
                x={100}
                y={(356 + widths[0]) / 2}
                width={200}
                wrap={"word"}
                draggable={true}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"lightgreen"}
                text={
                  showAnswer ? Math.abs(points.y + 56 + widths[1] - (50 + 306 + widths[0])) : "x"
                }
                x={
                  !showAnswer
                    ? points.y + 56 + widths[1] > 50 + 300 + widths[0]
                      ? 570
                      : 620
                    : points.y + 56 + widths[1] < 50 + 300 + widths[0]
                      ? 620
                      : Math.abs(points.y + 56 + widths[1] - (50 + 306 + widths[0])) < 10
                        ? 570
                        : Math.abs(points.y + 56 + widths[1] - (50 + 306 + widths[0])) < 100
                          ? 550
                          : 525
                }
                y={(points.y + 50 + widths[1] + 300 + widths[0] + 56) / 2}
                width={200 + widths[1]}
                wrap={"word"}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"lightblue"}
                text={Math.abs(44 - (points.y - 6))}
                x={620}
                y={(50 + points.y) / 2 - 40}
                width={200}
                wrap={"word"}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </Wrapper>
  );
}

export default CompositeShape2;

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
