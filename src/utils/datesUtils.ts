export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalDateTimeString(date = new Date()) {
  const dateString = getLocalDateString(date);
  const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${dateString} ${timeString}`;
}
export function getLocalTimeString(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}