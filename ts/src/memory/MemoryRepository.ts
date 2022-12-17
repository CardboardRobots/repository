import { NotFoundError } from "../RepositoryError";
import {
  Model,
  Repository,
  ListResult,
  OptionalId,
  Page,
  Sort,
  Filter,
} from "../Repository";

import { DataToObjectId, Uuid } from "./Uuid";

export class MemoryRepository<TModel extends Model, TFilter extends Filter>
  implements Repository<TModel, TFilter>
{
  collection: Record<string, TModel> = {};

  // TODO: Should we copy the object?
  _createId(document: OptionalId<TModel>): TModel {
    if (!document._id) {
      // @ts-expect-error TODO: Fix this type
      document._id = Uuid();
    }
    return document as any;
  }

  _insert<TData extends OptionalId<TModel>[]>(
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

  _clear(...data: OptionalId<TModel>[]): string[] {
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

  async getList<TFilter extends {}>(
    filter: TFilter,
    { offset = 0, limit = 0 }: Page = { offset: undefined, limit: undefined },
    // TODO: Fix this
    sort?: Sort<TModel>
  ): Promise<ListResult<TModel>> {
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

  async getById(_id: string): Promise<TModel | null> {
    return this.collection[_id] ?? null;
  }

  async create(data: OptionalId<TModel>): Promise<string> {
    const _id = Uuid();
    const record = {
      ...data,
      _id,
    };
    this.collection[_id] = record as any;
    return _id;
  }

  async update(_id: string, data: Partial<TModel>): Promise<boolean> {
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
