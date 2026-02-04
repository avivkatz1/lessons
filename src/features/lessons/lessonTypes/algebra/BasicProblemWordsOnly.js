import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { useParams } from "react-router-dom";
import BPAnswersAngles from "./BPAnswersAngles";
import BPQuestionAngles from "./BPQuestionAngles";
import BPQuestionSimpleEquations from "./BPQuestionSimpleEquations";
import { AnswerInput } from "../../../../shared/components";
import { useLessonState } from "../../../../hooks";
const angleTypesArray = [
  "supplementary_angles",
  "same_side_interior_angles",
  "vertical_angles",
  "corresponding_angles",
  "complementary_angles",
  "alternate_interior_angles",
  "triangle_sum",
];
const units = {
  pythagorean_theorem: ["cm", "ft"],
  equations: ["x", "y", "z"],
  area: ["sq. ft.", "sq. in."],
};

const initialVersion = numbers(2, 2);

function BasicProblemsWordsOnly({ triggerNewProblem }) {
  const params = useParams();

  // Phase 2: Use shared lesson state hook
  const { lessonProps, showAnswer, revealAnswer, hideAnswer } = useLessonState();
  const { wordProblemReturned, numbersReturned, problemTypeReturned, answer } = lessonProps;

  const [version, setVersion] = useState(initialVersion);

  const handleTryAnother = () => {
    triggerNewProblem();
    hideAnswer();
  };

  return (
    <Wrapper>
      <div className="lesson-container">
        {problemTypeReturned == "angles" && (
          <BPQuestionAngles
            wordProblem={wordProblemReturned}
            numberOne={numbersReturned}
            version={version}
          />
        )}
        {(problemTypeReturned == "simpleEquation" ||
          problemTypeReturned == "order_of_operations") && (
          <BPQuestionSimpleEquations units={units[wordProblemReturned]} showAnswer={showAnswer} />
        )}

        {problemTypeReturned == "angles" && <BPAnswersAngles showAnswer={showAnswer} />}
      </div>
      <div className="button-container">
        <AnswerInput
          correctAnswer={answer}
          answerType="array"
          onCorrect={revealAnswer}
          onTryAnother={handleTryAnother}
          disabled={showAnswer}
        />
      </div>
    </Wrapper>
  );
}
export default BasicProblemsWordsOnly;

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;

  button {
    width: 100%;
    background-color: rgb(238 234 180);
    align-items: center;
    height: 60px;
    text-transform: uppercase;
  }

  .answer-hide {
    opacity: 0;
  }
  .answer-show {
    opacity: 1;
  }
  .button-container {
    width: 100%;
    flex-grow: 1;
    align-items: center;
    display: flex;
  }
  .lesson-container {
    flex-grow: 10;
    align-items: center;
  }
`;
