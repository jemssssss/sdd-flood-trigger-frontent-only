export function getLatestForecastTime() {
  const now = new Date();

  // Round down
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:00:00`;
}

export function getLatestTimeDate() {
  const now = new Date();

  // Round down to the nearest hour
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);

  // Format the date using Intl.DateTimeFormat
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",   
    day: "numeric",  
    year: "numeric", 
    hour: "numeric", 
    minute: "2-digit", 
    hour12: true     
  });

  return formatter.format(now).replace(",", "");
}