import React from "react";
import { Shape } from "react-konva";

export default function MakeColoredAngle({ p, color = "red", drag = false, handleClick, on }) {
  return (
    <Shape
      sceneFunc={(context, shape) => {
        context.beginPath();
        context.moveTo(p[0], p[1]);
        context.lineTo(p[2], p[3]);
        context.lineTo(p[4], p[5]);

        context.closePath();
        // (!) Konva specific method, it is very important
        context.fillStrokeShape(shape);
      }}
      id={color}
      fill={color}
      stroke="black"
      strokeWidth={0}
      opacity={on ? 0.4 : 0.05}
      draggable={drag}
      onClick={handleClick}
    />
  );
}
