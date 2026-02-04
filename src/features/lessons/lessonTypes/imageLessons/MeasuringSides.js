import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text, Image } from "react-konva";
import useImage from "use-image";
import { ruler } from "../../../../shared/images";
import { useLessonState } from "../../../../hooks";

const MeasuringSides = () => {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();
  const length = lessonProps.question[0][0].text;
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate ruler width (accounting for responsive padding)
  const getPadding = () => {
    if (dimensions.width <= 480) return dimensions.width * 0.02; // 2% on small screens
    if (dimensions.width <= 768) return dimensions.width * 0.03; // 3% on medium screens
    return dimensions.width * 0.04; // 4% on larger screens
  };

  const padding = getPadding();
  const rulerWidth = dimensions.width - padding * 2;
  const lineLength = (rulerWidth * length) / 12;

  return (
    <Wrapper $padding={padding}>
      <div className="practice-container">
        <div className="line-container">
          <Stage width={rulerWidth} height={10}>
            <Layer>
              <Line points={[0, 0, lineLength, 0]} stroke={"red"} strokeWidth={8} />
            </Layer>
          </Stage>
        </div>
      </div>
      <div className="ruler-container">
        <img src={ruler} alt="ruler" style={{ width: "100%" }} />
      </div>
    </Wrapper>
  );
};

export default MeasuringSides;

const Wrapper = styled.div`
  margin-top: 20px;
  button {
    background-color: lightgreen;
    height: 50px;
    border-radius: 7px;
    font-size: 24px;
  }

  .practice-container {
    margin-top: 100px;
    display: flex;
    justify-content: center;
    padding: 0 ${(props) => props.$padding}px;
  }

  .line-container {
    width: 100%;
  }

  .problem-text {
    font-size: x-large;
    font-weight: 700;
    text-transform: lowercase;
  }

  .ruler-container {
    padding: 0 ${(props) => props.$padding}px;
  }

  @media (max-width: 768px) {
    .practice-container {
      margin-top: 60px;
    }
  }

  @media (max-width: 480px) {
    .practice-container {
      margin-top: 40px;
    }
  }
`;
