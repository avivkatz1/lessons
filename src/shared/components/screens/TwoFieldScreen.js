import React from "react";
import styled from "styled-components";

/**
 * TwoFieldScreen - Custom screen for UnifiedMathKeypad
 *
 * Used in GraphingLinesLesson Level 3 for rise/run input.
 * Displays two clickable fields stacked vertically with a divider between them.
 *
 * @example
 * <UnifiedMathKeypad
 *   buttonSet="basic"
 *   screen={
 *     <TwoFieldScreen
 *       fields={[
 *         { name: 'rise', label: 'Rise:', value: riseInput },
 *         { name: 'run', label: 'Run:', value: runInput }
 *       ]}
 *       activeField="rise"
 *       onFieldSwitch={setActiveField}
 *       dividerColor="#EF4444"
 *     />
 *   }
 * />
 */
const TwoFieldScreen = ({
  fields = [], // Array of { name, label, value }
  activeField, // Currently active field name
  onFieldSwitch, // Callback when field clicked
  dividerColor = "#EF4444", // Red fraction bar by default
  dividerHeight = 3, // Divider thickness in pixels
}) => {
  if (fields.length !== 2) {
    console.warn('TwoFieldScreen expects exactly 2 fields');
    return null;
  }

  const [field1, field2] = fields;

  return (
    <Container>
      <InputFieldBox
        onClick={() => onFieldSwitch && onFieldSwitch(field1.name)}
        $active={activeField === field1.name}
      >
        <FieldLabel>{field1.label}</FieldLabel>
        <FieldValue>{field1.value || "?"}</FieldValue>
      </InputFieldBox>

      <HorizontalDivider $color={dividerColor} $height={dividerHeight} />

      <InputFieldBox
        onClick={() => onFieldSwitch && onFieldSwitch(field2.name)}
        $active={activeField === field2.name}
      >
        <FieldLabel>{field2.label}</FieldLabel>
        <FieldValue>{field2.value || "?"}</FieldValue>
      </InputFieldBox>
    </Container>
  );
};

export default TwoFieldScreen;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  margin-bottom: 20px;
`;

const HorizontalDivider = styled.div`
  width: 100%;
  height: ${props => props.$height || 3}px;
  background-color: ${props => props.$color || '#EF4444'};
  margin: 0;
`;

const InputFieldBox = styled.div`
  flex: 1;
  padding: 16px;
  background-color: ${props => props.theme.colors.pageBackground};
  border: 2px solid ${props => props.$active
    ? props.theme.colors.info || '#3B82F6'
    : props.theme.colors.border};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    border-color: ${props => props.theme.colors.info || '#3B82F6'};
    background-color: ${props => props.$active
      ? props.theme.colors.pageBackground
      : props.theme.colors.cardBackground};
  }

  ${props => props.$active && `
    box-shadow: 0 0 0 3px ${props.theme.colors.info}20;
  `}
`;

const FieldLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FieldValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  min-width: 40px;
  text-align: center;
`;
