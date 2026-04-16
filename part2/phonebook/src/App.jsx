import { useState } from "react";

const Person = ({ name }) => {
  return <p>{name}</p>;
};

const App = () => {
  const [persons, setPersons] = useState([{ name: "Arto Hellas" }]);
  const [newName, setNewName] = useState("");

  const changeName = (event) => {
    setNewName(event.target.value);
  };

  const checkUserExists = (name) => {
    return persons.some((person) => person.name === name);
  };

  const addNewPerson = (event) => {
    event.preventDefault();

    if (checkUserExists(newName)) {
      alert(`${newName} is already added to Phonebook`);
      return;
    }

    const newPerson = {
      name: newName,
    };
    setPersons(persons.concat(newPerson));
    setNewName("");
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <form>
        <div>
          name:{" "}
          <input value={newName} onChange={changeName} placeholder="John Doe" />
        </div>
        <div>
          <button type="submit" onClick={addNewPerson}>
            add
          </button>
        </div>
      </form>
      <h2>Numbers</h2>
      {persons.map((person, index) => (
        <Person key={person.name + index} name={person.name} />
      ))}
    </div>
  );
};

export default App;
