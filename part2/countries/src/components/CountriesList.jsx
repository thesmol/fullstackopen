const CountriesList = ({ countries }) => {
  if (countries.length === 0) {
    return <div>No matches</div>;
  }

  if (countries.length > 10) {
    return <div>Too many matches, specify another filter</div>;
  }

  return (
    <div>
      {countries.map((country) => (
        <p key={country.name.official}>{country.name.common}</p>
      ))}
    </div>
  );
};

export default CountriesList;
