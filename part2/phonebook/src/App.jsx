import { useState } from "react";

const Person = ({ person }) => {
  return (
    <p>
      {person.name}, {person.phone}
    </p>
  );
};

const App = () => {
  const [persons, setPersons] = useState([
    { name: "Arto Hellas", phone: "040-1234567" },
  ]);
  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
  });

  const changeName = (event) => {
    setNewPerson({ ...newPerson, name: event.target.value });
  };

  const changePhone = (event) => {
    setNewPerson({ ...newPerson, phone: event.target.value });
  };

  const checkUserExists = () => {
    return persons.some(
      (p) => p.name === newPerson.name && p.phone === newPerson.phone,
    );
  };

  const addNewPerson = (event) => {
    event.preventDefault();

    if (newPerson.name === "" || newPerson.phone === "") {
      alert("Please fill in both name and phone fields.");
      return;
    }

    if (checkUserExists()) {
      alert(
        `${newPerson.name} with phone ${newPerson.phone} is already added to phonebook`,
      );
      return;
    }

    setPersons(persons.concat(newPerson));
    setNewPerson({ name: "", phone: "" });
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <form>
        <div>
          name:
          <input
            value={newPerson.name}
            onChange={changeName}
            placeholder="John Doe"
          />
        </div>
        <div>
          phone:
          <input
            value={newPerson.phone}
            onChange={changePhone}
            placeholder="+358..."
          />
        </div>
        <div>
          <button type="submit" onClick={addNewPerson}>
            add
          </button>
        </div>
      </form>
      <h2>Numbers</h2>
      {persons.map((person) => (
        <Person key={person.name + person.phone} person={person} />
      ))}
    </div>
  );
};

export default App;
