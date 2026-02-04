import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
const SimpleEquations = (props) => {
  const numberOne = useSelector((state) => state.lesson.lessonProps.numbersReturned);
  const numberOneSort = [...numberOne];
  const wordProblem = useSelector((state) => state.lesson.lessonProps.wordProblemReturned);

  let pm1 = Math.random() * 100;
  let pm2 = Math.random() * 100;
  let pm3 = Math.random() * 100;
  const [plusMinus1, setPlusMinus1] = useState(pm1);
  const [plusMinus2, setPlusMinus2] = useState(pm2);
  const [plusMinus3, setPlusMinus3] = useState(pm3);
  const equationTypes = {
    thirty_sixty_ninety: [
      {
        question: `In a triangle with angle measurements 30, 60, 90, the small side measures ${numberOne[0]} inches.  Find the other two sides.`,
        answer: `The hypotenuse would be ${
          2 * numberOne[0]
        } inches and the long side would be ${numberOne[0]}√3`,
      },
      {
        question: `In a triangle with angle measurements 30, 60, 90, the large side measures ${numberOne[0]}√3 inches.  Find the other two sides.`,
        answer: `The hypotenuse would be ${
          2 * numberOne[0]
        } inches and the short side would be ${numberOne[0]}`,
      },
      {
        question: `In a triangle with angle measurements 30, 60, 90, the hypotenuse measures ${
          2 * numberOne[0]
        } inches.  Find the other two sides.`,
        answer: `The short leg would be ${numberOne[0]} inches and the long leg would be ${numberOne[0]}√3`,
      },
    ],
    forty_five_forty_five_ninety: [
      {
        question: `In a triangle with angle measurements 45, 45, 90, one of the legs measures ${numberOne[0]}.  Find the other two sides of the triangle.`,
        answer: `The other legs would be ${numberOne[0]} and the hypotenuse would be ${numberOne[0]}√2`,
      },
      {
        question: `In a triangle with angle measurements 45, 45, 90, the hypotenuse measures ${numberOne[0]}√2.  Find the measure of the two legs of the triangle.`,
        answer: `The legs would both be ${numberOne[0]}`,
      },
    ],
    pythagoreon_theorem: [
      {
        question: `In a right triangle, the two sides measure ${numberOne[0]} inches and ${numberOne[1]} inches.  Find the length of the hypotenuse.`,
        answer: `the hypotenuse is ${((numberOne[1] ** 2 + numberOne[0] ** 2) ** (1 / 2)).toFixed(
          1
        )}`,
      },
      {
        question: `In a right triangle, one side measures ${
          numberOne[1] >= numberOne[0] ? numberOne[0] : numberOne[1]
        } inches and the hypotenuse measures ${
          numberOne[1] > numberOne[0]
            ? numberOne[1]
            : numberOne[1] == numberOne[0]
              ? numberOne[0] + 1
              : numberOne[0]
        } inches.  Find the length of the missing side.`,
        answer: `the side is ${
          numberOne[1] > numberOne[0]
            ? ((numberOne[1] ** 2 - numberOne[0] ** 2) ** (1 / 2)).toFixed(1)
            : numberOne[1] == numberOne[0]
              ? (((numberOne[0] + 1) ** 2 - numberOne[1] ** 2) ** (1 / 2)).toFixed(1)
              : ((numberOne[0] ** 2 - numberOne[1] ** 2) ** (1 / 2)).toFixed(1)
        }`,
      },
    ],
    equations: [
      {
        question: `Solve the following equation: ${
          plusMinus1 < 50 ? numberOne[0] * -1 : numberOne[0]
        } x ${plusMinus3 < 50 ? "-" : "+"} ${numberOne[2]} = ${
          (plusMinus1 < 50 ? -1 * numberOne[1] : numberOne[1]) *
            (plusMinus2 < 50 ? -1 * numberOne[0] : numberOne[0]) +
          (plusMinus3 < 50 ? -1 * numberOne[2] : numberOne[2])
        }`,
        answer: `${
          numberOne[0] == 0
            ? "x could equal any number so we say, infinitely many solutions"
            : `the answer is x = ${plusMinus2 < 50 ? -1 * numberOne[1] : numberOne[1]}`
        }`,
        ///////work on these answers here and make this look better
      },
      {
        question: `Solve the following equation: ${
          (plusMinus1 < 50 ? -1 * numberOne[1] : numberOne[1]) *
            (plusMinus2 < 50 ? -1 * numberOne[0] : numberOne[0]) +
          (plusMinus3 < 50 ? -1 * numberOne[2] : numberOne[2])
        } = ${plusMinus1 < 50 ? numberOne[0] * -1 : numberOne[0]} x ${
          plusMinus3 < 50 ? "-" : "+"
        } ${numberOne[2]}`,
        answer: `${
          numberOne[0] == 0
            ? "x could equal any number so we say, infinitely many solutions"
            : `the answer is x = ${plusMinus2 < 50 ? -1 * numberOne[1] : numberOne[1]}`
        }`,
      },
    ],
    area: [
      {
        question: `Find the area for a rectangle with height ${numberOne[0]} and a width ${numberOne[1]}.  `,
        answer: ` the answer is ${numberOne[0] * numberOne[1]}`,
      },
      {
        question: `Find the area for a triangle with base ${numberOne[0]} and a height ${numberOne[1]}.  `,
        answer: ` the answer is ${(numberOne[0] * numberOne[1]) / 2}`,
      },
      {
        question: `Find the area for a parallelogram with base ${numberOne[0]} and a height ${numberOne[1]}.  `,
        answer: ` the answer is ${numberOne[0] * numberOne[1]}`,
      },
      {
        question: `Find the area for a trapezoid with one base ${numberOne[0]} the second base ${numberOne[1]} and a height ${numberOne[2]}.  `,
        answer: ` the answer is ${((numberOne[0] + numberOne[1]) * numberOne[2]) / 2}`,
      },
      {
        question: `Find the area for a square with a side length of ${numberOne[0]}.  `,
        answer: ` the answer is ${numberOne[0] * numberOne[0]}`,
      },
    ],
    triangle_inequality: [
      {
        question: `Can a triangle be formed with side lengths ${numberOne[1]}, ${numberOne[0]}, and ${numberOne[2]}`,
        answer: `${
          numberOneSort.sort((a, b) => a - b)[0] + numberOneSort.sort((a, b) => a - b)[1] >
          numberOneSort.sort((a, b) => a - b)[2]
            ? `  Yes this would make a triangle`
            : `No these sides can not make a triangle`
        }`,
      },
      {
        question: `A triangle has side lengths ${numberOne[1]} and ${numberOne[0]}.  What are the possible lengths of the third side length?`,
        answer: `the third side needs to be between ${
          numberOne[0] > numberOne[1] ? numberOne[0] - numberOne[1] : numberOne[1] - numberOne[0]
        } and ${numberOne[0] + numberOne[1]}`,
      },
    ],
    area_perimeter: [
      {
        question: `Find the area and perimeter for of a rectangle with one side length ${numberOne[0]} inches and another side length of ${numberOne[1]} inches.`,
        answer: `the area is ${numberOne[0] * numberOne[1]} square inches and the perimeter is ${
          numberOne[0] * 2 + numberOne[1] * 2
        } inches`,
      },
      {
        question: `Find the area and perimeter for of a square with a side length ${numberOne[0]} inches.`,
        answer: `the area is ${
          numberOne[0] * numberOne[0]
        } square inches and the perimeter is ${numberOne[0] * 4} inches`,
      },
    ],
    proportions: [
      {
        question: [
          `Solve for x (round to nearest hundredth) if: `,
          `${numberOne[0]} / ${numberOne[1]} = ${numberOne[2]} / x `,
        ],
        answer: ` x = ${((numberOne[1] * numberOne[2]) / numberOne[0]).toFixed(2)}`,
      },
      {
        question: [
          `Solve for x (round to nearest hundredth) if:  `,
          `x / ${numberOne[0]} = ${numberOne[1]} / ${numberOne[2]}  `,
        ],
        answer: ` x = ${((numberOne[0] * numberOne[1]) / numberOne[2]).toFixed(2)}`,
      },
      {
        question: [
          `Solve for x (round to nearest hundredth) if:  `,
          `${numberOne[1]} / ${numberOne[2]} =  x / ${numberOne[0]} `,
        ],
        answer: ` x = ${((numberOne[0] * numberOne[1]) / numberOne[2]).toFixed(2)}`,
      },
      {
        question: [
          `Solve for x (round to nearest hundredth) if: `,
          `${numberOne[2]} / x = ${numberOne[0]} / ${numberOne[1]}`,
        ],
        answer: ` x = ${((numberOne[1] * numberOne[2]) / numberOne[0]).toFixed(2)}`,
      },
    ],
    proportional_reasoning: [
      {
        question: `Solve for x:  ${numberOne[0]} is to ${
          numberOne[0] * numberOne[1]
        } as ${numberOne[2]} is to x.`,
        answer: `x is ${numberOne[2] * numberOne[1]}`,
      },
    ],
    more_tangent: [{ question: "In a right triangle " }],
    all_trig_ratios: [{ question: "In a right triangle " }],
    inverse_trig: [
      {
        question: `In a right triangle what is the measure of an angle when the side opposite is ${numberOne[0]} and the side adjacent is ${numberOne[1]}`,
      },
    ],
    tangent: [
      {
        question: `In a right triangle with angle ${numberOne[0]}°, the ▲y is ${numberOne[1]} and the ▲x is ${numberOne[2]}, what is the tangent ratio?`,
        answer: `the tangent ratio is ${numberOne[1]}/${numberOne[2]}`,
      },
    ],
    system_of_equations: [
      {
        question: [
          `Find the solution to the system of equations:`,
          `${numberOne[0]}x ${plusMinus1 > 50 ? "+" : "-"} ${numberOne[1]}y = ${
            plusMinus1 > 50
              ? numberOne[2] * numberOne[0] + numberOne[3] * numberOne[1]
              : numberOne[2] * numberOne[0] - numberOne[3] * numberOne[1]
          }`,
          `${numberOne[4]}x ${plusMinus2 > 50 ? "+" : "-"} ${numberOne[5]}y = ${
            plusMinus2 > 50
              ? numberOne[2] * numberOne[4] + numberOne[3] * numberOne[5]
              : numberOne[2] * numberOne[4] - numberOne[3] * numberOne[5]
          }`,
        ],
        answer: ` x = ${numberOne[2]} and y = ${numberOne[3]}`,
      },
    ],
  };
  const arrayLength = equationTypes[wordProblem].length;
  const indexNum = Math.floor(Math.random() * arrayLength);
  const [simpleEquationIndex, setSimpleEquationIndex] = useState(indexNum);

  useEffect(() => {
    pm1 = Math.random() * 100;
    pm2 = Math.random() * 100;
    pm3 = Math.random() * 100;
    const indexNum = Math.floor(Math.random() * arrayLength);
    setSimpleEquationIndex(indexNum);
    setPlusMinus1(pm1);
    setPlusMinus2(pm2);
    setPlusMinus3(pm3);
  }, [numberOne]);
  const question = equationTypes[wordProblem][simpleEquationIndex].question;
  const answer = equationTypes[wordProblem][simpleEquationIndex].answer;
  return { question: question, answer: answer };
};
export default SimpleEquations;
