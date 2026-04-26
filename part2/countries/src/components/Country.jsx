import BasicData from "./BasicData";
import Languages from "./Languages";
import Weather from "./Weather";

const Country = ({ country }) => {
  return (
    <div>
      <h1>{country.name.common}</h1>
      <BasicData country={country} />
      <Languages country={country} />
      <img src={country.flags.png} alt={`Flag of ${country.name.common}`} />
      <Weather country={country} />
    </div>
  );
};

export default Country;
