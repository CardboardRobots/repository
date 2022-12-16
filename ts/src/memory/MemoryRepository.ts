import { NotFoundError } from "../RepositoryError";
import {
  Document,
  Repository,
  ListResult,
  OptionalId,
  Page,
  Sort,
} from "../Repository";

import { Uuid } from "./Uuid";

export type DataToObjectId<TData extends OptionalId<any>[]> = {
  [Property in keyof TData]: string;
};

export class MockDataAccess<TDocument extends Document, TFilter extends {}>
  implements Repository<TDocument, TFilter>
{
  collection: Record<string, TDocument> = {};

  // TODO: Should we copy the object?
  _createId(document: OptionalId<TDocument>): TDocument {
    if (!document._id) {
      document._id = Uuid();
    }
    return document as any;
  }

  _insert<TData extends OptionalId<TDocument>[]>(
    ...data: TData
  ): DataToObjectId<TData> {
    const records = data.map(this._createId);
    this.collection = records.reduce(
      (collection, document) => ({
        ...collection,
        [document._id?.toString() || ""]: document,
      }),
      this.collection
    );
    return records.map(({ _id }) => _id) as any;
  }

  _clear(...data: OptionalId<TDocument>[]): string[] {
    this.collection = {};
    if (data.length) {
      return this._insert(...data);
    } else {
      return [];
    }
  }

  _getIds() {
    return Object.values(this.collection).map(({ _id }) => _id);
  }

  async getList(
    filter: TFilter,
    { offset = 0, limit = 0 }: Page = { offset: undefined, limit: undefined },
    // TODO: Fix this
    sort?: Sort<TDocument>
  ): Promise<ListResult<TDocument>> {
    const data = Object.values(this.collection)
      .filter(
        (document) =>
          !Object.entries(filter).find(
            ([key, value]) => document[key as keyof typeof document] !== value
          )
      )
      .slice(offset, offset + limit);
    const count = data.length;
    return {
      count,
      data,
    };
  }

  async getById(_id: string): Promise<TDocument | null> {
    return this.collection[_id] ?? null;
  }

  async create(data: OptionalId<TDocument>): Promise<string> {
    const _id = Uuid();
    const record = {
      ...data,
      _id,
    };
    this.collection[_id] = record as any;
    return _id;
  }

  async update(_id: string, data: Partial<TDocument>): Promise<boolean> {
    const record = this.collection[_id];
    if (!record) {
      throw new NotFoundError();
    }
    // TODO: Fix deep merging
    this.collection[_id.toString()] = {
      ...record,
      ...data,
    };
    return true;
  }

  async delete(_id: string): Promise<void> {
    const record = this.collection[_id.toString()];
    if (!record) {
      throw new NotFoundError();
    }
    delete this.collection[_id.toString()];
  }
}

export type Constructor<T> = new (...args: any) => T;

export function createMockDataAccess<
  TDataAccess extends MockDataAccess<any, any>,
  TData extends OptionalId<any>[]
>(
  constructor: Constructor<TDataAccess>,
  ...data: TData
): [TDataAccess, ...DataToObjectId<TData>] {
  const dataAccess = new constructor();
  const ids = dataAccess._insert(...data);
  return [dataAccess, ...ids] as any;
}
