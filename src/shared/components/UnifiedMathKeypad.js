import React, { useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import FractionDisplay from "./FractionDisplay";

/**
 * UnifiedMathKeypad - Consolidated math input component
 *
 * Replaces: MathKeypad, SlimMathKeypad, FractionKeypad
 *
 * Features:
 * - Configurable button sets (basic, full, fraction)
 * - Custom screen components (TwoFieldScreen, FractionScreen, etc.)
 * - Fraction mode with stacked display
 * - Extra buttons append to button set
 * - "Keep this open" checkbox
 * - Random number generator
 * - iPad-optimized touch targets (48-56px)
 * - Inline layout (bottom-sheet mode deferred to Phase 2)
 *
 * @example
 * // Basic usage
 * <UnifiedMathKeypad
 *   value={value}
 *   onChange={setValue}
 *   buttonSet="basic"
 * />
 *
 * @example
 * // With custom screen (GraphingLines L3 pattern)
 * <UnifiedMathKeypad
 *   buttonSet="basic"
 *   screen={<TwoFieldScreen fields={...} />}
 * />
 *
 * @example
 * // With fraction mode
 * <UnifiedMathKeypad
 *   buttonSet="full"
 *   fractionMode={true}
 * />
 */

// ==================== BUTTON SET PRESETS ====================

const BUTTON_SETS = {
  basic: {
    // 3 columns, 5 rows (from SlimMathKeypad)
    columns: 3,
    layout: [
      ['7', '8', '9'],
      ['4', '5', '6'],
      ['1', '2', '3'],
      ['0', '.', '⌫'],
      ['C', '-', null], // null = placeholder for random/extraButtons
    ],
  },

  full: {
    // 4 columns, 5 rows (from MathKeypad)
    columns: 4,
    layout: [
      ['7', '8', '9', '⌫'],
      ['4', '5', '6', 'C'],
      ['1', '2', '3', '-'],
      ['0', '.', ',', 'Space'],
      ['(', ')', '⬜/⬜', null], // null = placeholder for submit button if needed
    ],
  },

  fraction: {
    // 3 columns, 5 rows (from FractionKeypad)
    columns: 3,
    layout: [
      ['7', '8', '9'],
      ['4', '5', '6'],
      ['1', '2', '3'],
      ['0', '/', '⌫'],
      ['C', { type: 'submit', span: 2 }], // Submit button spans 2 columns
    ],
  },
};

// ==================== MAIN COMPONENT ====================

const UnifiedMathKeypad = ({
  // Core functionality
  value = "",
  onChange,
  onSubmit,

  // Layout & Display
  layout = "inline", // "inline" | "bottom-sheet" (Phase 2)
  columns, // Auto-set by buttonSet, or override
  visible = true, // For bottom-sheet mode (Phase 2)
  onClose, // For bottom-sheet mode (Phase 2)

  // Screen component
  screen = null, // Custom screen component (TwoFieldScreen, FractionScreen, etc.)
  hideDisplay = false, // Hide default display (when using custom screen)

  // Button configuration
  buttonSet = "basic", // "basic" | "full" | "fraction"
  extraButtons = [], // Additional buttons to append (e.g., ["/", "x", "y", "="])
  includeRandom = false, // Add random number button

  // Fraction mode (built-in stacked display)
  fractionMode = false,
  activeField = "numerator", // "numerator" | "denominator"
  onFieldSwitch, // Callback when switching fraction fields

  // Validation & Submit
  enableSubmit = false, // Show submit button in keypad
  submitLabel = "Submit",
  submitDisabled = false,

  // Keep open feature
  showKeepOpen = false,
  keepOpen = false,
  onKeepOpenChange,

  // Styling
  minHeight = 48,
  spacing = 8,
}) => {
  // ==================== STATE ====================

  const [internalFractionMode, setInternalFractionMode] = useState(false);
  const [internalActiveField, setInternalActiveField] = useState("numerator");

  const activeFractionMode = fractionMode || internalFractionMode;
  const currentActiveField = onFieldSwitch ? activeField : internalActiveField;

  // ==================== HELPERS ====================

  // Parse value into numerator/denominator for fraction mode
  const parseFraction = useCallback((val) => {
    if (!val || !val.includes("/")) {
      return { numerator: val || "", denominator: "" };
    }
    const parts = val.split("/");
    return { numerator: parts[0] || "", denominator: parts[1] || "" };
  }, []);

  const { numerator, denominator } = parseFraction(value);

  // Build fraction value from numerator and denominator
  const buildFractionValue = useCallback((num, den) => {
    return `${num}/${den}`;
  }, []);

  // ==================== HANDLERS ====================

  const handleDigit = useCallback((digit) => {
    if (activeFractionMode) {
      const { numerator: num, denominator: den } = parseFraction(value);
      if (currentActiveField === "numerator") {
        onChange(buildFractionValue(num + digit, den));
      } else {
        onChange(buildFractionValue(num, den + digit));
      }
    } else {
      onChange(value + digit);
    }
  }, [activeFractionMode, currentActiveField, value, onChange, parseFraction, buildFractionValue]);

  const handleDecimal = useCallback(() => {
    if (activeFractionMode) {
      const { numerator: num, denominator: den } = parseFraction(value);
      if (currentActiveField === "numerator") {
        if (!num.includes(".")) {
          onChange(buildFractionValue(num + ".", den));
        }
      } else {
        if (!den.includes(".")) {
          onChange(buildFractionValue(num, den + "."));
        }
      }
    } else {
      if (!value.includes(".")) {
        onChange(value + ".");
      }
    }
  }, [activeFractionMode, currentActiveField, value, onChange, parseFraction, buildFractionValue]);

  const handleBackspace = useCallback(() => {
    if (activeFractionMode) {
      const { numerator: num, denominator: den } = parseFraction(value);
      if (currentActiveField === "numerator") {
        onChange(buildFractionValue(num.slice(0, -1), den));
      } else {
        onChange(buildFractionValue(num, den.slice(0, -1)));
      }
    } else {
      onChange(value.slice(0, -1));
    }
  }, [activeFractionMode, currentActiveField, value, onChange, parseFraction, buildFractionValue]);

  const handleClear = useCallback(() => {
    if (activeFractionMode) {
      onChange(buildFractionValue("", ""));
    } else {
      onChange("");
    }
  }, [activeFractionMode, onChange, buildFractionValue]);

  const handleMinus = useCallback(() => {
    if (activeFractionMode) {
      const { numerator: num, denominator: den } = parseFraction(value);
      if (currentActiveField === "numerator") {
        const toggled = num.startsWith("-") ? num.slice(1) : "-" + num;
        onChange(buildFractionValue(toggled, den));
      } else {
        const toggled = den.startsWith("-") ? den.slice(1) : "-" + den;
        onChange(buildFractionValue(num, toggled));
      }
    } else {
      // For general use and coordinates, append minus
      onChange(value + "-");
    }
  }, [activeFractionMode, currentActiveField, value, onChange, parseFraction, buildFractionValue]);

  const handleFractionToggle = useCallback(() => {
    if (activeFractionMode) {
      // Exiting fraction mode
      setInternalFractionMode(false);
      setInternalActiveField("numerator");
    } else {
      // Entering fraction mode
      setInternalFractionMode(true);
      setInternalActiveField("numerator");
      if (value && !value.includes("/")) {
        onChange(value + "/");
      } else if (!value) {
        onChange("/");
      }
    }
  }, [activeFractionMode, value, onChange]);

  const handleFieldSwitch = useCallback((field) => {
    if (onFieldSwitch) {
      onFieldSwitch(field);
    } else {
      setInternalActiveField(field);
    }
  }, [onFieldSwitch]);

  const handleRandom = useCallback(() => {
    const randomNum = Math.floor(Math.random() * 101);
    onChange(String(randomNum));
  }, [onChange]);

  const handleCharacter = useCallback((char) => {
    onChange(value + char);
  }, [value, onChange]);

  const handleComma = useCallback(() => {
    onChange(value + ",");
  }, [value, onChange]);

  const handleLeftParen = useCallback(() => {
    onChange(value + "(");
  }, [value, onChange]);

  const handleRightParen = useCallback(() => {
    onChange(value + ")");
  }, [value, onChange]);

  const handleSpace = useCallback(() => {
    onChange(value + " ");
  }, [value, onChange]);

  const handleSubmit = useCallback(() => {
    if (onSubmit && !submitDisabled) {
      onSubmit();
    }
  }, [onSubmit, submitDisabled]);

  // ==================== BUTTON CONFIGURATION ====================

  // Get base button set
  const baseSet = BUTTON_SETS[buttonSet] || BUTTON_SETS.basic;
  const effectiveColumns = columns || baseSet.columns;

  // Build button grid
  const keys = useMemo(() => {
    let grid = [...baseSet.layout.map(row => [...row])];

    // Replace null placeholders
    grid = grid.map((row, rowIdx) => {
      return row.map((key, colIdx) => {
        // Handle submit button object
        if (typeof key === 'object' && key?.type === 'submit') {
          return {
            label: submitLabel,
            action: handleSubmit,
            type: 'submit',
            span: key.span || 1,
            disabled: submitDisabled,
          };
        }

        // Handle null placeholders
        if (key === null) {
          // In basic set row 5, replace with Random if includeRandom
          if (buttonSet === 'basic' && rowIdx === 4 && colIdx === 2 && includeRandom) {
            return { label: "Random", action: handleRandom, type: "action" };
          }
          // Otherwise, keep as null (will be skipped in render)
          return null;
        }

        // Map button labels to actions
        const actionMap = {
          '0': () => handleDigit('0'),
          '1': () => handleDigit('1'),
          '2': () => handleDigit('2'),
          '3': () => handleDigit('3'),
          '4': () => handleDigit('4'),
          '5': () => handleDigit('5'),
          '6': () => handleDigit('6'),
          '7': () => handleDigit('7'),
          '8': () => handleDigit('8'),
          '9': () => handleDigit('9'),
          '.': handleDecimal,
          '⌫': handleBackspace,
          'C': handleClear,
          '-': handleMinus,
          '\u2212': handleMinus, // Unicode minus
          ',': handleComma,
          '(': handleLeftParen,
          ')': handleRightParen,
          'Space': handleSpace,
          '⬜/⬜': handleFractionToggle,
          '/': () => handleCharacter('/'),
        };

        return {
          label: key,
          action: actionMap[key] || (() => handleCharacter(key)),
          type: ['⌫', 'C', '-', '\u2212', 'Space'].includes(key) ? 'action' : undefined,
        };
      });
    });

    // Append extraButtons as new row(s)
    if (extraButtons.length > 0) {
      const extraRow = extraButtons.map(char => ({
        label: char,
        action: () => handleCharacter(char),
        type: 'action',
      }));
      grid.push(extraRow);
    }

    // Add submit button if enableSubmit and not already present
    if (enableSubmit && buttonSet !== 'fraction') {
      grid.push([{
        label: submitLabel,
        action: handleSubmit,
        type: 'submit',
        span: effectiveColumns,
        disabled: submitDisabled,
      }]);
    }

    return grid;
  }, [
    baseSet,
    buttonSet,
    extraButtons,
    includeRandom,
    enableSubmit,
    submitLabel,
    submitDisabled,
    effectiveColumns,
    handleDigit,
    handleDecimal,
    handleBackspace,
    handleClear,
    handleMinus,
    handleComma,
    handleLeftParen,
    handleRightParen,
    handleSpace,
    handleFractionToggle,
    handleRandom,
    handleCharacter,
    handleSubmit,
  ]);

  // ==================== RENDER ====================

  return (
    <KeypadContainer $spacing={spacing}>
      {/* Custom screen OR default display */}
      {screen ? (
        <ScreenWrapper>{screen}</ScreenWrapper>
      ) : !hideDisplay ? (
        <DisplayArea>
          <DisplayText>{value || "0"}</DisplayText>
        </DisplayArea>
      ) : null}

      {/* Fraction mode display (if enabled and no custom screen) */}
      {activeFractionMode && !screen && (
        <FractionArea>
          <FractionDisplay
            numerator={numerator}
            denominator={denominator}
            activeField={currentActiveField}
            onFieldSwitch={handleFieldSwitch}
          />
        </FractionArea>
      )}

      {/* Button grid */}
      <KeyGrid $spacing={spacing}>
        {keys.map((row, rowIndex) => (
          <KeyRow key={rowIndex} $spacing={spacing}>
            {row.map((key, colIndex) => {
              if (!key) return null; // Skip null placeholders

              const keyId = `${rowIndex}-${colIndex}`;

              return (
                <Key
                  key={keyId}
                  onClick={key.action}
                  $type={key.type}
                  $span={key.span || 1}
                  $minHeight={minHeight}
                  $fractionActive={key.label === '⬜/⬜' && activeFractionMode}
                  disabled={key.disabled}
                  aria-label={key.label === '⌫' ? 'Backspace' : key.label === '\u2212' ? 'Minus' : key.label}
                >
                  {key.label}
                </Key>
              );
            })}
          </KeyRow>
        ))}
      </KeyGrid>

      {/* Keep this open checkbox */}
      {showKeepOpen && onKeepOpenChange && (
        <KeepOpenRow>
          <KeepOpenCheckbox
            type="checkbox"
            checked={keepOpen}
            onChange={(e) => onKeepOpenChange(e.target.checked)}
          />
          <KeepOpenLabel onClick={() => onKeepOpenChange(!keepOpen)}>
            Keep this open
          </KeepOpenLabel>
        </KeepOpenRow>
      )}
    </KeypadContainer>
  );
};

export default UnifiedMathKeypad;

// ==================== STYLED COMPONENTS ====================

const KeypadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$spacing || 8}px;
  width: 100%;
`;

const ScreenWrapper = styled.div`
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
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace;
  letter-spacing: 0.5px;
  word-break: break-all;

  @media (max-width: 1024px) {
    font-size: 24px;
    letter-spacing: 0.3px;
  }
`;

const FractionArea = styled.div`
  padding: 4px 8px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  margin-bottom: 4px;

  @media (max-width: 1024px) {
    padding: 2px 6px 0;
    margin-bottom: 2px;
  }
`;

const KeyGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$spacing || 8}px;

  @media (max-width: 1024px) {
    gap: ${props => Math.max(3, (props.$spacing || 8) - 2)}px;
  }
`;

const KeyRow = styled.div`
  display: flex;
  gap: ${props => props.$spacing || 8}px;

  @media (max-width: 1024px) {
    gap: ${props => Math.max(3, (props.$spacing || 8) - 2)}px;
  }
`;

const Key = styled.button`
  flex: ${props => props.$span || 1};
  min-height: ${props => props.$minHeight || 48}px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  font-size: ${(props) => {
    if (props.$type === "submit") return "15px";
    if (props.$type === "space") return "14px";
    return "22px";
  }};
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s, opacity 0.2s;

  background-color: ${(props) => {
    if (props.$type === "submit") return props.theme.colors.info;
    if (props.$fractionActive) return props.theme.colors.warning;
    return props.theme.colors.pageBackground;
  }};

  color: ${(props) => {
    if (props.$type === "submit") return props.theme.colors.textInverted;
    if (props.$fractionActive) return props.theme.colors.textInverted;
    return props.theme.colors.textPrimary;
  }};

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:hover:not(:active):not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 1024px) {
    min-height: ${props => Math.max(36, (props.$minHeight || 48) - 12)}px;
    border-radius: 6px;
    font-size: ${(props) => {
      if (props.$type === "submit") return "13px";
      if (props.$type === "space") return "11px";
      return "20px";
    }};
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
