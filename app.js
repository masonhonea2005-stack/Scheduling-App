const STORAGE_KEY = 'scheduling-app-plan-v4';
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const stageTemplates = {
  exploring: {
    classes: ['Intro/foundations course in your major', 'Communication & writing course', 'Digital tools or data literacy course'],
    roles: ['Shadowing opportunity', 'Campus organization role', 'Entry-level part-time role'],
  },
  foundation: {
    classes: ['Intermediate major course', 'Project-based class', 'Ethics/professional practice course'],
    roles: ['Internship or practicum', 'Research assistant position', 'Volunteer experience in field'],
  },
  building: {
    classes: ['Advanced technical/specialized elective', 'Capstone prep or methods course', 'Leadership or collaboration course'],
    roles: ['Competitive internship', 'Co-op / clinical / studio placement', 'Portfolio-based project role'],
  },
  advanced: {
    classes: ['Capstone/thesis/advanced seminar', 'Industry certification prep', 'Career transition strategy course'],
    roles: ['Target job-role internship', 'Graduate assistantship/fellowship', 'Full-time conversion pathway'],
  },
};

const state = {
  profile: { name: '', timezone: '', major: '', gpa: 3.5 },
  baseline: { internship: 45, sleep: 8, personal: 18 },
  career: { field: '', role: '', stage: 'exploring', priority: '' },
  classes: [],
  customRecommendations: { classes: [], internships: [] },
  dailyTasks: {},
  dailyNotes: {},
};

const els = {
  profileForm: document.getElementById('profile-form'),
  baselineForm: document.getElementById('baseline-form'),
  careerForm: document.getElementById('career-form'),
  classForm: document.getElementById('class-form'),
  taskForm: document.getElementById('daily-task-form'),
  customClassRecForm: document.getElementById('custom-class-rec-form'),
  customInternshipRecForm: document.getElementById('custom-internship-rec-form'),
  classList: document.getElementById('class-list'),
  allocationBody: document.getElementById('allocation-body'),
  dayPlan: document.getElementById('day-plan'),
  summary: document.getElementById('summary'),
  classRecommendations: document.getElementById('class-recommendations'),
  internshipRecommendations: document.getElementById('internship-recommendations'),
  taskList: document.getElementById('daily-task-list'),
  dailyDate: document.getElementById('daily-date'),
  dailyTitle: document.getElementById('daily-title'),
  dailyNote: document.getElementById('daily-note'),
  copySummary: document.getElementById('copy-day-summary'),
  exportData: document.getElementById('export-data'),
  importData: document.getElementById('import-data'),
  resetAll: document.getElementById('reset-all'),
  clearClasses: document.getElementById('clear-classes'),
};

function uid() {
  return crypto?.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function dayNameFromISO(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return days[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    Object.assign(state.profile, parsed.profile || {});
    Object.assign(state.baseline, parsed.baseline || {});
    Object.assign(state.career, parsed.career || {});
    state.classes = Array.isArray(parsed.classes) ? parsed.classes : [];
    state.customRecommendations.classes = Array.isArray(parsed.customRecommendations?.classes)
      ? parsed.customRecommendations.classes
      : [];
    state.customRecommendations.internships = Array.isArray(parsed.customRecommendations?.internships)
      ? parsed.customRecommendations.internships
      : [];
    state.dailyTasks = parsed.dailyTasks && typeof parsed.dailyTasks === 'object' ? parsed.dailyTasks : {};
    state.dailyNotes = parsed.dailyNotes && typeof parsed.dailyNotes === 'object' ? parsed.dailyNotes : {};
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calculateStudyHours(course) {
  const base = Math.max(course.credits * 2, course.meetingHours * 1.5);
  const difficultyBoost = 1 + (course.difficulty - 3) * 0.15;
  return Math.max(1.5, Number((base * difficultyBoost).toFixed(1)));
}

function totalAvailableHours() {
  return Number((168 - state.baseline.internship - state.baseline.sleep * 7 - state.baseline.personal).toFixed(1));
}

function totalRequiredHours() {
  return Number(state.classes.reduce((sum, c) => sum + c.meetingHours + calculateStudyHours(c), 0).toFixed(1));
}

function titleCase(value) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function getUniversalRecommendations() {
  const stage = state.career.stage || 'exploring';
  const template = stageTemplates[stage] || stageTemplates.exploring;
  const field = state.career.field.trim();
  const role = state.career.role.trim();
  const major = state.profile.major.trim();

  const contextualClasses = [
    major ? `${titleCase(major)} core requirement or elective` : null,
    field ? `${titleCase(field)} trends, policy, or market-analysis course` : null,
    state.career.priority.trim() ? `Learning goal aligned to priority: ${state.career.priority.trim()}` : null,
  ].filter(Boolean);

  const contextualRoles = [
    role ? `${titleCase(role)} pathway role (internship, assistantship, or project position)` : null,
    field ? `Professional association, club, or volunteer work in ${titleCase(field)}` : null,
    'Portfolio/research/project milestone with measurable outcomes',
  ].filter(Boolean);

  return {
    classes: [...template.classes, ...contextualClasses, ...state.customRecommendations.classes],
    internships: [...template.roles, ...contextualRoles, ...state.customRecommendations.internships],
  };
}

function renderInputs() {
  document.getElementById('profile-name').value = state.profile.name;
  document.getElementById('profile-timezone').value = state.profile.timezone;
  document.getElementById('profile-major').value = state.profile.major;
  document.getElementById('profile-gpa').value = state.profile.gpa;
  document.getElementById('internship-hours').value = state.baseline.internship;
  document.getElementById('sleep-hours').value = state.baseline.sleep;
  document.getElementById('personal-hours').value = state.baseline.personal;
  document.getElementById('career-field').value = state.career.field;
  document.getElementById('career-role').value = state.career.role;
  document.getElementById('career-stage').value = state.career.stage;
  document.getElementById('career-priority').value = state.career.priority;
}

function renderClassList() {
  els.classList.innerHTML = '';
  if (!state.classes.length) {
    els.classList.innerHTML = '<li class="list-item">No classes yet. Add one above.</li>';
    return;
  }

  state.classes.forEach((course) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <strong>${course.name}</strong>
      <span class="pill">${course.credits} credits</span>
      <span class="pill">${course.meetingHours}h in class</span>
      <span class="pill">Difficulty ${course.difficulty}/5</span>
      <span class="pill">Due ${course.dueDay}</span>
      <button class="delete" type="button" data-action="delete-class" data-id="${course.id}">Remove</button>
    `;
    els.classList.appendChild(li);
  });
}

function renderSummary() {
  const available = totalAvailableHours();
  const required = totalRequiredHours();
  const remaining = Number((available - required).toFixed(1));

  let level = 'ok';
  let message = `${state.profile.name || 'You'} have ${available} free hours/week and need ${required} for classes + study. `;
  if (remaining < 0) {
    level = 'alert';
    message += `You are overbooked by ${Math.abs(remaining)} hours. Reduce class load or rebalance work/personal time.`;
  } else if (remaining < 8) {
    level = 'warn';
    message += `Only ${remaining} buffer hours remain. Keep your commitments tight this week.`;
  } else {
    message += `${remaining} buffer hours remain for recovery and career progress work.`;
  }

  els.summary.className = `summary ${level}`;
  els.summary.textContent = message;
}

function renderAllocationTable() {
  els.allocationBody.innerHTML = '';
  if (!state.classes.length) {
    els.allocationBody.innerHTML = '<tr><td colspan="3">No classes added yet.</td></tr>';
    return;
  }

  state.classes
    .slice()
    .sort((a, b) => days.indexOf(a.dueDay) - days.indexOf(b.dueDay))
    .forEach((course) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${course.name}</td><td>${calculateStudyHours(course)}</td><td>${course.dueDay}</td>`;
      els.allocationBody.appendChild(tr);
    });
}

function renderDayPlan() {
  const byDay = Object.fromEntries(days.map((d) => [d, []]));

  state.classes.forEach((course) => {
    const study = calculateStudyHours(course);
    const perDay = Number((study / 3).toFixed(1));
    const dueIndex = days.indexOf(course.dueDay);
    const prepDays = [days[(dueIndex + 4) % 7], days[(dueIndex + 5) % 7], days[(dueIndex + 6) % 7]];
    prepDays.forEach((day) => byDay[day].push(`${course.name}: ${perDay}h prep`));
  });

  els.dayPlan.innerHTML = '';
  days.forEach((day) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `<strong>${day}</strong> — ${byDay[day].length ? byDay[day].join(' • ') : 'Recovery, admin, and light review.'}`;
    els.dayPlan.appendChild(li);
  });
}

function renderCareerRecommendations() {
  const recs = getUniversalRecommendations();

  els.classRecommendations.innerHTML = '';
  recs.classes.forEach((item) => {
    const isCustom = state.customRecommendations.classes.includes(item);
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `${item}${isCustom ? ` <span class="pill">custom</span> <button class="delete small" type="button" data-action="delete-custom-class" data-name="${item}">Remove</button>` : ''}`;
    els.classRecommendations.appendChild(li);
  });

  els.internshipRecommendations.innerHTML = '';
  recs.internships.forEach((item) => {
    const isCustom = state.customRecommendations.internships.includes(item);
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `${item}${isCustom ? ` <span class="pill">custom</span> <button class="delete small" type="button" data-action="delete-custom-internship" data-name="${item}">Remove</button>` : ''}`;
    els.internshipRecommendations.appendChild(li);
  });
}

function selectedDate() {
  return els.dailyDate.value || todayISO();
}

function ensureDate(date) {
  if (!Array.isArray(state.dailyTasks[date])) state.dailyTasks[date] = [];
  if (!Object.hasOwn(state.dailyNotes, date)) state.dailyNotes[date] = '';
}

function renderDailyPlanner() {
  const date = selectedDate();
  ensureDate(date);
  const dayName = dayNameFromISO(date);

  els.dailyTitle.textContent = `${dayName} checklist (${date})`;
  els.dailyNote.value = state.dailyNotes[date];
  els.taskList.innerHTML = '';

  if (!state.dailyTasks[date].length) {
    els.taskList.innerHTML = '<li class="list-item">No tasks for this date yet.</li>';
    return;
  }

  state.dailyTasks[date].forEach((task) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <label class="check-item">
        <input type="checkbox" data-action="toggle-task" data-id="${task.id}" ${task.done ? 'checked' : ''} />
        <span class="task-text ${task.done ? 'done' : ''}">${task.text}</span>
      </label>
      <button class="delete small" type="button" data-action="delete-task" data-id="${task.id}">Delete</button>
    `;
    els.taskList.appendChild(li);
  });
}

function daySummaryText(date) {
  ensureDate(date);
  const dayName = dayNameFromISO(date);
  const tasks = state.dailyTasks[date].map((t) => `- [${t.done ? 'x' : ' '}] ${t.text}`).join('\n');
  const field = state.career.field || 'Any field';
  const role = state.career.role || 'Any role';

  return `# ${(state.profile.name || 'Student')} Daily Plan (${date})\n\n`
    + `**Major/Program:** ${state.profile.major || 'Not set'}\n`
    + `**Career Field:** ${field}\n`
    + `**Target Role:** ${role}\n`
    + `**Stage:** ${state.career.stage}\n`
    + `**Priority:** ${state.career.priority || 'Not set'}\n\n`
    + `## ${dayName} Tasks\n${tasks || '- [ ] Add first task'}\n\n`
    + `## Notes\n${state.dailyNotes[date] || 'No notes yet.'}`;
}

function copyDaySummary() {
  navigator.clipboard.writeText(daySummaryText(selectedDate())).then(() => {
    els.copySummary.textContent = 'Copied!';
    setTimeout(() => {
      els.copySummary.textContent = 'Copy day summary';
    }, 1200);
  });
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `universal-planner-backup-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      Object.assign(state.profile, parsed.profile || {});
      Object.assign(state.baseline, parsed.baseline || {});
      Object.assign(state.career, parsed.career || {});
      state.classes = Array.isArray(parsed.classes) ? parsed.classes : [];
      state.customRecommendations.classes = Array.isArray(parsed.customRecommendations?.classes)
        ? parsed.customRecommendations.classes
        : [];
      state.customRecommendations.internships = Array.isArray(parsed.customRecommendations?.internships)
        ? parsed.customRecommendations.internships
        : [];
      state.dailyTasks = parsed.dailyTasks && typeof parsed.dailyTasks === 'object' ? parsed.dailyTasks : {};
      state.dailyNotes = parsed.dailyNotes && typeof parsed.dailyNotes === 'object' ? parsed.dailyNotes : {};
      renderAll();
    } catch {
      alert('Import failed. Use a JSON file exported from this app.');
    }
  };
  reader.readAsText(file);
}

function resetAll() {
  if (!confirm('This will clear all saved data. Continue?')) return;
  state.profile = { name: '', timezone: '', major: '', gpa: 3.5 };
  state.baseline = { internship: 45, sleep: 8, personal: 18 };
  state.career = { field: '', role: '', stage: 'exploring', priority: '' };
  state.classes = [];
  state.customRecommendations = { classes: [], internships: [] };
  state.dailyTasks = {};
  state.dailyNotes = {};
  els.dailyDate.value = todayISO();
  renderAll();
}

function renderAll() {
  renderInputs();
  renderClassList();
  renderSummary();
  renderAllocationTable();
  renderDayPlan();
  renderCareerRecommendations();
  renderDailyPlanner();
  saveState();
}

function bindEvents() {
  els.profileForm.addEventListener('input', () => {
    state.profile.name = document.getElementById('profile-name').value.trim();
    state.profile.timezone = document.getElementById('profile-timezone').value.trim();
    state.profile.major = document.getElementById('profile-major').value.trim();
    state.profile.gpa = Number(document.getElementById('profile-gpa').value) || 0;
    renderAll();
  });

  els.baselineForm.addEventListener('input', () => {
    state.baseline.internship = Number(document.getElementById('internship-hours').value) || 0;
    state.baseline.sleep = Number(document.getElementById('sleep-hours').value) || 0;
    state.baseline.personal = Number(document.getElementById('personal-hours').value) || 0;
    renderAll();
  });

  els.careerForm.addEventListener('input', () => {
    state.career.field = document.getElementById('career-field').value.trim();
    state.career.role = document.getElementById('career-role').value.trim();
    state.career.stage = document.getElementById('career-stage').value;
    state.career.priority = document.getElementById('career-priority').value.trim();
    renderAll();
  });

  els.classForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('class-name').value.trim();
    if (!name) return;

    state.classes.push({
      id: uid(),
      name,
      credits: Number(document.getElementById('class-credits').value),
      meetingHours: Number(document.getElementById('class-meeting-hours').value),
      difficulty: Number(document.getElementById('class-difficulty').value),
      dueDay: document.getElementById('class-due-day').value,
    });

    els.classForm.reset();
    document.getElementById('class-credits').value = 3;
    document.getElementById('class-meeting-hours').value = 3;
    document.getElementById('class-difficulty').value = 3;
    document.getElementById('class-due-day').value = 'Monday';
    renderAll();
  });

  els.clearClasses.addEventListener('click', () => {
    state.classes = [];
    renderAll();
  });

  els.classList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.dataset.action !== 'delete-class') return;
    state.classes = state.classes.filter((c) => c.id !== target.dataset.id);
    renderAll();
  });

  els.customClassRecForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('custom-class-rec-input');
    const value = input.value.trim();
    if (!value) return;
    state.customRecommendations.classes.push(value);
    input.value = '';
    renderAll();
  });

  els.customInternshipRecForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('custom-internship-rec-input');
    const value = input.value.trim();
    if (!value) return;
    state.customRecommendations.internships.push(value);
    input.value = '';
    renderAll();
  });

  document.querySelector('.recommendations-grid').addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action === 'delete-custom-class') {
      state.customRecommendations.classes = state.customRecommendations.classes.filter((item) => item !== target.dataset.name);
      renderAll();
    }
    if (target.dataset.action === 'delete-custom-internship') {
      state.customRecommendations.internships = state.customRecommendations.internships.filter((item) => item !== target.dataset.name);
      renderAll();
    }
  });

  els.dailyDate.addEventListener('change', () => {
    renderDailyPlanner();
    saveState();
  });

  els.taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('daily-task-input');
    const value = input.value.trim();
    if (!value) return;
    const date = selectedDate();
    ensureDate(date);
    state.dailyTasks[date].push({ id: uid(), text: value, done: false });
    input.value = '';
    renderAll();
  });

  els.taskList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.dataset.action !== 'delete-task') return;
    const date = selectedDate();
    ensureDate(date);
    state.dailyTasks[date] = state.dailyTasks[date].filter((task) => task.id !== target.dataset.id);
    renderAll();
  });

  els.taskList.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.dataset.action !== 'toggle-task') return;
    const date = selectedDate();
    ensureDate(date);
    const task = state.dailyTasks[date].find((item) => item.id === target.dataset.id);
    if (!task) return;
    task.done = target.checked;
    renderAll();
  });

  els.dailyNote.addEventListener('input', () => {
    const date = selectedDate();
    ensureDate(date);
    state.dailyNotes[date] = els.dailyNote.value;
    saveState();
  });

  els.copySummary.addEventListener('click', copyDaySummary);
  els.exportData.addEventListener('click', exportData);
  els.importData.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    importData(target.files?.[0]);
    target.value = '';
  });
  els.resetAll.addEventListener('click', resetAll);
}

function init() {
  loadState();
  if (!els.dailyDate.value) els.dailyDate.value = todayISO();
  bindEvents();
  renderAll();
}

init();
