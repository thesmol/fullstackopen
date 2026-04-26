const BasicData = ({ country }) => {
  return (
    <div>
      <p>Capital: {country.capital.join(",")}</p>
      <p>Area {country.area}</p>
    </div>
  );
};

export default BasicData;
