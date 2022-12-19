import { randomUUID } from "crypto";

export function Uuid() {
  return randomUUID();
}

export type DataToObjectId<TData extends any[]> = {
  [Property in keyof TData]: string;
};
