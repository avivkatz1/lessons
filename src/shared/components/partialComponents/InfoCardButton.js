import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

const InfoCardButton = ({ className, textOnClick, disabled, alertStatus, text, oneMoreText }) => {
  const [buttonToggle, setButtonToggle] = useState(false);
  const newProblem = useSelector((state) => state.lesson.lessonProps.problemNumber);
  useEffect(() => {
    setButtonToggle(false);
  }, [newProblem]);
  return (
    <Wrapper>
      {className && (
        <button className={`button ${className}`} onClick={() => setButtonToggle(!buttonToggle)}>
          {buttonToggle ? textOnClick : text}
        </button>
      )}
      {!className && <button className="button invisible"></button>}
    </Wrapper>
  );
};

export default InfoCardButton;

const Wrapper = styled.div`
  .button {
    background-color: #d882f5;
    padding: 10px 15px;
    border-radius: 8px;
    font-size: clamp(1rem, 3vw, 1.5rem);
    min-height: 50px;
    max-width: 100%;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    line-height: 1.3;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .invisible {
    opacity: 0;
    pointer-events: none;
  }

  @media (max-width: 480px) {
    .button {
      padding: 8px 12px;
      min-height: 44px;
    }
  }
`;
