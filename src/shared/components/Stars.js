import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { IconContext } from "react-icons";
import { changeStars } from "../../store/lessonSlice";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

const Stars = (props) => {
  const dispatch = useDispatch();
  const stars = useSelector((state) => {
    return state.lesson.lessonProps.stars;
  });
  function starClick(num) {
    dispatch(changeStars(num + 1));
  }

  let starsArray = [...Array(5)];
  starsArray = starsArray.map((_, index) => index < stars);
  return (
    <Wrapper>
      <div className="star-holder">
        {starsArray.map((star, i) => (
          <IconContext.Provider value={{ className: "button-stars" }}>
            {star ? (
              <FaStar onClick={() => starClick(i)} id={`star${i}`} />
            ) : (
              <FaRegStar onClick={() => starClick(i)} id={`star${i}`} />
            )}
          </IconContext.Provider>
        ))}
      </div>
    </Wrapper>
  );
};

export default Stars;
const Wrapper = styled.div`
  .star-holder {
    display: flex;
  }
  .button-stars {
    font-size: 30px;
    margin: 5px 5px;
    padding: 0px;
  }
`;
