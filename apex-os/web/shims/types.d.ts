declare module "*.wasm" {
  const bytes: Uint8Array;
  export default bytes;
}
declare module "sql.js/dist/sql-wasm-browser.js" {
  import type { SqlJsStatic } from "sql.js";
  const init: (config?: { wasmBinary?: ArrayBuffer | Uint8Array }) => Promise<SqlJsStatic>;
  export default init;
}
