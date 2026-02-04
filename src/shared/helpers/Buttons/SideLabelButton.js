import { Circle, Line, Rect, Text } from "react-konva";
import { useState, useEffect } from "react";

const SideLabelButton = ({
  text = "S",
  primes = true,
  handleClick,
  sideLabel,
  x = 20,
  y = 0,
  objPos = { x: 0, y: 0 },
  textPos = { x: 0, y: 0 },
}) => {
  const [letter, setLetter] = useState(0);
  const [letterArray, setLetterArray] = useState([]);
  useEffect(() => {
    const tempArray = [...Array(letter)].map((_, i) => text + "'".repeat(i));
    setLetterArray(tempArray);
  }, [letter]);

  const handleQuantity = (e) => {
    let newNum = +e.target.attrs.name + letter;
    if (newNum < 0) newNum = 0;
    setLetter(newNum);
  };

  return (
    <>
      <Text x={x + 35} y={y + 2} fontSize={30} text={text} fill="black" />
      <Rect
        id="sideLabel"
        x={x}
        y={y}
        width={90}
        height={30}
        fill={"yellow"}
        opacity={0.5}
        stroke={"black"}
        onClick={handleClick}
      />
      <Line points={[x + 10, y + 15, x + 30, y + 15]} stroke="black" />
      <Line points={[x + 60, y + 15, x + 80, y + 15]} stroke="black" />
      <Line points={[x + 70, y + 5, x + 70, y + 25]} stroke="black" />
      <Circle
        name="1"
        radius={10}
        fill="green"
        x={x + 70}
        y={y + 15}
        opacity={0.3}
        onClick={handleQuantity}
      />
      <Circle
        name="-1"
        radius={10}
        fill="red"
        x={x + 20}
        y={y + 15}
        opacity={0.3}
        onClick={handleQuantity}
      />
      {[...Array(letter)].map((_, i) => {
        return (
          <Text
            id={i}
            key={i}
            x={x + 20 + objPos.x}
            y={y + 40 + objPos.y}
            fontSize={40}
            text={primes ? letterArray[i] : text}
            fill="blue"
            fontWeight="bold"
            draggable={true}
          />
        );
      })}
    </>
  );
};

export default SideLabelButton;
