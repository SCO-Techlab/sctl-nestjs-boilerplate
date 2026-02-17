import { Inject, Injectable } from '@nestjs/common';
import { MAGIC_NUMBERS, MAGIC_STRINGS } from '@shared/constants';
import { PROVIDER_CONFIG } from '@shared/helpers';
import { Connection, createConnection, Model, Schema } from 'mongoose';
import { IMongodbConfig } from './mongodb.config';

@Injectable()
export class MongodbService {

  private _dbConnections: Map<string, Connection> = new Map<string, Connection>();
  private _hasSkippedInitialConnection: Map<string, boolean> = new Map<string, boolean>();

  constructor(
    @Inject(PROVIDER_CONFIG) private options: IMongodbConfig[]
  ) {
    if (!this.validateOptions(this.options)) {
      return;
    }

    for (const config of this.options) {
      this.createConnectionDB(config);
    }
  }

  public clearConnection(name: string = MAGIC_STRINGS.DEFAULT): boolean {
    if (!this._dbConnections.has(name)) {
      return false;
    }

    try {
      this._dbConnections.get(name)?.close();
      this._dbConnections.delete(name);
      return true;
    } catch (err) {
      console.error(`[MongoDbService] clearConnection (${name}) -> Error: ${err}`);
      return false;
    }
  }

  public async createConnectionDB(config: IMongodbConfig): Promise<void> {
    if (config.avoidConnection && !this._hasSkippedInitialConnection.has(config.name)) {
      console.log(`[MongoDbService] createConnectionDB (${config.name}) -> Skipped initial connection to '${config.database}' (avoidConnection)`);
      this._hasSkippedInitialConnection.set(config.name, true);
      return;
    }

    this.clearConnection(config.name);

    return new Promise<void>((resolve, reject) => {
      try {
        const url = this.createConnectionUrl(config);

        this._dbConnections.set(config.name, createConnection(url, {
          autoCreate: false,
          autoIndex: false
        }));

        this._dbConnections.get(config.name)?.once('open', async () => {
          console.log(`[MongoDbService] createConnectionDB (${config.name}) -> Connected to '${config.database}'`);
          resolve();
        });

        this._dbConnections.get(config.name)?.on('error', (error: any) => {
          console.error(`[MongoDbService] createConnectionDB (${config.name}) -> Error connecting to '${config.database}', ${error}`);
          reject(error);
        });
      } catch (error) {
        console.error(`[MongoDbService] createConnectionDB (${config.name}) -> Error: ${error}`);
        reject(error);
      }
    });
  }

  public getConnection(name: string = MAGIC_STRINGS.DEFAULT): Connection | undefined {
    if (!this._dbConnections.has(name)) {
      return undefined;
    }

    return this._dbConnections.get(name);
  }

  public getModel<T>(model: string, schema: Schema<T>, collection: string, name: string = MAGIC_STRINGS.DEFAULT): Model<T> | undefined {
    if (!this._dbConnections.has(name)) {
      return undefined;
    }

    return this._dbConnections.get(name)?.model<T>(model, schema, collection);
  }

  private validateOptions(options: IMongodbConfig[]): boolean {
    if (!options || options.length === MAGIC_NUMBERS.N_0) {
      console.error("[MongoDbService] Invalid configuration: no configuration parameters provided");
      return false;
    }

    const usedNames = new Set<string>();
    for (const config of options) {
      if (!config.name) {
        console.error("[MongoDbService] Invalid configuration: missing 'name' parameter");
        return false;
      }

      if (usedNames.has(config.name)) {
        console.error(`[MongoDbService] Invalid configuration: duplicate configuration name '${config.name}'`);
        return false;
      }
      usedNames.add(config.name);

      if (!config.host) {
        console.error(`[MongoDbService] Invalid configuration: missing 'host' parameter for '${config.name}'`);
        return false;
      }

      if (config.port == null) {
        console.error(`[MongoDbService] Invalid configuration: missing 'port' parameter for '${config.name}'`);
        return false;
      }

      if (!config.database) {
        console.error(`[MongoDbService] Invalid configuration: missing 'database' parameter for '${config.name}'`);
        return false;
      }
    }

    return true;
  }

  private createConnectionUrl(config: IMongodbConfig): string {
    const { user, pass, host, port, database, authSource } = config;

    const credentials = user && pass
      ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`
      : '';

    const auth = user && pass
      ? `?authSource=${authSource ?? 'admin'}`
      : '';

    return `mongodb://${credentials}${host}:${port}/${database}${auth}`;
  }
}
