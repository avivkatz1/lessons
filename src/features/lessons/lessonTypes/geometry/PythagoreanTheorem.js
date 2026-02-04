import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { Stage, Layer, RegularPolygon, Rect, Circle, Line, Shape, Text, Arrow } from "react-konva";

const randomNum = (max = 10) => {
  return Math.floor(Math.random() * max);
};
const pythagorean_triples = [
  [3, 4, 5],
  [5, 12, 13],
  [7, 24, 25],
  [8, 15, 17],
  [9, 40, 41],
  [11, 60, 61],
  [12, 35, 37],
];
const positionText = [
  { x: 190, y: 210 },
  { x: 520, y: 420 },
  { x: 550, y: 170 },
];

const initial_terms = pythagorean_triples[randomNum(pythagorean_triples.length)];
function PythagoreanTheorem(props) {
  const [points, setPoints] = useState([
    { id: 0, x: 248, y: 62 },
    { id: 1, x: 248, y: 403 },
    { id: 2, x: 855, y: 403 },
    { id: 3, x: 248, y: 62 },
  ]);
  const [adding, setAdding] = useState(35);
  const [showC, setShowC] = useState(false);
  const [terms, setTerms] = useState(initial_terms);
  const [hidden, setHidden] = useState(randomNum(3));
  const [answer, setAnswer] = useState(false);

  const shootArrow = () => {
    setAdding(200);
    setShowC(true);
    setTimeout(() => {
      setAdding(35);
      setShowC(false);
    }, 2000);
  };

  const showAnswers = () => {
    setAnswer(!answer);
  };

  const newTriangle = () => {
    setTerms(pythagorean_triples[randomNum(pythagorean_triples.length)]);
    setHidden(randomNum(3));
  };
  const changePosition = (e) => {
    const newPoints = points.map((point) => {
      if (point.id != e.target.attrs.id && Math.abs(point.id - e.target.attrs.id) <= 2)
        return point;
      point.x = e.target.attrs.x;
      point.y = e.target.attrs.y;
      return point;
    });
    setPoints(newPoints);
  };

  return (
    <Wrapper>
      <div className="practice-container">
        <div>
          <Stage width={window.innerWidth} height={500}>
            <Layer>
              <Text
                fontSize={30}
                fontStyle={"bold"}
                fill={"red"}
                text={showC ? `C` : ``}
                x={480}
                y={160}
                width={200}
                wrap={"word"}
              />
              {terms.map((term, index) => {
                return (
                  <Text
                    fontSize={50}
                    fontStyle={"bold"}
                    fill={"black"}
                    text={index == hidden && !answer ? "x" : `${term}`}
                    x={positionText[index].x}
                    y={positionText[index].y}
                    width={200}
                    wrap={"word"}
                  />
                );
              })}
            </Layer>
            <Layer>
              <Arrow
                points={[points[1].x, points[1].y, points[1].x + adding, points[1].y - adding]}
                pointerAtEnding={true}
                stroke={"red"}
                fill={"red"}
                strokeWidth={5}
                pointerLength={15}
                pointerWidth={30}
                className="arrow"
              />
              <Rect
                className="rectangle-shooter"
                stroke={"black"}
                strokeWidth={2}
                x={points[1].x}
                y={points[1].y - 40}
                width={40}
                height={40}
                fill={"red"}
                opacity={1}
                onMouseOver={shootArrow}
              />

              <Line
                stroke={"black"}
                strokeWidth={3}
                points={[points[1].x, points[1].y, points[0].x, points[0].y]}
              />
              <Line
                stroke={"black"}
                strokeWidth={3}
                points={[points[1].x, points[1].y, points[2].x, points[2].y]}
              />
              <Line
                stroke={showC ? "red" : "black"}
                strokeWidth={showC ? 8 : 3}
                points={[points[2].x, points[2].y, points[3].x, points[3].y]}
              />
              {points.map((p, i) => {
                return (
                  <Circle
                    id={`jk${i * 4}`}
                    radius={4}
                    stroke={"black"}
                    strokeWidth={3}
                    x={p.x}
                    y={p.y}
                    fill={"black"}
                    draggable={false}
                    onDragMove={changePosition}
                  />
                );
              })}
            </Layer>
          </Stage>
          <button onClick={newTriangle}>Different Right Triangle</button>
          <button onClick={showAnswers}>{answer ? `Hide Answer` : `Show Answer`}</button>
        </div>
      </div>
    </Wrapper>
  );
}

export default PythagoreanTheorem;

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
  }
  .problem-text {
    font-size: x-large;
    font-weight: 700;
    text-transform: lowercase;
  }
`;
