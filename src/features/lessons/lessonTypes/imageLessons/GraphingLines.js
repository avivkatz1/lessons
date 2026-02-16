import React from "react";
import { useWindowDimensions } from "../../../../hooks";
import { Layer, Stage } from "react-konva";
import Grid from "./components/Grid";
import styled from "styled-components";
import LineOnGraph from "./components/LineOnGraph";

const GraphingLines = () => {
  const { width, height } = useWindowDimensions();
  const stageWidth = Math.min(width - 40, 600);
  const stageHeight = 350;

  return (
    <Wrapper>
      <Stage width={stageWidth} height={stageHeight} className="stage">
        <Layer>
          <LineOnGraph />
          <Grid stageHeight={stageHeight} stageWidth={stageWidth} />
          <LineOnGraph />
        </Layer>
      </Stage>
    </Wrapper>
  );
};

export default GraphingLines;
const Wrapper = styled.div`
  /* margin-top: 20px; */
  display: flex;
  /* height:100vh; */
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  button {
    background-color: ${props => props.theme.colors.buttonSuccess};
    color: ${props => props.theme.colors.textInverted};
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
