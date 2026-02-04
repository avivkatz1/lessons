import React from "react";

const BPQuestionAngles = ({ wordProblem, numberOne, version }) => {
  const variation1 = ["Angle A and Angle B are complementary", "Angles A and B are complementary"];
  const variation2 = ["... if Angle A = ", ".  If Angle a is "];
  return (
    <div>
      <p className="problem-text">
        {wordProblem != "triangle_sum"
          ? `Angle A and Angle B are ${wordProblem.replaceAll("_", " ")}${
              variation2[version[1]]
            }${numberOne[0]}, 
          what is the measure of Angle B?`
          : ""}
      </p>

      {wordProblem == "triangle_sum" ? (
        <>
          <p>
            In a triangle where Angle A = {numberOne[0]} and Angle B = {numberOne[1]}
          </p>
          <p>what is the measure of Angle C?</p>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default BPQuestionAngles;
