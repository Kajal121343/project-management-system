import { describe, it, expect } from "vitest";
import { isTaskOverdue, buildTaskSort } from "../src/utils/taskHelpers.js";
describe("isTaskOverdue", () => {
  const past = new Date(Date.now() - 86400000);
  const future = new Date(Date.now() + 86400000);
  it("returns true when due date passed and status not completed", () => {
    expect(isTaskOverdue({ dueDate: past, status: "TODO" })).toBe(true);
  });
  it("returns false when task completed", () => {
    expect(isTaskOverdue({ dueDate: past, status: "COMPLETED" })).toBe(false);
  });
  it("returns false when due date in future", () => {
    expect(isTaskOverdue({ dueDate: future, status: "TODO" })).toBe(false);
  });
  it("returns false when no due date", () => {
    expect(isTaskOverdue({ status: "TODO" })).toBe(false);
  });
});
describe("buildTaskSort", () => {
  it("sorts by priority descending", () => {
    expect(buildTaskSort("priority")).toEqual({ priority: -1 });
  });
  it("defaults to createdAt desc", () => {
    expect(buildTaskSort(undefined)).toEqual({ createdAt: -1 });
  });
});
