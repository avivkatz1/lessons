import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";
import { rotation } from "../../../../shared/images";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

function TangentMultiple(props) {
  const [triangleParts, setTriangleParts] = useState(rotationData[0]);
  const [practice, setPractice] = useState(false);
  const [showY, setShowY] = useState(false);
  const [showX, setShowX] = useState(false);
  const [answer, setAnswer] = useState(false);
  const [rotationAmount, setRotationAmount] = useState("");
  const [rotationTextAmount, setRotationTextAmount] = useState("");
  const [offsetXAmount, setOffsetXAmount] = useState(670);
  const [offsetYAmount, setOffsetYAmount] = useState(225);
  const [offsetXTextAmount, setOffsetXTextAmount] = useState("");
  const [offsetYTextAmount, setOffsetYTextAmount] = useState("");

  const handlePractice = () => {
    setTriangleParts(rotationData[numbers(1, 37)[0] * 10]);
  };

  const showDrag = (e) => {};
  const toggleY = () => {
    setShowY(!showY);
  };
  const toggleX = () => {
    setShowX(!showX);
  };
  const toggleAnswer = () => {
    setAnswer(!answer);
  };

  const handleRotationAmountChange = (e) => {
    // setRotationAmount(e.target.value);
    setTriangleParts(rotationData[numbers(1, 37)[0] * 10]);
    // setTriangleParts(e.target.value)
    // setTriangleParts(e.target.value)
    // console.log(triangleParts)
  };
  const handleRotationTextAmountChange = (e) => {
    setRotationTextAmount(e.target.value);
  };
  const handleoffsetXAmountChange = (e) => {
    setOffsetXAmount(e.target.value);
  };
  const handleoffsetYAmountChange = (e) => {
    setOffsetYAmount(e.target.value);
  };
  const handleoffsetXTextAmountChange = (e) => {
    setOffsetXTextAmount(e.target.value);
  };
  const handleoffsetYTextAmountChange = (e) => {
    setOffsetYTextAmount(e.target.value);
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={window.innerWidth} height={500}>
            <Layer
              rotation={triangleParts.degree}
              offsetX={offsetXAmount}
              offsetY={offsetYAmount}
              x={offsetXAmount}
              y={offsetYAmount}
            >
              <Shape
                sceneFunc={(context, shape) => {
                  context.beginPath();
                  context.moveTo(619, 50);
                  context.lineTo(619, 350);
                  context.lineTo(850, 350);
                  context.closePath();
                  // (!) Konva specific method, it is very important
                  context.fillStrokeShape(shape);
                }}
                // rotation={rotationAmount}
                fill="#00D2FF"
                stroke="black"
                strokeWidth={4}
                offsetX={677}
                offsetY={198}
                x={677}
                y={198}
              />

              <Text
                fontSize={30}
                fontStyle={"bold"}
                fill={"blue"}
                text={"40°"}
                x={632.5}
                y={141}
                opacity={0.4}
                wrap={"word"}
                onClick={toggleY}
                rotation={-triangleParts.degree}
                offsetX={
                  // 0
                  triangleParts.topAngleOffsetX
                }
                offsetY={
                  // 0
                  triangleParts.topAngleOffsetY
                }
              />
              <Text
                fontSize={50}
                fontStyle={"bold"}
                fill={"green"}
                text={`x`}
                x={563.5}
                y={191}
                opacity={0.4}
                wrap={"word"}
                onClick={toggleX}
                rotation={-triangleParts.degree}
                offsetX={
                  // 0
                  triangleParts.dXOffsetX
                }
                offsetY={
                  // 0
                  triangleParts.dXOffsetY
                }
              />
              <Text
                fontSize={50}
                fontStyle={"bold"}
                fill={"green"}
                text={`y`}
                x={730}
                y={355}
                opacity={0.4}
                wrap={"word"}
                onClick={toggleX}
                draggable={true}
                onDragMove={showDrag}
                rotation={-1 * triangleParts.degree}
                offsetX={triangleParts.dYOffsetX}
                offsetY={triangleParts.dYOffsetY}
              />
            </Layer>
          </Stage>
          <button onClick={handlePractice}>New Slope Triangle</button>
          <button onClick={toggleAnswer}>{answer ? "hide answer" : "Show Answer"}</button>
          <label htmlFor={"rotationAmount"}>rotation amount</label>
          <input
            name="rotationAmount"
            value={rotationAmount}
            onChange={handleRotationAmountChange}
          ></input>
          <label htmlFor={"rotationTextAmount"}>rotation Textamount</label>
          <input
            name="rotationTextAmount"
            value={-rotationTextAmount}
            onChange={handleRotationTextAmountChange}
          ></input>
          <label htmlFor={"offsetXAmount"}>offsetX</label>
          <input
            name="offsetXAmount"
            value={offsetXAmount}
            onChange={handleoffsetXAmountChange}
          ></input>
          <label htmlFor={"offsetYAmount"}>offsetY</label>
          <input
            name="offsetYAmount"
            value={offsetYAmount}
            onChange={handleoffsetYAmountChange}
          ></input>
          <label htmlFor={"offsetXTextAmount"}>offsetXText</label>
          <input
            name="offsetXTextAmount"
            value={offsetXTextAmount}
            onChange={handleoffsetXTextAmountChange}
          ></input>
          <label htmlFor={"offsetYTextAmount"}>offsetYText</label>
          <input
            name="offsetYTextAmount"
            value={offsetYTextAmount}
            onChange={handleoffsetYTextAmountChange}
          ></input>
        </div>
      </div>
    </Wrapper>
  );
}

export default TangentMultiple;

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

const rotationData = {
  0: {
    degree: 0,
    dYOffsetY: 0,
    dYOffsetX: 0,
    dXOffsetY: 0,
    dXOffsetX: 0,
    topAngleOffsetY: 0,
    topAngleOffsetX: 0,
  },
  10: {
    degree: 10,
    dYOffsetY: 0,
    dYOffsetX: 0,
    dXOffsetY: 0,
    dXOffsetX: 0,
    topAngleOffsetY: 0,
    topAngleOffsetX: 0,
  },
  20: {
    degree: 20,
    dYOffsetY: 10,
    dYOffsetX: 0,
    dXOffsetY: 0,
    dXOffsetX: 0,
    topAngleOffsetY: 0,
    topAngleOffsetX: 5,
  },
  30: {
    degree: 30,
    dYOffsetY: 0,
    dYOffsetX: 20,
    dXOffsetY: 0,
    dXOffsetX: 10,
    topAngleOffsetY: 0,
    topAngleOffsetX: 5,
  },
  40: {
    degree: 40,
    dYOffsetY: 0,
    dYOffsetX: 30,
    dXOffsetY: 0,
    dXOffsetX: 15,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  50: {
    degree: 50,
    dYOffsetY: 0,
    dYOffsetX: 40,
    dXOffsetY: 0,
    dXOffsetX: 20,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  60: {
    degree: 60,
    dYOffsetY: 0,
    dYOffsetX: 40,
    dXOffsetY: 0,
    dXOffsetX: 25,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  70: {
    degree: 70,
    dYOffsetY: 0,
    dYOffsetX: 40,
    dXOffsetY: 0,
    dXOffsetX: 30,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  80: {
    degree: 80,
    dYOffsetY: 0,
    dYOffsetX: 40,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  90: {
    degree: 90,
    dYOffsetY: 20,
    dYOffsetX: 40,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  100: {
    degree: 100,
    dYOffsetY: 20,
    dYOffsetX: 40,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  110: {
    degree: 110,
    dYOffsetY: 20,
    dYOffsetX: 60,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: -5,
    topAngleOffsetX: 10,
  },
  120: {
    degree: 120,
    dYOffsetY: 20,
    dYOffsetX: 60,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: -5,
    topAngleOffsetX: 10,
  },
  130: {
    degree: 130,
    dYOffsetY: 20,
    dYOffsetX: 60,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: -5,
    topAngleOffsetX: 20,
  },
  140: {
    degree: 140,
    dYOffsetY: 40,
    dYOffsetX: 60,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: -5,
    topAngleOffsetX: 25,
  },
  150: {
    degree: 150,
    dYOffsetY: 40,
    dYOffsetX: 50,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: -5,
    topAngleOffsetX: 30,
  },
  160: {
    degree: 160,
    dYOffsetY: 60,
    dYOffsetX: 30,
    dXOffsetY: 10,
    dXOffsetX: 35,
    topAngleOffsetY: 10,
    topAngleOffsetX: 40,
  },
  170: {
    degree: 170,
    dYOffsetY: 60,
    dYOffsetX: 30,
    dXOffsetY: 10,
    dXOffsetX: 35,
    topAngleOffsetY: 10,
    topAngleOffsetX: 40,
  },
  180: {
    degree: 180,
    dYOffsetY: 60,
    dYOffsetX: 20,
    dXOffsetY: 10,
    dXOffsetX: 30,
    topAngleOffsetY: 10,
    topAngleOffsetX: 40,
  },
  190: {
    degree: 190,
    dYOffsetY: 60,
    dYOffsetX: 15,
    dXOffsetY: 10,
    dXOffsetX: 25,
    topAngleOffsetY: 10,
    topAngleOffsetX: 40,
  },
  200: {
    degree: 200,
    dYOffsetY: 60,
    dYOffsetX: 15,
    dXOffsetY: 10,
    dXOffsetX: 20,
    topAngleOffsetY: 10,
    topAngleOffsetX: 40,
  },
  210: {
    degree: 210,
    dYOffsetY: 60,
    dYOffsetX: 15,
    dXOffsetY: 10,
    dXOffsetX: 15,
    topAngleOffsetY: 10,
    topAngleOffsetX: 35,
  },
  220: {
    degree: 220,
    dYOffsetY: 60,
    dYOffsetX: 15,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 10,
    topAngleOffsetX: 35,
  },
  230: {
    degree: 230,
    dYOffsetY: 60,
    dYOffsetX: 5,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 10,
    topAngleOffsetX: 35,
  },
  240: {
    degree: 240,
    dYOffsetY: 60,
    dYOffsetX: 5,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 15,
    topAngleOffsetX: 35,
  },
  250: {
    degree: 250,
    dYOffsetY: 50,
    dYOffsetX: 0,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 15,
    topAngleOffsetX: 35,
  },
  260: {
    degree: 260,
    dYOffsetY: 50,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 20,
    topAngleOffsetX: 35,
  },
  270: {
    degree: 270,
    dYOffsetY: 50,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 20,
    topAngleOffsetX: 35,
  },
  280: {
    degree: 280,
    dYOffsetY: 30,
    dYOffsetX: -10,
    dXOffsetY: 50,
    dXOffsetX: 10,
    topAngleOffsetY: 25,
    topAngleOffsetX: 35,
  },
  290: {
    degree: 290,
    dYOffsetY: 30,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 25,
    topAngleOffsetX: 35,
  },
  300: {
    degree: 300,
    dYOffsetY: 30,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 35,
    topAngleOffsetX: 35,
  },
  310: {
    degree: 310,
    dYOffsetY: 20,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 40,
    topAngleOffsetX: 35,
  },
  320: {
    degree: 320,
    dYOffsetY: 20,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 40,
    topAngleOffsetX: 30,
  },
  330: {
    degree: 330,
    dYOffsetY: 10,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 0,
    topAngleOffsetX: -15,
  },
  340: {
    degree: 340,
    dYOffsetY: 10,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 0,
    topAngleOffsetX: -10,
  },
  350: {
    degree: 350,
    dYOffsetY: 0,
    dYOffsetX: 0,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 0,
    topAngleOffsetX: 0,
  },
  360: {
    degree: 360,
    dYOffsetY: 0,
    dYOffsetX: 0,
    dXOffsetY: 0,
    dXOffsetX: 0,
    topAngleOffsetY: 0,
    topAngleOffsetX: 0,
  },
};
