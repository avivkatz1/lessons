import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import katex from "katex";
import { useSelector, useDispatch } from "react-redux";
import { functionCheckOrder } from "../../store/lessonSlice";
import InfoCardButton from "./partialComponents/InfoCardButton";

let newWidth;
const InfoCard = (props) => {
  const dispatch = useDispatch();
  const [alertLowerLeft, setAlertLowerLeft] = useState(false);
  const [extraInfoBottom, setExtraInfoBottom] = useState("");
  const lessonName = useSelector((state) => state.lesson.lessonProps.lessonName);
  const order = useSelector((state) => state.lesson.lessonProps.order);
  const propsSelector = useSelector((state) => state.lesson.lessonProps);
  const { text, topButtons, bottomButtons, width, totalLength, fontSize } = props;

  newWidth = totalLength;

  const KaTeXComponent = ({ texExpression }) => {
    const containerRef = useRef();
    useEffect(() => {
      if (containerRef.current) {
        // Clear old content first to prevent duplication
        containerRef.current.innerHTML = '';

        // Render new content
        katex.render(texExpression, containerRef.current, {
          fontSize: "0.5rem",
        });
      }
    }, [texExpression]); // Re-run when texExpression changes

    return <div ref={containerRef} />;
  };

  const changeInfoBottomMiddle = (text) => {
    setExtraInfoBottom(text);
  };
  const alertLower = () => {
    setAlertLowerLeft(true);
    setTimeout(() => {
      setAlertLowerLeft(false);
    }, 3000);
  };

  const handleButtonClick = () => {
    if (lessonName == "order_of_operations") {
      const currentNumber = +bottomButtons.textOnClick;
      if (order.length == 0) {
        if (currentNumber == 1) {
          changeInfoBottomMiddle(currentNumber);
          dispatch(functionCheckOrder(currentNumber));
        } else {
          alertLower();
        }
      } else {
        if (order[order.length - 1] == currentNumber - 1) {
          changeInfoBottomMiddle(currentNumber);
          dispatch(functionCheckOrder(currentNumber));
        } else {
          alertLower();
        }
      }
    }
    if (
      lessonName == "evaluating_expressions" ||
      lessonName == "adding_integers" ||
      lessonName == "subtracting_integers" ||
      lessonName == "rounding"
    ) {
      changeInfoBottomMiddle(bottomButtons.textOnClick);
    }
  };
  const handleHotCornerLowerLeft = () => {
    if (lessonName == "order_of_operations") {
      const currentNumber = +bottomButtons.hotCornerLowerLeft.onClick;

      if (order.length == 0) {
        if (currentNumber == 1) {
          setExtraInfoBottom(currentNumber);
          dispatch(functionCheckOrder(currentNumber));
        } else {
          alertLower();
        }
      } else {
        if (order[order.length - 1] == currentNumber - 1) {
          setExtraInfoBottom(currentNumber);
          dispatch(functionCheckOrder(currentNumber));
        } else {
          alertLower();
        }
      }
    }
    if (
      lessonName == "evaluating_expressions" ||
      lessonName == "adding_integers" ||
      lessonName == "subtracting_integers" ||
      lessonName == "rounding"
    ) {
      setExtraInfoBottom(bottomButtons.hotCornerLowerLeft.onClick);
    }
  };
  // console.log();(bottomButtons.map((item)=>item.name))
  // console.log(topButtons[0]);
  // console.log(topButtons[1]);
  // console.log(topButtons[2]);
  return (
    <Wrapper>
      <div className="top-container">
        {topButtons?.map((item) => {
          const { name, text, textOnClick, alertTextOnClick } = item;
          return <InfoCardButton className={name} text={text} textOnClick={textOnClick} />;
          // return <h1>hello</h1>
        })}
      </div>
      <div className={totalLength < 8 ? `middle-container` : `middle-container-small`}>
        <KaTeXComponent
          className={
            fontSize == "answer"
              ? "answer-text"
              : totalLength < 8
                ? "question-text"
                : "question-text-small"
          }
          texExpression={`${text}`}
        />
      </div>
      <div className={!alertLowerLeft ? "bottom-container" : "alert-container"}>
        {bottomButtons?.map((item) => {
          const { name, text, textOnClick, alertTextOnClick } = item;

          return <InfoCardButton className={name} text={text} textOnClick={textOnClick} />;
        })}
      </div>
    </Wrapper>
  );
};

export default InfoCard;
const Wrapper = styled.div`
  align-items: center;
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* width:97px; */
  /* width:{100/newWidth}px; */

  /* @media (max-width: 500px) {
    .middle-container {
      .katex {
        height: 10rem;
        font-size: 5rem;
      }
    }
  } */
`;
