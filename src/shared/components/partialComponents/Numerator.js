import React from "react";
import { Text } from "react-konva";
const Numerator = (props) => {
  const xPosition = props.xPosition;
  const yPosition = props.yPosition;
  const textMessage = props.textMessage;
  return (
    <Text
      x={xPosition}
      y={yPosition + 40}
      fontSize={40}
      fontStyle={"bold"}
      fontFamily="monospace"
      fill={"red"}
      text={textMessage}
    />
  );
};

export default Numerator;
