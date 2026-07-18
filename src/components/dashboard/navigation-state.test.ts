import { describe, expect, it } from "vitest";
import { isNavigationItemActive } from "./navigation-state";

const itemHrefs = [
  "/dashboard",
  "/plan",
  "/coach",
  "/forecast",
  "/decisions",
  "/memory",
  "/reminders",
  "/income",
  "/expenses",
  "/debts",
] as const;

function activeItems(pathname: string, publicDemo: boolean) {
  return itemHrefs.filter((itemHref) =>
    isNavigationItemActive({ pathname, itemHref, publicDemo }),
  );
}

describe("isNavigationItemActive", () => {
  it.each([
    ["/demo", "/dashboard"],
    ["/demo/", "/dashboard"],
    ["/demo/dashboard", "/dashboard"],
    ["/demo/plan", "/plan"],
    ["/demo/coach", "/coach"],
    ["/demo/coach/follow-up", "/coach"],
    ["/demo/forecast", "/forecast"],
    ["/demo/decisions", "/decisions"],
    ["/demo/decision-simulator", "/decisions"],
    ["/demo/memory", "/memory"],
    ["/demo/reminders", "/reminders"],
    ["/demo/income", "/income"],
    ["/demo/expenses", "/expenses"],
    ["/demo/debts", "/debts"],
  ])("selects one demo item for %s", (pathname, expected) => {
    expect(activeItems(pathname, true)).toEqual([expected]);
  });

  it("keeps dashboard exact and other self-host routes segment-aware", () => {
    expect(activeItems("/dashboard", false)).toEqual(["/dashboard"]);
    expect(activeItems("/dashboard/details", false)).toEqual([]);
    expect(activeItems("/coach", false)).toEqual(["/coach"]);
    expect(activeItems("/coach/follow-up", false)).toEqual(["/coach"]);
  });
});
