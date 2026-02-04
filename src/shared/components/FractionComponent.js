import React from "react";
import { Denominator, Numerator, LineData } from "./partialComponents";
import { Stage, Layer } from "react-konva";

const FractionComponent = (props) => {
  const { numeratorValue, denominatorValue, xPos, yPos } = props;
  return (
    <div>
      <Numerator xPosition={xPos} yPosition={yPos} textMessage={numeratorValue} />
      <LineData xPosition={xPos} yPosition={yPos + 50} />
      <Numerator xPosition={xPos} yPosition={yPos + 50} textMessage={denominatorValue} />
    </div>
  );
};

export default FractionComponent;
