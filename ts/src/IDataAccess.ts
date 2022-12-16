export interface Document {
  _id: string;
  [key: string]: any;
}

export type OptionalId<TDocument extends Document> = Omit<TDocument, "_id"> & {
  _id?: string;
};

export interface ListResult<TDocument extends Document> {
  count: number;
  data: TDocument[];
}

export interface Page {
  limit?: number;
  offset?: number;
}

export interface IDataAccess<TDocument extends Document, TFilter extends {}> {
  list(
    filter: TFilter,
    page: Page,
    sort?: { [Property in keyof TDocument]?: 1 | -1 }
  ): Promise<ListResult<TDocument>>;

  getById(id: string): Promise<TDocument | null>;

  create(data: OptionalId<TDocument>): Promise<string>;

  update(id: string, data: Partial<TDocument>): Promise<boolean>;

  deleteById(id: string): Promise<void>;
}
