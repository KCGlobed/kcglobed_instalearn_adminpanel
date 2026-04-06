import moment from "moment";

export function formatSeconds(seconds:any) {
  const duration = moment.duration(seconds, 'seconds');

  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const secs = duration.seconds();

  return `${hours}h ${minutes}m ${secs}s`;
}