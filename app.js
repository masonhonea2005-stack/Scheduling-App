const STORAGE_KEY = 'scheduling-app-plan-v3';
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultCareerTracks = {
  'software-engineering': {
    classes: {
      freshman: ['Intro to Programming', 'Calculus I', 'Discrete Math'],
      sophomore: ['Data Structures', 'Computer Organization', 'Algorithms'],
      junior: ['Operating Systems', 'Databases', 'Software Engineering'],
      senior: ['Distributed Systems', 'Cloud Computing', 'Capstone Project'],
    },
    internships: {
      freshman: ['IT Support Intern', 'QA Intern'],
      sophomore: ['Frontend Developer Intern', 'Software Intern (local/startup)'],
      junior: ['Software Engineer Intern', 'Platform Engineering Intern'],
      senior: ['Backend Engineer Intern', 'Return Offer Internship'],
    },
  },
  'data-science': {
    classes: {
      freshman: ['Python for Data Analysis', 'Statistics I', 'Calculus I'],
      sophomore: ['Linear Algebra', 'Data Structures', 'Database Fundamentals'],
      junior: ['Machine Learning', 'Data Mining', 'Probability II'],
      senior: ['Deep Learning', 'MLOps', 'AI Ethics'],
    },
    internships: {
      freshman: ['Analytics Intern', 'Reporting Intern'],
      sophomore: ['Data Analyst Intern', 'BI Intern'],
      junior: ['Data Science Intern', 'ML Engineer Intern'],
      senior: ['Applied AI Intern', 'Research Engineer Intern'],
    },
  },
  cybersecurity: {
    classes: {
      freshman: ['Networking Fundamentals', 'Linux Essentials', 'Intro to Cybersecurity'],
      sophomore: ['Secure Programming', 'System Administration', 'Digital Forensics'],
      junior: ['Ethical Hacking', 'Network Security', 'Security Operations'],
      senior: ['Cloud Security', 'Incident Response', 'Threat Detection'],
    },
    internships: {
      freshman: ['IT Operations Intern', 'Help Desk Intern'],
      sophomore: ['SOC Analyst Intern', 'GRC Intern'],
      junior: ['Cybersecurity Intern', 'Penetration Testing Intern'],
      senior: ['Security Engineer Intern', 'Threat Intelligence Intern'],
    },
  },
  'product-management': {
    classes: {
      freshman: ['Intro to Business', 'Public Speaking', 'Statistics I'],
      sophomore: ['UX Fundamentals', 'Microeconomics', 'Product Design Basics'],
      junior: ['Product Management', 'Technical Writing', 'Software Concepts'],
      senior: ['Roadmapping Strategy', 'Leadership in Tech', 'Capstone Product Lab'],
    },
    internships: {
      freshman: ['Operations Intern', 'Marketing Intern'],
      sophomore: ['Customer Success Intern', 'Product Operations Intern'],
      junior: ['APM Intern', 'Growth Product Intern'],
      senior: ['Product Manager Intern', 'Technical PM Intern'],
    },
  },
};

const state = {
  profile: {
    name: '',
    timezone: '',
    gpa: 3.5,
  },
  baseline: {
    internship: 45,
    sleep: 8,
    personal: 18,
  },
  career: {
    path: 'software-engineering',
    stage: 'freshman',
  },
  classes: [],
  customRecommendations: {
    classes: [],
    internships: [],
  },
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
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
  const sleepWeekly = Number(state.baseline.sleep) * 7;
  return Number((168 - Number(state.baseline.internship) - sleepWeekly - Number(state.baseline.personal)).toFixed(1));
}

function totalRequiredHours() {
  return Number(state.classes.reduce((sum, c) => sum + c.meetingHours + calculateStudyHours(c), 0).toFixed(1));
}

function getCurrentRecommendations() {
  const track = defaultCareerTracks[state.career.path];
  const baseClasses = track?.classes[state.career.stage] || [];
  const baseInternships = track?.internships[state.career.stage] || [];

  return {
    classes: [...baseClasses, ...state.customRecommendations.classes],
    internships: [...baseInternships, ...state.customRecommendations.internships],
  };
}

function renderInputs() {
  document.getElementById('profile-name').value = state.profile.name;
  document.getElementById('profile-timezone').value = state.profile.timezone;
  document.getElementById('profile-gpa').value = state.profile.gpa;
  document.getElementById('internship-hours').value = state.baseline.internship;
  document.getElementById('sleep-hours').value = state.baseline.sleep;
  document.getElementById('personal-hours').value = state.baseline.personal;
  document.getElementById('career-path').value = state.career.path;
  document.getElementById('career-stage').value = state.career.stage;
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
  let message = `${state.profile.name || 'You'} have ${available} free hours/week and need ${required} hours for class + study. `;

  if (remaining < 0) {
    level = 'alert';
    message += `You are overbooked by ${Math.abs(remaining)} hours. Reduce load or rebalance internship/personal time.`;
  } else if (remaining < 8) {
    level = 'warn';
    message += `Only ${remaining} buffer hours remain. Protect your energy and avoid extra obligations.`;
  } else {
    message += `${remaining} buffer hours remain for rest, interview prep, and life admin.`;
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
  const planByDay = Object.fromEntries(days.map((day) => [day, []]));

  state.classes.forEach((course) => {
    const study = calculateStudyHours(course);
    const perDay = Number((study / 3).toFixed(1));
    const dueIndex = days.indexOf(course.dueDay);
    const prepDays = [days[(dueIndex + 4) % 7], days[(dueIndex + 5) % 7], days[(dueIndex + 6) % 7]];
    prepDays.forEach((day) => {
      planByDay[day].push(`${course.name}: ${perDay}h prep`);
    });
  });

  els.dayPlan.innerHTML = '';
  days.forEach((day) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    const details = planByDay[day].length ? planByDay[day].join(' • ') : 'Recovery, admin tasks, and light review.';
    li.innerHTML = `<strong>${day}</strong> — ${details}`;
    els.dayPlan.appendChild(li);
  });
}

function renderCareerRecommendations() {
  const recommendations = getCurrentRecommendations();

  els.classRecommendations.innerHTML = '';
  recommendations.classes.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    const custom = index >= recommendations.classes.length - state.customRecommendations.classes.length;
    li.innerHTML = `${item}${custom ? ' <span class="pill">custom</span> <button class="delete small" type="button" data-action="delete-custom-class" data-name="' + item + '">Remove</button>' : ''}`;
    els.classRecommendations.appendChild(li);
  });

  els.internshipRecommendations.innerHTML = '';
  recommendations.internships.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    const custom = index >= recommendations.internships.length - state.customRecommendations.internships.length;
    li.innerHTML = `${item}${custom ? ' <span class="pill">custom</span> <button class="delete small" type="button" data-action="delete-custom-internship" data-name="' + item + '">Remove</button>' : ''}`;
    els.internshipRecommendations.appendChild(li);
  });
}

function getSelectedDate() {
  return els.dailyDate.value || todayISO();
}

function ensureDay(date) {
  if (!Array.isArray(state.dailyTasks[date])) state.dailyTasks[date] = [];
  if (!Object.hasOwn(state.dailyNotes, date)) state.dailyNotes[date] = '';
}

function renderDailyPlanner() {
  const date = getSelectedDate();
  ensureDay(date);
  const dayName = dayNameFromISO(date);

  els.dailyTitle.textContent = `${dayName} checklist (${date})`;
  els.dailyTaskList.innerHTML = '';
  els.dailyNote.value = state.dailyNotes[date] || '';

  if (!state.dailyTasks[date].length) {
    const empty = document.createElement('li');
    empty.className = 'list-item';
    empty.textContent = 'No tasks for this day yet. Add one below.';
    els.dailyTaskList.appendChild(empty);
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
    els.dailyTaskList.appendChild(li);
  });
}

function getDailySummaryText(date) {
  ensureDay(date);
  const dayName = dayNameFromISO(date);
  const tasks = state.dailyTasks[date]
    .map((task) => `- [${task.done ? 'x' : ' '}] ${task.text}`)
    .join('\n');
  const focusLine = Array.from(els.dayPlan.querySelectorAll('.list-item'))
    .find((li) => li.textContent.startsWith(dayName))
    ?.textContent.trim();

  return `# ${state.profile.name || 'Student'} Daily Plan (${date})\n\n`
    + `**Timezone:** ${state.profile.timezone || 'Not set'}\n`
    + `**Target GPA:** ${state.profile.gpa}\n`
    + `**Career Path:** ${state.career.path.replace('-', ' ')} (${state.career.stage})\n\n`
    + `## Day Focus\n${focusLine || 'No focus generated yet.'}\n\n`
    + `## Tasks\n${tasks || '- [ ] Add your first task'}\n\n`
    + `## Notes\n${state.dailyNotes[date] || 'No notes yet.'}`;
}

function copyDailySummary() {
  const date = getSelectedDate();
  const summary = getDailySummaryText(date);
  navigator.clipboard.writeText(summary).then(() => {
    els.copySummary.textContent = 'Copied!';
    setTimeout(() => {
      els.copySummary.textContent = 'Copy day summary';
    }, 1200);
  });
}

function exportData() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `schedule-planner-backup-${todayISO()}.json`;
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
      alert('Could not import file. Please use a JSON file exported from this app.');
    }
  };
  reader.readAsText(file);
}

function resetAll() {
  const ok = confirm('This will permanently clear all data. Continue?');
  if (!ok) return;

  state.profile = { name: '', timezone: '', gpa: 3.5 };
  state.baseline = { internship: 45, sleep: 8, personal: 18 };
  state.career = { path: 'software-engineering', stage: 'freshman' };
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
    state.career.path = document.getElementById('career-path').value;
    state.career.stage = document.getElementById('career-stage').value;
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
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== 'delete-class') return;

    state.classes = state.classes.filter((course) => course.id !== target.dataset.id);
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

  const recommendationsContainer = document.querySelector('.recommendations-grid');
  recommendationsContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.dataset.action === 'delete-custom-class') {
      state.customRecommendations.classes = state.customRecommendations.classes.filter((item) => item !== target.dataset.name);
      renderAll();
      return;
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

    const date = getSelectedDate();
    ensureDay(date);
    state.dailyTasks[date].push({ id: uid(), text: value, done: false });
    input.value = '';
    renderAll();
  });

  els.taskList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== 'delete-task') return;

    const date = getSelectedDate();
    ensureDay(date);
    state.dailyTasks[date] = state.dailyTasks[date].filter((task) => task.id !== target.dataset.id);
    renderAll();
  });

  els.taskList.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.dataset.action !== 'toggle-task') return;

    const date = getSelectedDate();
    ensureDay(date);
    const task = state.dailyTasks[date].find((item) => item.id === target.dataset.id);
    if (!task) return;
    task.done = target.checked;
    renderAll();
  });

  els.dailyNote.addEventListener('input', () => {
    const date = getSelectedDate();
    ensureDay(date);
    state.dailyNotes[date] = els.dailyNote.value;
    saveState();
  });

  els.copySummary.addEventListener('click', copyDailySummary);
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
