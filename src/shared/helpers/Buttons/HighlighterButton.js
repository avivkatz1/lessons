import React, { useEffect, useState } from "react";
import { Rect } from "react-konva";
const HighlighterButton = ({
  handleClick,
  highlighter,
  x = 220,
  y = 0,
  color = "red",
  highlightPositionX = 0,
  highlightPositionY = 0,
  colorsNum = 3,
  width = 50,
  highlightedPositionY = 0,
  reproduce = true,
  id = "highlighter",
  objPos = { x: 0, y: 0 },
  textPos = { x: 0, y: 0 },
}) => {
  const [highlights, setHighlights] = useState(["."]);

  const handleDragEnd = () => {
    const num = highlights.length + 1;
    setHighlights([...Array(num)]);
  };
  useEffect(() => {
    if (!highlighter) setHighlights(["."]);
  }, [highlighter]);

  return (
    <>
      <Rect
        id={id}
        x={x + (highlightPositionX * 90) / colorsNum}
        y={y + highlightPositionY}
        width={90 / colorsNum}
        height={30}
        fill={color}
        opacity={0.5}
        stroke={"black"}
        strokeWidth={2}
        onClick={handleClick}
      />
      {highlighter &&
        highlights.map((_, i) => {
          return (
            <Rect
              id={i + 1}
              key={i + 1}
              x={240 + highlightPositionX * 50 + objPos.x}
              y={50 + highlightPositionY + highlightedPositionY + objPos.y}
              width={width}
              height={50}
              fill={color}
              opacity={reproduce ? 0.4 : 0.8}
              draggable={true}
              onDragEnd={reproduce ? handleDragEnd : ""}
            />
          );
        })}
    </>
  );
};

export default HighlighterButton;
