import React, { useState } from "react";
import { useWindowDimensions } from "../../../../hooks";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, Line, Text } from "react-konva";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};
let multiplierOne;
let multiplierTwo;
let sendBackNum;

const createNumbers = (rand) => {
  const num = randomNum(10) + 1;
  const a = randomNum(5) + 1;
  const b = randomNum(20);
  multiplierOne = randomNum(10) + 2;
  multiplierTwo = randomNum(10) + 2;
  const proportionNumbers = [
    [num, multiplierOne * num, num * multiplierTwo, num * multiplierTwo * multiplierOne],
    [multiplierOne * num, num, num * multiplierTwo * multiplierOne, num * multiplierTwo],
    [num * multiplierTwo, num * multiplierTwo * multiplierOne, num, multiplierOne * num],
    [num * multiplierTwo * multiplierOne, num * multiplierTwo, multiplierOne * num, num],
  ];

  sendBackNum = randomNum(proportionNumbers.length);
  const returningArray = createTextObject(proportionNumbers[sendBackNum], rand, a, b);
  return returningArray;
};

const createTextObject = (array, randomNumberInput, a, b) => {
  const newTerms = array.map((term, index) => {
    let changingTerm = { num: term, numVar: term };
    if (index === randomNumberInput) {
      changingTerm = {
        num: `${a}x-${b}`,
        numVar: term,
        xVal: Math.round(((term + b) / a) * 1000) / 1000,
      };
    }
    return changingTerm;
  });
  return newTerms;
};

function Proportions(props) {
  const [answer, setAnswer] = useState(false);
  const [randomVar, setRandomVar] = useState(randomNum(4));
  const [terms, setTerms] = useState(createNumbers(randomVar));
  const [ratio, setRatio] = useState(false);
  const { width, height } = useWindowDimensions();

  const newProportion = async () => {
    const newRandom = randomNum(4);
    setRandomVar(newRandom);
    const newArray = createNumbers(newRandom);
    setTerms(newArray);
    setRatio(false);
    setAnswer(false);
  };

  const seeAnswers = () => {
    setAnswer(!answer);
  };
  const crossMultiply = () => {};

  const textCord = [
    { x: 340, y: 124 },
    { x: 540, y: 124 },
    { x: 340, y: 194 },
    { x: 540, y: 194 },
  ];

  const changeRatio = () => {
    setRatio(!ratio);
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={width} height={500}>
            <Layer>
              <Line stroke={"black"} strokeWidth={10} points={[300, 176, 420, 176]} />
              <Line stroke={"black"} strokeWidth={10} points={[501, 176, 621, 176]} />
              <Line stroke={"black"} strokeWidth={4} points={[446, 185, 474, 185]} />
              <Line stroke={"black"} strokeWidth={4} points={[446, 170, 474, 170]} />
              {textCord.map((coord, index) => {
                let equation;
                return (
                  <Text
                    key={`33fsf${index * 203904}`}
                    id={`234${index}e`}
                    fontSize={50}
                    fontStyle={"bold"}
                    fill={"black"}
                    text={index == randomVar && !ratio ? terms[index].num : terms[index].numVar}
                    x={
                      index === randomVar && !ratio
                        ? coord.x - 30
                        : terms[index].num >= 100
                          ? coord.x - 15
                          : terms[index].num > 10
                            ? coord.x - 10
                            : coord.x
                    }
                    y={coord.y}
                    width={200}
                    wrap={"word"}
                    onClick={crossMultiply}
                  />
                );
              })}
              {answer && (
                <Text
                  fontSize={50}
                  fontStyle={"bold"}
                  fill={"red"}
                  text={`x = ${terms[randomVar].xVal}`}
                  x={400}
                  y={400}
                  wrap={"word"}
                />
              )}
            </Layer>
          </Stage>
          <button onClick={newProportion}>new proportion</button>
          <button onClick={seeAnswers}>{answer ? "Hide Answer" : "See Answer"}</button>
          <button onClick={changeRatio}>
            {ratio ? `View with variable` : `See the equal ratios`}
          </button>
        </div>
      </div>
    </Wrapper>
  );
}

export default Proportions;

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
