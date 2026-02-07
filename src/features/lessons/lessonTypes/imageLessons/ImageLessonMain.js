import React, { useState } from "react";
import styled from "styled-components";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text, Image } from "react-konva";
import useImage from "use-image";

const ImageLessonMain = ({ child }) => {
  const width = typeof window !== "undefined" ? window.innerWidth : 800;

  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={width} height={100}>
            <Layer>{child}</Layer>
          </Stage>
        </div>
      </div>
    </Wrapper>
  );
};

export default ImageLessonMain;
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
  .ruler-container {
    padding: 0px 50px;
  }
`;
