import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

const numberSides = Math.floor(Math.random() * 7) + 3;

const initial_state = {
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
};

function ReflectionSymmetry(props) {
  const [lineAttr, setLineAttr] = useState({ color: "black", strokeWidth: 2 });

  const checkDrag = (e) => {
    const lineAttr =
      e.target.attrs.x < 183 && e.target.attrs.x > 177
        ? { color: "lightgreen", strokeWidth: 10 }
        : { color: "black", strokeWidth: 2 };
    setLineAttr(lineAttr);
  };

  //   const newShape =()=>{
  //     // numberSides = Math.floor(Math.random() * 8) + 3;
  //     // const tempState = {...shape,degrees:0,list:shape.list.map((item,index)=>{
  //     //   if(index===0){
  //     //     const newItem ={...item,sides:numberSides}
  //     //     return newItem
  //     //   }
  //     //   else{
  //     //     const newItem ={...item,sides:numberSides,rotation:0}
  //     //     return newItem
  //     //   }
  //     // })}
  //     // setShape(tempState)
  //   }

  //   const dragTrack = (e) => {
  //     console.log(e.target.attrs);
  //     // setLayerX(0);
  //   };

  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={Math.min(window.innerWidth - 20, 600)} height={300}>
            <Layer>
              <RegularPolygon
                x={Math.min(window.innerWidth - 20, 600) / 3}
                y={150}
                fill="red"
                opacity={0.5}
                radius={80}
                stroke="black"
                sides={5}
                strokeWidth={2}
              />
            </Layer>
            <Layer>
              <Line
                draggable={true}
                points={[0, 0, 0, 300]}
                y={0}
                x={Math.min(window.innerWidth - 20, 600) / 2}
                stroke={lineAttr.color}
                strokeWidth={lineAttr.strokeWidth}
                onDragMove={checkDrag}
              />
            </Layer>
          </Stage>
          {/* TODO: Implement reset graph functionality */}
          <button onClick={() => {}}>Reset Graph</button>
        </div>
      </div>
    </Wrapper>
  );
}

export default ReflectionSymmetry;

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
