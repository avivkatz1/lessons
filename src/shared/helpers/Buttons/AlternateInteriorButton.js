import { Circle, Line, Rect } from "react-konva";
import { useState } from "react";
import MovablePointsAndLinesAlternateInterior from "../MovablePointsAndLinesAlternateInterior";
const AlternateInteriorButton = ({
  handleClick,
  alternateInterior,
  x = 20,
  y = 0,
  objPos = { x: 0, y: 0 },
  textPos = { x: 0, y: 0 },
}) => {
  const [points, setPoints] = useState([
    { id: 0, x: x + 10 + objPos.x, y: y + 70 + objPos.y },
    { id: 1, x: x + 90 + objPos.x, y: y + 50 + objPos.y },
    { id: 2, x: x + 10 + objPos.x, y: y + 160 + objPos.y },
  ]);

  const changePosition = (e) => {
    const newPoints = points.map((point) => {
      if (point.id != e.target.attrs.id) return point;
      point.x = e.target.attrs.x;
      point.y = e.target.attrs.y;
      return point;
    });
    setPoints(newPoints);
  };

  const handleShapeMoving = (e) => {
    const xChange = e.target.attrs.x;
    const yChange = e.target.attrs.y;
    const newPoints = points.map((point) => {
      point.x += xChange;
      point.y += yChange;
      return point;
    });
    setPoints(newPoints);
  };

  return (
    <>
      <Circle x={x + 55} y={y + 9} fill="green" radius={4} />
      <Circle x={x + 35} y={y + 21} fill="green" radius={4} />
      <Line stroke={"black"} points={[x + 10, y + 5, x + 80, y + 5]} />
      <Line stroke={"black"} points={[x + 10, y + 25, x + 80, y + 5]} />
      <Line stroke={"black"} points={[x + 10, y + 25, x + 80, y + 25]} />

      <Rect
        id="alternateInterior"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"yellow"}
        opacity={0.5}
        stroke={"black"}
        onClick={handleClick}
      />
      {alternateInterior && (
        <MovablePointsAndLinesAlternateInterior
          points={points}
          changePosition={changePosition}
          setPoints={setPoints}
          handleShapeMoving={handleShapeMoving}
          objPos={objPos}
        />
      )}
    </>
  );
};

export default AlternateInteriorButton;
