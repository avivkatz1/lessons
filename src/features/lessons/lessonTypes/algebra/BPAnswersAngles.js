import React from "react";
import styled from "styled-components";
import { useLessonState } from "../../../../hooks";

const BPAnswersAngles = ({ showAnswer }) => {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const { wordProblemReturned: wordProblem, numbersReturned: numberOne } = lessonProps;
  return (
    <Wrapper>
      <div className={showAnswer ? "answer-container answer-show" : "answer-container answer-hide"}>
        <h3 className="problem-text">
          {wordProblem != "triangle_sum"
            ? `The answer is ${
                wordProblem == "supplementary_angles" || wordProblem == "same_side_interior_angles"
                  ? 180 - numberOne[0]
                  : wordProblem == "vertical_angles" ||
                      wordProblem == "corresponding_angles" ||
                      wordProblem == "alternate_interior_angles"
                    ? numberOne
                    : 90 - numberOne[0]
              } degrees`
            : `Angle C = ${180 - numberOne[0] - numberOne[1]}`}
        </h3>
        <p>{`How'd you do with the ${wordProblem.split("_").join(" ")}`}</p>
      </div>
    </Wrapper>
  );
};

export default BPAnswersAngles;

const Wrapper = styled.div`
  p {
    color: red;
    text-align: center;
  }
`;
