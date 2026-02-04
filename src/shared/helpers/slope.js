export default function slope({ x1, y1, x2, y2, p = false, p1, p2 }) {
  return p == false ? (y2 - y1) / (x2 - x1) : (p2.y - p1.y) / (p2.x - p1.x);
}
