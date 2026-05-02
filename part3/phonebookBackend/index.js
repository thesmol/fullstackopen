const express = require("express");
const app = express();
app.use(express.json());

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (request, response) => {
  const now = new Date(Date.now());
  const personsCount = persons.length;

  const html = `
  <div>
    <h3>Phonebook has info for ${personsCount} people</h3>
    <p>${now}</p>
  </div>
  `;

  response.send(html);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const note = persons.find((note) => note.id === id);

  if (note) {
    response.json(note);
  } else {
    response.statusMessage = `Person with ID ${id} not found`;
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const randomId = Math.floor(Math.random() * 10000000000);
  return String(randomId);
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.phone) {
    return response.status(400).json({
      error: "name or number are missing",
    });
  }

  const isDuplicate = persons.some((person) => person.name === body.name);
  if (isDuplicate) {
    return response.status(400).json({
      error: `name "${body.name}" is already in the phonebook`,
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    phone: body.phone,
  };

  persons = persons.concat(person);

  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
