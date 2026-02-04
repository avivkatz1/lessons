import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Question from "../../components/Question";
import Answer from "../../components/Answer";
const BPQuestionSimpleEquations = () => {
  return (
    <Wrapper>
      <div className="question-container">
        <Question />
      </div>
      <div className="answer-container">
        <Answer fontSize={"answer"} />
      </div>
    </Wrapper>
  );
};

export default BPQuestionSimpleEquations;

const Wrapper = styled.div`
  height: 100%;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  .question-container {
    align-items: center;
    flex-grow: 8;
    justify-content: center;
    display: flex;
    /* height:80vh; */
  }
  .answer-container {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 5rem;
  }
`;
