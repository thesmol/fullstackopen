const SuccessNotification = ({ message, type }) => {
  if (!message) return null;

  return <div className={`${type}Notification`}>{message}</div>;
};

export default SuccessNotification;
