import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { AnswerInput } from "../../../../shared/components";

let x;
let equation;
const newNumbers = () => {
  const levelOneNumbers = numbers(3, 20);
  const x = levelOneNumbers[0];
  const a = levelOneNumbers[1];
  const b = levelOneNumbers[2];
  const c = x * a - b;
  const leftRight = Math.random();
  const leftSide = leftRight > 0.5 ? `${a}x-${b}` : `${c}`;
  const rightSide = leftRight <= 0.5 ? `${a}x-${b}` : `${c}`;

  const equation = `${leftSide} = ${rightSide}`;
  return { x: x, equation: equation };
};
const initialState = newNumbers();
function Equations(props) {
  const { showAnswer, seeAnswer, newProblem } = props;
  const [problem, setProblem] = useState(initialState);
  const handlePractice = () => {
    const { x, equation } = newNumbers();
    setProblem({ x, equation });
    newProblem();
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <AnswerInput
          correctAnswer={problem.x}
          answerType="number"
          onCorrect={seeAnswer}
          onTryAnother={() => {
            seeAnswer();
            handlePractice();
          }}
          disabled={showAnswer}
        />
        {showAnswer && (
          <>
            <div className="problem-text">
              <h3>{`The answer is ${problem.x}`}</h3>
            </div>
          </>
        )}
        <div className="problem-text">
          <p>{problem.equation}</p>
        </div>
      </div>
    </Wrapper>
  );
}

export default Equations;

const Wrapper = styled.div`
  .problem-text {
    justify-content: center;
    text-align: center;
  }
`;
