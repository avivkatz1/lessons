import { useState, useCallback, useEffect } from "react";

/**
 * useInputOverlay - State management hook for InputOverlayPanel
 *
 * Manages the state for the input overlay panel system used in
 * algebra lessons (SubtractingIntegersLesson). Handles panel visibility, input value,
 * and submission state.
 *
 * Usage:
 *   const { panelOpen, inputValue, setInputValue, openPanel, closePanel } = useInputOverlay();
 *
 *   <EnterAnswerButton onClick={openPanel} />
 *   <InputOverlayPanel visible={panelOpen} onClose={closePanel}>
 *     <SlimMathKeypad value={inputValue} onChange={setInputValue} />
 *   </InputOverlayPanel>
 *
 * @returns {Object} Panel state and control functions
 * @returns {boolean} panelOpen - Whether the panel is currently visible
 * @returns {string} inputValue - Current input value
 * @returns {boolean} submitted - Whether the answer has been submitted
 * @returns {Function} setInputValue - Update the input value
 * @returns {Function} setSubmitted - Update the submitted state
 * @returns {Function} openPanel - Open the panel
 * @returns {Function} closePanel - Close the panel
 * @returns {Function} resetInput - Clear input and reset submitted state
 * @returns {Function} resetAll - Close panel and clear all state
 * @returns {boolean} keepOpen - Whether to keep panel open after correct answer
 * @returns {Function} setKeepOpen - Update the keep open preference
 */
export function useInputOverlay() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Keep Open state - persists to localStorage
  const [keepOpen, setKeepOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('mathKeypadKeepOpen');
      return saved === 'true';
    } catch (error) {
      return false; // Default to OFF
    }
  });

  // Save keepOpen preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mathKeypadKeepOpen', String(keepOpen));
    } catch (error) {
      // Silently fail if localStorage is unavailable
    }
  }, [keepOpen]);

  /**
   * Open the input panel
   */
  const openPanel = useCallback(() => {
    setPanelOpen(true);
  }, []);

  /**
   * Close the input panel
   */
  const closePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  /**
   * Clear input value and reset submitted state
   */
  const resetInput = useCallback(() => {
    setInputValue("");
    setSubmitted(false);
  }, []);

  /**
   * Close panel and clear all state (for problem transitions)
   */
  const resetAll = useCallback(() => {
    setPanelOpen(false);
    setInputValue("");
    setSubmitted(false);
  }, []);

  return {
    // State
    panelOpen,
    inputValue,
    submitted,
    keepOpen,

    // Setters
    setInputValue,
    setSubmitted,
    setKeepOpen,

    // Actions
    openPanel,
    closePanel,
    resetInput,
    resetAll,
  };
}
