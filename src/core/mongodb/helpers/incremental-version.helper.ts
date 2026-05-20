import { MAGIC_NUMBERS } from "@core/shared/constants";
import { Schema } from "mongoose";

export const setIncrementalVersion = (schema: Schema) => {
  schema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function () {
    const update = this.getUpdate() || {};

    if (!update['$inc']) {
      update['$inc'] = {};
    }

    if (update['$inc'].__v === null || update['$inc'].__v === undefined) {
      update['$inc'].__v = MAGIC_NUMBERS.N_1;
    }

    this.setUpdate(update);
  });
};