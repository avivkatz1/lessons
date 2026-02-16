import React from "react";
import styled from "styled-components";
import HomeButton from "../../../shared/components/HomeButton";
import Stars from "../../../shared/components/Stars";
import { IconContext } from "react-icons";
import { FaSun, FaMoon } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../../hooks";
import lessonContext from "../../../api/lessonContext";
import { getCurrentDimensions } from "../../../shared/helpers/functions/getScreenSize";
import { changeLessonProps } from "../../../store/lessonSlice";

const LessonHeader = (props) => {
  const { lessonImage, lessonName, LessonComponent } = props;
  const dispatch = useDispatch();
  const { isDark, toggleTheme } = useTheme();
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
      const allProps = { ...answer, ...screenSize, order: [], levelNum: parseInt(level) };
      dispatch(changeLessonProps(allProps));
    } catch (error) {
      // Error loading level - show user feedback
      if (process.env.NODE_ENV === "development") {
        console.error("Error loading level:", error);
      }
      alert(`Unable to load level ${level}. Please try again.`);
    }
  };

  return (
    <Wrapper>
      <div className="header-start">
        <div className="left-controls">
          <HomeButton />
          <ToggleButton onClick={toggleTheme} aria-label="Toggle dark mode">
            {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
          </ToggleButton>
        </div>
        <div className="problem-title">
          <h1 className="problem-title-text">{lessonTitle}</h1>
          {/* <img src={lessonImage} alt={lessonName} className="problem-title-img" /> */}
        </div>
        <div className="levels-div">
          {levels.length > 1 &&
            levels.map((level, i) => {
              const levelNumber = i + 1;
              const currentLevel = lessonProps.levelNum || 1;
              const isActive = parseInt(currentLevel) === levelNumber;
              return (
                <div key={levelNumber}>
                  <button
                    className={`levels-button ${isActive ? "active" : ""}`}
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

const ToggleButton = styled.button`
  background: transparent;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  color: ${props => props.theme.colors.textPrimary};
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 6px;
  }
`;

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

  .left-controls {
    display: flex;
    align-items: center;
    gap: 8px;
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
    transition: background-color 0.2s ease;
    cursor: pointer;

    :active {
      border-width: 1px;
      background-color: #2ad5d0;
    }

    :focus {
      background-color: #2ad5d0;
    }

    &.active {
      background-color: #2ad5d0;
      font-weight: 600;
    }

    :hover:not(.active) {
      background-color: #b8e6e4;
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
