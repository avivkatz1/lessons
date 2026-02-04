import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
const InstructionComponent = () => {
  const instruction = useSelector((state) => {
    return state.lesson.lessonProps.headerQuestion;
  });
  const level = useSelector((state) => {
    return state.lesson.lessonProps.level;
  });

  // If no instruction data, show default message
  if (!instruction) {
    return (
      <Wrapper>
        <p>{"explore"}</p>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <p>{instruction[level]?.text}</p>
    </Wrapper>
  );
};

export default InstructionComponent;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  font-size: clamp(14px, 4vw, 20px);
  padding: 10px;
  margin: 0 10px;
  text-align: center;
  font-weight: bold;
  line-height: 1.4;
  word-break: break-word;

  p {
    margin: 0;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 8px;
    margin: 0 5px;
  }
`;
