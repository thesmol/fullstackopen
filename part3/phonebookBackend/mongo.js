const mongoose = require("mongoose");

const props = process.argv;

if (props.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = props[2];

const rawPerson = {
  name: props[3],
  number: props[4],
};

// srv doesn't work in my network for some reason
const url = `mongodb://ranzar2000_db_user:${password}@ac-imhv4ad-shard-00-00.7qlepop.mongodb.net:27017,ac-imhv4ad-shard-00-01.7qlepop.mongodb.net:27017,ac-imhv4ad-shard-00-02.7qlepop.mongodb.net:27017/phonebookApp?ssl=true&replicaSet=atlas-tbwqy2-shard-0&authSource=admin&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url, { family: 4 });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (!rawPerson?.name || !rawPerson?.number) {
  Person.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((person) => {
      console.log(person.name, " ", person.number);
    });
    mongoose.connection.close();

    process.exit(1);
  });
} else {
  const person = new Person(rawPerson);

  person.save().then((result) => {
    console.log(`added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
}
