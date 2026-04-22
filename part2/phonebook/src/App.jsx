import { useEffect, useState } from "react";
import PersonsList from "./components/PersonsList";
import Filter from "./components/Filter";
import NewPersonForm from "./components/NewPersonForm";
import personsService from "./services/personsService";

const App = () => {
  const [persons, setPersons] = useState([]);

  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
  });

  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    personsService
      .getAll()
      .then((initialPersons) => setPersons(initialPersons));
  }, []);

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

    personsService.create(newPerson).then((addedPerson) => {
      setPersons(persons.concat(addedPerson));
      setNewPerson({ name: "", phone: "" });
    });
  };

  const deletePerson = (person) => {
    if (window.confirm(`Delete person ${person.name} forever?`)) {
      personsService
        .remove(person.id)
        .then((removedPerson) =>
          setPersons(persons.filter((p) => p.id !== removedPerson.id)),
        );
    }
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
      <PersonsList persons={filteredPersons} deletePerson={deletePerson} />
    </div>
  );
};

export default App;
