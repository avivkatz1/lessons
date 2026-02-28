import React, { useCallback } from "react";
import styled from "styled-components";

/**
 * SlimMathKeypad - Compact 3-column keypad for geometry lessons (Levels 3-7)
 *
 * Simplified version of MathKeypad.js designed for:
 * - Basic number entry (whole numbers, decimals, negatives)
 * - Smaller footprint (3 columns vs 4) for side panel layout
 * - iPad-optimized touch targets (56px minimum)
 * - "Keep this open" feature for rapid problem solving
 *
 * Layout (3 columns × 5 rows + keep open):
 *   [ 7 ] [ 8 ] [ 9 ]
 *   [ 4 ] [ 5 ] [ 6 ]
 *   [ 1 ] [ 2 ] [ 3 ]
 *   [ 0 ] [ . ] [ ⌫ ]
 *   [ C ] [ - ] [Random]
 *   ☐ Keep this open
 *
 * Optional 6th row for custom characters (e.g., coordinates):
 *   extraButtons={["(", ",", ")"]} adds [ ( ] [ , ] [ ) ]
 */
const SlimMathKeypad = ({
  value = "",
  onChange,
  onSubmit,
  extraButtons = null,
  keepOpen = false,
  onKeepOpenChange = null
}) => {
  const handleDigit = useCallback(
    (digit) => {
      onChange(value + digit);
    },
    [value, onChange]
  );

  const handleDecimal = useCallback(() => {
    if (!value.includes(".")) {
      onChange(value + ".");
    }
  }, [value, onChange]);

  const handleBackspace = useCallback(() => {
    onChange(value.slice(0, -1));
  }, [value, onChange]);

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  const handleMinus = useCallback(() => {
    // Insert minus at end, or remove if last character is already minus
    if (value.endsWith("-")) {
      onChange(value.slice(0, -1)); // Remove last character
    } else {
      onChange(value + "-"); // Append minus at end
    }
  }, [value, onChange]);

  const handleRandom = useCallback(() => {
    // Generate random number between 0 and 100
    const randomNum = Math.floor(Math.random() * 101);
    onChange(String(randomNum));
  }, [onChange]);

  const handleCharacter = useCallback((char) => {
    onChange(value + char);
  }, [value, onChange]);

  // Key definitions for 3-column layout
  const baseKeys = [
    [
      { label: "7", action: () => handleDigit("7") },
      { label: "8", action: () => handleDigit("8") },
      { label: "9", action: () => handleDigit("9") },
    ],
    [
      { label: "4", action: () => handleDigit("4") },
      { label: "5", action: () => handleDigit("5") },
      { label: "6", action: () => handleDigit("6") },
    ],
    [
      { label: "1", action: () => handleDigit("1") },
      { label: "2", action: () => handleDigit("2") },
      { label: "3", action: () => handleDigit("3") },
    ],
    [
      { label: "0", action: () => handleDigit("0") },
      { label: ".", action: handleDecimal },
      { label: "\u232B", action: handleBackspace, type: "action" },
    ],
    [
      { label: "C", action: handleClear, type: "action" },
      { label: "\u2212", action: handleMinus, type: "action" },
      { label: "Random", action: handleRandom, type: "action" },
    ],
  ];

  // Add extra buttons row if provided (e.g., for coordinates)
  const keys = extraButtons
    ? [
        ...baseKeys,
        extraButtons.map((char) => ({
          label: char,
          action: () => handleCharacter(char),
          type: "action",
        })),
      ]
    : baseKeys;

  return (
    <KeypadContainer>
      {/* Display area shows current value */}
      <DisplayArea>
        <DisplayText>{value || "0"}</DisplayText>
      </DisplayArea>

      {/* Key grid */}
      <KeyGrid>
        {keys.map((row, rowIndex) => (
          <KeyRow key={rowIndex}>
            {row.map((key) => (
              <Key
                key={key.label}
                onClick={key.action}
                $type={key.type}
                aria-label={key.label === "\u232B" ? "Backspace" : key.label === "\u2212" ? "Minus" : key.label}
              >
                {key.label}
              </Key>
            ))}
          </KeyRow>
        ))}
      </KeyGrid>

      {/* Keep this open checkbox */}
      {onKeepOpenChange && (
        <KeepOpenRow>
          <KeepOpenCheckbox
            type="checkbox"
            id="keepOpen"
            checked={keepOpen}
            onChange={(e) => onKeepOpenChange(e.target.checked)}
          />
          <KeepOpenLabel htmlFor="keepOpen">
            Keep this open
          </KeepOpenLabel>
        </KeepOpenRow>
      )}
    </KeypadContainer>
  );
};

export default SlimMathKeypad;

// ==================== STYLED COMPONENTS ====================

const KeypadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const DisplayArea = styled.div`
  padding: 12px 16px;
  background-color: ${(props) => props.theme.colors.pageBackground};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 1024px) {
    padding: 10px 14px;
    min-height: 48px;
  }
`;

const DisplayText = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: right;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  letter-spacing: 0.5px;
  word-break: break-all;

  @media (max-width: 1024px) {
    font-size: 24px;
    letter-spacing: 0.3px;
  }
`;

const KeyGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 1024px) {
    gap: 6px;
  }
`;

const KeyRow = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 1024px) {
    gap: 6px;
  }
`;

const Key = styled.button`
  flex: 1;
  min-height: 56px; /* iPad-optimized touch target */
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  font-size: ${(props) => (props.$type === "submit" ? "15px" : "22px")};
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s, opacity 0.2s;

  background-color: ${(props) => {
    if (props.$type === "submit") return props.theme.colors.info;
    return props.theme.colors.pageBackground;
  }};

  color: ${(props) => {
    if (props.$type === "submit") return props.theme.colors.textInverted;
    return props.theme.colors.textPrimary;
  }};

  &:active {
    transform: scale(0.95);
  }

  &:hover:not(:active) {
    opacity: 0.9;
  }

  @media (max-width: 1024px) {
    min-height: 48px;
    font-size: ${(props) => (props.$type === "submit" ? "13px" : "20px")};
  }
`;

const KeepOpenRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 4px 4px 4px;
  justify-content: center;
`;

const KeepOpenCheckbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${(props) => props.theme.colors.info};

  @media (max-width: 1024px) {
    width: 18px;
    height: 18px;
  }
`;

const KeepOpenLabel = styled.label`
  font-size: 14px;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  user-select: none;

  @media (max-width: 1024px) {
    font-size: 13px;
  }
`;
