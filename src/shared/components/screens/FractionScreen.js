import React from "react";
import styled from "styled-components";

/**
 * FractionScreen - Custom screen for UnifiedMathKeypad
 *
 * Displays a stacked fraction with clickable numerator and denominator fields.
 * Alternative to the built-in fractionMode when you need more control.
 *
 * @example
 * <UnifiedMathKeypad
 *   buttonSet="basic"
 *   screen={
 *     <FractionScreen
 *       numerator={numerator}
 *       denominator={denominator}
 *       activeField="numerator"
 *       onFieldSwitch={setActiveField}
 *     />
 *   }
 * />
 */
const FractionScreen = ({
  numerator = "",
  denominator = "",
  activeField = "numerator", // "numerator" | "denominator"
  onFieldSwitch, // Callback when field clicked
  dividerColor, // Optional custom divider color
}) => {
  return (
    <Container>
      <FieldBox
        onClick={() => onFieldSwitch && onFieldSwitch("numerator")}
        $active={activeField === "numerator"}
      >
        <FieldValue>{numerator || "0"}</FieldValue>
      </FieldBox>

      <Divider $color={dividerColor} />

      <FieldBox
        onClick={() => onFieldSwitch && onFieldSwitch("denominator")}
        $active={activeField === "denominator"}
      >
        <FieldValue>{denominator || "0"}</FieldValue>
      </FieldBox>
    </Container>
  );
};

export default FractionScreen;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background-color: ${props => props.theme.colors.pageBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  margin-bottom: 12px;
`;

const FieldBox = styled.div`
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 6px;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${props => props.$active
    ? props.theme.colors.info + '20'
    : 'transparent'};

  ${props => props.$active && `
    box-shadow: 0 0 0 2px ${props.theme.colors.info};
  `}

  &:hover {
    background-color: ${props => props.theme.colors.info + '10'};
  }
`;

const FieldValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 24px;
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 2px;
  background-color: ${props => props.$color || props.theme.colors.textPrimary};
  margin: 4px 0;
`;
