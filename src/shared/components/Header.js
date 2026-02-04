import React from "react";
import { IconContext } from "react-icons";
import { FaUserCircle, FaSearch } from "react-icons/fa";
import styled from "styled-components";
const Header = () => {
  return (
    <Wrapper className="header">
      <div className="header-group">
        <IconContext.Provider value={{ className: "search-icon" }}>
          <FaSearch size={28} />
        </IconContext.Provider>
        <input type="text" className="search-bar header-item" />
        <IconContext.Provider value={{ color: "#00BF63", size: "30px", className: "header-item" }}>
          <FaUserCircle />
        </IconContext.Provider>
      </div>
    </Wrapper>
  );
};

export default Header;

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
  }

  .search-icon:hover {
    background-color: #ddd;
    border-radius: 4px;
  }

  .search-bar {
    background-color: #f1efef;
    border: 1px solid black;
    border-radius: 4px;
    font-family: monospace;
    padding: 8px 10px;
    font-size: 14px;
    width: 120px;
    max-width: 40vw;
    transition: width 0.2s;
  }

  .search-bar:focus {
    outline: 2px solid #00bf63;
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
