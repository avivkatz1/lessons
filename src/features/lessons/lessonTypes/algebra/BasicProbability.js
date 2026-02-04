import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

const numPattern = 10;

const initialState = [...Array(numPattern)].map((_, i) => (Math.random() > 0.4 ? "red" : "white"));

function BasicProbability(props) {
  // const [shape, setShape] = useState();

  //   const [layerX, setLayerX] = useState({ x: 0, y: 0 });
  const [practice, setPractice] = useState(false);
  const [fillPattern, setFillPattern] = useState(initialState);

  let percentRed = fillPattern
    .map((good) => (good == "red" ? 1 : 0))
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  const [answer, setAnswer] = useState(percentRed);
  const handlePractice = () => {
    setPractice(true);
  };

  const changeFill = () => {
    const newPattern = [...Array(numPattern)].map((_, i) =>
      Math.random() > 0.2 ? "black" : "red"
    );
    setFillPattern(newPattern);

    const newPercentRed = newPattern
      .map((good) => (good == "red" ? 1 : 0))
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    setAnswer(newPercentRed);
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
          <Stage width={window.innerWidth} height={300}>
            {/* <Layer>
              {[...Array(30)].map((_, indexH) => {
                let strokeColorH = "lightgray";
                let strokeWidthH = 1;
                if (indexH === axis.OriginH) {
                  strokeColorH = "darkgray";
                  strokeWidthH = 2;
                }
                return (
                  <Line
                    key={`y${indexH}`}
                    points={[0, 0, 1300, 0]}
                    stroke={strokeColorH}
                    strokeWidth={strokeWidthH}
                    x={0}
                    y={indexH * 15 + 10}
                  />
                );
              })}
              {[...Array(100)].map((_, indexV) => {
                let strokeColorV = "lightgray";
                let strokeWidthV = 1;
                if (indexV === axis.OriginV + 20) {
                  strokeColorV = "darkgray";
                  strokeWidthV = 2;
                }
                return (
                  <Line
                    key={`x${indexV}`}
                    points={[0, 0, 0, 300]}
                    stroke={strokeColorV}
                    strokeWidth={strokeWidthV}
                    x={indexV * 15 + 10}
                    y={0}
                  />
                );
              })}
            </Layer> */}
            <Layer>
              {[...Array(numPattern)].map((_, index) => (
                <RegularPolygon
                  x={180 + 40 * index}
                  y={120}
                  fill={fillPattern[index]}
                  opacity={0.5}
                  radius={20}
                  stroke="black"
                  sides={5}
                  strokeWidth={2}
                />
              ))}
            </Layer>
            <Layer>
              <Text x={150} y={0} fontSize={40} fill={"red"} text={`${answer}/10`} />
              <Text x={300} y={0} fontSize={40} fill={"red"} text={`${answer}0%`} />
              <Text x={450} y={0} fontSize={40} fill={"red"} text={`0.${answer}`} />
            </Layer>
          </Stage>
          <button onClick={changeFill}>New Pattern</button>
        </div>
      </div>
    </Wrapper>
  );
}

export default BasicProbability;

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
