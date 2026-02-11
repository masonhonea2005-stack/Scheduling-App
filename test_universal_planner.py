import unittest

from universal_planner import UniversalPlanner


class UniversalPlannerTests(unittest.TestCase):
    def test_workload_summary_levels(self):
        p = UniversalPlanner()
        p.baseline.update({"internship": 45, "sleep": 8, "personal": 18})
        p.add_class("Algebra", 3, 3, 3, "Friday")
        summary = p.workload_summary()
        self.assertIn(summary["status"], {"ok", "warn", "alert"})
        self.assertGreater(summary["available"], 0)

    def test_recommendations_are_universal(self):
        p = UniversalPlanner()
        p.profile["major"] = "Fine arts"
        p.career.update({"field": "creative media", "role": "art director", "stage": "building", "priority": "portfolio"})
        p.custom_recommendations["classes"].append("Brand Strategy Seminar")
        recs = p.recommendations()
        self.assertTrue(any("Fine" in r for r in recs["classes"]))
        self.assertTrue(any("Art" in r for r in recs["roles"]))
        self.assertIn("Brand Strategy Seminar", recs["classes"])

    def test_daily_tasks_and_notes(self):
        p = UniversalPlanner()
        d = "2026-01-10"
        tid = p.add_task("Finish case study", d)
        p.toggle_task(tid, True, d)
        p.set_note("Big progress today", d)
        summary = p.day_summary_text(d)
        self.assertIn("[x] Finish case study", summary)
        self.assertIn("Big progress today", summary)

    def test_export_import_roundtrip(self):
        p = UniversalPlanner()
        p.profile["name"] = "Alex"
        p.add_class("Biology", 4, 4, 4, "Monday")
        payload = p.to_json()
        restored = UniversalPlanner.from_json(payload)
        self.assertEqual(restored.profile["name"], "Alex")
        self.assertEqual(len(restored.classes), 1)


if __name__ == "__main__":
    unittest.main()
