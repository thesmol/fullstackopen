import { useState } from "react";

const Header = ({ text }) => <h1>{text}</h1>;

const Button = ({ onClick, text }) => {
  return <button onClick={onClick}>{text}</button>;
};

const ButtonsGroup = ({ buttons }) => {
  return (
    <div>
      {buttons.map((button) => (
        <Button key={button.text} onClick={button.onClick} text={button.text} />
      ))}
    </div>
  );
};

const Stat = ({ text, value }) => {
  return (
    <div>
      <span>
        {text}: {value}
      </span>
    </div>
  );
};

const Statistic = ({ statistic }) => {
  return (
    <div>
      {statistic.map((stat) => (
        <Stat key={stat.text} text={stat.text} value={stat.value} />
      ))}
    </div>
  );
};

const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [bad, setBad] = useState(0);

  const handleGoodClick = () => {
    setGood(good + 1);
  };
  const handleNeutralClick = () => {
    setNeutral(neutral + 1);
  };
  const handleBadClick = () => {
    setBad(bad + 1);
  };

  const getAll = () => good + neutral + bad;
  const getAverage = () => {
    const all = getAll();

    if (all === 0) {
      return 0;
    }

    return (good + -bad) / all;
  };
  const getPositive = () => {
    const all = getAll();
    if (all === 0) {
      return "0 %";
    }

    return `${(good / all) * 100} %`;
  };

  return (
    <div>
      <Header text="Give feedback" />
      <ButtonsGroup
        buttons={[
          { text: "Good", onClick: handleGoodClick },
          { text: "Neutral", onClick: handleNeutralClick },
          { text: "Bad", onClick: handleBadClick },
        ]}
      />
      <Header text="Statistics" />
      <Statistic
        statistic={[
          { text: "Good", value: good },
          { text: "Neutral", value: neutral },
          { text: "Bad", value: bad },
          { text: "All", value: getAll() },
          { text: "Average", value: getAverage() },
          { text: "Positive", value: getPositive() },
        ]}
      />
    </div>
  );
};

export default App;
