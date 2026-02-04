import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Stage, Layer, Image as KonvaImage, Text, Line } from "react-konva";
import { protractor } from "../../../../shared/images";
import { useLessonState } from "../../../../hooks";

const Protractor = () => {
  // Phase 2: Use shared lesson state hook
  const { lessonProps } = useLessonState();

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function toRadians(angle) {
    return angle * (Math.PI / 180);
  }

  const answer = +lessonProps.answer[0].text;

  // Original protractor image dimensions (at scale 1)
  const originalImageWidth = 500;
  const originalImageHeight = 295;
  // Origin point relative to original image (center bottom of protractor arc)
  const originalOriginX = 249;
  const originalOriginY = 295;

  // Calculate responsive scale based on available width
  // Leave some padding on sides
  const availableWidth = Math.min(dimensions.width - 40, 600);
  const availableHeight = Math.min(dimensions.height * 0.35, 280);

  // Scale to fit within available space
  const scaleByWidth = availableWidth / originalImageWidth;
  const scaleByHeight = availableHeight / originalImageHeight;
  const protractorScale = Math.min(scaleByWidth, scaleByHeight, 1.5);

  // Calculate actual protractor dimensions after scaling
  const scaledWidth = originalImageWidth * protractorScale;
  const scaledHeight = originalImageHeight * protractorScale;

  // Stage dimensions - fit the protractor plus room for lines
  const lineLength = Math.min(150 * protractorScale, scaledWidth * 0.5);
  const stageWidth = Math.min(dimensions.width - 20, scaledWidth + lineLength * 2 + 40);
  const stageHeight = scaledHeight + 40;

  // Center the protractor image in the stage
  const protractorX = (stageWidth - scaledWidth) / 2;
  const protractorY = 10;

  // Calculate origin point (where lines meet) based on scaled image position
  const origin = [
    protractorX + originalOriginX * protractorScale,
    protractorY + originalOriginY * protractorScale,
  ];

  // Stroke width scales for visibility
  const strokeWidth = Math.max(3, Math.min(8 * protractorScale, 8));

  // Calculate second point based on angle
  const secondPointArray = useMemo(() => {
    const points = [];
    if (answer === 0) {
      points.push(origin[0] + lineLength);
      points.push(origin[1]);
    } else if (answer === 180) {
      points.push(origin[0] - lineLength);
      points.push(origin[1]);
    } else if (answer === 90) {
      points.push(origin[0]);
      points.push(origin[1] - lineLength);
    } else {
      const x = Math.cos(toRadians(answer)) * lineLength;
      const y = Math.sin(toRadians(answer)) * lineLength;
      points.push(origin[0] + x);
      points.push(origin[1] - y);
    }
    return points;
  }, [answer, origin, lineLength]);

  const imageElement = useMemo(() => {
    const img = document.createElement("img");
    img.src = protractor;
    return img;
  }, []);

  return (
    <Wrapper>
      <div className="protractor-container">
        <Stage width={stageWidth} height={stageHeight} className="stage">
          <Layer>
            <KonvaImage
              image={imageElement}
              x={protractorX}
              y={protractorY}
              scaleX={protractorScale}
              scaleY={protractorScale}
            />

            <Line
              stroke={"red"}
              strokeWidth={strokeWidth}
              points={[...origin, origin[0] + lineLength, origin[1]]}
              opacity={0.6}
            />
            <Line
              stroke={"green"}
              strokeWidth={strokeWidth}
              points={[...origin, ...secondPointArray]}
              opacity={0.6}
            />
          </Layer>
        </Stage>
      </div>
    </Wrapper>
  );
};

export default Protractor;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100vw;
  overflow: hidden;
  padding: 10px;
  box-sizing: border-box;

  .protractor-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  .stage {
    max-width: 100%;
  }

  button {
    background-color: lightgreen;
    height: auto;
    min-height: 50px;
    border-radius: 7px;
    font-size: clamp(1rem, 3vw, 1.5rem);
    padding: 10px 20px;
  }

  .practice-container {
    margin-top: 50px;
    display: flex;
    justify-content: center;
  }

  .problem-text {
    font-size: clamp(1rem, 4vw, 1.5rem);
    font-weight: 700;
    text-transform: lowercase;
  }

  @media (max-width: 768px) {
    padding: 5px;

    .practice-container {
      margin-top: 30px;
    }
  }

  @media (max-width: 480px) {
    .practice-container {
      margin-top: 20px;
    }
  }
`;
