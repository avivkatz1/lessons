import React from "react";
import { Layer, Stage } from "react-konva";
import Grid from "./components/Grid";
import styled from "styled-components";
import LineOnGraph from "./components/LineOnGraph";

const GraphingLines = () => {
  return (
    <Wrapper>
      <Stage width={Math.min(window.innerWidth - 40, 600)} height={350} className="stage">
        <Layer>
          <LineOnGraph />
          <Grid stageHeight={350} />
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
  .ruler-container {
    padding: 0px 50px;
  }
  /* .stage{
    background-color:rgba(215, 224, 229, 0.3);
  } */
`;
