import { cleanupPostgresTestSchema } from "./postgres-test-context.mjs";

const [schemaName] = process.argv.slice(2);

if (!schemaName) {
  console.error("Silinecek geçici test schema adı zorunludur.");
  process.exit(1);
}

await cleanupPostgresTestSchema(schemaName);
console.log("Geçici PostgreSQL test schema'sı temizlendi.");
