import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

let PointX = randomNum(60) + 5;
let PointY = randomNum(10) + 5;
let OriginH = randomNum(10) + 5;
let OriginV = randomNum(10) + 10;

function Angles(props) {
  const [axis, setAxis] = useState({ OriginH, OriginV });
  const [points, setPoints] = useState([
    { id: 0, x: 503, y: 283 },
    { id: 1, x: 329, y: 186 },
    { id: 2, x: 328, y: 43 },
  ]);
  const [layerX, setLayerX] = useState({ x: 0, y: 0 });
  const [practice, setPractice] = useState(false);
  const handlePractice = () => {
    setPractice(true);
  };

  const changePosition = (e) => {
    // const points = [...points,]
    // setPoints({ x: e.target.attrs.x, y: e.target.attrs.y });
    const newPoints = points.map((point) => {
      if (point.id != e.target.attrs.id) return point;
      point.x = e.target.attrs.x;
      point.y = e.target.attrs.y;
      return point;
    });
    setPoints(newPoints);
  };

  const newGrid = () => {
    OriginH = randomNum(10) + 5;
    OriginV = randomNum(10) + 10;
    PointX = randomNum(10) + 5;
    PointY = randomNum(10) + 5;
    setPoints({ PointX, PointY });
    setAxis({ OriginH, OriginV });
    setLayerX({ x1: 0, y1: 0 });
  };
  const dragTrack = (e) => {
    // setLayerX(0);
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={window.innerWidth} height={500}>
            <Layer>
              <Shape
                sceneFunc={(context, shape) => {
                  context.beginPath();
                  context.moveTo((points[0].x + points[1].x) / 2, (points[0].y + points[1].y) / 2);
                  context.lineTo((points[2].x + points[1].x) / 2, (points[2].y + points[1].y) / 2);
                  context.lineTo(points[1].x, points[1].y);

                  context.closePath();
                  // (!) Konva specific method, it is very important
                  context.fillStrokeShape(shape);
                }}
                fill="#00D2FF"
                stroke="black"
                strokeWidth={2}
              />
            </Layer>
            <Layer>
              <Text
                x={points[1].x + 20}
                y={points[1].y - 10}
                fontSize={20}
                fill={"blue"}
                text={"The angle is this corner"}
              />
            </Layer>

            <Layer>
              <Line
                stroke={"black"}
                strokeWidth={3}
                points={[points[1].x, points[1].y, points[0].x, points[0].y]}
              />
              <Line
                stroke={"black"}
                strokeWidth={3}
                points={[points[1].x, points[1].y, points[2].x, points[2].y]}
              />
              {points.map((p, i) => {
                return (
                  <Circle
                    id={i}
                    radius={4}
                    stroke={i == 1 ? "red" : "black"}
                    strokeWidth={2}
                    x={p.x}
                    y={p.y}
                    fill={i == 1 ? "red" : "black"}
                    draggable={true}
                    onDragMove={changePosition}
                  />
                );
              })}
            </Layer>
          </Stage>
          <button onClick={newGrid}>Reset Graph</button>
        </div>
      </div>
    </Wrapper>
  );
}

export default Angles;

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
