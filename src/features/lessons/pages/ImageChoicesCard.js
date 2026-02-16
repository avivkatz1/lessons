import React from "react";
import styled from "styled-components";

const ImageChoicesCard = (props) => {
  return (
    <Wrapper>
      <div
        className={`lesson lesson--${props.index + 1}`}
        key={props.index}
        onClick={() => props.lessonChoice(props.imageSrc.text)}
      >
        <h3 className="img-title">{props.imageSrc.label}</h3>
        <img className="selector-image" src={props.imageSrc.src} alt={props.imageSrc.label} />
      </div>
    </Wrapper>
  );
};

export default ImageChoicesCard;

const Wrapper = styled.div`
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.textPrimary};
  font-family: monospace;
  width: calc(50% - 10px);
  box-sizing: border-box;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    background-color 0.3s,
    color 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    background-color: ${props => props.theme.colors.hoverBackground};
  }

  &:active {
    transform: translateY(0);
  }

  .img-title {
    width: 100%;
    margin: 0 0 8px 0;
    padding: 5px;
    background-color: transparent;
    border: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: clamp(12px, 3vw, 16px);
    color: inherit;
  }

  .selector-image {
    width: 100%;
    max-width: 120px;
    height: auto;
  }

  @media (min-width: 480px) {
    width: calc(50% - 15px);
    padding: 15px 10px;

    .selector-image {
      max-width: 130px;
    }
  }

  @media (min-width: 700px) {
    width: calc(33.33% - 15px);
    padding: 15px;

    .img-title {
      font-size: 16px;
    }

    .selector-image {
      max-width: 150px;
    }
  }

  @media (min-width: 1024px) {
    width: calc(25% - 15px);
  }
`;
