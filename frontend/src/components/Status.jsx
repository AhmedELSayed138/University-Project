export function Loading() {
  return <div className="status">Loading data...</div>;
}

export function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="alert">{message}</div>;
}

export function Empty({ text }) {
  return <div className="status">{text}</div>;
}
