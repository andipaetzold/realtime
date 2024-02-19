import { Literal, Record, Union, String } from "runtypes";

export const SubscriptionParamsRuntype = Union(
  Record({
    type: Literal("path"),
    path: String,
  }),
  Record({
    type: Literal("query"),
    query: String,
  })
);
