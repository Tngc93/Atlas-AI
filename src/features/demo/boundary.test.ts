import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("public demo import boundary", () => {
  it("does not import Prisma repositories or Server Actions", () => {
    const roots = ["src/app/demo", "src/components/demo", "src/features/demo"];
    const files = roots.flatMap((root) =>
      readdirSync(root, { recursive: true, encoding: "utf8" })
        .filter((file) => (file.endsWith(".ts") || file.endsWith(".tsx")) && !file.endsWith(".test.ts"))
        .map((file) => join(root, file)),
    );
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/@prisma\/client|\/repository["']|\/actions["']|["']use server["']/);
    }
  });
});
