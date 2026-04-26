import { useEffect, useState } from "react";
import PersonsList from "./components/PersonsList";
import Filter from "./components/Filter";
import NewPersonForm from "./components/NewPersonForm";
import personsService from "./services/personsService";
import SuccessNotification from "./components/Notification";

const App = () => {
  const [persons, setPersons] = useState([]);

  const [newPerson, setNewPerson] = useState({
    name: "",
    number: "",
  });

  const [filterName, setFilterName] = useState("");
  const [notification, setNotification] = useState(null);

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

  const changeNumber = (event) => {
    setNewPerson({ ...newPerson, number: event.target.value });
  };

  const findExistingPerson = () => {
    return persons.find((p) => p.name === newPerson.name);
  };

  const updatePerson = (person) => {
    if (
      window.confirm(
        `${person.name} ia already added to the phonebook, 
        replace the old number with a new one?`,
      )
    ) {
      personsService
        .update(person.id, { ...person, number: newPerson.number })
        .then((updatedPerson) => {
          setPersons(
            persons.map((p) => (p.id === updatedPerson.id ? updatedPerson : p)),
          );
        })
        .catch((error) => {
          if (error.response.status === 404) {
            setPersons(persons.filter((p) => p.id !== person.id));
            setNotification({
              message: `Information about '${person.name}' has already been removed from the server.`,
              type: "error",
            });
            setTimeout(() => {
              setNotification(null);
            }, 5000);
          }
        })
        .finally(() => {
          setNewPerson({ name: "", number: "" });
        });
    }
  };

  const addNewPerson = (event) => {
    event.preventDefault();

    if (newPerson.name === "" || newPerson.number === "") {
      alert("Please fill in both name and phone fields.");
      return;
    }

    const existingPerson = findExistingPerson();

    if (existingPerson) {
      updatePerson(existingPerson);
      return;
    }

    personsService.create(newPerson).then((addedPerson) => {
      setPersons(persons.concat(addedPerson));
      setNewPerson({ name: "", number: "" });

      setNotification({
        message: `Added '${addedPerson.name}'`,
        type: "success",
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
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
      <SuccessNotification
        message={notification?.message}
        type={notification?.type}
      />
      <Filter searchString={filterName} onSearchUpdate={changeFilter} />
      <h3>Add a new</h3>
      <NewPersonForm
        newPerson={newPerson}
        onNameChange={changeName}
        onPhoneChange={changeNumber}
        onSubmit={addNewPerson}
      />
      <h3>Numbers</h3>
      <PersonsList persons={filteredPersons} deletePerson={deletePerson} />
    </div>
  );
};

export default App;
