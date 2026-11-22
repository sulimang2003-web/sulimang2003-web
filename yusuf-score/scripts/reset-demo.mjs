import { rmSync } from "node:fs";
rmSync(".data", { recursive: true, force: true });
console.log("Demo data reset — restart the server to reload the seed catalogue.");
