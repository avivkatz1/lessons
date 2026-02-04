import React from "react";
import styled from "styled-components";
const BPAnswerSimpleEquations = ({ wordProblem, numberOne }) => {
  return (
    <Wrapper>
      <h3 className="problem-text">{`The answer is `}</h3>
      <p>{`How'd you do with the ${wordProblem.split("_").join(" ")}`}</p>
    </Wrapper>
  );
};

export default BPAnswerSimpleEquations;

const Wrapper = styled.div`
  p {
    color: red;
    text-align: center;
  }
`;
