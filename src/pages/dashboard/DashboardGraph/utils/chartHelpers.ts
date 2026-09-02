import moment from "moment";

export interface GraphDateItem {
  start_date?: string;
  end_date?: string;
  [key: string]: any;
}

/**
 * Formats a graph item's x-axis / tooltip label based on filter and date range.
 * - Week filter (or when start_date and end_date are given and differ):
 *   displays e.g. "Aug 27 - Sep 02" so users clearly see the range up to the current date.
 * - Month filter: displays "Aug 2026"
 * - Year filter: displays "2026"
 */
export const formatGraphLabel = (item: GraphDateItem, filter?: string): string => {
  if (!item || !item.start_date) return "";

  const start = moment(item.start_date);
  if (!start.isValid()) return "";

  if (filter === "year") {
    return start.format("YYYY");
  }

  if (filter === "month") {
    return start.format("MMM YYYY");
  }

  // Week filter or fallback when end_date is present
  if (item.end_date) {
    const end = moment(item.end_date);
    if (end.isValid() && !start.isSame(end, "day")) {
      return `${start.format("MMM DD")} - ${end.format("MMM DD")}`;
    }
  }

  return start.format("MMM DD");
};

/**
 * Sorts graph data chronologically (oldest to newest / current date on right)
 * so that timeline graphs display naturally from past to present.
 */
export const sortGraphDataChronologically = <T extends GraphDateItem>(data: T[]): T[] => {
  if (!Array.isArray(data)) return [];
  return [...data].sort((a, b) => {
    if (!a.start_date || !b.start_date) return 0;
    return moment(a.start_date).valueOf() - moment(b.start_date).valueOf();
  });
};
