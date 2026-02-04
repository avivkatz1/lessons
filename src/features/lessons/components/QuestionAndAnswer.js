import React from "react";
import styled from "styled-components";
import Question from "./Question";
import Answer from "./Answer";
const QuestionAndAnswer = () => {
  return (
    <Wrapper>
      <Question className="question-container" />
      <Answer className="answer-container" />
    </Wrapper>
  );
};

export default QuestionAndAnswer;

const Wrapper = styled.div`
  .question-container {
    width: 100vw;
  }
`;
