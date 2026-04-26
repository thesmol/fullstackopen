const CountyListItem = ({ country, onCountyShow }) => {
  return (
    <p key={country.name.official}>
      {country.name.common}
      <button onClick={onCountyShow}>show</button>
    </p>
  );
};

export default CountyListItem;
