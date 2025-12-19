import moment from "moment";

export enum DateFormat {
  f1 = "YYYY-MM-DD",
  f2 = "YYYY-MM-DD HH:mm:ss",
  f3 = "YYYY-MM-DD HH:mm",
  f4 = "YYYY/MM/DD",
  f5 = "YYYY/MM/DD HH:mm:ss",
  f6 = "YYYY/MM/DD HH:mm",
  f7 = "YYYY.MM.DD",
  f8 = "YYYY.MM.DD HH:mm:ss",
  f9 = "YYYY.MM.DD HH:mm",
}

export function formatTimestamp(timestamp?: number, format?: DateFormat) {
  return moment(timestamp).format(format || DateFormat.f1);
}
