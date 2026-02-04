import React from "react";
import { Text } from "react-konva";

function AboveAndBelowMessage({ xPosition, yPosition, textAbove, textBelow }) {
  return (
    <div>
      <>
        <Text
          x={xPosition}
          y={yPosition - 20}
          fontSize={20}
          fontStyle={"bold"}
          fontFamily="monospace"
          fill={"red"}
          text={textAbove}
        />
        <Text
          x={xPosition}
          y={yPosition + 40}
          fontSize={40}
          fontStyle={"bold"}
          fontFamily="monospace"
          fill={"red"}
          text={textBelow}
        />
      </>
    </div>
  );
}

export default AboveAndBelowMessage;
