/**
 * Generates another point on the same line that is VAR units away in X or Y direction
 * @param {y2}  - point broken down {x1,y1,x2,y2}
 * @param {pos} boolean - true if you want to go in positive direction (opposite for y ;)
 * @param {yVal} boolean - true if you want to move in y direction false for x direction
 * @param {move} int - how many spaces, default is 50
 */

import React from "react";
import slope from "./slope";
export default function nextPoint({ x1, y1, x2, y2, pos = true, yVal = true, move = 50 }) {
  const m1 = slope({ x1, y1, x2, y2 });
  return yVal
    ? pos
      ? { x: move / m1 + x1, y: y1 + move }
      : { x: (-1 * move) / m1 + x1, y: y1 - move }
    : pos
      ? { x: x1 + move, y: m1 * move + y1 }
      : { x: x1 - move, y: m1 * (-1 * move) + y1 };
}
