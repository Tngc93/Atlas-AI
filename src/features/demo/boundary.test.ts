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

  it("contains no persistence or external-request primitive", () => {
    const roots = ["src/app/demo", "src/components/demo", "src/features/demo"];
    const files = roots.flatMap((root) =>
      readdirSync(root, { recursive: true, encoding: "utf8" })
        .filter((file) => (file.endsWith(".ts") || file.endsWith(".tsx")) && !file.endsWith(".test.ts"))
        .map((file) => join(root, file)),
    );

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|\bdocument\.cookie\b|\bcaches\.(?:open|put|match)\b/);
      expect(source, file).not.toMatch(/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bsendBeacon\b/);
    }
  });

  it("keeps the landing route public and rewrites only self-host product routes", () => {
    const config = readFileSync("next.config.ts", "utf8");
    expect(config).not.toContain('{ source: "/", destination: "/demo" }');
    expect(config).toContain('destination: `/demo/${route}`');
  });
});
