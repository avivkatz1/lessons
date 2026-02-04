import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Data } from "../Data";
import styled from "styled-components";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";
import { IconContext } from "react-icons";
import { useNavigate, useLocation } from "react-router-dom";
function ChapterPages() {
  const location = useLocation();
  const navigate = useNavigate();
  const chapter = useParams();
  const [text, setText] = useState(location.state || true);
  const handlePick = (concept) => {
    const route = concept.toLowerCase().replace(" ", "_");
    navigate(`./${route}`);
  };

  const conceptChoices = Data.Selector[chapter.chapter].text.map((concept, id) => {
    return (
      <h3 key={id} onClick={() => handlePick(concept)}>
        {concept}
      </h3>
    );
  });

  const imageChoices = Data.Selector[chapter.chapter].diagram.map((imageSrc, index) => {
    return (
      <div className="selector-text" key={index}>
        <h5>{imageSrc.label}</h5>
        {/* <img
            className="selector-image"
            src={imageSrc.src}
            alt={"picture"}
            onClick={() => handlePick(imageSrc.text)}
          /> */}
      </div>
    );
  });

  return (
    <Wrapper>
      <div>
        <h3>{location.state?.select}</h3>
        <IconContext.Provider value={{ color: "lightgreen", className: "button-home" }}>
          <h3 className="button-home">
            <FaLongArrowAltLeft onClick={() => navigate(-1)} />
            <span>Back to Chapter List</span>
          </h3>
        </IconContext.Provider>
      </div>
      <div className="chapter-title">
        <h1>
          Chapter {chapter.chapter[0].toUpperCase() + chapter.chapter.slice(1)}
          <span>
            <IconContext.Provider value={{ color: "lightgreen" }}>
              <span className="text">text</span>
              <span className="toggle-button" onClick={() => setText(!text)}>
                {text ? <BsToggleOff /> : <BsToggleOn />}
              </span>
            </IconContext.Provider>
            <span className="diagram">diagram</span>
          </span>
        </h1>
      </div>

      <div className="chapter-list">{text ? conceptChoices : imageChoices}</div>
    </Wrapper>
  );
}
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100vw;
  padding: 10px;
  box-sizing: border-box;
  overflow-x: hidden;

  select {
    background-color: lightgreen;
    font-size: clamp(16px, 4vw, 30px);
    padding: 8px;
    border-radius: 4px;
  }

  h1 {
    margin-left: 10px;
    font-size: clamp(18px, 5vw, 32px);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  h3 {
    width: 100%;
    font-size: clamp(14px, 3.5vw, 18px);
    padding: 10px;
    margin: 5px 0;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(144, 238, 144, 0.3);
    }
  }

  .button-home {
    font-size: clamp(24px, 6vw, 50px);
    text-transform: lowercase;
    margin-left: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    span {
      font-size: clamp(12px, 3vw, 18px);
    }
  }

  .toggle-button {
    font-size: clamp(24px, 6vw, 50px);
    cursor: pointer;
  }

  .chapter-title {
    padding: 10px 0;
  }

  .chapter-list {
    padding: 10px 5%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .selector-pulldown {
    width: 100%;
    text-align: center;
  }

  .selector-choices {
    text-align: left;
    margin-left: 1rem;
  }

  .selector-text {
    padding: 10px;
  }

  .selector-image {
    width: 100%;
    max-width: 300px;
    height: auto;
    border: 2px solid black;
    border-radius: 5px;
  }

  .text {
    margin-left: 15px;
    font-size: clamp(12px, 3vw, 16px);
  }

  .diagram {
    font-size: clamp(12px, 3vw, 16px);
  }

  @media (min-width: 480px) {
    padding: 15px;

    h1 {
      margin-left: 20px;
    }

    h3 {
      width: 48%;
    }

    .chapter-list {
      grid-template-columns: 1fr 1fr;
      padding-left: 5%;
    }

    .button-home {
      margin-left: 20px;
    }

    .text {
      margin-left: 30px;
    }
  }

  @media (min-width: 768px) {
    h1 {
      margin-left: 50px;
    }

    h3 {
      width: 30%;
    }

    .chapter-list {
      grid-template-columns: repeat(3, 1fr);
      padding-left: 10%;
    }

    .button-home {
      margin-left: 30px;
    }

    .text {
      margin-left: 50px;
    }
  }
`;

export default ChapterPages;
