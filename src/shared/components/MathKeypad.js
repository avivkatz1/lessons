import React, { useState, useCallback } from "react";
import styled from "styled-components";
import FractionDisplay from "./FractionDisplay";

/**
 * MathKeypad is a bottom-sheet custom keypad for touch devices (iPad).
 * It replaces the native iOS keyboard to avoid covering the Konva canvas.
 *
 * Layout (4 rows):
 *   [ 7 ] [ 8 ] [ 9 ] [ backspace ]
 *   [ 4 ] [ 5 ] [ 6 ] [ C ]
 *   [ 1 ] [ 2 ] [ 3 ] [ minus ]
 *   [ 0 ] [ . ] [ fraction ] [ Submit ]
 *
 * Supports fraction mode: when active, a FractionDisplay appears above the
 * keypad and number keys target the active field (numerator or denominator).
 */
const MathKeypad = ({ value = "", onChange, onSubmit, onClose, visible }) => {
  const [fractionMode, setFractionMode] = useState(false);
  const [activeField, setActiveField] = useState("numerator");

  // Parse value into numerator/denominator when in fraction mode
  const parseFraction = useCallback(
    (val) => {
      if (!val || !val.includes("/")) {
        return { numerator: val || "", denominator: "" };
      }
      const parts = val.split("/");
      return { numerator: parts[0] || "", denominator: parts[1] || "" };
    },
    []
  );

  const { numerator, denominator } = parseFraction(value);

  // Build the value string from numerator and denominator
  const buildFractionValue = useCallback((num, den) => {
    return `${num}/${den}`;
  }, []);

  const handleDigit = useCallback(
    (digit) => {
      if (fractionMode) {
        const { numerator: num, denominator: den } = parseFraction(value);
        if (activeField === "numerator") {
          onChange(buildFractionValue(num + digit, den));
        } else {
          onChange(buildFractionValue(num, den + digit));
        }
      } else {
        onChange(value + digit);
      }
    },
    [fractionMode, activeField, value, onChange, parseFraction, buildFractionValue]
  );

  const handleDecimal = useCallback(() => {
    if (fractionMode) {
      const { numerator: num, denominator: den } = parseFraction(value);
      if (activeField === "numerator") {
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
  }, [fractionMode, activeField, value, onChange, parseFraction, buildFractionValue]);

  const handleBackspace = useCallback(() => {
    if (fractionMode) {
      const { numerator: num, denominator: den } = parseFraction(value);
      if (activeField === "numerator") {
        onChange(buildFractionValue(num.slice(0, -1), den));
      } else {
        onChange(buildFractionValue(num, den.slice(0, -1)));
      }
    } else {
      onChange(value.slice(0, -1));
    }
  }, [fractionMode, activeField, value, onChange, parseFraction, buildFractionValue]);

  const handleClear = useCallback(() => {
    if (fractionMode) {
      onChange(buildFractionValue("", ""));
    } else {
      onChange("");
    }
  }, [fractionMode, onChange, buildFractionValue]);

  const handleMinus = useCallback(() => {
    if (fractionMode) {
      const { numerator: num, denominator: den } = parseFraction(value);
      if (activeField === "numerator") {
        const toggled = num.startsWith("-") ? num.slice(1) : "-" + num;
        onChange(buildFractionValue(toggled, den));
      } else {
        const toggled = den.startsWith("-") ? den.slice(1) : "-" + den;
        onChange(buildFractionValue(num, toggled));
      }
    } else {
      const toggled = value.startsWith("-") ? value.slice(1) : "-" + value;
      onChange(toggled);
    }
  }, [fractionMode, activeField, value, onChange, parseFraction, buildFractionValue]);

  const handleFractionToggle = useCallback(() => {
    if (fractionMode) {
      // Exiting fraction mode: keep the fraction string as-is
      setFractionMode(false);
      setActiveField("numerator");
    } else {
      // Entering fraction mode: convert current value to fraction format
      setFractionMode(true);
      setActiveField("numerator");
      if (value && !value.includes("/")) {
        // Put existing value as numerator
        onChange(value + "/");
      } else if (!value) {
        onChange("/");
      }
    }
  }, [fractionMode, value, onChange]);

  const handleFieldSwitch = useCallback((field) => {
    setActiveField(field);
  }, []);

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit();
    }
  }, [onSubmit]);

  const handleOverlayClick = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Key definitions for the 4-row layout
  const keys = [
    [
      { label: "7", action: () => handleDigit("7") },
      { label: "8", action: () => handleDigit("8") },
      { label: "9", action: () => handleDigit("9") },
      { label: "\u232B", action: handleBackspace, type: "action" },
    ],
    [
      { label: "4", action: () => handleDigit("4") },
      { label: "5", action: () => handleDigit("5") },
      { label: "6", action: () => handleDigit("6") },
      { label: "C", action: handleClear, type: "action" },
    ],
    [
      { label: "1", action: () => handleDigit("1") },
      { label: "2", action: () => handleDigit("2") },
      { label: "3", action: () => handleDigit("3") },
      { label: "\u2212", action: handleMinus, type: "action" },
    ],
    [
      { label: "0", action: () => handleDigit("0") },
      { label: ".", action: handleDecimal },
      {
        label: "\u25AD/\u25AD",
        action: handleFractionToggle,
        type: "fraction",
      },
      { label: "Submit", action: handleSubmit, type: "submit" },
    ],
  ];

  return (
    <>
      {visible && <Overlay onClick={handleOverlayClick} />}
      <KeypadContainer $visible={visible}>
        {fractionMode && (
          <FractionArea>
            <FractionDisplay
              numerator={numerator}
              denominator={denominator}
              activeField={activeField}
              onFieldSwitch={handleFieldSwitch}
            />
          </FractionArea>
        )}
        <KeyGrid>
          {keys.map((row, rowIndex) => (
            <KeyRow key={rowIndex}>
              {row.map((key) => (
                <Key
                  key={key.label}
                  onClick={key.action}
                  $type={key.type}
                  $fractionActive={key.type === "fraction" && fractionMode}
                  aria-label={key.label}
                >
                  {key.label}
                </Key>
              ))}
            </KeyRow>
          ))}
        </KeyGrid>
      </KeypadContainer>
    </>
  );
};

export default MathKeypad;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
`;

const KeypadContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-top: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(${(props) => (props.$visible ? "0" : "100%")});
  transition: transform 0.3s ease-in-out;
  padding: 8px 8px calc(8px + env(safe-area-inset-bottom, 0px)) 8px;
`;

const FractionArea = styled.div`
  padding: 4px 8px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  margin-bottom: 4px;
`;

const KeyGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const KeyRow = styled.div`
  display: flex;
  gap: 6px;
`;

const Key = styled.button`
  flex: 1;
  min-height: 48px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  font-size: ${(props) => (props.$type === "submit" ? "16px" : "20px")};
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s;

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

  &:active {
    transform: scale(0.95);
  }
`;
