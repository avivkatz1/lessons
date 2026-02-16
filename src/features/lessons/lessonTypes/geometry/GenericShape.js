import React, { useState } from "react";
import { useWindowDimensions } from "../../../../hooks";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle } from "react-konva";
import Konva from "konva";
import { Transform } from "konva/lib/Util";
import { FaRegUserCircle } from "react-icons/fa";

const initial_state = {
  sides: 4,
  radius: 50,
  fill: "red",
  width: 400,
  height: 200,
  x: 200,
  y: 120,
  stroke: "black",
  strokeWidth: 4,
  shadowColor: "black",
  shadowBlur: 2,
  shadowOffset: { x: 10, y: 5 },
  shadowOpacity: 0.2,
  shadowEnabled: true,
  rotation: 45,
  draggable: true,
};

function RotationalSymmetry(props) {
  const [shape, setShape] = useState(initial_state);
  const { answer, setAnswer } = props;
  const [practice, setPractice] = useState(false);
  //   const [problem, setProblem] = useState({ shape });
  const { width, height } = useWindowDimensions();
  const handlePractice = () => {
    setPractice(true);
  };
  const handleDragStart = () => {
    const tempState = {
      ...shape,
      width: 420,
      height: 220,
      shadowBlur: 12,
      shadowOffset: { x: 20, y: 8 },
    };
    setShape(tempState);
  };
  const handleDragEnd = () => {
    const tempState = {
      ...shape,
      width: 400,
      height: 200,
      shadowOpacity: 0.2,
      shadowBlur: 8,
      shadowOffset: { x: 10, y: 5 },
    };
    setShape(tempState);
  };

  return (
    <Wrapper>
      <div className="practice-container">
        {!practice && <button onClick={handlePractice}>try problem</button>}
        {practice && (
          <div>
            <Stage width={width} height={300}>
              <Layer>
                <RegularPolygon
                  sides={shape?.sides}
                  onMouseDown={handleDragStart}
                  onMouseUp={handleDragEnd}
                  radius={shape?.radius}
                  fill={shape?.fill}
                  width={shape?.width}
                  height={shape?.height}
                  x={shape?.x}
                  y={shape?.y}
                  stroke={shape?.stroke}
                  strokeWidth={shape?.strokeWidth}
                  shadowColor={shape?.shadowColor}
                  shadowBlur={shape?.shadowBlur}
                  shadowOffset={shape?.shadowOffset}
                  shadowOpacity={shape?.shadowOpacity}
                  shadowEnabled={shape?.shadowEnabled}
                  rotation={shape?.rotation}
                  draggable={shape?.draggable}
                />
              </Layer>
            </Stage>
            {!answer && <button onClick={() => setAnswer(!answer)}>see answer</button>}
            {answer && (
              <div>
                <h3>{`The answer is `}</h3>
                <button
                  onClick={() => {
                    setAnswer(false);
                    // handlePractice();
                  }}
                >
                  try another one
                </button>
              </div>
            )}
          </div>
        )}
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
