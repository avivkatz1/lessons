import { Data } from "../Data";
import { useDispatch, useSelector } from "react-redux";
import { selectLesson, changeLessonProps } from "../../../store/lessonSlice";
import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import ChapterChoicesCard from "./ChapterChoicesCard";
import ImageChoicesCard from "./ImageChoicesCard";
import Header from "../../../shared/components/Header";
import SideBar from "../../../shared/components/SideBar";
import lessonContext from "../../../api/lessonContext";
import { getCurrentDimensions } from "../../../shared/helpers/functions/getScreenSize";
const initialChapter = 1;
function SelectingSection() {
  const dispatch = useDispatch();
  const chapterSelected =
    useSelector((state) => {
      return state.lesson.chapterSelected;
    }) || 0;
  const [text, setText] = useState(true);
  const navigate = useNavigate();

  const lessonChoice = async (lesson) => {
    dispatch(selectLesson(lesson));
    const newLesson = lesson.replace(/[ -]/g, "_");
    const answer = await lessonContext({
      lesson: newLesson,
      problemNumber: 1,
      levelNum: 1,
    });
    const screenSize = getCurrentDimensions();

    const allProps = { ...answer, ...screenSize, order: [] };
    dispatch(changeLessonProps(allProps));
    navigate(`../lessons/${newLesson}`);
  };

  const chapterChoices = Data.Selector[chapterSelected].text.map((item, index) => {
    return (
      <ChapterChoicesCard key={index * 20} item={item} index={index} lessonChoice={lessonChoice} />
    );
  });
  const imageChoices = Data.Selector[chapterSelected].diagram.map((imageSrc, index) => {
    return (
      <ImageChoicesCard
        key={index * 20}
        imageSrc={imageSrc}
        index={index}
        lessonChoice={lessonChoice}
      />
    );
  });
  const chapters = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
  return (
    <Wrapper>
      <Header />
      <SideBar setText={setText} text={text} chapters={chapters} />

      <div className="lessons">{text ? chapterChoices : imageChoices}</div>
      <div className="footer"></div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;

  .img-title {
    text-align: center;
    font-size: clamp(14px, 3vw, 18px);
  }

  .lessons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    padding: 10px;
  }

  .footer {
    background-color: #edd7f7;
    padding: 10px;
  }

  .selector-image {
    width: 100%;
    max-width: 150px;
    height: auto;
  }

  @media (min-width: 480px) {
    .lessons {
      justify-content: space-between;
      gap: 15px;
      padding: 15px;
    }
  }

  @media (min-width: 700px) {
    .lessons {
      justify-content: space-around;
      row-gap: 20px;
      padding: 20px;
    }
  }
`;

export default SelectingSection;
