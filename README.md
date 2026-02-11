# Scheduling-App

A fully customizable daily planner for students balancing classes with work/internship hours.

This version is designed to be universal: **any major, any career field, any target role/position**.

## Universal customization features

- **Profile**
  - Name
  - Timezone
  - Major/program
  - Target GPA
- **Weekly constraints**
  - Work/internship hours
  - Sleep hours
  - Personal/commute hours
- **Class planning**
  - Add unlimited classes with credits, meeting hours, difficulty, due day
  - Automatic study-hour estimates and weekly day-by-day focus
- **Career planning for any field**
  - Enter any career field (e.g., healthcare, law, arts, engineering, business)
  - Enter any target role/position
  - Select current stage (exploring → advanced)
  - Enter a custom term priority
  - Add/remove your own custom class/learning goals
  - Add/remove your own custom roles/internships/experiences
- **Daily planning**
  - Date-based checklist with completion tracking
  - Date-based notes
  - Copy day summary for OneNote
- **Data portability**
  - Export to JSON backup
  - Import from JSON backup
  - Reset all data

## Daily usage flow

1. Set your profile and weekly constraints.
2. Add your current classes.
3. Enter your field + target position + stage.
4. Add custom recommendations specific to your path.
5. Open the Daily Planner each day:
   - pick date,
   - add tasks,
   - check tasks done,
   - write notes,
   - copy summary into OneNote.


## Pythonista single-class version

If you want a copy/paste-friendly Python implementation, use `universal_planner.py`.
It contains one class (`UniversalPlanner`) with:
- workload calculations,
- universal recommendations,
- daily tasks/notes,
- JSON import/export.

You can copy that single class into Pythonista and use it directly.

## Use with Microsoft OneNote

- Click **Copy day summary** in the Daily Planner.
- Paste into your OneNote daily page.
- Keep the planner open in a browser tab each day for live updates.

## Run

No build step required.

1. Open `index.html`, or
2. Run:

```bash
python -m http.server 8080
```

Then browse to <http://localhost:8080>.

## Notes

- Study-hour estimates are heuristic planning helpers.
- Because all key recommendations are editable, this planner can be tailored to virtually any discipline or career path.
