/**
 * Generates a halfway point between two points
 * @param {arr} array - This can either be two points [p1,p2] or a list of [x1,y1,x2,y2]
 * @param {p} boolean - true if using [p1,p2] method while transferring over
 */

export default function halfwayPoint(arr, p = false) {
  let midpointCalculatedX;
  let midpointCalculatedY;
  if (p == false) {
    midpointCalculatedX = (arr[0] + arr[2]) / 2;
    midpointCalculatedY = (arr[1] + arr[3]) / 2;
  } else {
    midpointCalculatedX = (arr[0].x + arr[1].x) / 2;
    midpointCalculatedY = (arr[0].y + arr[1].y) / 2;
  }
  return { x: midpointCalculatedX, y: midpointCalculatedY };
}
