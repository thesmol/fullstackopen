import Person from "./Person";

const PersonsList = ({ persons }) => {
  return (
    <div>
      {persons.map((person) => {
        return <Person key={person.id} person={person} />;
      })}
    </div>
  );
};

export default PersonsList;
