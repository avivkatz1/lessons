import { Line, Rect } from "react-konva";
import { useState } from "react";
import MovablePointsAndLinesPerpendicular from "../MovablePointsAndLinesPerpendicular";
const PerpendicularLinesButton = ({
  handleClick,
  perpendicular,
  x = 20,
  y = 0,
  objPos = { x: 0, y: 0 },
  textPos = { x: 0, y: 0 },
}) => {
  const [points, setPoints] = useState([
    { id: 0, x: x + 45 + objPos.x, y: y + 50 + objPos.y },
    { id: 1, x: x + 45 + objPos.x, y: y + 130 + objPos.y },
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
      <Line stroke={"black"} points={[x + 45, y + 25, x + 45, y + 5]} />
      <Line stroke={"black"} points={[x + 15, y + 25, x + 75, y + 25]} />
      <Rect
        id="perpendicular"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"red"}
        opacity={0.5}
        stroke={"black"}
        onClick={handleClick}
      />
      {perpendicular && (
        <MovablePointsAndLinesPerpendicular
          points={points}
          changePosition={changePosition}
          setPoints={setPoints}
          handleShapeMoving={handleShapeMoving}
        />
      )}
    </>
  );
};

export default PerpendicularLinesButton;
