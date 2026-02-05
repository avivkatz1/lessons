import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import katex from "katex";
import SettingUpProblem from "../../../../shared/helpers/SettingUpProblem";
import { AnswerInput } from "../../../../shared/components";

const problemTypes = [
  "order_of_operations",
  "evaluating_expressions",
  "adding_integers",
  "subtracting_integers",
  "multiplying_integers",
  "one_step_equations",
  "two_step_equations",
];
const units = {};

function Evaluating({ showAnswer, newProblem, seeAnswer }) {
  const params = useParams();
  const initialProblemType = params.lesson;
  const [problem, setProblem] = useState(SettingUpProblem({ lesson: initialProblemType }));

  const KaTeXComponent = ({ texExpression }) => {
    const containerRef = useRef();
    useEffect(() => {
      if (containerRef.current) {
        // Clear old content first to prevent duplication
        containerRef.current.innerHTML = '';

        // Render new content
        katex.render(texExpression, containerRef.current);
      }
    }, [texExpression]); // Re-run when texExpression changes (not problem)

    return <div ref={containerRef} />;
  };

  const handlePractice = () => {
    const newProblem = SettingUpProblem({ lesson: initialProblemType });
    setProblem(newProblem);
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
          correctAnswer={problem.answer}
          answerType="number"
          onCorrect={seeAnswer}
          onTryAnother={handleNextProblem}
          disabled={showAnswer}
        />

        <div className="equation-text">
          <KaTeXComponent texExpression={`${problem.problem}`} />
        </div>
        {showAnswer && (
          <div>
            <h1>{problem.answer}</h1>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
export default Evaluating;

const Wrapper = styled.div`
  .equation-text {
    font-size: 50px;
    color: red;
    display: flex;
    justify-content: center;
    margin-top: 50px;
  }
`;
