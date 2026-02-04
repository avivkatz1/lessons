import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectChapter } from "../../store/lessonSlice";
import { IconContext } from "react-icons";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";
import styled from "styled-components";
const SideBar = (props) => {
  const dispatch = useDispatch();
  const chapterSelected = useSelector((state) => {
    return state.lesson.chapterSelected;
  });
  const handleChapterPick = (chapter) => {
    dispatch(selectChapter(chapter));
  };
  return (
    <Wrapper>
      <div>
        <h3>Chapter</h3>
      </div>
      <div>
        <IconContext.Provider value={{ color: "darkgreen" }}>
          <span>text</span>
          <span onClick={() => props.setText(!props.text)}>
            {props.text ? <BsToggleOff /> : <BsToggleOn />}
          </span>
          <span>diagram</span>
        </IconContext.Provider>
      </div>

      {props.chapters.map((chapter, i) => (
        <div key={i * 20} className="chapters-list">
          <h3
            className={
              chapterSelected === chapter ? "chapters-select chapter-highlight" : "chapters-select"
            }
            onClick={() => handleChapterPick(chapter)}
            key={i}
          >
            {chapter}
          </h3>
        </div>
      ))}
    </Wrapper>
  );
};

export default SideBar;
const Wrapper = styled.div`
  display: flex;
  grid-area: chapters;
  flex-direction: row;
  flex-wrap: wrap;
  font-family: monospace;
  justify-content: center;
  align-items: center;
  padding: 8px 5px;
  gap: 5px;

  h3 {
    color: black;
    margin: 5px 8px;
    font-size: clamp(12px, 3vw, 16px);
  }

  > div {
    display: flex;
    align-items: center;
  }

  .chapters-individual {
    margin-right: 5px;
  }

  .chapters-select {
    line-height: 20px;
    font-size: clamp(12px, 3vw, 14px);
    cursor: pointer;
    padding: 5px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .chapters-select:hover {
    color: red;
    background-color: rgba(0, 0, 0, 0.05);
  }

  .chapter-highlight {
    color: #00bf63;
    font-size: clamp(14px, 3.5vw, 18px);
    font-weight: bold;
  }

  .chapters-list {
    flex-shrink: 0;
  }

  @media (min-width: 480px) {
    padding: 10px;
    gap: 10px;

    h3 {
      margin: 8px 10px;
    }

    .chapters-select {
      padding: 8px 10px;
    }
  }

  @media (min-width: 700px) {
    height: auto;
    min-height: 60px;
    align-items: center;
    gap: 20px;
    padding: 10px 20px;

    .chapters-select {
      height: auto;
      margin: 10px 0;
      font-size: 14px;

      &:hover {
        transform: translateX(4px);
      }
    }

    .chapters-individual {
      margin-right: 0;
    }
  }

  @media (min-width: 1024px) {
    gap: 40px;
  }
`;
