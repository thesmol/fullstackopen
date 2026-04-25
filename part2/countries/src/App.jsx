import { useState } from "react";
import SearchField from "./components/SearchField";
import countryService from "./services/countryService";
import Country from "./components/Country";
import CountriesList from "./components/CountriesList";
import { useEffect } from "react";

function App() {
  const [searchString, setSearchString] = useState("");
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    countryService.getAll().then((countries) => setCountries(countries));
  }, []);

  const searchLowered = searchString.toLowerCase();
  const filteredCountries =
    searchLowered.length > 0
      ? countries.filter((country) => {
          return (
            country.name.common.toLowerCase().includes(searchLowered) ||
            country.name.official.toLowerCase().includes(searchLowered)
          );
        })
      : [];

  let searchResult;
  if (filteredCountries.length === 1) {
    searchResult = <Country country={filteredCountries[0]} />;
  } else {
    searchResult = <CountriesList countries={filteredCountries} />;
  }

  return (
    <div>
      <SearchField
        searchString={searchString}
        onSearchUpdate={(event) => setSearchString(event.target.value)}
      />
      {searchResult}
    </div>
  );
}

export default App;
