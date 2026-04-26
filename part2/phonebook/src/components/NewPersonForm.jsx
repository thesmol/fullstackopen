const NewPersonForm = ({
  newPerson,
  onNameChange,
  onPhoneChange,
  onSubmit,
}) => {
  return (
    <form>
      <div>
        name:
        <input
          value={newPerson.name}
          onChange={onNameChange}
          placeholder="John Doe"
        />
      </div>
      <div>
        phone:
        <input
          value={newPerson.number}
          onChange={onPhoneChange}
          placeholder="+358..."
        />
      </div>
      <div>
        <button type="submit" onClick={onSubmit}>
          add
        </button>
      </div>
    </form>
  );
};

export default NewPersonForm;
