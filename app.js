const stateKey = "betterme-progress-v2";
const habits = [
  { name: "Talking in English", points: 20, icon: "◉" },
  { name: "Workout", points: 20, icon: "↔" },
  { name: "Confident", points: 10, icon: "♛" },
  { name: "Observant", points: 10, icon: "◉" },
  { name: "Anger control emotions control", points: 10, icon: "✿" },
  { name: "Honest", points: 20, icon: "⬟" },
  { name: "Helpful", points: 20, icon: "♥" },
  { name: "Don't think of bad past and future at all", points: 30, icon: "❋" },
  { name: "No insta, no utube, no screen time", points: 30, icon: "⊘" },
  { name: "No junk, only homemade food", points: 10, icon: "▥" },
  { name: "Eat less and workmore", points: 10, icon: "▥" },
  { name: "Your daily work which is written in the notes", points: 50, icon: "▤" },
  { name: "Skin care (you can start after buying with your own money)", points: 0, icon: "☀" },
  { name: "No insta only on Saturday at 9 o clock only for half hour", points: 0, icon: "◎" },
  { name: "Drink 3L of water", points: 20, icon: "◌" },
  { name: "no sal", points: 50, icon: "◈" }
];
const today = new Date();
function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function dateFromKey(key) { const [year, month, day] = key.split("-").map(Number); return new Date(year, month - 1, day); }
function dateOffsetFrom(key, offset) { const date = dateFromKey(key); date.setDate(date.getDate() + offset); return localDateKey(date); }
let dateKey = localDateKey(today);
const dateLabel = today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const defaultState = { completed: Array(habits.length).fill(false), history: {}, goals: [70, 100, 100, 25], startDate: dateKey, currentDate: dateKey };
let state = JSON.parse(localStorage.getItem(stateKey) || "null") || defaultState;
if (!state.currentDate) state = { ...defaultState };
state.history = state.history || {};
state.goals = [state.goals?.[0] ?? 70, state.goals?.[1] ?? 100, state.goals?.[2] ?? 100, 25];
state.startDate = state.startDate || dateKey;
if (state.currentDate !== dateKey) {
  state.completed = Array(habits.length).fill(false);
  state.currentDate = dateKey;
  save();
}
state.completed = habits.map((_, index) => Boolean(state.completed[index]));

document.querySelector("#date-chip").textContent = `▣  ${dateLabel}`;
document.querySelector("#today-date").textContent = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });

function save() { localStorage.setItem(stateKey, JSON.stringify(state)); }
function syncToday() {
  const currentDate = localDateKey();
  if (currentDate === dateKey) return;
  dateKey = currentDate;
  state.currentDate = dateKey;
  state.completed = Array(habits.length).fill(false);
  document.querySelector("#date-chip").textContent = `▣  ${new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}`;
  document.querySelector("#today-date").textContent = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  save();
  renderAll();
}
function completedCount() { return state.completed.filter(Boolean).length; }
function points() { return state.completed.reduce((total, done, index) => total + (done ? habits[index].points : 0), 0); }
function maxPoints() { return habits.reduce((total, habit) => total + habit.points, 0); }
function historyEntry(key) { const entry = state.history[key]; return typeof entry === "number" ? { count: entry, points: 0, bonus: 0 } : entry || { count: 0, points: 0, bonus: 0 }; }
function dateOffset(offset) { return dateOffsetFrom(dateKey, offset); }
function journeyDayFor(key) { return Math.floor((dateFromKey(key) - dateFromKey(state.startDate)) / 86400000) + 1; }
function isJourneyDate(key) { const day = journeyDayFor(key); return day >= 1 && day <= 90; }
function currentStreak() { let streak = 0; for (let offset = 0; offset < 90; offset += 1) { const key = dateOffset(-offset); if (!isJourneyDate(key) || historyEntry(key).count === 0) break; streak += 1; } return streak; }
function bestStreak() { let best = 0; let streak = 0; for (let day = 1; day <= 90; day += 1) { const key = dateOffsetFrom(state.startDate, day - 1); if (key > dateKey) continue; if (historyEntry(key).count > 0) { streak += 1; best = Math.max(best, streak); } else streak = 0; } return best; }
function weeklyPoints() { return Array.from({ length: 7 }, (_, index) => historyEntry(dateOffset(-6 + index)).points).reduce((total, value) => total + value, 0); }
function streakBonus(previousStreak) { return Math.min(25, Math.floor(previousStreak / 3) * 5); }
function setText(selector, value) { const element = document.querySelector(selector); if (element) element.textContent = value; }
function showToast(message) { const toast = document.querySelector("#toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200); }

function renderGoals() {
  const names = ["GSoC 2027 preparation", "Web development course", "C++ fundamentals", "Resume"];
  document.querySelector("#goal-list").innerHTML = names.map((name, index) => `<div class="goal-row"><div class="goal-icon">${["G", "W", "C", "R"][index]}</div><div><div class="goal-name">${name}</div><div class="goal-meta">${index === 0 ? "Target: reach a confident 70% foundation" : index === 3 ? "1/4 of the resume part should be completed" : "Keep the momentum through the next 3 months"}</div><div class="progress-track"><span class="progress-fill" style="width:${state.goals[index]}%"></span></div></div><div class="goal-percent">${state.goals[index]}%</div></div>`).join("");
}
function renderHabits() {
  document.querySelector("#habit-body").innerHTML = habits.map((habit, index) => `<tr><td><input class="check" type="checkbox" ${state.completed[index] ? "checked" : ""} data-index="${index}" aria-label="Mark ${habit.name} complete"></td><td><span style="color:var(--mint); margin-right:7px">${habit.icon}</span><span class="habit-name">${habit.name}</span></td><td>${habit.points ? `<span class="tag">${habit.points} pts</span>` : "--"}</td><td><span class="tag ${state.completed[index] ? "" : habit.points ? "pending" : "na"}">${habit.points ? state.completed[index] ? "● Done" : "● Pending" : "N/A"}</span></td></tr>`).join("");
  document.querySelectorAll(".check").forEach(input => input.addEventListener("change", event => { state.completed[Number(event.target.dataset.index)] = event.target.checked; const previousStreak = Array.from({ length: 89 }, (_, index) => index + 1).findIndex(offset => historyEntry(dateOffset(-offset)).count === 0); const consecutiveDays = previousStreak === -1 ? 89 : previousStreak; state.history[dateKey] = { count: completedCount(), points: points(), bonus: event.target.checked ? streakBonus(consecutiveDays) : 0 }; save(); renderAll(); showToast(event.target.checked ? "Habit completed. Nice work." : "Habit moved back to pending."); }));
}
function renderChart() {
  const canvas = document.querySelector("#progress-chart"); const ctx = canvas.getContext("2d"); const width = canvas.clientWidth; const height = canvas.clientHeight; const ratio = window.devicePixelRatio || 1; canvas.width = width * ratio; canvas.height = height * ratio; ctx.scale(ratio, ratio); const values = Array.from({ length: 7 }, (_, index) => { const entry = historyEntry(dateOffset(-6 + index)); return entry.points + (entry.bonus || 0); }); const scale = Math.ceil(Math.max(maxPoints(), ...values) / 50) * 50 || 50; const pad = { left: 38, right: 10, top: 20, bottom: 30 }; const chartW = width - pad.left - pad.right; const chartH = height - pad.top - pad.bottom;
  ctx.clearRect(0, 0, width, height); ctx.font = "10px Trebuchet MS"; ctx.fillStyle = "#8ea9bd"; ctx.strokeStyle = "rgba(126,187,212,.14)"; ctx.lineWidth = 1;
  for (let value = 0; value <= scale; value += scale / 4) { const y = pad.top + chartH - value / scale * chartH; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke(); ctx.fillText(Math.round(value), 8, y + 3); }
  const chartPoints = values.map((value, index) => ({ x: pad.left + index * chartW / 6, y: pad.top + chartH - Math.min(scale, value) / scale * chartH })); ctx.beginPath(); chartPoints.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.lineTo(chartPoints.at(-1).x, pad.top + chartH); ctx.lineTo(chartPoints[0].x, pad.top + chartH); ctx.closePath(); const fill = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH); fill.addColorStop(0, "rgba(45,229,176,.45)"); fill.addColorStop(1, "rgba(45,229,176,.03)"); ctx.fillStyle = fill; ctx.fill(); ctx.beginPath(); chartPoints.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.strokeStyle = "#2de5b0"; ctx.lineWidth = 2; ctx.stroke();
  chartPoints.forEach((point, index) => { ctx.beginPath(); ctx.fillStyle = "#2de5b0"; ctx.arc(point.x, point.y, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#b5cbd4"; ctx.fillText(index === 6 ? "Today" : `${6 - index}d ago`, point.x - 15, height - 9); });
}
function renderAll() { const count = completedCount(); const total = points(); const current = currentStreak(); const completionPercent = Math.round(count / habits.length * 100); const journeyDay = Math.min(90, Math.max(1, journeyDayFor(dateKey))); setText("#completed-count", `${count} / ${habits.length} completed`); setText("#progress-percent", `${completionPercent}%`); setText("#total-points", `${total} / ${maxPoints()}`); setText("#journey-day", `Day ${journeyDay} / 90`); setText("#done-stat", count); setText("#point-stat", total); setText("#week-stat", `${weeklyPoints()} pts`); setText("#hero-progress", `${completionPercent}%`); setText("#best-streak", `${bestStreak()} Days`); setText("#current-streak", `${current} Days`); setText("#habit-total", habits.length); const journeyFill = document.querySelector(".journey-line span"); if (journeyFill) journeyFill.style.width = `${Math.round(journeyDay / 90 * 100)}%`; const heroFill = document.querySelector("#hero-meter-fill"); if (heroFill) heroFill.style.width = `${completionPercent}%`; renderGoals(); renderHabits(); renderChart(); renderCalendar(); }
function renderCalendar() { const calendar = document.querySelector("#calendar"); calendar.innerHTML = Array.from({ length: 90 }, (_, index) => { const key = dateOffsetFrom(state.startDate, index); const value = historyEntry(key).count; const elapsed = key <= dateKey; return `<span class="day-dot ${value >= habits.length ? "done" : value > 0 ? "partial" : ""} ${!elapsed ? "future" : ""} ${key === dateKey ? "today" : ""}" title="Day ${index + 1} · ${key}: ${elapsed ? `${value}/${habits.length} habits` : "Not started"}"></span>`; }).join(""); }

document.querySelectorAll(".nav-btn").forEach(button => button.addEventListener("click", () => { document.querySelectorAll(".nav-btn").forEach(item => item.classList.remove("active")); button.classList.add("active"); document.querySelectorAll(".view").forEach(view => view.classList.remove("active")); document.querySelector(`#${button.dataset.view}`).classList.add("active"); if (button.dataset.view === "progress-view") setTimeout(renderChart, 10); }));
document.querySelector("#add-task").addEventListener("click", () => { const name = window.prompt("What habit or goal should be added?"); if (name) showToast(`${name} added to your plan.`); });
document.querySelector("#open-progress").addEventListener("click", () => document.querySelector('[data-view="progress-view"]').click());
document.querySelector("#scroll-goals").addEventListener("click", () => document.querySelector("#goals-panel").scrollIntoView({ behavior: "smooth", block: "start" }));
window.addEventListener("resize", renderChart); renderAll(); window.setInterval(syncToday, 60000);
