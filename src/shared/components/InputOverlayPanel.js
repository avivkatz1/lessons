import React from "react";
import styled from "styled-components";

/**
 * InputOverlayPanel - Slide-in panel for geometry lesson answer input
 *
 * Features:
 * - Slides in from right on desktop/tablet landscape (40% width)
 * - Full overlay on mobile/tablet portrait
 * - 300ms smooth CSS transition animation
 * - Dark mode support via theme tokens
 * - Non-dismissible backdrop (explicit close only)
 *
 * Usage:
 *   <InputOverlayPanel
 *     visible={panelOpen}
 *     onClose={() => setPanelOpen(false)}
 *     title="Calculate Area"
 *   >
 *     <input />
 *     <SlimMathKeypad />
 *   </InputOverlayPanel>
 */
const InputOverlayPanel = ({
  visible,
  onClose,
  children,
  title = "Enter Your Answer",
}) => {
  return (
    <>
      {/* Backdrop - only visible on mobile */}
      {visible && <Backdrop />}

      {/* Slide-in panel */}
      <PanelContainer $visible={visible}>
        {/* Header with title and close button */}
        <PanelHeader>
          <PanelTitle>{title}</PanelTitle>
          <CloseButton onClick={onClose} aria-label="Close panel">
            ×
          </CloseButton>
        </PanelHeader>

        {/* Scrollable content area */}
        <PanelContent>{children}</PanelContent>
      </PanelContainer>
    </>
  );
};

export default InputOverlayPanel;

// ==================== STYLED COMPONENTS ====================

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 998;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Only show on mobile - desktop has side-by-side layout */
  @media (min-width: 769px) {
    display: none;
  }
`;

const PanelContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 40%;
  min-width: 360px;
  max-width: 480px;

  background-color: ${(props) => props.theme.colors.cardBackground};
  border-left: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.12);
  z-index: 999;

  /* Smooth slide-in animation */
  transform: translateX(${(props) => (props.$visible ? "0" : "100%")});
  transition: transform 0.3s ease-in-out;

  display: flex;
  flex-direction: column;

  /* Mobile: Full screen overlay */
  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    border-left: none;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
  flex-shrink: 0;

  @media (max-width: 1024px) {
    padding: 16px 20px;
  }
`;

const PanelTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  min-height: 36px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.pageBackground};
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;

  &:hover {
    background: ${(props) => props.theme.colors.hoverBackground};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 1024px) {
    width: 32px;
    height: 32px;
    min-height: 32px;
    font-size: 24px;
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  /* Custom scrollbar for better aesthetics */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.pageBackground};
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.border};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.colors.textSecondary};
  }

  @media (max-width: 1024px) {
    padding: 20px;
    gap: 16px;
  }
`;
