import React, { useState } from "react";
import styled from "styled-components";
import { Stage, Layer, Circle, Line, Text } from "react-konva";
import { AnswerInput } from "../../../../shared/components";

const getRandomX = () => Math.floor(Math.random() * 401) + 200; // 200 to 600

const LINE_START_X = 100; // Line always starts at this position

function Symmetry() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [points, setPoints] = useState([
    { id: 0, x: getRandomX(), y: 100 },
    { id: 1, x: getRandomX(), y: 20 },
  ]);
  const [lineX, setLineX] = useState(LINE_START_X);

  // The correct answer is at points[1].x (the mirror/symmetry line)
  const correctX = points[1].x;
  const isCorrect = Math.abs(lineX - correctX) < 10;

  const handleSeeAnswer = () => {
    // Move line to the correct symmetry position
    setLineX(correctX);
    setShowAnswer(true);
  };

  const handleTryAnother = () => {
    // Randomize x values and reset line position
    setPoints([
      { id: 0, x: getRandomX(), y: 100 },
      { id: 1, x: getRandomX(), y: 20 },
    ]);
    setLineX(LINE_START_X);
    setShowAnswer(false);
  };

  const changePosition = (e) => {
    const newPoints = points.map((point) => {
      if (point.id != e.target.attrs.id) return point;
      point.x = e.target.attrs.x;
      point.y = e.target.attrs.y;
      return point;
    });
    setPoints(newPoints);
  };

  const moveLine = (e) => {
    setLineX(e.target.attrs.x);
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <button onClick={handleTryAnother}>New Problem</button>

        <div>
          <Stage width={window.innerWidth} height={350}>
            <Layer>
              <Text
                fontSize={30}
                x={40}
                y={0}
                text="drag the line over to find the line of symmetry (mirror)"
              />
              <Circle
                radius={10}
                stroke={"black"}
                strokeWidth={2}
                opacity={0.7}
                x={
                  points[0].x - 60 <= points[1].x
                    ? points[1].x - points[0].x + 60 + points[1].x
                    : points[1].x + 60 - (points[0].x - points[1].x)
                }
                y={points[0].y}
                fill={"red"}
              />
              <Circle
                radius={10}
                stroke={"black"}
                strokeWidth={2}
                opacity={0.7}
                x={
                  points[0].x + 60 <= points[1].x
                    ? points[1].x - points[0].x - 60 + points[1].x
                    : points[1].x - 60 - (points[0].x - points[1].x)
                }
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
              <Line
                id={1}
                stroke={isCorrect ? "green" : "lightblue"}
                strokeWidth={isCorrect ? 14 : 8}
                draggable={true}
                x={lineX}
                y={0}
                points={[0, points[1].y, 0, points[1].y + 400]}
                onDragEnd={moveLine}
              />
              <Text
                fontSize={40}
                fontStyle={"bold"}
                fill={"red"}
                text={`${lineX.toFixed(0)}`}
                x={lineX - 30}
                y={30}
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

export default Symmetry;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  .practice-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
`;
