import assert from "node:assert/strict";
import test from "node:test";

import { resolvePanelTab, visibleTabsForRole } from "@/lib/admin-panel-navigation";

test("visibleTabsForRole exposes full office navigation for admins", () => {
  const tabs = visibleTabsForRole("admin");

  assert.equal(tabs.includes("overview"), true);
  assert.equal(tabs.includes("portfolio-create"), true);
  assert.equal(tabs.includes("portfolio-approval"), true);
  assert.equal(tabs.includes("blog-create"), true);
  assert.equal(tabs.includes("advisor-manage"), true);
  assert.equal(tabs.includes("leads"), true);
  assert.equal(tabs.includes("user-manage"), true);
});

test("visibleTabsForRole limits portfolio managers to portfolio operations", () => {
  const tabs = visibleTabsForRole("portfolio_manager");

  assert.deepEqual(tabs, ["portfolio-create", "portfolio-locations", "portfolio-projects", "portfolio-edit"]);
});

test("resolvePanelTab falls back to the first allowed tab", () => {
  assert.equal(resolvePanelTab("user-manage", ["overview", "portfolio-edit"]), "overview");
  assert.equal(resolvePanelTab(undefined, ["portfolio-edit"]), "portfolio-edit");
});
