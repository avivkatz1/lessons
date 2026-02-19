import React from "react";
import styled from "styled-components";

/**
 * FractionDisplay renders a stacked fraction preview with numerator on top
 * and denominator on bottom, separated by a horizontal fraction bar.
 * The active field (numerator or denominator) is highlighted to indicate
 * where keypad input will be directed.
 *
 * Used by MathKeypad when fraction mode is enabled.
 */
const FractionDisplay = ({
  numerator = "",
  denominator = "",
  activeField = "numerator",
  onFieldSwitch,
}) => {
  const handleNumeratorClick = () => {
    if (activeField !== "numerator" && onFieldSwitch) {
      onFieldSwitch("numerator");
    }
  };

  const handleDenominatorClick = () => {
    if (activeField !== "denominator" && onFieldSwitch) {
      onFieldSwitch("denominator");
    }
  };

  return (
    <Wrapper>
      <FractionBox>
        <Field
          $active={activeField === "numerator"}
          onClick={handleNumeratorClick}
          role="button"
          aria-label="Numerator field"
          tabIndex={0}
        >
          {numerator || <Placeholder>?</Placeholder>}
        </Field>
        <FractionBar />
        <Field
          $active={activeField === "denominator"}
          onClick={handleDenominatorClick}
          role="button"
          aria-label="Denominator field"
          tabIndex={0}
        >
          {denominator || <Placeholder>?</Placeholder>}
        </Field>
      </FractionBox>
    </Wrapper>
  );
};

export default FractionDisplay;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
`;

const FractionBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  padding: 4px 12px;
`;

const Field = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 36px;
  padding: 4px 8px;
  font-size: 22px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  background-color: ${(props) =>
    props.$active ? props.theme.colors.pageBackground : "transparent"};
  border: 2px solid
    ${(props) =>
      props.$active ? props.theme.colors.info : "transparent"};
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
`;

const FractionBar = styled.div`
  width: 100%;
  height: 2px;
  background-color: ${(props) => props.theme.colors.textPrimary};
  margin: 2px 0;
`;

const Placeholder = styled.span`
  color: ${(props) => props.theme.colors.textDisabled};
  font-weight: 400;
`;
