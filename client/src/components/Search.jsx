import { useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import "../styles/search.css";

const Search = ({ onTextChange, onSubmit }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");
  const showSearchInput = isHovered || isFocused;

  const change = ({ target: { value } }) => {
    setValue(value);
    if (onTextChange) onTextChange(value);
  };

  const submit = (e) => {
    e.preventDefault();
    setValue("");
    onSubmit(value);
  };

  return (
    <div
      className="cc-search"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <form onSubmit={submit}>
        <input
          value={value}
          onChange={change}
          style={{ display: showSearchInput ? "block" : "none" }}
          className="cc-search-input"
          placeholder={showSearchInput ? "Search for a book..." : ""}
        />
      </form>
      <SearchOutlined
        className={`cc-search-icon ${showSearchInput && "open"}`}
      />
    </div>
  );
};

export default Search;
