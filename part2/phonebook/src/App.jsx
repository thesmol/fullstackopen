import { useState } from "react";
import PersonsList from "./components/PersonsList";
import Filter from "./components/Filter";
import NewPersonForm from "./components/NewPersonForm";

const App = () => {
  const [persons, setPersons] = useState([
    { name: "Arto Hellas", phone: "040-123456", id: 1 },
    { name: "Ada Lovelace", phone: "39-44-5323523", id: 2 },
    { name: "Dan Abramov", phone: "12-43-234345", id: 3 },
    { name: "Mary Poppendieck", phone: "39-23-6423122", id: 4 },
  ]);

  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
    id: "",
  });

  const [filterName, setFilterName] = useState("");

  const changeFilter = (event) => {
    setFilterName(event.target.value);
  };

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
      <h2>Phonebook</h2>
      <Filter searchString={filterName} onSearchUpdate={changeFilter} />
      <h3>Add a new</h3>
      <NewPersonForm
        newPerson={newPerson}
        onNameChange={changeName}
        onPhoneChange={changePhone}
        onSubmit={addNewPerson}
      />
      <h3>Numbers</h3>
      <PersonsList persons={filteredPersons} />
    </div>
  );
};

export default App;
