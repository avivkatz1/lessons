import React, { useEffect, useState, useRef, useDeferredValue } from "react";
import styled from "styled-components";
import katex from "katex";

const textHeight = "";

const AnswerCard = (props) => {
  const { text, width, fontSize } = props;

  const KaTeXComponent = ({ texExpression }) => {
    const containerRef = useRef();
    useEffect(() => {
      katex.render(texExpression, containerRef.current, {
        fontSize: "1em",
      });
    }, []);

    return <div ref={containerRef} />;
  };

  return (
    <Wrapper>
      <div className={`middle-container container-width-${width}`}>
        <KaTeXComponent
          className={fontSize == "answer" ? "answer-text" : "question-text"}
          texExpression={`${text}`}
        />
      </div>
    </Wrapper>
  );
};

export default AnswerCard;

const Wrapper = styled.div`
  align-items: center;
  height: 80px;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px;
  box-sizing: border-box;

  .middle-container {
    height: 60px;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    padding: 5px;

    .katex {
      height: auto;
    }
  }

  @media (max-width: 480px) {
    padding: 5px;
    height: 60px;
    min-width: 80px;

    .middle-container {
      padding: 3px;
      height: 40px;
    }
  }
`;
