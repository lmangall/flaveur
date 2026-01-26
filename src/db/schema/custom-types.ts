import { customType } from "drizzle-orm/pg-core";

export const jsonb = <T>() =>
  customType<{ data: T; driverData: string }>({
    dataType() {
      return "jsonb";
    },
    toDriver(value: T) {
      return JSON.stringify(value);
    },
    fromDriver(value: string) {
      return JSON.parse(value) as T;
    },
  });

export const textArray = customType<{ data: string[]; driverData: string[] }>({
  dataType() {
    return "text[]";
  },
});

export const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return "tsvector";
  },
});
