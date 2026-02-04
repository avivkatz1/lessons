import React from "react";
import MakeColoredAngle from "./MakeColoredAngle";
export default function MakeColoredAnglesCorrespond({ shapeViews, p1, p2, color, handleClick }) {
  return (
    <>
      <MakeColoredAngle
        p={p1}
        color={color}
        drag={true}
        handleClick={handleClick}
        on={shapeViews}
      />
      {/* <Shape p1 p2 p3 p4 p5 p6 color drag handleClick/> */}

      {shapeViews && (
        <MakeColoredAngle p={p2} color={color} on={shapeViews} handleClick={handleClick} />
      )}
    </>
  );
}
