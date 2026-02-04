import { useParams } from "react-router-dom";
import numbers from "./numbers";

const angleTypesArray = [
  "supplementary_angles",
  "same_side_interior_angles",
  "vertical_angles",
  "corresponding_angles",
  "complementary_angles",
  "alternate_interior_angles",
  "triangle_sum",
];

const simpleEquations = [
  "thirty_sixty_ninety",
  "forty_five_forty_five_ninety",
  "pythagoreon_theorem",
  "equations",
  "area",
  "triangle_inequality",
  "area_perimeter",
  "proportions",
  "proportional_reasoning",
  "more_tangent",
  "all_trig_ratios",
  "inverse_trig",
  "tangent",
  "system_of_equations",
];
const equations = {
  thirty_sixty_ninety: { quantity: 1, max: 50, min: 1 },
  forty_five_forty_five_ninety: { quantity: 1, max: 50, min: 1 },
  pythagoreon_theorem: { quantity: 2, max: 30, min: 1 },
  equations: { quantity: 6, max: 50, levels: 2 },
  area: { quantity: 4, max: 100, min: 1 },
  triangle_inequality: { quantity: 3, max: 100, min: 1 },
  area_perimeter: { quantity: 5, max: 100, min: 1 },
  proportions: { quantity: 3, max: 100 },
  proportional_reasoning: { quantity: 3, max: 20, min: 1 },
  more_tangent: { quantity: 2, max: 89, min: 1 },
  all_trig_ratios: { quantity: 2, max: 89, min: 1 },
  inverse_trig: { quantity: 2, max: 89, min: 1 },
  tangent: { quantity: 3, max: 89, min: 1 },
  system_of_equations: { quantity: 8, max: 20 },
};

export default function BasicProblemSorter({ problem }) {
  let wordProblem;
  let problemTypeReturned;
  let numbs = [];

  if (problem === "all_angles") {
    const pick = Math.floor(Math.random() * angleTypesArray.length);
    wordProblem = angleTypesArray[pick];
  } else wordProblem = problem;
  if (angleTypesArray.includes(wordProblem)) {
    problemTypeReturned = "angles";
  } else if (simpleEquations.includes(wordProblem)) {
    problemTypeReturned = "simpleEquation";
  } else {
    problemTypeReturned = wordProblem;
  }
  numbs = getNumsForProblem({ wordProblem });

  return {
    numbersReturned: numbs,
    problemTypeReturned: problemTypeReturned,
    wordProblemReturned: wordProblem,
  };

  //this function will return the numbers needed, the words for the problem, and the problemType as "angle2, angle3 (perahps for angle with two or three problems) equation4, area etc."
}

const getNumsForProblem = ({ wordProblem }) => {
  let newNum = [];
  if (wordProblem == "complementary_angles") return (newNum = numbers(1, 89));
  else if (wordProblem == "triangle_sum") {
    newNum[0] = numbers(1, 177)[0];
    newNum[1] = numbers(1, 179 - newNum[0]);
    return newNum;
  } else if (simpleEquations.includes(wordProblem)) {
    const quantityOfNumbers = equations[wordProblem].quantity;
    const maxNumber = equations[wordProblem].max;
    const minNumber = equations[wordProblem].min;
    const levels = equations[wordProblem]?.levels;
    newNum = numbers(quantityOfNumbers, maxNumber, minNumber, levels);
    return newNum;
  } else return (newNum = numbers(1, 179));
};
