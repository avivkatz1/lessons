import React from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Answer from "../../components/Answer";
import ImageQuestion from "../../components/ImageQuestion";
import { AnswerInput } from "../../../../shared/components";
import { useLessonState } from "../../../../hooks";

const ImageLesson = ({ triggerNewProblem }) => {
  const params = useParams();

  // Phase 2: Use shared lesson state hook
  const { lessonProps, showAnswer, revealAnswer, hideAnswer } = useLessonState();

  const {
    wordProblemReturned,
    numbersReturned,
    problemTypeReturned,
    lessonSelected,
    answer,
    question,
  } = lessonProps;

  const handleNextProblem = () => {
    if (showAnswer) {
      triggerNewProblem();
      hideAnswer();
    } else {
      revealAnswer();
    }
  };

  // Determine correct answer based on lesson type
  const getCorrectAnswer = () => {
    if (wordProblemReturned === "plotting_points") {
      // For plotting points, answer is [x, y] coordinates
      return answer ? [answer[0], answer[1]] : null;
    }
    if (wordProblemReturned === "measuring_angles") {
      // For measuring angles, answer is in answer[0].text
      return answer?.[0]?.text;
    }
    if (wordProblemReturned === "measuring_sides") {
      // For measuring sides, answer is in question[0][0].text
      return question?.[0]?.[0]?.text;
    }
    if (wordProblemReturned === "graphing_lines") {
      // For graphing lines, answer might be slope or y-intercept
      return answer?.[0]?.text || numbersReturned?.[0];
    }
    if (wordProblemReturned === "patterns") {
      // For patterns, answer is in answer[4]
      return answer?.[4];
    }
    // Default: use numbersReturned
    return numbersReturned?.[0];
  };

  // Determine answer type based on lesson
  const getAnswerType = () => {
    if (wordProblemReturned === "plotting_points") {
      return "coordinate";
    }
    return "number";
  };

  // Determine placeholder based on lesson
  const getPlaceholder = () => {
    if (wordProblemReturned === "plotting_points") {
      return "Enter coordinates (x, y)";
    }
    if (wordProblemReturned === "measuring_angles") {
      return "Enter angle in degrees";
    }
    if (wordProblemReturned === "measuring_sides") {
      return "Enter length in inches";
    }
    return "Enter answer";
  };

  const lessonWithAnswerButton =
    lessonSelected == "symmetry" ||
    lessonSelected == "rotational symmetry" ||
    lessonSelected == "angles" ||
    lessonSelected == "shapes" ||
    lessonSelected == "patterns" ||
    lessonSelected == "perpendicular"
      ? false
      : true;

  return (
    <Wrapper>
      {lessonWithAnswerButton && (
        <div className="button-container">
          <AnswerInput
            correctAnswer={getCorrectAnswer()}
            answerType={getAnswerType()}
            onCorrect={revealAnswer}
            onTryAnother={() => {
              triggerNewProblem();
              hideAnswer();
            }}
            disabled={showAnswer}
            placeholder={getPlaceholder()}
          />
          {/* {!showAnswer&&<h1 className="empty">(0 , 0 )</h1>} */}
          <Answer showAnswer={showAnswer} />
        </div>
      )}
      <div className="question-container">
        <ImageQuestion showAnswer={showAnswer} />
      </div>
      {/* <div className="answer-container">
        <Answer showAnswer={showAnswer} />
      </div> */}
    </Wrapper>
  );
};

export default ImageLesson;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;

  .button-container {
  }

  .question-container {
    align-items: center;
    justify-content: center;
    display: flex;
  }

  .answer-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 5rem;
  }

  .empty {
    opacity: 0;
  }
`;
