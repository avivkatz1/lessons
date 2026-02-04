/**
 * Generates the intersection of two lines
 * @param {a} int - This can either be two points [p1,p2] or a list of [a,b,c,d]
 * @param {p} boolean - true if using [p1,p2] method while transferring over
 */

import slope from "./slope";

export default function intersectionTwoLines({ a, b, c, d, m1, m2, p1, p2, p = false }) {
  let intersectingPointXValue;
  let intersectingPointYValue;
  if (p == false) {
    intersectingPointXValue = (-m1 * c + d - b + a * m2) / (m2 - m1);
    intersectingPointYValue = m2 * (intersectingPointXValue - a) + b;
  } else {
    intersectingPointXValue = (-m1 * p2.x + p2.y - p1.y + p1.x * m2) / (m2 - m1);
    intersectingPointYValue = m2 * (intersectingPointXValue - p1.x) + p1.y;
  }
  return { x: intersectingPointXValue, y: intersectingPointYValue };
}
