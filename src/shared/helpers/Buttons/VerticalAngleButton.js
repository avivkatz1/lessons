import { Line, Rect } from "react-konva";
import { useState } from "react";
import MovablePointsAndLines from "../MovablePointsAndLines";
const VerticalAngleButton = ({
  handleClick,
  vertical,
  x = 20,
  y = 0,
  objPos = { x: 0, y: 0 },
  textPos = { x: 0, y: 0 },
}) => {
  const [points, setPoints] = useState([
    { id: 0, x: 100 + objPos.x, y: 200 + objPos.y },
    { id: 1, x: 100 + objPos.x, y: 300 + objPos.y },
    { id: 2, x: 300 + objPos.x, y: 200 + objPos.y },
    { id: 3, x: 300 + objPos.x, y: 300 + objPos.y },
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
      <Line
        stroke={"black"}
        points={[x + 5, y + 5, x + 85, y + 25, x + 85, y + 5, x + 5, y + 25, x + 5, y + 5]}
      />
      <Rect
        id="vertical"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"green"}
        opacity={0.5}
        stroke={"black"}
        onClick={handleClick}
      />
      {vertical && (
        <MovablePointsAndLines
          points={points}
          changePosition={changePosition}
          setPoints={setPoints}
          handleShapeMoving={handleShapeMoving}
        />
      )}
    </>
  );
};

export default VerticalAngleButton;
