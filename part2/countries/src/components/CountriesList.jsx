import CountyListItem from "./CountyListItem";

const CountriesList = ({ countries, onCountyShow }) => {
  if (countries.length === 0) {
    return <div>No matches</div>;
  }

  if (countries.length > 10) {
    return <div>Too many matches, specify another filter</div>;
  }

  return (
    <div>
      {countries.map((country) => (
        <CountyListItem
          key={country.name.official}
          country={country}
          onCountyShow={() => onCountyShow(country.name.common)}
        />
      ))}
    </div>
  );
};

export default CountriesList;
