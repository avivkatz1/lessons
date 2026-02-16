import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useWindowDimensions } from "../../../../hooks";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

let numberSides = Math.floor(Math.random() * 8) + 3;
let rotationAmount = 360 / (4 * numberSides);

const initial_state = {
  list: [
    {
      sides: numberSides,
      radius: 100,
      fill: "red",
      opacity: 0.2,
      id: 1,
      x: 400,
      y: 110,
      stroke: "black",
      strokeWidth: 2,
      rotation: 40,
    },
    {
      sides: numberSides,
      radius: 100,
      fill: "blue",
      opacity: 0.2,
      id: 2,
      x: 400,
      y: 110,
      stroke: "black",
      strokeWidth: 2,
      rotation: 0,
    },
  ],
  degrees: 0,
};

function RotationalSymmetry(props) {
  const { width } = useWindowDimensions();
  const [shape, setShape] = useState(initial_state);
  const { answer, setAnswer } = props;
  const newShape = () => {
    numberSides = Math.floor(Math.random() * 8) + 3;
    rotationAmount = 360 / (4 * numberSides);
    const tempState = {
      ...shape,
      degrees: 0,
      list: shape.list.map((item, index) => {
        if (index === 0) {
          const newItem = { ...item, sides: numberSides };
          return newItem;
        } else {
          const newItem = { ...item, sides: numberSides, rotation: 0 };
          return newItem;
        }
      }),
    };
    setShape(tempState);
  };

  const handleClick = (e) => {
    let newRotation = shape.degrees + rotationAmount;
    if (newRotation > 360) newRotation = rotationAmount;
    const tempShape = {
      ...e.target.attrs,
      rotation: e.target.attrs.rotation + rotationAmount,
    };
    const newShapes = {
      ...shape,
      degrees: newRotation,
      list: shape.list.map((sh, i) => {
        if (i === 0) return sh;
        else return tempShape;
      }),
    };
    setShape(newShapes);
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={width} height={300}>
            <Layer>
              <Text x={355} y={94} fontSize={14} fill={"black"} text={`Press to turn`} />
              <RegularPolygon
                sides={shape.list[0].sides}
                radius={shape.list[0].radius}
                fill={shape.list[0].fill}
                opacity={shape.list[0].opacity}
                id={shape.list[0].id}
                x={shape.list[0].x}
                y={shape.list[0].y}
                stroke={shape.list[0].stroke}
                strokeWidth={shape.list[0].strokeWidth}
              />
              <RegularPolygon
                sides={shape.list[1].sides}
                radius={shape.list[1].radius}
                fill={shape.list[1].fill}
                opacity={shape.list[1].opacity}
                id={shape.list[1].id}
                x={shape.list[1].x}
                y={shape.list[1].y}
                stroke={shape.list[1].stroke}
                strokeWidth={shape.list[1].strokeWidth}
                rotation={shape.list[1].rotation}
                onClick={handleClick}
              />

              <Text
                x={500}
                y={150}
                fontSize={30}
                fill={"black"}
                text={`the shape has turned ${shape.degrees}°s`}
              />
            </Layer>
          </Stage>
          {!answer && <button onClick={newShape}>Try another shape</button>}
        </div>
      </div>
    </Wrapper>
  );
}

export default RotationalSymmetry;

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
