const Header = ({ course }) => {
  return <h1>{course}</h1>;
};

const Part = ({ name, count }) => {
  return (
    <p>
      {name} {count}
    </p>
  );
};

const Content = ({ parts }) => {
  return (
    <div>
      {parts.map((part, index) => (
        <Part key={index} name={part.name} count={part.exercises} />
      ))}
    </div>
  );
};

const Total = ({ parts }) => {
  const sum = parts.reduce((acc, part) => acc + part.exercises, 0);
  return <p>Number of exercises {sum}</p>;
};

const App = () => {
  const course = {
    name: "Half Stack application development",
    parts: [
      {
        name: "Fundamentals of React",
        exercises: 10,
      },
      {
        name: "Using props to pass data",
        exercises: 7,
      },
      {
        name: "State of a component",
        exercises: 14,
      },
    ],
  };

  return (
    <div>
      <Header course={course.name} />
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </div>
  );
};

export default App;
