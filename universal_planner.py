"""Universal planner logic in one class.

This file is intentionally self-contained so it can be copied into Pythonista.
"""

from __future__ import annotations

import json
import uuid
from datetime import date, datetime


class UniversalPlanner:
    DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    STAGE_TEMPLATES = {
        "exploring": {
            "classes": [
                "Intro/foundations course in your major",
                "Communication & writing course",
                "Digital tools or data literacy course",
            ],
            "roles": [
                "Shadowing opportunity",
                "Campus organization role",
                "Entry-level part-time role",
            ],
        },
        "foundation": {
            "classes": [
                "Intermediate major course",
                "Project-based class",
                "Ethics/professional practice course",
            ],
            "roles": [
                "Internship or practicum",
                "Research assistant position",
                "Volunteer experience in field",
            ],
        },
        "building": {
            "classes": [
                "Advanced technical/specialized elective",
                "Capstone prep or methods course",
                "Leadership or collaboration course",
            ],
            "roles": [
                "Competitive internship",
                "Co-op / clinical / studio placement",
                "Portfolio-based project role",
            ],
        },
        "advanced": {
            "classes": [
                "Capstone/thesis/advanced seminar",
                "Industry certification prep",
                "Career transition strategy course",
            ],
            "roles": [
                "Target job-role internship",
                "Graduate assistantship/fellowship",
                "Full-time conversion pathway",
            ],
        },
    }

    def __init__(self):
        self.profile = {"name": "", "timezone": "", "major": "", "gpa": 3.5}
        self.baseline = {"internship": 45.0, "sleep": 8.0, "personal": 18.0}
        self.career = {"field": "", "role": "", "stage": "exploring", "priority": ""}
        self.classes = []
        self.custom_recommendations = {"classes": [], "internships": []}
        self.daily_tasks = {}
        self.daily_notes = {}

    # ------------------------ Core planning ------------------------
    def add_class(self, name, credits, meeting_hours, difficulty, due_day):
        self.classes.append(
            {
                "id": str(uuid.uuid4()),
                "name": str(name).strip(),
                "credits": float(credits),
                "meetingHours": float(meeting_hours),
                "difficulty": int(difficulty),
                "dueDay": due_day,
            }
        )

    def remove_class(self, class_id):
        self.classes = [c for c in self.classes if c["id"] != class_id]

    def calculate_study_hours(self, course):
        base = max(course["credits"] * 2, course["meetingHours"] * 1.5)
        difficulty_boost = 1 + (course["difficulty"] - 3) * 0.15
        return max(1.5, round(base * difficulty_boost, 1))

    def total_available_hours(self):
        return round(168 - self.baseline["internship"] - self.baseline["sleep"] * 7 - self.baseline["personal"], 1)

    def total_required_hours(self):
        total = 0.0
        for course in self.classes:
            total += course["meetingHours"] + self.calculate_study_hours(course)
        return round(total, 1)

    def workload_summary(self):
        available = self.total_available_hours()
        required = self.total_required_hours()
        remaining = round(available - required, 1)

        if remaining < 0:
            status = "alert"
            msg = f"Overbooked by {abs(remaining)} hours/week."
        elif remaining < 8:
            status = "warn"
            msg = f"Only {remaining} buffer hours remain."
        else:
            status = "ok"
            msg = f"{remaining} buffer hours remain for recovery and career progress."

        return {
            "status": status,
            "available": available,
            "required": required,
            "remaining": remaining,
            "message": msg,
        }

    def weekly_focus_by_day(self):
        plan = {day: [] for day in self.DAYS}

        for course in self.classes:
            study = self.calculate_study_hours(course)
            per_day = round(study / 3, 1)
            due_idx = self.DAYS.index(course["dueDay"])
            prep_days = [self.DAYS[(due_idx + 4) % 7], self.DAYS[(due_idx + 5) % 7], self.DAYS[(due_idx + 6) % 7]]
            for day in prep_days:
                plan[day].append(f"{course['name']}: {per_day}h prep")

        return plan

    # ------------------------ Career recommendations ------------------------
    @staticmethod
    def _title_case(value):
        parts = [p for p in str(value).strip().split(" ") if p]
        return " ".join(word[:1].upper() + word[1:] for word in parts)

    def recommendations(self):
        stage = self.career.get("stage", "exploring")
        template = self.STAGE_TEMPLATES.get(stage, self.STAGE_TEMPLATES["exploring"])
        major = self.profile.get("major", "").strip()
        field = self.career.get("field", "").strip()
        role = self.career.get("role", "").strip()
        priority = self.career.get("priority", "").strip()

        contextual_classes = [
            f"{self._title_case(major)} core requirement or elective" if major else None,
            f"{self._title_case(field)} trends, policy, or market-analysis course" if field else None,
            f"Learning goal aligned to priority: {priority}" if priority else None,
        ]
        contextual_roles = [
            f"{self._title_case(role)} pathway role (internship, assistantship, or project position)" if role else None,
            f"Professional association, club, or volunteer work in {self._title_case(field)}" if field else None,
            "Portfolio/research/project milestone with measurable outcomes",
        ]

        classes = [*template["classes"], *[x for x in contextual_classes if x], *self.custom_recommendations["classes"]]
        roles = [*template["roles"], *[x for x in contextual_roles if x], *self.custom_recommendations["internships"]]
        return {"classes": classes, "roles": roles}

    # ------------------------ Daily tasks ------------------------
    @staticmethod
    def _normalize_date(iso_date=None):
        if not iso_date:
            return date.today().isoformat()
        datetime.strptime(iso_date, "%Y-%m-%d")
        return iso_date

    def ensure_date(self, iso_date=None):
        d = self._normalize_date(iso_date)
        if d not in self.daily_tasks:
            self.daily_tasks[d] = []
        if d not in self.daily_notes:
            self.daily_notes[d] = ""
        return d

    def add_task(self, text, iso_date=None):
        d = self.ensure_date(iso_date)
        task = {"id": str(uuid.uuid4()), "text": str(text).strip(), "done": False}
        self.daily_tasks[d].append(task)
        return task["id"]

    def toggle_task(self, task_id, done, iso_date=None):
        d = self.ensure_date(iso_date)
        for task in self.daily_tasks[d]:
            if task["id"] == task_id:
                task["done"] = bool(done)
                return True
        return False

    def delete_task(self, task_id, iso_date=None):
        d = self.ensure_date(iso_date)
        before = len(self.daily_tasks[d])
        self.daily_tasks[d] = [t for t in self.daily_tasks[d] if t["id"] != task_id]
        return len(self.daily_tasks[d]) != before

    def set_note(self, note, iso_date=None):
        d = self.ensure_date(iso_date)
        self.daily_notes[d] = str(note)

    def day_summary_text(self, iso_date=None):
        d = self.ensure_date(iso_date)
        day_name = self.DAYS[datetime.strptime(d, "%Y-%m-%d").weekday()]
        tasks = "\n".join(f"- [{'x' if t['done'] else ' '}] {t['text']}" for t in self.daily_tasks[d])

        return (
            f"# {self.profile.get('name') or 'Student'} Daily Plan ({d})\n\n"
            f"**Major/Program:** {self.profile.get('major') or 'Not set'}\n"
            f"**Career Field:** {self.career.get('field') or 'Any field'}\n"
            f"**Target Role:** {self.career.get('role') or 'Any role'}\n"
            f"**Stage:** {self.career.get('stage') or 'exploring'}\n"
            f"**Priority:** {self.career.get('priority') or 'Not set'}\n\n"
            f"## {day_name} Tasks\n{tasks or '- [ ] Add first task'}\n\n"
            f"## Notes\n{self.daily_notes[d] or 'No notes yet.'}"
        )

    # ------------------------ Import/export ------------------------
    def to_dict(self):
        return {
            "profile": self.profile,
            "baseline": self.baseline,
            "career": self.career,
            "classes": self.classes,
            "customRecommendations": self.custom_recommendations,
            "dailyTasks": self.daily_tasks,
            "dailyNotes": self.daily_notes,
        }

    def to_json(self):
        return json.dumps(self.to_dict(), indent=2)

    @classmethod
    def from_json(cls, raw_json):
        payload = json.loads(raw_json)
        planner = cls()
        planner.profile.update(payload.get("profile", {}))
        planner.baseline.update(payload.get("baseline", {}))
        planner.career.update(payload.get("career", {}))
        planner.classes = payload.get("classes", []) if isinstance(payload.get("classes"), list) else []

        custom = payload.get("customRecommendations", {}) if isinstance(payload.get("customRecommendations"), dict) else {}
        planner.custom_recommendations["classes"] = custom.get("classes", []) if isinstance(custom.get("classes"), list) else []
        planner.custom_recommendations["internships"] = custom.get("internships", []) if isinstance(custom.get("internships"), list) else []

        planner.daily_tasks = payload.get("dailyTasks", {}) if isinstance(payload.get("dailyTasks"), dict) else {}
        planner.daily_notes = payload.get("dailyNotes", {}) if isinstance(payload.get("dailyNotes"), dict) else {}
        return planner
