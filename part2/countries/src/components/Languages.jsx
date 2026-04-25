const Languages = ({ country }) => {
  return (
    <div>
      <h2>languages</h2>
      <ul>
        {Object.entries(country.languages).map(([code, name]) => (
          <li key={code}>{name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Languages;
