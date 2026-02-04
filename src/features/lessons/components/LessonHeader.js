import React from "react";
import styled from "styled-components";
import HomeButton from "../../../shared/components/HomeButton";
import Stars from "../../../shared/components/Stars";
import { IconContext } from "react-icons";
import { useDispatch, useSelector } from "react-redux";
import lessonContext from "../../../api/lessonContext";
import { getCurrentDimensions } from "../../../shared/helpers/functions/getScreenSize";
import { changeLessonProps } from "../../../store/lessonSlice";

const LessonHeader = (props) => {
  const { lessonImage, lessonName, LessonComponent } = props;
  const dispatch = useDispatch();
  const lessonProps = useSelector((state) => state.lesson.lessonProps);
  const lessonTitle = useSelector((state) => state.lesson.lessonSelected);

  // Determine number of levels from multiple sources for robustness
  // Priority: 1) Backend levels array, 2) Frontend component array length
  const backendLevels = lessonProps?.levels;
  const componentLevelCount = LessonComponent?.length || 0;

  // Use backend levels if available, otherwise use component array length
  const levels =
    backendLevels && backendLevels.length > 0
      ? backendLevels
      : Array.from({ length: componentLevelCount }, (_, i) => i + 1);

  // Handle level change: make API call with new level, update Redux
  const handleLesson = async (level) => {
    try {
      const answer = await lessonContext({
        lesson: lessonProps.lessonName,
        problemNumber: 1, // Reset to problem 1 on level change
        levelNum: level,
      });
      const screenSize = getCurrentDimensions();
      // Explicitly include levelNum to ensure component switching works
      const allProps = { ...answer, ...screenSize, order: [], levelNum: level };
      dispatch(changeLessonProps(allProps));
    } catch (error) {
      // Error loading level - silently fail
    }
  };

  return (
    <Wrapper>
      <div className="header-start">
        <div>
          <HomeButton />
        </div>
        <div className="problem-title">
          <h1 className="problem-title-text">{lessonTitle}</h1>
          {/* <img src={lessonImage} alt={lessonName} className="problem-title-img" /> */}
        </div>
        <div className="levels-div">
          {levels.length > 1 &&
            levels.map((level, i) => {
              const levelNumber = i + 1;
              return (
                <div key={levelNumber}>
                  <button
                    className={"levels-button"}
                    onClick={() => handleLesson(`${levelNumber}`)}
                    name={`level_${levelNumber}`}
                  >{`L${levelNumber}`}</button>
                </div>
              );
            })}
        </div>
      </div>

      {/* title bar */}

      {/* <div>
        <Stars />
      </div> */}
    </Wrapper>
  );
};

export default LessonHeader;
const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  grid-row: 1/3;
  display: flex;
  align-items: center;

  .header-start {
    display: flex;
    align-items: center;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    padding: 8px;
    gap: 5px;
  }

  .levels-div {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .levels-button {
    border-radius: 7px;
    font-size: clamp(12px, 3vw, 14px);
    margin: 3px;
    padding: 8px 10px;
    min-width: 40px;
    max-width: 100%;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: nowrap;
    line-height: 1.2;

    :active {
      border-width: 1px;
      background-color: #2ad5d0;
    }

    :focus {
      background-color: #2ad5d0;
    }
  }

  img {
    height: 50px;
    display: flex;
    justify-content: flex-end;
  }

  .problem-title {
    display: flex;
    align-items: center;
    margin: 5px;
    flex: 1;
    min-width: 0;
    justify-content: center;
  }

  .problem-title-text {
    font-size: clamp(18px, 5vw, 45px);
    text-transform: capitalize;
    text-align: center;
    word-break: break-word;
  }

  @media (min-width: 480px) {
    .header-start {
      padding: 10px;
    }
    .levels-button {
      font-size: clamp(14px, 3.5vw, 18px);
      margin: 4px;
      padding: 8px 12px;
    }
    img {
      height: 60px;
    }
  }

  @media (min-width: 768px) {
    .levels-button {
      font-size: clamp(18px, 3vw, 24px);
      margin: 5px;
      padding: 10px 14px;
    }
    img {
      height: 80px;
    }
    .problem-title {
      margin: 10px;
    }
  }
`;
