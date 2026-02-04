import React from "react";
import styled from "styled-components";
import InfoCard from "../../../shared/components/InfoCard";
import { useSelector } from "react-redux";
import AnswerCard from "./AnswerCard";

const Answer = () => {
  const showAnswer = useSelector((state) => state.lesson.showAnswer);
  const answer = useSelector((state) => state.lesson.lessonProps.answer);
  const wordProblem = useSelector((state) => {
    return state.lesson.lessonProps.wordProblemReturned;
  });
  return (
    <Wrapper className={showAnswer ? "visible" : "hidden"}>
      {wordProblem !== "plotting_points" &&
        wordProblem !== "measuring_angles" &&
        wordProblem !== "patterns" &&
        answer &&
        answer.map((item, index) => {
          const { text } = item;
          return <AnswerCard key={index} text={text} />;
        })}
      {wordProblem == "plotting_points" && answer && (
        <div>
          <h1 className="plotting_points">{`(${answer[0]} , ${answer[1]})`}</h1>
        </div>
      )}
      {wordProblem == "measuring_angles" && answer && answer[0] && (
        <div>
          <h1 className="measuring_angles">{`${answer[0].text}`}</h1>
        </div>
      )}
      {wordProblem == "patterns" && answer && (
        <div>
          <h1>{`${answer[4]}`}</h1>
        </div>
      )}
    </Wrapper>
  );
};

export default Answer;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  height: 100%;
  width: 100%;
  font-size: 2rem;
  padding: 10px;
  box-sizing: border-box;
  gap: 10px;
  min-height: 80px;

  &.hidden {
    visibility: hidden;
  }

  &.visible {
    visibility: visible;
  }

  .plotting_points {
    font-size: clamp(3rem, 10vw, 6rem);
    text-align: center;
  }

  .measuring_angles {
    font-size: clamp(3rem, 10vw, 6rem);
    text-align: center;
  }

  h1 {
    text-align: center;
    word-break: break-word;
    font-size: 4rem;
  }

  @media (max-width: 480px) {
    padding: 5px;
    gap: 5px;
  }
`;
