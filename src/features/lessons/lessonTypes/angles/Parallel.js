import React, { useState, useEffect } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";

const newNumbers = () => {
  const equationNumbers = numbers(3, 20);
  const b = equationNumbers[1];
  const c = equationNumbers[2];
  const a = b > c ? equationNumbers[0] : equationNumbers[0] * -1;
  const equation = `y = ${a}/${b}x ${a >= 10 ? "+" : "-"} ${c}`;
  const problemAnswer = `${a}/${b}`;
  return { equation: equation, problemAnswer: problemAnswer };
};

function Parallel(props) {
  const [problem, setProblem] = useState(newNumbers); // Initialize with problem function
  const [showAnswer, setShowAnswer] = useState(false); // Internal state for answer display

  const handlePractice = () => {
    const newProblem = newNumbers();
    setProblem(newProblem);
    setShowAnswer(false);
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <p className="problem-text">{`what is the slope of a line parallel to: ${problem?.equation}`}</p>
          <AnswerInput
            correctAnswer={problem?.problemAnswer}
            answerType="text"
            onCorrect={() => setShowAnswer(true)}
            onTryAnother={handlePractice}
            disabled={showAnswer}
            placeholder="Enter slope"
          />
          {showAnswer && (
            <div>
              <h3>{`The answer is ${problem?.problemAnswer}`}</h3>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

export default Parallel;

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
