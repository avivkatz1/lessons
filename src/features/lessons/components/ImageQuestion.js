import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { PlottingPoints } from "../lessonTypes/graphing";
import { MeasuringSides, Protractor, GraphingLines } from "../lessonTypes/imageLessons";
import { Angles, Perpendicular } from "../lessonTypes/angles";
import { RotationalSymmetry, Shapes, Symmetry } from "../lessonTypes/geometry";
import { Patterns } from "../lessonTypes/algebra";

const ImageQuestion = (props) => {
  const wordProblem = useSelector((state) => state.lesson.lessonProps.wordProblemReturned);
  const lessonSelected = useSelector((state) => state.lesson.lessonSelected);
  return (
    <Wrapper>
      {wordProblem === "plotting_points" && <PlottingPoints />}
      {wordProblem === "measuring_sides" && <MeasuringSides />}
      {wordProblem == "measuring_angles" && <Protractor />}
      {wordProblem == "graphing_lines" && <GraphingLines />}
      {lessonSelected == "symmetry" && <Symmetry />}
      {lessonSelected == "angles" && <Angles />}
      {lessonSelected == "patterns" && <Patterns showAnswer={props.showAnswer} />}
      {lessonSelected == "shapes" && <Shapes />}
      {lessonSelected == "rotational symmetry" && <RotationalSymmetry />}
      {lessonSelected == "perpendicular" && <Perpendicular />}
    </Wrapper>
  );
};

export default ImageQuestion;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100vw;
  overflow: hidden;
  box-sizing: border-box;
  padding: 10px;

  @media (max-width: 480px) {
    padding: 5px;
  }
`;
