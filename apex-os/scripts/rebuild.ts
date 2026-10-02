import { getDb } from "../src/data/db";
import { rebuildProjections } from "../src/data/store";
const t = Date.now();
const n = rebuildProjections(getDb());
console.log(`Replayed ${n} events in ${Date.now() - t} ms`);
