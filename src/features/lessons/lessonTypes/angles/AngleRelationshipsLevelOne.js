import React, { useState } from "react";
import styled from "styled-components";
import { useLessonState } from "../../../../hooks";
import numbers from "../../../../shared/helpers/numbers";
import { useParams } from "react-router-dom";
import { AnswerInput } from "../../../../shared/components";
let initialNumber;
const initialVersion = numbers(2, 2);
const angleTypesArray = [
  "supplementary_angles",
  "same_side_interior_angles",
  "vertical_angles",
  "corresponding_angles",
  "complementary_angles",
  "alternate_interior_angles",
];
function AngleRelationShipsLevelOne(props) {
  const params = useParams();
  let angleTypes = params.lesson;
  if (angleTypes === "all_angles") {
    angleTypes = angleTypesArray[numbers(1, angleTypesArray.length)[0]];
  }
  const [angleRelationship, setAngleRelationship] = useState(angleTypes);
  if (angleRelationship == "complementary_angles") initialNumber = numbers(1, 89)[0];
  else if (angleRelationship == "triangle_sum") {
    initialNumber = [];
    initialNumber[0] = numbers(1, 178)[0];
    initialNumber[1] = numbers(1, 179 - initialNumber[0]);
  } else initialNumber = numbers(1, 179)[0];

  const [numberOne, setNumberOne] = useState(initialNumber);
  const [constant, setConstant] = useState(numbers(3, 100, 1));
  const [positive, setPositive] = useState(numbers(3, 100));
  const [version, setVersion] = useState(initialVersion);

  // Phase 2 - Stage 5: Use shared lesson state hook
  const { showAnswer, revealAnswer, hideAnswer } = useLessonState();

  const handlePractice = () => {
    let newNum;
    if (params.lesson === "all_angles") {
      angleTypes = angleTypesArray[numbers(1, angleTypesArray.length)[0]];
      setAngleRelationship(angleTypes);
    }
    if (angleTypes == "complementary_angles") newNum = numbers(1, 89)[0];
    else if (angleTypes == "triangle_sum") {
      newNum = [];
      newNum[0] = numbers(1, 178)[0];
      newNum[1] = numbers(1, 179 - newNum[0]);
    } else newNum = numbers(1, 179)[0];
    const newVersion = numbers(2, 2);
    setNumberOne(newNum);
    setVersion(newVersion);
    setPositive(numbers(3, 100));
    setConstant(numbers(3, 100, 1));
  };
  const handleNextProblem = () => {
    hideAnswer();
    handlePractice();
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <AnswerInput
          correctAnswer={
            angleRelationship !== "triangle_sum"
              ? positive[0] > 50
                ? numberOne - constant[0]
                : constant[0] + numberOne
              : Math.round(
                  ((180 -
                    (positive[0] > 50 ? constant[0] : -1 * constant[0]) -
                    (positive[1] > 50 ? constant[1] : -1 * constant[1]) -
                    (positive[2] > 50 ? constant[2] : -1 * constant[2])) /
                    3) *
                    100
                ) / 100
          }
          answerType="number"
          onCorrect={revealAnswer}
          onTryAnother={handleNextProblem}
          disabled={showAnswer}
          placeholder="x = ?"
        />
        {showAnswer && (
          <div>
            <h3 className="problem-text">
              {angleRelationship != "triangle_sum"
                ? `x =  ${positive[0] > 50 ? numberOne - constant[0] : constant[0] + numberOne}`
                : angleRelationship != "complementary_angles"
                  ? `x = ${
                      Math.round(
                        ((180 -
                          (positive[0] > 50 ? constant[0] : -1 * constant[0]) -
                          (positive[1] > 50 ? constant[1] : -1 * constant[1]) -
                          (positive[2] > 50 ? constant[2] : -1 * constant[2])) /
                          3) *
                          100
                      ) / 100
                    }`
                  : `x = `}
            </h3>
          </div>
        )}
        <div>
          <p className="problem-text">
            {angleRelationship != "triangle_sum"
              ? `Angle A and Angle B are ${angleRelationship.replaceAll(
                  "_",
                  " "
                )}${variation2[version[1]]} x ${
                  positive[0] > 50 ? ` + ${constant[0]}` : ` - ${constant[0]}`
                } and Angle B is ${
                  angleRelationship == "supplementary_angles" ||
                  angleRelationship == "same_side_interior_angles"
                    ? 180 - numberOne
                    : angleRelationship == "vertical_angles" ||
                        angleRelationship == "corresponding_angles" ||
                        angleRelationship == "alternate_interior_angles"
                      ? numberOne
                      : 90 - numberOne
                }, find the value of x`
              : `In a triangle where Angle A = ${
                  positive[0] > 50 ? `x + ${constant[0]}` : `x - ${constant[0]}`
                } and Angle B = ${
                  positive[1] > 50 ? `x + ${constant[1]}` : `x - ${constant[1]}`
                }, and Angle C = ${positive[2] > 50 ? `x + ${constant[2]}` : `x - ${constant[2]}`}`}
          </p>
        </div>
      </div>
    </Wrapper>
  );
}
export default AngleRelationShipsLevelOne;
const variation1 = ["Angle A and Angle B are complementary", "Angles A and B are complementary"];
const variation2 = ["... if Angle A = ", ".  If Angle a is "];
const Wrapper = styled.div``;
