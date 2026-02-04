import numbers from "./numbers";

const vars = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "m",
  "n",
  "p",
  "q",
  "r",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
];

const variables = ({ numberOfVariables }) => {
  const returnVars = {};
  const newVars = [...vars];
  for (let i = 0; i < numberOfVariables; i++) {
    const pick = numbers(1, newVars.length, 0);
    returnVars[i] = newVars[pick];
    newVars.splice(pick, 1);
  }
  return returnVars;
};

export default variables;
