import { OptionalId } from "../Repository";
import { MemoryRepository } from "./MemoryRepository";
import { DataToObjectId } from "./Uuid";

export type Constructor<T> = new (...args: any) => T;

export function createMockDataAccess<
  TDataAccess extends MemoryRepository<any>,
  TData extends OptionalId<any>[]
>(
  constructor: Constructor<TDataAccess>,
  ...data: TData
): [TDataAccess, ...DataToObjectId<TData>] {
  const dataAccess = new constructor();
  const ids = dataAccess._insert(...data);
  return [dataAccess, ...ids] as any;
}
