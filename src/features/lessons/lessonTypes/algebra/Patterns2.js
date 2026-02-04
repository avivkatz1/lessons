import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { useParams } from "react-router-dom";
import { AnswerInput } from "../../../../shared/components";

const initialNumbs = numbers(6, 100);

const a = initialNumbs[0] > 50 ? initialNumbs[1] : -1 * initialNumbs[1];
const b = initialNumbs[2] > 50 ? initialNumbs[3] : -1 * initialNumbs[3];
const c = initialNumbs[4] > 50 ? initialNumbs[5] : -1 * initialNumbs[5];

let patternArray = [];
for (let i = 0; i < 5; i++) {
  patternArray.push(a * i + b);
}

function Patterns2(props) {
  const params = useParams();

  const [pattern, setPattern] = useState(patternArray);
  const [patternVals, setPatternVals] = useState([a, b, c]);
  const { showAnswer, newProblem, seeAnswer } = props;

  const handlePractice = () => {
    const newNumb = numbers(6, 100);

    const a = newNumb[0] > 50 ? newNumb[1] : -1 * newNumb[1];
    const b = newNumb[2] > 50 ? newNumb[3] : -1 * newNumb[3];
    const c = newNumb[4] > 50 ? newNumb[5] : -1 * newNumb[5];

    patternArray = [];
    for (let i = 0; i < 5; i++) {
      patternArray.push(a * i + b);
    }
    setPattern(patternArray);
    setPatternVals([a, b, c]);
  };
  const handleNextProblem = () => {
    seeAnswer();
    handlePractice();
    newProblem();
  };
  return (
    <Wrapper>
      <div className="practice-container">
        <AnswerInput
          correctAnswer={pattern[3]}
          answerType="number"
          onCorrect={seeAnswer}
          onTryAnother={handleNextProblem}
          disabled={showAnswer}
          placeholder="Next number?"
        />
        {showAnswer && (
          <div>
            <h3 className="problem-text">
              {`${pattern[0]}, ${pattern[1]}, ${pattern[2]}, ${pattern[3]}, ${pattern[4]}`}
            </h3>
            <h3 className="problem-text">
              {`Starting at `}
              <span className="problem">{patternVals[1]} </span> {`the value then changes`}{" "}
              <span className="problem">{patternVals[0]}</span> {` each time`}
            </h3>
          </div>
        )}
        <div>
          <p className="problem-text problem">
            {`Find the next two numbers in the sequence: ${pattern[0]}, ${pattern[1]}, ${pattern[2]}`}
          </p>
        </div>
      </div>
    </Wrapper>
  );
}
export default Patterns2;
const variation1 = ["Angle A and Angle B are complementary", "Angles A and B are complementary"];
const variation2 = ["... if Angle A = ", ".  If Angle a is "];
const Wrapper = styled.div`
  .problem {
    color: red;
  }
`;
