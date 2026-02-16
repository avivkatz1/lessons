import React from "react";
import styled from "styled-components";
import InfoCard from "../../../shared/components/InfoCard";
import { useSelector } from "react-redux";
import StyledInfoCard from "../../../shared/components/StyledInfoCard";
const Question = () => {
  const initialValue = { triggered: false, message: "", orderedNumber: 0 };

  const question = useSelector((state) => state.lesson.lessonProps.question);

  // Add null/undefined checks
  if (!question) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("Question component: question is null or undefined");
    }
    return <Wrapper><div>Loading question...</div></Wrapper>;
  }

  if (!Array.isArray(question) || question.length === 0) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("Question component: question is not an array or is empty", question);
    }
    return <Wrapper><div>No question data</div></Wrapper>;
  }

  if (!Array.isArray(question[0]) || question[0].length === 0) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("Question component: question[0] is not an array or is empty", question[0]);
    }
    return <Wrapper><div>Invalid question format</div></Wrapper>;
  }

  return (
    <Wrapper>
      {question[0].map((item, index) => {
        const { text, topButtons, bottomButtons } = item;
        return (
          <StyledInfoCard key={index}>
            <InfoCard
              text={text}
              // topButtons={topButtons}
              // bottomButtons={bottomButtons}
              totalLength={question[0].length}
            />
          </StyledInfoCard>
        );
      })}
    </Wrapper>
  );
};

export default Question;

const Wrapper = styled.div`
  display: flex;
  /* make the text bigger */
  font-size: 3em;
  align-items: center;
  height: 100%;
  width: 100%;
  max-width: 100vw;
  justify-content: center;
  flex-wrap: wrap;
  padding: 10px;
  box-sizing: border-box;
  gap: 10px;

  @media (max-width: 480px) {
    padding: 5px;
    gap: 5px;
  }
`;
