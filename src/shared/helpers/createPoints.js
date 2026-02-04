import numbers from "./numbers";

const createPoints = (num, xMax = 600, xMin = 0, yMax = 500, yMin = 0) => {
  const letters = [
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
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  const copyLetters = letters.slice(0);
  const createdPoints = {};
  const xPoints = numbers(num, xMax);
  const yPoints = numbers(num, yMax);
  for (let i = 0; i < num; i++) {
    const randNum = numbers(1, copyLetters.length)[0];
    createdPoints[`x${i + 1}`] = xPoints[i] + xMin;
    createdPoints[`y${i + 1}`] = yPoints[i] + yMin;
    createdPoints[`name${i + 1}`] = {
      name: copyLetters[randNum],
      x: xPoints[i] + xMin,
      y: yPoints[i] + yMin,
    };
    copyLetters.splice(randNum, 1);
  }

  return createdPoints;
};

export default createPoints;
