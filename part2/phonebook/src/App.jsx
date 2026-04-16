import { useState } from "react";

const Person = ({ person }) => {
  return (
    <p>
      {person.name}, {person.number}
    </p>
  );
};

const Header = ({ text }) => {
  return <h2>{text}</h2>;
};

const App = () => {
  const [persons, setPersons] = useState([
    { name: "Arto Hellas", number: "040-123456", id: 1 },
    { name: "Ada Lovelace", number: "39-44-5323523", id: 2 },
    { name: "Dan Abramov", number: "12-43-234345", id: 3 },
    { name: "Mary Poppendieck", number: "39-23-6423122", id: 4 },
  ]);

  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
    id: "",
  });

  const [filterName, setFilterName] = useState("");

  const changeName = (event) => {
    setNewPerson({ ...newPerson, name: event.target.value });
  };

  const changeFilter = (event) => {
    setFilterName(event.target.value);
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

    const newId = persons.length + 1;

    setPersons(persons.concat({ ...newPerson, id: newId }));
    setNewPerson({ name: "", phone: "", id: "" });
  };

  const filteredPersons =
    filterName.length > 0
      ? persons.filter((person) =>
          person.name.toLowerCase().includes(filterName.toLowerCase()),
        )
      : persons;

  return (
    <div>
      <Header text="Phonebook" />
      <div>
        filter shown with:
        <input
          value={filterName}
          onChange={changeFilter}
          placeholder="Search..."
        />
      </div>
      <Header text="Add a new" />
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
      <Header text="Numbers" />
      {filteredPersons.map((person) => (
        <Person key={person.id} person={person} />
      ))}
    </div>
  );
};

export default App;
