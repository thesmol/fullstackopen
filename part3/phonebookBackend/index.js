require("dotenv").config();

const express = require("express");
const morgan = require("morgan");

const Person = require("./models/person");

const app = express();

app.use(express.json());

morgan.token("body", (req) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
);

app.use(express.static("dist"));

app.get("/info", (request, response) => {
  Person.countDocuments({}).then((count) => {
    const html = `
      <div>
        <h3>Phonebook has info for ${count} people</h3>
        <p>${new Date()}</p>
      </div>
    `;
    response.send(html);
  });
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  // persons = persons.filter((person) => person.id !== id);
  console.log("not implemented yet");

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "name or number are missing" });
  }

  const person = new Person({ name: body.name, number: body.number });
  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
