import { Injectable } from "@nestjs/common";
import { GridFSBucket } from "mongodb";

@Injectable()
export class GridfsManagerService {

  private readonly buckets = new Map<string, GridFSBucket>();

  public set(name: string, bucket: GridFSBucket): void {
    this.buckets.set(name, bucket);
  }

  public get(name: string): GridFSBucket | undefined {
    return this.buckets.get(name);
  }

  public exists(name: string): boolean {
    return this.buckets.has(name);
  }

  public keys(): string[] {
    return [...this.buckets.keys()];
  }
}