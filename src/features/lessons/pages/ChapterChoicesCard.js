import React from "react";
import styled from "styled-components";

const ChapterChoicesCard = (props) => {
  return (
    <Wrapper
      key={props.index}
      onClick={() => {
        props.lessonChoice(props.item);
      }}
    >
      <h4
        className="card"
        onClick={() => {
          props.lessonChoice(props.item);
        }}
        //only added recently to click on pc
      >
        {props.item}
      </h4>
    </Wrapper>
  );
};

export default ChapterChoicesCard;

const Wrapper = styled.div`
  border: 2px solid black;
  border-radius: 8px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: hsl(206deg 57.59% 87.82%);
  font-family: monospace;
  width: calc(50% - 10px);
  min-height: 60px;
  box-sizing: border-box;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  .card {
    width: 100%;
    margin: 0;
    padding: 5px;
    background-color: transparent;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    font-size: clamp(12px, 3vw, 16px);
    word-break: break-word;
  }

  @media (min-width: 480px) {
    width: calc(50% - 15px);
    padding: 15px 10px;
  }

  @media (min-width: 700px) {
    width: calc(33.33% - 15px);
    padding: 15px;

    .card {
      font-size: 16px;
    }
  }

  @media (min-width: 1024px) {
    width: calc(25% - 15px);
  }
`;
