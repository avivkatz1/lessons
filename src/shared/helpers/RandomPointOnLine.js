import React from "react";
import numbers from "./numbers";
import slope from "./slope";

const RandomPointOnLine = ({ x1, y1, x2, y2, p = false, p1, p2 }) => {
  let newSlope;
  let newX;
  let newY;

  if (p == false) {
    const p1 = { x1, y1 };
    const p2 = { x2, y2 };
    newSlope = slope({ p: true, p1, p2 });
    newX = numbers(1, 200, x1 + 50)[0];
    newY = newSlope * (newX - x1) + y1;
  } else {
    newSlope = slope({ p: true, p1, p2 });
    newX = numbers(1, 200, p1.x + 50)[0];
    newY = newSlope * (newX - p1.x) + p1.y;
  }
  return { x: newX, y: newY };
};

export default RandomPointOnLine;
