import React, { useCallback } from "react";
import styled from "styled-components";

/**
 * FractionKeypad - Compact 3-column keypad for fraction input
 *
 * Designed for algebra lessons requiring fraction answers (AddingFractions, etc.)
 * Simplified layout optimized for fraction entry (numerator/denominator).
 *
 * Layout (3 columns × 5 rows + keep open):
 *   [ 7 ] [ 8 ] [ 9 ]
 *   [ 4 ] [ 5 ] [ 6 ]
 *   [ 1 ] [ 2 ] [ 3 ]
 *   [ 0 ] [ / ] [ ⌫ ]
 *   [ C ] [Submit ✓]
 *   ☐ Keep this open
 *
 * Features:
 * - Sequential input: "3" → "/" → "4" = "3/4"
 * - Validation: max 1 slash, numerator AND denominator required
 * - Submit disabled until valid fraction entered
 * - 56px touch targets (iPad optimized)
 * - "Keep this open" feature for rapid problem solving
 *
 * Valid formats: "3/4", "12/5", "2/1", "6/8" (unsimplified allowed)
 * Invalid: "3/", "/4", "3//4", "", "3/0" (zero denominator)
 */
const FractionKeypad = ({
  value = "",
  onChange,
  onSubmit,
  keepOpen = false,
  onKeepOpenChange = null
}) => {
  // Digit handler
  const handleDigit = useCallback(
    (digit) => {
      onChange(value + digit);
    },
    [value, onChange]
  );

  // Slash handler (only allow one slash)
  const handleSlash = useCallback(() => {
    if (!value.includes("/")) {
      onChange(value + "/");
    }
  }, [value, onChange]);

  // Backspace handler
  const handleBackspace = useCallback(() => {
    onChange(value.slice(0, -1));
  }, [value, onChange]);

  // Clear handler
  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  // Submit handler with validation
  const handleSubmit = useCallback(() => {
    // Validate before submitting
    if (!value.includes("/")) return;
    const [num, den] = value.split("/");
    if (num && den && !isNaN(num) && !isNaN(den) && Number(den) !== 0) {
      if (onSubmit) {
        onSubmit();
      }
    }
  }, [value, onSubmit]);

  // Check if submit should be enabled
  const canSubmit = (() => {
    if (!value.includes("/")) return false;
    const [num, den] = value.split("/");
    return num && den && !isNaN(num) && !isNaN(den) && Number(den) !== 0;
  })();

  return (
    <KeypadContainer>
      {/* Display area shows current value */}
      <DisplayArea>
        <DisplayText>{value || "0"}</DisplayText>
      </DisplayArea>

      {/* Key grid */}
      <KeyGrid>
        {/* Row 1: 7 8 9 */}
        <KeyRow>
          <Key onClick={() => handleDigit("7")}>7</Key>
          <Key onClick={() => handleDigit("8")}>8</Key>
          <Key onClick={() => handleDigit("9")}>9</Key>
        </KeyRow>

        {/* Row 2: 4 5 6 */}
        <KeyRow>
          <Key onClick={() => handleDigit("4")}>4</Key>
          <Key onClick={() => handleDigit("5")}>5</Key>
          <Key onClick={() => handleDigit("6")}>6</Key>
        </KeyRow>

        {/* Row 3: 1 2 3 */}
        <KeyRow>
          <Key onClick={() => handleDigit("1")}>1</Key>
          <Key onClick={() => handleDigit("2")}>2</Key>
          <Key onClick={() => handleDigit("3")}>3</Key>
        </KeyRow>

        {/* Row 4: 0 / ⌫ */}
        <KeyRow>
          <Key onClick={() => handleDigit("0")}>0</Key>
          <Key onClick={handleSlash}>/</Key>
          <Key onClick={handleBackspace} aria-label="Backspace">
            ⌫
          </Key>
        </KeyRow>

        {/* Row 5: C Submit */}
        <KeyRow>
          <Key onClick={handleClear}>C</Key>
          <SubmitKey
            onClick={handleSubmit}
            disabled={!canSubmit}
            $canSubmit={canSubmit}
            aria-label="Submit"
          >
            Submit ✓
          </SubmitKey>
        </KeyRow>
      </KeyGrid>

      {/* Keep this open checkbox */}
      {onKeepOpenChange && (
        <KeepOpenRow>
          <KeepOpenCheckbox
            type="checkbox"
            id="keepOpenFraction"
            checked={keepOpen}
            onChange={(e) => onKeepOpenChange(e.target.checked)}
          />
          <KeepOpenLabel htmlFor="keepOpenFraction">
            Keep this open
          </KeepOpenLabel>
        </KeepOpenRow>
      )}
    </KeypadContainer>
  );
};

export default FractionKeypad;

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
  font-size: 22px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s, opacity 0.2s;
  background-color: ${(props) => props.theme.colors.pageBackground};
  color: ${(props) => props.theme.colors.textPrimary};

  &:active {
    transform: scale(0.95);
  }

  &:hover:not(:active) {
    opacity: 0.9;
  }

  @media (max-width: 1024px) {
    min-height: 48px;
    font-size: 20px;
  }
`;

const SubmitKey = styled.button`
  flex: 2; /* Spans 2 columns */
  min-height: 56px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: ${(props) => (props.$canSubmit ? "pointer" : "not-allowed")};
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s, opacity 0.2s;
  background-color: ${(props) =>
    props.$canSubmit ? props.theme.colors.info : props.theme.colors.border};
  color: ${(props) =>
    props.$canSubmit ? props.theme.colors.textInverted : props.theme.colors.textSecondary};
  opacity: ${(props) => (props.$canSubmit ? 1 : 0.5)};

  &:active {
    transform: ${(props) => (props.$canSubmit ? "scale(0.95)" : "none")};
  }

  &:hover:not(:active) {
    opacity: ${(props) => (props.$canSubmit ? 0.9 : 0.5)};
  }

  @media (max-width: 1024px) {
    min-height: 48px;
    font-size: 13px;
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
