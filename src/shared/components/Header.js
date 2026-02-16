import React from "react";
import { IconContext } from "react-icons";
import { FaUserCircle, FaSearch, FaSun, FaMoon } from "react-icons/fa";
import styled from "styled-components";
import { useTheme } from "../../hooks";

const Header = () => {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <Wrapper className="header">
      <div className="header-group">
        <IconContext.Provider value={{ className: "search-icon" }}>
          <FaSearch size={28} />
        </IconContext.Provider>
        <input type="text" className="search-bar header-item" />
        <ToggleButton onClick={toggleTheme} aria-label="Toggle dark mode">
          {isDark ? <FaSun size={24} /> : <FaMoon size={24} />}
        </ToggleButton>
        <IconContext.Provider value={{ color: theme.colors.primary, size: "30px", className: "header-item" }}>
          <FaUserCircle />
        </IconContext.Provider>
      </div>
    </Wrapper>
  );
};

export default Header;

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textPrimary};
  transition: background-color 0.2s, color 0.2s;
  border-radius: 4px;
  margin: 0 3px;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.borderFocus};
    outline-offset: 2px;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin: 5px;
  padding: 5px;
  width: 100%;
  box-sizing: border-box;

  .header-group {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin: 5px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .header-item {
    margin: 0 3px;
    flex-shrink: 0;
  }

  .search-icon {
    margin: 5px;
    min-width: 24px;
    min-height: 24px;
    cursor: pointer;
    color: ${props => props.theme.colors.textPrimary};
  }

  .search-icon:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
    border-radius: 4px;
  }

  .search-bar {
    background-color: ${props => props.theme.colors.inputBackground};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: 4px;
    font-family: monospace;
    padding: 8px 10px;
    font-size: 14px;
    width: 120px;
    max-width: 40vw;
    transition: width 0.2s;
    color: ${props => props.theme.colors.textPrimary};
  }

  .search-bar:focus {
    outline: 2px solid ${props => props.theme.colors.borderFocus};
    width: 180px;
  }

  @media (min-width: 480px) {
    .search-bar {
      width: 150px;
    }

    .search-bar:focus {
      width: 200px;
    }
  }

  @media (min-width: 768px) {
    .search-bar {
      width: 200px;
    }

    .search-bar:focus {
      width: 280px;
    }

    .header-group {
      gap: 10px;
    }
  }
`;
