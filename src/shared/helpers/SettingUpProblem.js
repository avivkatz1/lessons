import React, { useState } from "react";
import { chain } from "mathjs";
import numbers from "./numbers";
import { evaluate } from "mathjs";
import variables from "./variables";
import operations from "./operations";
const SettingUpProblem = ({ lesson, level = 1 }) => {
  let sideOne;
  let newNumbs;
  let ans;
  const operationArray = [];
  if (lesson == "order_of_operations") {
    newNumbs = numbers(6, 20 * level, 0, 0, true, true);
    const { a, b, c, d, e, f } = newNumbs;
    for (let i = 0; i < 5; i++) {
      const opp = operations();
      operationArray.push(opp);
    }

    sideOne = `${a} ${operationArray[0].operationText} ${b} ${operationArray[1].operationText} ${c} ${operationArray[2].operationText} ${d} ${operationArray[3].operationText} ${e} ${operationArray[4].operationText} ${f}`;

    ans = evaluate(
      `${a} ${operationArray[0].operation} ${b} ${operationArray[1].operation} ${c} ${operationArray[2].operation} ${d} ${operationArray[3].operation} ${e} ${operationArray[4].operation} ${f}`
    );
  }

  if (lesson == "evaluating_expressions") {
    newNumbs = numbers(6, 20 * level, 0, 0, true, true);
    const { a, b, c, d, e, f } = newNumbs;
    for (let i = 0; i < 5; i++) {
      const opp = operations();
      operationArray.push(opp);
    }
    sideOne = `${a}x + ${b}x`;

    ans = `${a + b}x`;
  }

  if (lesson == "one_step_equation") {
  }

  const numbersForProblem = newNumbs;
  const answerForProblem = ans;
  const sentencesForProblem = sideOne;

  return {
    numbers: numbersForProblem,
    answer: answerForProblem,
    problem: sentencesForProblem,
  };
};

export default SettingUpProblem;

////(−?\d+⋅)+−?\d+ putting parenthesis around this captures the num · num look   (7⋅−10⋅−14)+(−5⋅−18⋅−16)

///(−?\d+\/)−?\d+ putting number into fraction, this captures the number before and the number after the / symbol
/////  −6⋅(−5/−11)−5−8−16  or −6+(−14/8)/(18/−5)+−19

//// ^.*(?=\/) matches everything before / to make one big fraction  (−6⋅−5)/−11−5−8−16

//// (?<=\/).*  matches everything after / to make one big fraction    −6⋅−5/(−11−5−8−16)

//// −− matches the double negative for -(-4)
