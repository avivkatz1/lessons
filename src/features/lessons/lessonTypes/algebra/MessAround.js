import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text } from "react-konva";
import {
  AlternateInteriorButton,
  BuildingButton,
  CircleAngleButton,
  CircleArrowButton,
  CorrespondingAnglesButton,
  DottedLine,
  HighlighterButton,
  ParallelLinesButton,
  PerpendicularLinesButton,
  PersonButton,
  RightAngleButton,
  SameSideInteriorButton,
  SideLabelButton,
  SunButton,
  SupplementaryAngleButton,
  TreeButton,
  VerticalAngleButton,
} from "../../../../shared/helpers/Buttons";
import { SupplementaryAnglButton } from "../../../../shared/helpers";

const initialButtons = {
  alternateInterior: false,
  building: false,
  circle: false,
  corresponding: false,
  highlighter: false,
  parallel: false,
  perpendicular: false,
  person: false,
  right: false,
  sameSideInterior: false,
  sideLabel: false,
  sun: false,
  supplementary: false,
  vertical: false,
  shadow: false,
  ground: false,
  tree: false,
  circleArrow: false,
  dottedLine: false,
};

function MessAround(props) {
  const [buttons, setButtons] = useState(initialButtons);
  const {
    dottedLine,
    circleArrow,
    shadow,
    alternateInterior,
    building,
    circle,
    corresponding,
    highlighter,
    parallel,
    perpendicular,
    person,
    right,
    sameSideInterior,
    sideLabel,
    sun,
    supplementary,
    vertical,
    ground,
    tree,
  } = buttons;

  const highlightMarkers = ["red", "green", "pink", "black", "yellow", "red"];
  const handleButtonClick = (e) => {
    const name = e.target.attrs.id;
    const newState = { ...buttons, [name]: !buttons[name] };
    setButtons(newState);
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={window.innerWidth} height={700}>
            <Layer>
              {highlightMarkers?.map((col, i) => {
                return (
                  // make highlighters have different id's to be able to use different ones like ground
                  <HighlighterButton
                    handleClick={handleButtonClick}
                    highlighter={highlighter}
                    x={0}
                    y={0}
                    color={col}
                    highlightPositionX={i}
                    colorsNum={highlightMarkers.length}
                    objPos={{ x: 200, y: 100 }}
                    id="highlighter"
                  />
                );
              })}
              <SunButton
                handleClick={handleButtonClick}
                sun={sun}
                x={100}
                y={0}
                color={"yellow"}
                objPos={{ x: 300, y: 150 }}
              />
              <HighlighterButton
                handleClick={handleButtonClick}
                highlighter={ground}
                x={200}
                y={0}
                color={"green"}
                highlightPositionX={0}
                highlightPositionY={0}
                id="ground"
                colorsNum={1}
                width={800}
                objPos={{ x: 0, y: 450 }}
              />
              <HighlighterButton
                handleClick={handleButtonClick}
                highlighter={shadow}
                x={300}
                y={0}
                color={"black"}
                highlightPositionX={0}
                highlightPositionY={0}
                highlightedPositionY={350}
                colorsNum={1}
                width={350}
                reproduce={false}
                id={"shadow"}
              />
              <PersonButton
                handleClick={handleButtonClick}
                person={person}
                x={400}
                y={0}
                color={"yellow"}
                objPos={{ x: 20, y: 100 }}
              />
              <BuildingButton
                handleClick={handleButtonClick}
                building={building}
                x={500}
                y={0}
                color={"yellow"}
                objPos={{ x: 0, y: 100 }}
              />
              <AlternateInteriorButton
                x={600}
                handleClick={handleButtonClick}
                alternateInterior={alternateInterior}
                objPos={{ x: -20, y: 100 }}
              />
              <CorrespondingAnglesButton
                x={700}
                handleClick={handleButtonClick}
                corresponding={corresponding}
                objPos={{ x: 60, y: 100 }}
                textPos={{ x: 20, y: 50 }}
              />
              <SameSideInteriorButton
                x={800}
                handleClick={handleButtonClick}
                sameSideInterior={sameSideInterior}
                objPos={{ x: 100, y: 100 }}
                textPos={{ x: 20, y: 50 }}
              />
              <SupplementaryAngleButton
                x={0}
                y={50}
                supplementary={supplementary}
                handleClick={handleButtonClick}
                objPos={{ x: 300, y: 20 }}
              />
              <RightAngleButton
                x={100}
                y={50}
                right={right}
                handleClick={handleButtonClick}
                objPos={{ x: 20, y: 50 }}
              />
              <VerticalAngleButton
                x={200}
                y={50}
                vertical={vertical}
                handleClick={handleButtonClick}
              />
              <CircleAngleButton circle={circle} x={300} y={50} handleClick={handleButtonClick} />

              {/* work on making sidelabel id's linked to text */}
              <SideLabelButton
                text="S"
                primes={true}
                handleClick={handleButtonClick}
                x={500}
                y={50}
                objPos={{ x: 0, y: 60 }}
              />
              <SideLabelButton
                text="A"
                primes={false}
                handleClick={handleButtonClick}
                x={700}
                y={50}
                objPos={{ x: 0, y: 60 }}
              />
              <ParallelLinesButton
                x={400}
                y={50}
                parallel={parallel}
                handleClick={handleButtonClick}
                objPos={{ x: 0, y: 50 }}
              />

              {/* halfway and the collision between halfway points and lines parallel to each perpendicular line intersects */}
              <PerpendicularLinesButton
                x={600}
                y={50}
                perpendicular={perpendicular}
                handleClick={handleButtonClick}
                objPos={{ x: 0, y: 60 }}
              />
              <TreeButton
                handleClick={handleButtonClick}
                tree={tree}
                x={800}
                y={50}
                color={"green"}
                objPos={{ x: -100, y: 150 }}
              />
              <CircleArrowButton
                handleClick={handleButtonClick}
                circleArrow={circleArrow}
                x={900}
                y={50}
                objPos={{ x: -100, y: 150 }}
              />
              <DottedLine
                handleClick={handleButtonClick}
                dottedLine={dottedLine}
                x={900}
                objPos={{ x: -100, y: 150 }}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </Wrapper>
  );
}

export default MessAround;

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

const rotationData = {
  0: {
    degree: 0,
    dYOffsetY: 0,
    dYOffsetX: 0,
    dXOffsetY: 0,
    dXOffsetX: 0,
    topAngleOffsetY: 0,
    topAngleOffsetX: 0,
  },
  10: {
    degree: 10,
    dYOffsetY: 0,
    dYOffsetX: 0,
    dXOffsetY: 0,
    dXOffsetX: 0,
    topAngleOffsetY: 0,
    topAngleOffsetX: 0,
  },
  20: {
    degree: 20,
    dYOffsetY: 10,
    dYOffsetX: 0,
    dXOffsetY: 0,
    dXOffsetX: 0,
    topAngleOffsetY: 0,
    topAngleOffsetX: 5,
  },
  30: {
    degree: 30,
    dYOffsetY: 0,
    dYOffsetX: 20,
    dXOffsetY: 0,
    dXOffsetX: 10,
    topAngleOffsetY: 0,
    topAngleOffsetX: 5,
  },
  40: {
    degree: 40,
    dYOffsetY: 0,
    dYOffsetX: 30,
    dXOffsetY: 0,
    dXOffsetX: 15,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  50: {
    degree: 50,
    dYOffsetY: 0,
    dYOffsetX: 40,
    dXOffsetY: 0,
    dXOffsetX: 20,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  60: {
    degree: 60,
    dYOffsetY: 0,
    dYOffsetX: 40,
    dXOffsetY: 0,
    dXOffsetX: 25,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  70: {
    degree: 70,
    dYOffsetY: 0,
    dYOffsetX: 40,
    dXOffsetY: 0,
    dXOffsetX: 30,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  80: {
    degree: 80,
    dYOffsetY: 0,
    dYOffsetX: 40,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  90: {
    degree: 90,
    dYOffsetY: 20,
    dYOffsetX: 40,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  100: {
    degree: 100,
    dYOffsetY: 20,
    dYOffsetX: 40,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: 0,
    topAngleOffsetX: 10,
  },
  110: {
    degree: 110,
    dYOffsetY: 20,
    dYOffsetX: 60,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: -5,
    topAngleOffsetX: 10,
  },
  120: {
    degree: 120,
    dYOffsetY: 20,
    dYOffsetX: 60,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: -5,
    topAngleOffsetX: 10,
  },
  130: {
    degree: 130,
    dYOffsetY: 20,
    dYOffsetX: 60,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: -5,
    topAngleOffsetX: 20,
  },
  140: {
    degree: 140,
    dYOffsetY: 40,
    dYOffsetX: 60,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: -5,
    topAngleOffsetX: 25,
  },
  150: {
    degree: 150,
    dYOffsetY: 40,
    dYOffsetX: 50,
    dXOffsetY: 0,
    dXOffsetX: 35,
    topAngleOffsetY: -5,
    topAngleOffsetX: 30,
  },
  160: {
    degree: 160,
    dYOffsetY: 60,
    dYOffsetX: 30,
    dXOffsetY: 10,
    dXOffsetX: 35,
    topAngleOffsetY: 10,
    topAngleOffsetX: 40,
  },
  170: {
    degree: 170,
    dYOffsetY: 60,
    dYOffsetX: 30,
    dXOffsetY: 10,
    dXOffsetX: 35,
    topAngleOffsetY: 10,
    topAngleOffsetX: 40,
  },
  180: {
    degree: 180,
    dYOffsetY: 60,
    dYOffsetX: 20,
    dXOffsetY: 10,
    dXOffsetX: 30,
    topAngleOffsetY: 10,
    topAngleOffsetX: 40,
  },
  190: {
    degree: 190,
    dYOffsetY: 60,
    dYOffsetX: 15,
    dXOffsetY: 10,
    dXOffsetX: 25,
    topAngleOffsetY: 10,
    topAngleOffsetX: 40,
  },
  200: {
    degree: 200,
    dYOffsetY: 60,
    dYOffsetX: 15,
    dXOffsetY: 10,
    dXOffsetX: 20,
    topAngleOffsetY: 10,
    topAngleOffsetX: 40,
  },
  210: {
    degree: 210,
    dYOffsetY: 60,
    dYOffsetX: 15,
    dXOffsetY: 10,
    dXOffsetX: 15,
    topAngleOffsetY: 10,
    topAngleOffsetX: 35,
  },
  220: {
    degree: 220,
    dYOffsetY: 60,
    dYOffsetX: 15,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 10,
    topAngleOffsetX: 35,
  },
  230: {
    degree: 230,
    dYOffsetY: 60,
    dYOffsetX: 5,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 10,
    topAngleOffsetX: 35,
  },
  240: {
    degree: 240,
    dYOffsetY: 60,
    dYOffsetX: 5,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 15,
    topAngleOffsetX: 35,
  },
  250: {
    degree: 250,
    dYOffsetY: 50,
    dYOffsetX: 0,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 15,
    topAngleOffsetX: 35,
  },
  260: {
    degree: 260,
    dYOffsetY: 50,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 20,
    topAngleOffsetX: 35,
  },
  270: {
    degree: 270,
    dYOffsetY: 50,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 20,
    topAngleOffsetX: 35,
  },
  280: {
    degree: 280,
    dYOffsetY: 30,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 25,
    topAngleOffsetX: 35,
  },
  290: {
    degree: 290,
    dYOffsetY: 30,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 25,
    topAngleOffsetX: 35,
  },
  300: {
    degree: 300,
    dYOffsetY: 30,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 35,
    topAngleOffsetX: 35,
  },
  310: {
    degree: 310,
    dYOffsetY: 20,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 40,
    topAngleOffsetX: 35,
  },
  320: {
    degree: 320,
    dYOffsetY: 20,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 40,
    topAngleOffsetX: 30,
  },
  330: {
    degree: 330,
    dYOffsetY: 10,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 0,
    topAngleOffsetX: -15,
  },
  340: {
    degree: 340,
    dYOffsetY: 10,
    dYOffsetX: -10,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 0,
    topAngleOffsetX: -10,
  },
  350: {
    degree: 350,
    dYOffsetY: 0,
    dYOffsetX: 0,
    dXOffsetY: 10,
    dXOffsetX: 10,
    topAngleOffsetY: 0,
    topAngleOffsetX: 0,
  },
  360: {
    degree: 360,
    dYOffsetY: 0,
    dYOffsetX: 0,
    dXOffsetY: 0,
    dXOffsetX: 0,
    topAngleOffsetY: 0,
    topAngleOffsetX: 0,
  },
};
