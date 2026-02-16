import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

import makingAngle from "../../../../shared/helpers/makingAngle";
import { Stage, Layer, Line, Text, Rect } from "react-konva";

const NamingAnglesLevelOne = (props) => {
  // Initialize state with lazy initializer function to avoid module-level errors
  // Use a single initialization to keep linesArray and lettersArray consistent
  const initialAngle = React.useMemo(() => makingAngle(), []);
  const [linesArray, setLinesArray] = useState(initialAngle.linesArray);
  const [lettersArray, setLettersArray] = useState(initialAngle.lettersArray);
  const [answerArray, setAnswerArray] = useState([]);
  const [correct, setCorrect] = useState(true);
  const { triggerNewProblem } = props;

  // Phase 2 - Stage 5: Use shared lesson state hook
  const { showAnswer, revealAnswer, hideAnswer } = useLessonState();
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const varOne = lettersArray[0].name;
  const varTwo = lettersArray[1].name;
  const varThree = lettersArray[2].name;

  const newAngle = () => {
    setAnswerArray([]);
    hideAnswer();
    const newAngle = makingAngle();
    setLinesArray(newAngle.linesArray);
    setLettersArray(newAngle.lettersArray);
  };

  const handleClick = (e) => {
    const { id } = e.target.attrs;
    if (
      ((answerArray.length === 0 || answerArray.length === 2) && id === varTwo) ||
      (answerArray.length === 1 && id !== varTwo)
    ) {
      setCorrect(false);
      setAnswerArray([]);
      setTimeout(() => {
        setCorrect(true);
      }, 2000);
      return; // Exit early on incorrect click
    }
    // Only add to answer array if click was correct
    setAnswerArray([...answerArray, id]);
  };
  const highlightMarkers = [];
  return (
    <Wrapper>
      <div className="practice-container">
        <button onClick={newAngle}>Another Angle</button>
        <Stage width={width} height={500}>
          <Layer>
            {/* Canvas background */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={500}
              fill={konvaTheme.canvasBackground}
            />

            <Text
              x={180}
              y={0}
              fontSize={20}
              fill={konvaTheme.labelText}
              text={
                correct && answerArray.length === 3
                  ? `Well done! ∠${answerArray.join(
                      ""
                    )} is correct!!!  Try another angle, or move on to next level`
                  : correct
                    ? `Practice naming an angle with 3 letters.  Tap on the letters in the correct order to name the below angle:  ∠${answerArray.join(
                        ""
                      )}`
                    : "Try again!  Remember, the vertex always goes in the middle!!!"
              }
              width={800}
              wrap="word"
            />
            {linesArray.map((line, index) => {
              const { x1, y1, x2, y2, x3, y3 } = line;
              return (
                <Line
                  id={index}
                  key={index}
                  x={line.x}
                  y={line.y}
                  stroke={konvaTheme.shapeStroke}
                  points={[x1, y1, x2, y2, x3, y3]}
                />
              );
            })}
            {lettersArray.map((letterVar, index) => {
              const { x, y, fontSize, fill, fontWidth, name } = letterVar;
              return (
                <Text
                  id={name}
                  key={index}
                  x={x}
                  y={y}
                  fontSize={fontSize}
                  fill={fill}
                  text={name}
                  fontWidth={fontWidth}
                  onClick={handleClick}
                />
              );
            })}
          </Layer>
        </Stage>
        {showAnswer && (
          <h3>{`∠${varTwo} or ∠${varOne}${varTwo}${varThree} or ∠${varThree}${varTwo}${varOne} ( ** Hint ** ${varTwo} MUST be in the MIDDLE)`}</h3>
        )}
      </div>
    </Wrapper>
  );
};

export default NamingAnglesLevelOne;

const Wrapper = styled.div`
  margin-top: 20px;

  button {
    background-color: ${props => props.theme.colors.buttonSuccess};
    color: ${props => props.theme.colors.textInverted};
    height: 50px;
    border-radius: 7px;
    font-size: 24px;
    text-transform: capitalize;
    padding: 0 20px;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }
  }

  .practice-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;
