# Scheduling-App

A fully usable, customizable web app that helps you balance college classes, a 45-hour internship, and daily planning.

## What you can customize

- **User profile**
  - Name
  - Timezone
  - Target GPA
- **Weekly commitments**
  - Internship hours
  - Sleep hours/night
  - Personal/commute hours/week
- **Class planner**
  - Add/remove classes, credits, meeting hours, difficulty, due day
  - Auto-generated weekly study load and day-by-day prep schedule
- **Career planning**
  - Choose a career path + your academic stage
  - Built-in recommended next classes/internships
  - Add and remove your own custom recommendations
- **Daily planner**
  - Date-based task list with checkboxes
  - Daily notes
  - Copy a daily summary for journaling or reporting

## Daily use workflow

1. Open the app.
2. Update weekly commitments and classes as your semester changes.
3. Select your career path and add your own recommendation targets.
4. Use the **Daily planner** section every day:
   - Pick a date
   - Add tasks
   - Mark tasks done
   - Save notes
   - Copy the summary into your notebook or planner

## Use with Microsoft OneNote ("Microsoft Notes")

You can use this app daily with OneNote in two practical ways:

1. **Copy summary into OneNote pages**
   - In the app, click **Copy day summary**.
   - Paste directly into your OneNote daily page.

2. **Pin/open the app alongside OneNote**
   - Run this project locally (see run instructions below).
   - Keep the app open in a browser tab and OneNote in another window.
   - Your planner data stays saved in your browser via localStorage.

## Backup and restore

- Click **Export data** to download a JSON backup.
- Click **Import data** to restore a previous backup.
- Click **Reset all data** if you want to start over.

## Run it

No build tools required.

1. Open `index.html` directly, or
2. Serve locally:

```bash
python -m http.server 8080
```

Then open <http://localhost:8080>.

## Notes

- Study-hour estimates are heuristic and intended for planning.
- Customize class and internship recommendations to match your major and local opportunities.
