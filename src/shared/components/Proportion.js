import React from "react";
import { Stage, Layer, Text, Circle } from "react-konva";
import FractionComponent from "../components/FractionComponent";
import { useSelector } from "react-redux";

function Proportion(props) {
  const wordProblem = useSelector((state) => state.lesson.lessonProps.wordProblemReturned);
  const {
    numeratorValueOne,
    denominatorValueOne,
    xPosOne,
    yPosOne,
    numeratorValueTwo,
    denominatorValueTwo,
    xPosTwo,
    yPosTwo,
    textX,
    textY,
    textMessage,
    radius,
  } = props;
  return (
    <>
      <FractionComponent
        numeratorValue={numeratorValueOne}
        denominatorValue={denominatorValueOne}
        xPos={xPosOne}
        yPos={yPosOne}
      />
      {wordProblem != "multiplying_fractions" ? (
        <Text
          x={textX}
          y={textY}
          fontSize={40}
          fontStyle={"bold"}
          fontFamily="monospace"
          fill={"red"}
          text={textMessage}
        />
      ) : (
        <Circle x={textX} y={textY} radius={radius} fill="red" />
      )}
      <FractionComponent
        numeratorValue={numeratorValueTwo}
        denominatorValue={denominatorValueTwo}
        xPos={xPosTwo}
        yPos={yPosTwo}
      />
    </>
  );
}

export default Proportion;
