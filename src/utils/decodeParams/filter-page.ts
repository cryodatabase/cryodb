/*import { FilterParams } from "../../../../arc/archive/types/filters"

/**
 * Parses and decodes a URL query string (specifically for filters) into an object of key-value pairs.
 * This function takes a `filters` string, decodes it, and processes it into a structured object that maps filter names to their values.
 * It handles both single and multi-value filters, as well as special characters like spaces represented as "+" and trims extra spaces.
 * 
 * Example of expected query string format:
 * `filters=key1=value1&key2=value2,value3&key3=value4`
 * 
 * @param params - An object containing a `filters` query string.
 *   - `filters`: A URL-encoded string representing multiple filters, separated by "&".
 * @returns A `FilterParams` object where each key corresponds to a filter name and each value is either a single value or an array of values.
 * 
 * Example output:
 * {
 *   key1: "value1",
 *   key2: ["value2", "value3"],
 *   key3: "value4"
 * }
 * /

export const getFiltersFromParams = (params: { filters: string }): FilterParams => {
  const decodedParams = decodeURIComponent(params.filters);
  const filters: FilterParams = {};

  decodedParams.split("&").forEach((param) => {
    const [key, value] = param.split("=");

    if (value) {
      const processedValue = value.replace(/\+/g, " ").trim();

      if (processedValue) {
        if (processedValue.includes(",")) {
          const filteredArray = processedValue
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v);
          if (filteredArray.length > 0) filters[key] = filteredArray;
        } else {
          filters[key] = processedValue;
        }
      }
    }
  });
  
  return filters;
};
*/