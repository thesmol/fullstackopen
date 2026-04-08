const Header = ({ title }) => {
  return <h1>{title}</h1>;
};

const Part = ({ name, count }) => {
  return (
    <p>
      {name} {count}
    </p>
  );
};

const Content = ({ part1, part2, part3 }) => {
  return (
    <div>
      <Part name={part1.name} count={part1.count} />
      <Part name={part2.name} count={part2.count} />
      <Part name={part3.name} count={part3.count} />
    </div>
  );
};

const Total = ({ sum }) => {
  return <p>Number of exercises {sum}</p>;
};

const App = () => {
  const course = "Half Stack application development";
  const part1 = "Fundamentals of React";
  const exercises1 = 10;
  const part2 = "Using props to pass data";
  const exercises2 = 7;
  const part3 = "State of a component";
  const exercises3 = 14;

  return (
    <div>
      <Header title={course} />
      <Content
        part1={{ name: part1, count: exercises1 }}
        part2={{ name: part2, count: exercises2 }}
        part3={{ name: part3, count: exercises3 }}
      />
      <Total sum={exercises1 + exercises2 + exercises3} />
    </div>
  );
};

export default App;
