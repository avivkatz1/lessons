import React from "react";
import styled from "styled-components";

const StyledInfoCard = styled.div`
  .invisible {
    opacity: 0;
  }

  button {
    background-color: ${props => props.theme.colors.cardBackground};
    color: ${props => props.theme.colors.textPrimary};
    border: 1px solid ${props => props.theme.colors.border};
    padding: 8px 12px;
    min-height: 44px;
    min-width: 44px;
    max-width: 100%;
    font-size: clamp(0.875rem, 2.5vw, 1.25rem);
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    line-height: 1.3;
    text-align: center;
    transition: background-color 0.2s, color 0.2s;
  }

  .answer-text {
    font-size: clamp(2em, 8vw, 5em);
  }

  .question-text {
    font-size: clamp(2em, 10vw, 7em);
  }

  .question-text-small {
    font-size: clamp(1em, 4vw, 2em);
  }

  .top-container {
    width: 100%;
    flex-grow: 1;
    display: flex;
    flex-wrap: wrap;
  }

  .invisible {
    opacity: 0;
  }

  .button-1 {
    flex-grow: 3;
    justify-content: flex-start;
  }

  .button-space {
    flex-grow: 3;
    cursor: default;
  }

  .button {
    flex-grow: 3;
    justify-content: flex-end;
    background-color: ${props => props.theme.colors.buttonSuccess};
    color: ${props => props.theme.colors.textInverted};
  }

  .button-3-alert {
    color: ${props => props.theme.colors.error};
  }

  .middle-container {
    flex-grow: 8;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    padding: 5px;

    .katex {
      height: auto;
      min-height: 3rem;
      font-size: clamp(2.5rem, 10vw, 12vw);
    }

    .middle-text {
      font-size: clamp(3rem, 15vw, 12rem);
    }

    .middle-text-answer {
      font-size: clamp(1.5rem, 8vw, 60px);
    }
  }

  .middle-container-small {
    flex-grow: 8;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    padding: 5px;

    .katex {
      height: auto;
      min-height: 2rem;
      font-size: clamp(1.8rem, 8vw, 10vw);
    }

    .middle-text {
      font-size: clamp(2.5rem, 14vw, 12rem);
    }

    .middle-text-answer {
      font-size: clamp(1.8rem, 8vw, 60px);
    }
  }

  .bottom-container {
    width: 100%;
    flex-grow: 1;
    display: flex;
    flex-wrap: wrap;

    .invisible {
      opacity: 0;
    }

    .button-three {
      flex-grow: 3;
      justify-content: flex-start;
    }

    .button-space {
      flex-grow: 3;
    }

    .button-four {
      flex-grow: 3;
      justify-content: flex-end;
    }
  }

  .alert-container {
    background-color: ${props => props.theme.colors.error};
  }

  @media (max-width: 480px) {
    button {
      padding: 6px;
      font-size: 14px;
    }

    .middle-container,
    .middle-container-small {
      padding: 3px;
    }
  }
`;
export default StyledInfoCard;
