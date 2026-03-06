export interface IMongodbDocument {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export interface IMongodbRecord {
  property: string;
  value: any;
}