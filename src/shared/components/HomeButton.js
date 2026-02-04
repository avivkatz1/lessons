import React from "react";
import { IconContext } from "react-icons";
import { FaHome } from "react-icons/fa";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
const HomeButton = (props) => {
  const navigate = useNavigate();
  return (
    <Wrapper>
      {/* <div className="title-home"> */}
      <IconContext.Provider value={{ color: "#D882F5", className: "button-home" }}>
        {/* <div className="button-home"> */}
        <FaHome onClick={() => navigate("/")} size={48} />
        {/* </div> */}
      </IconContext.Provider>
      {/* </div> */}
    </Wrapper>
  );
};

export default HomeButton;
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  .button-home {
    font-size: clamp(28px, 6vw, 40px);
    text-transform: lowercase;
    cursor: pointer;
    transition: transform 0.2s;
    min-width: 44px;
    min-height: 44px;

    &:hover {
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  button {
    height: 44px;
    min-width: 44px;
    border-radius: 7px;
  }

  @media (min-width: 768px) {
    .button-home {
      font-size: 40px;
    }
  }
`;
