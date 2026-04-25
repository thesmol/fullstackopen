const SuccessNotification = ({ message }) => {
  if (!message) return null;

  return <div className="successNotification">{message}</div>;
};

export default SuccessNotification;
