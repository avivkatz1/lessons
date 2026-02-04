import React from "react";
import slope from "./slope";
import numbers from "./numbers";
const PointPerpendicular = ({ x1, y1, x2, y2, p = false, p1, p2 }) => {
  let newX;
  let newY;
  let slopeOne;
  let slopeTwo;
  if (p == false) {
    const p1 = { x: x1, y: y1 };
    const p2 = { x: x2, y: y2 };
    slopeOne = -1 / slope({ p1, p2, p: true });
    slopeTwo = slope({ p1, p2, p: true });
    newX = numbers(1, 50, x2 + 50)[0];
    newY = slopeOne * (newX - x2) + y2;
  } else {
    slopeOne = -1 / slope({ p: true, p1, p2 });
    slopeTwo = slope({ p: true, p1, p2 });
    newX = numbers(1, 50, p2.x + 50)[0];
    newY = slopeOne * (newX - p2.x) + p2.y;
  }

  return { x: newX, y: newY };
};

export default PointPerpendicular;
