const ACCUMULATION_HOUR = Number(import.meta.env.SENSING_TIME ?? 6); 

export function getAccumulationTimes() {

  const end = new Date();

  end.setHours(ACCUMULATION_HOUR);
  end.setMinutes(0);
  end.setSeconds(0);
  end.setMilliseconds(0);

  // If current time hasn't reached today's accumulation hour,
  // use yesterday instead.
  const now = new Date();

  if (now < end) {
    end.setDate(end.getDate() - 1);
  }

  const start = new Date(end);
  start.setDate(start.getDate() - 1);

  const format = (date, withZulu = false) => {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:00:00${withZulu ? "Z" : ""}`;
  };

  return {

    forecastTime: format(end),
    initTime: format(start, true),
    hour: ACCUMULATION_HOUR

  };

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
    //hour: "numeric", 
    //minute: "2-digit", 
    //hour12: true
  });

  return formatter.format(now).replace(",", "");
}

export function formatSensingTime() {
  const sensingTime = ACCUMULATION_HOUR;

  if (sensingTime < 12) {
    return `${ACCUMULATION_HOUR} AM`;
  }
  else {
    return `${ACCUMULATION_HOUR} PM`;
  }
}