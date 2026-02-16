import React from "react";
import styled from "styled-components";

const AnswerButton = ({
  showAnswer,
  onSeeAnswer,
  onTryAnother,
  seeAnswerText = "see answer",
  tryAnotherText = "try another one",
}) => {
  return (
    <>
      {!showAnswer && <StyledButton onClick={onSeeAnswer}>{seeAnswerText}</StyledButton>}
      {showAnswer && <StyledButton onClick={onTryAnother}>{tryAnotherText}</StyledButton>}
    </>
  );
};

export default AnswerButton;

const StyledButton = styled.button`
  background-color: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  height: 50px;
  border-radius: 7px;
  font-size: 24px;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  padding: 0 20px;
  min-width: 200px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;
