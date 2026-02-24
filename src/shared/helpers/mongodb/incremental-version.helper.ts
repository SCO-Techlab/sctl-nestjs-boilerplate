import { MAGIC_NUMBERS, MAGIC_STRINGS } from "@shared/constants";
import { Schema } from "mongoose";

export const setIncrementalVersion = (schema: Schema) => {
  schema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function () {
    const update = this.getUpdate() || {};

    if (!update[MAGIC_STRINGS.$INC]) {
      update[MAGIC_STRINGS.$INC] = {};
    }

    if (update[MAGIC_STRINGS.$INC].__v === null || update[MAGIC_STRINGS.$INC].__v === undefined) {
      update[MAGIC_STRINGS.$INC].__v = MAGIC_NUMBERS.N_1;
    }

    this.setUpdate(update);
  });
};