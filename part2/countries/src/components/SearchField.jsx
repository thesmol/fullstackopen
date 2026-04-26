const SearchField = ({ searchString, onSearchUpdate }) => {
  return (
    <div>
      <label htmlFor="search">Find countries</label>
      <input
        id="search"
        type="text"
        value={searchString}
        onChange={onSearchUpdate}
      />
    </div>
  );
};

export default SearchField;
