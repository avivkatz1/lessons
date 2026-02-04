import React from "react";
import { Stage, Layer, Text } from "react-konva";
import AboveAndBelowMessage from "./AboveAndBelowMessage";

const AddingIntegers = (props) => {
  const {
    textXOne,
    textYOne,
    textOneText,
    textOneOnClick,
    textXTwo,
    textYTwo,
    textTwoText,
    textTwoOnClick,
    textXThree,
    textYThree,
    textThreeText,
    textThreeOnClick,
    changeOne,
    changeTwo,
    changeThree,
    showAnswer,
    answerX,
    answerY,
    answerText,
    changeOneData,
    changeTwoData,
    changeThreeData,
  } = props;

  return (
    <>
      <Text
        x={textXOne}
        y={textYOne}
        fontSize={40}
        fontStyle={"bold"}
        fontFamily="monospace"
        fill={"red"}
        text={textOneText}
        onClick={textOneOnClick}
      />
      <Text
        x={textXTwo}
        y={textYTwo}
        fontSize={40}
        fontStyle={"bold"}
        fontFamily="monospace"
        fill={"red"}
        text={textTwoText}
        onClick={textTwoOnClick}
      />
      <Text
        x={textXThree}
        y={textYThree}
        fontSize={40}
        fontStyle={"bold"}
        fontFamily="monospace"
        fill={"red"}
        text={textThreeText}
        onClick={textThreeOnClick}
      />
      {changeThree && (
        <AboveAndBelowMessage
          xPosition={changeThreeData.xPos}
          yPosition={changeThreeData.yPos}
          textAbove={changeThreeData.textAbove}
          textBelow={changeThreeData.textBelow}
        />
      )}
      {changeOne && (
        <AboveAndBelowMessage
          xPosition={changeOneData.xPos}
          yPosition={changeOneData.yPos}
          textAbove={changeOneData.textAbove}
          textBelow={changeOneData.textBelow}
        />
      )}

      {changeTwo && (
        <AboveAndBelowMessage
          xPosition={changeTwoData.xPos}
          yPosition={changeTwoData.yPos}
          textAbove={changeTwoData.textAbove}
          textBelow={changeTwoData.textBelow}
        />
      )}
      {showAnswer && (
        <>
          <Text
            x={answerX}
            y={answerY}
            fontSize={40}
            fontStyle={"bold"}
            fontFamily="monospace"
            fill={"red"}
            text={answerText}
            width={400}
          />
        </>
      )}
    </>
  );
};

export default AddingIntegers;
