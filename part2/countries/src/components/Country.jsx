import BasicData from "./BasicData";
import Languages from "./Languages";

const Country = ({ country }) => {
  return (
    <div>
      <h1>{country.name.common}</h1>
      <BasicData country={country} />
      <Languages country={country} />
      <img src={country.flags.png} alt={`Flag of ${country.name.common}`} />
    </div>
  );
};

export default Country;
