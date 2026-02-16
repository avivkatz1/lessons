import React, { useState } from "react";
import { useWindowDimensions } from "../../../../hooks";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";

const vennList = [
  {
    venn1: "Has 4 legs",
    venn2: "Hairy",
    left: "Turtle",
    center: "Dog",
    right: "Ape",
    out: "Snake",
  },
  {
    venn1: "Has Wheels",
    venn2: "Has Windows",
    left: "Stroller",
    center: "Car",
    right: "Building",
    out: "Couch",
  },
  {
    venn1: "4 equal sides",
    venn2: "4 right angles",
    left: "rhombus",
    center: "square",
    right: "rectangle",
    out: "triangle",
  },
];

// Initial positions for draggable words
const initialPositions = {
  left: { x: 600, y: 50 },
  right: { x: 600, y: 100 },
  center: { x: 600, y: 150 },
  out: { x: 600, y: 200 },
};

function VennDiagram(props) {
  const [venn, setVenn] = useState({ list: vennList[0] });
  const [wordPositions, setWordPositions] = useState(initialPositions);
  const { width, height } = useWindowDimensions();
  const { answer, setAnswer } = props;

  const newVenn = () => {
    const num = Math.floor(Math.random() * vennList.length);
    setVenn({ list: vennList[num] });
    // Reset word positions to initial state
    setWordPositions(initialPositions);
  };

  const handleDragEnd = (word, e) => {
    setWordPositions({
      ...wordPositions,
      [word]: { x: e.target.x(), y: e.target.y() },
    });
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={width} height={300}>
            <Layer>
              <Circle
                radius={120}
                fill={"red"}
                opacity={0.3}
                x={300}
                y={122}
                stroke={"black"}
                strokeWidth={2}
              />
              <Circle
                radius={120}
                fill={"blue"}
                opacity={0.3}
                x={450}
                y={122}
                stroke={"black"}
                strokeWidth={2}
              />
              <Text x={530} y={0} fontSize={20} fill={"black"} text={venn.list.venn1} />
              <Text x={150} y={0} fontSize={20} fill={"black"} text={venn.list.venn2} />
            </Layer>
            <Layer>
              <Text
                x={wordPositions.left.x}
                y={wordPositions.left.y}
                fontSize={15}
                fill={"black"}
                text={venn.list.left}
                draggable={true}
                wrap={"word"}
                width={70}
                align="center"
                onDragEnd={(e) => handleDragEnd("left", e)}
              />
              <Text
                x={wordPositions.right.x}
                y={wordPositions.right.y}
                fontSize={15}
                fill={"black"}
                align="center"
                text={venn.list.right}
                wrap={"word"}
                width={70}
                draggable={true}
                onDragEnd={(e) => handleDragEnd("right", e)}
              />
              <Text
                x={wordPositions.center.x}
                y={wordPositions.center.y}
                fontSize={15}
                fill={"black"}
                text={venn.list.center}
                draggable={true}
                wrap={"word"}
                width={70}
                align="center"
                onDragEnd={(e) => handleDragEnd("center", e)}
              />
              <Text
                x={wordPositions.out.x}
                y={wordPositions.out.y}
                fontSize={15}
                fill={"black"}
                text={venn.list.out}
                draggable={true}
                wrap={"word"}
                width={70}
                align="center"
                onDragEnd={(e) => handleDragEnd("out", e)}
              />
            </Layer>
          </Stage>
          {!answer && <button onClick={newVenn}>Try another Venn Diagram</button>}
        </div>
      </div>
    </Wrapper>
  );
}

export default VennDiagram;

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
