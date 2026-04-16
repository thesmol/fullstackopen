const Filter = ({ searchString, onSearchUpdate }) => {
  return (
    <div>
      filter shown with:
      <input
        value={searchString}
        onChange={onSearchUpdate}
        placeholder="Search..."
      />
    </div>
  );
};

export default Filter;
