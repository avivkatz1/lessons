import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";
import { useLessonState } from "../../../../hooks";

const randomNum = (max = 5) => {
  return Math.floor(Math.random() * max);
};

const yPosition = 150;

let num = randomNum(5);
let start = randomNum(5);

function Patterns(props) {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { showAnswer, question, answer, hints } = lessonProps;

  const questionArray = question[0];
  const pattern_num = questionArray;
  const { newProblem, seeAnswer } = props;

  const handlePractice = () => {
    newPattern();
  };
  const newPattern = () => {
    const positive = Math.random() * 10 > 5 ? true : false;
    num = randomNum(5);
    if (positive) {
      start = randomNum(4);
    } else {
      start = 5 - Math.floor(Math.random() * 4);
      num = num * -1;
    }
  };
  const handleNextProblem = () => {
    seeAnswer();
    handlePractice();
    newProblem();
  };

  const returnReactArray = [];
  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={window.innerWidth} height={350}>
            <Layer>
              {/* {showAnswer&&<Text
              text={`The pattern starts with ${pattern_num[0]} and then changes ${pattern_num[1]-pattern_num[0]} each time`}
              fill="red"
              x={20}
              y={20}
              fontSize={30}
              width={250}
              />} */}
              {pattern_num?.map((occurances, index) => {
                // if (index >= 4)
                //   return (
                //     showAnswer && (
                //       <>

                //         <Text
                //           x={100 * index + 300}
                //           y={yPosition}
                //           fontSize={20}
                //           fill={"red"}
                //           text={occurances}
                //         />
                //         {/* {[...Array(Math.abs(occurances))].map(
                //           (num, occurancesIndex) => {
                //             return (
                //               <Rect
                //                 key={`${index}${occurancesIndex}`}
                //                 fill={occurances < 0 ? "blue" : "red"}
                //                 width={30}
                //                 height={10}
                //                 stroke="black"
                //                 strokeWidth={1}
                //                 x={
                //                   (occurances > 0 && occurancesIndex < 17) ||
                //                   (occurances < 0 && occurancesIndex < 12)
                //                     ? 100 * index + 300
                //                     : 100 * index + 330
                //                 }
                //                 y={
                //                   occurances > 0 && occurancesIndex < 17
                //                     ? yPosition - 20 + occurancesIndex * -15
                //                     : occurances > 0 && occurancesIndex >= 17
                //                     ? yPosition -
                //                       20 +
                //                       (occurancesIndex - 17) * -15
                //                     : occurancesIndex < 12
                //                     ? yPosition + 30 + occurancesIndex * 15
                //                     : yPosition +
                //                       30 +
                //                       (occurancesIndex - 12) * 15
                //                 }
                //               />
                //             );
                //           }
                //         )} */}
                //       </>
                //     )
                // );
                const indexNum = props.showAnswer == true ? 5 : 4;
                if (index < indexNum)
                  return (
                    <>
                      <Text
                        x={100 * index + 100}
                        y={yPosition}
                        fontSize={20}
                        fill={"red"}
                        text={occurances}
                      />
                      {[...Array(Math.abs(occurances))].map((num, occurancesIndex) => {
                        return (
                          <Rect
                            key={`${index}${occurancesIndex}`}
                            fill={occurances < 0 ? "blue" : "red"}
                            width={30}
                            height={10}
                            stroke="black"
                            strokeWidth={1}
                            x={occurancesIndex < 9 ? 100 * index + 100 : 100 * index + 140}
                            y={
                              occurancesIndex >= 9 && occurances < 0
                                ? yPosition + 30 + (occurancesIndex - 9) * 15
                                : occurancesIndex >= 9 && occurances > 0
                                  ? yPosition - 20 + (occurancesIndex - 9) * -15
                                  : occurances < 0
                                    ? yPosition + 30 + occurancesIndex * 15
                                    : yPosition - 20 + occurancesIndex * -15
                            }
                          />
                        );
                      })}
                    </>
                  );
              })}
            </Layer>
          </Stage>
        </div>
      </div>
    </Wrapper>
  );
}

export default Patterns;

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
