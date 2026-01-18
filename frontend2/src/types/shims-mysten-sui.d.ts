declare module "@mysten/sui" {
  // Minimal shim to satisfy the TypeScript compiler in environments where
  // the @mysten/sui package types may not be present during this quick check.
  // The real package exports proper types; this file only provides a lightweight
  // any-based fallback so we can run tsc in this workspace.
  export class TransactionBlock {
    // allow any operations used in this codebase
    [x: string]: any;
    constructor(...args: any[]);
  }
  export = TransactionBlock;
}
