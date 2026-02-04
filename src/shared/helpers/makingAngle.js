import createPoints from "../helpers/createPoints";

const makingAngle = () => {
  const linesArray = [];
  for (let i = 0; i < 1; i++) {
    linesArray.push(createPoints(3, 600, 100, 300, 100));
  }
  const { x1, y1, x2, y2, x3, y3 } = linesArray[0];
  linesArray[0].name1 = {
    ...linesArray[0].name1,
    x: x1 <= x2 ? x1 - 35 : x1 + 10,
    y: y1 <= y2 ? y1 - 20 : y1 + 2,
    fontSize: 30,
    fill: "red",
    fontWidth: 5,
  };
  linesArray[0].name2 = {
    ...linesArray[0].name2,
    x: x1 >= x2 && x3 >= x2 ? x2 - 20 : x1 <= x2 && x3 <= x2 ? x2 + 10 : x2,
    y: y1 <= y2 && y3 <= y2 ? y2 + 15 : y1 >= y2 && y3 >= y2 ? y2 - 30 : y2 - 10,
    fontSize: 30,
    fill: "red",
    fontWidth: 5,
  };
  linesArray[0].name3 = {
    ...linesArray[0].name3,
    x: x3 <= x2 ? x3 - 35 : x3 + 10,
    y: y3 <= y2 ? y3 - 20 : y3 + 2,
    fontSize: 30,
    fill: "red",
    fontWidth: 5,
  };
  const lettersArray = [linesArray[0].name1, linesArray[0].name2, linesArray[0].name3];
  return { linesArray: linesArray, lettersArray: lettersArray };
};
export default makingAngle;
