import { Circle, Line, Rect, Text } from "react-konva";
import { useState } from "react";
import MovablePointsAndLinesCorresponding from "../MovablePointsAndLinesCorresponding";
const CorrespondingAnglesButton = ({
  handleClick,
  corresponding,
  x = 20,
  y = 0,
  objPos = { x: 0, y: 0 },
  textPos = { x: 0, y: 0 },
}) => {
  const [points, setPoints] = useState([
    { id: 0, x: 50 + objPos.x, y: y + 200 + objPos.y },
    { id: 1, x: 800 + objPos.x, y: y + 150 + objPos.y },
    { id: 2, x: 50 + objPos.x, y: y + 300 + objPos.y },
    { id: 4, x: x + 60 + objPos.x, y: 100 + objPos.y },
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
      <Circle x={x + 30} y={y + 15} fill="green" radius={4} />
      <Circle x={x + 65} y={y + 24} fill="green" radius={4} />
      <Line stroke={"black"} points={[x + 10, y + 5, x + 80, y + 25]} />
      <Line stroke={"black"} points={[x + 10, y + 12, x + 80, y + 5]} />
      <Line stroke={"black"} points={[x + 30, y + 25, x + 80, y + 18]} />

      <Rect
        id="corresponding"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"yellow"}
        opacity={0.5}
        stroke={"black"}
        onClick={handleClick}
      />

      {corresponding && (
        <>
          <Text
            x={x - 500 + textPos.x}
            y={y + 40 + textPos.y}
            fontSize={20}
            text="press any angle to see it's corresponding angle"
          />
          <MovablePointsAndLinesCorresponding
            points={points}
            changePosition={changePosition}
            setPoints={setPoints}
            handleShapeMoving={handleShapeMoving}
          />
        </>
      )}
    </>
  );
};

export default CorrespondingAnglesButton;
