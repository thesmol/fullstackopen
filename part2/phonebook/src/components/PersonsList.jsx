import Person from "./Person";

const PersonsList = ({ persons, deletePerson }) => {
  return (
    <div>
      {persons.map((person) => {
        return (
          <Person
            key={person.id}
            person={person}
            deletePerson={() => deletePerson(person)}
          />
        );
      })}
    </div>
  );
};

export default PersonsList;
