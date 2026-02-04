import React from "react";
import { useSelector } from "react-redux";
import { Stage, Layer, Text, Circle } from "react-konva";
import FractionComponent from "../components/FractionComponent";

const ReducingFractionsComponent = (props) => {
  const { showAnswer } = props;
  const question = useSelector((state) => state.lesson.lessonProps.question);
  const answer = useSelector((state) => state.lesson.lessonProps.answer);
  return (
    <>
      <Stage width={500} height={400}>
        <Layer>
          <FractionComponent
            numeratorValue={question[0].numeratorValueOne}
            denominatorValue={question[0].denominatorValueOne}
            xPos={100}
            yPos={40}
          />
          {showAnswer && (
            <FractionComponent
              numeratorValue={answer[0].numeratorAnswer}
              denominatorValue={answer[0].denominatorAnswer}
              xPos={150}
              yPos={150}
            />
          )}
        </Layer>
      </Stage>
    </>
  );
};

export default ReducingFractionsComponent;
