import React, { useState } from "react";
import { useEffect } from "react";
import styled from "styled-components";

function Hints({ hint, index, newProblem }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(false);
  }, [newProblem]);
  return (
    <Wrapper>
      {show && (
        <h3>
          {index + 1}. {hint}
        </h3>
      )}
      {!show && (
        <button
          onClick={() => {
            setShow(!show);
          }}
        >
          hint {index + 1}
        </button>
      )}
    </Wrapper>
  );
}

export default Hints;

const Wrapper = styled.div`
  display: flex;
  button {
    background-color: #2ad5d0;
    height: 50px;
    border-radius: 30px;
    width: 85px;
    text-transform: capitalize;
    /* margin-top:20px; */
  }
`;
