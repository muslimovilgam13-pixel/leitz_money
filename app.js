const STORAGE_KEY = "leitz-flow-v4";
const SECURITY_KEY = "leitz-flow-security-v1";
const SESSION_KEY = "leitz-flow-session-unlocked";
const MONTH_SHORT = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const MONTH_FULL = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

const initialState = {
  incomeEntries: [],
  debtors: [],
  goals: {},
  ui: {
    view: "month",
    section: "overview",
  },
};

const initialSecurityState = {
  pinHash: "",
  biometricCredentialId: "",
};

const state = loadState();
const security = loadSecurity();
const biometric = {
  available: false,
  checked: false,
  label: "Face ID / Touch ID",
};

const refs = {
  viewTabs: document.getElementById("viewTabs"),
  sectionTabsDesktop: document.getElementById("sectionTabsDesktop"),
  sectionTabsMobile: document.getElementById("sectionTabsMobile"),
  monthFilter: document.getElementById("monthFilter"),
  rangeStart: document.getElementById("rangeStart"),
  rangeEnd: document.getElementById("rangeEnd"),
  yearFilter: document.getElementById("yearFilter"),
  singleMonthControl: document.getElementById("singleMonthControl"),
  rangeStartControl: document.getElementById("rangeStartControl"),
  rangeEndControl: document.getElementById("rangeEndControl"),
  yearControl: document.getElementById("yearControl"),
  entrySearch: document.getElementById("entrySearch"),
  debtorSearch: document.getElementById("debtorSearch"),
  clientSuggestions: document.getElementById("clientSuggestions"),
  clientSelect: document.getElementById("clientSelect"),
  incomeForm: document.getElementById("incomeForm"),
  debtorForm: document.getElementById("debtorForm"),
  goalDialog: document.getElementById("goalDialog"),
  goalForm: document.getElementById("goalForm"),
  openGoalBtn: document.getElementById("openGoalBtn"),
  paymentDialog: document.getElementById("paymentDialog"),
  paymentForm: document.getElementById("paymentForm"),
  paymentDialogTitle: document.getElementById("paymentDialogTitle"),
  incomeEditDialog: document.getElementById("incomeEditDialog"),
  incomeEditForm: document.getElementById("incomeEditForm"),
  debtorEditDialog: document.getElementById("debtorEditDialog"),
  debtorEditForm: document.getElementById("debtorEditForm"),
  exportJsonBtn: document.getElementById("exportJsonBtn"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  importBtn: document.getElementById("importBtn"),
  importInput: document.getElementById("importInput"),
  seedDemoBtn: document.getElementById("seedDemoBtn"),
  securityBtn: document.getElementById("securityBtn"),
  heroIncome: document.getElementById("heroIncome"),
  heroCaption: document.getElementById("heroCaption"),
  selectionLabel: document.getElementById("selectionLabel"),
  heroTrend: document.getElementById("heroTrend"),
  heroBars: document.getElementById("heroBars"),
  heroBarsMeta: document.getElementById("heroBarsMeta"),
  sidebarIncome: document.getElementById("sidebarIncome"),
  sidebarLabel: document.getElementById("sidebarLabel"),
  goalAmount: document.getElementById("goalAmount"),
  goalMeta: document.getElementById("goalMeta"),
  goalProgress: document.getElementById("goalProgress"),
  ordersCountMetric: document.getElementById("ordersCountMetric"),
  averageDayMetric: document.getElementById("averageDayMetric"),
  pendingDebtsMetric: document.getElementById("pendingDebtsMetric"),
  openDebtorsMetric: document.getElementById("openDebtorsMetric"),
  bestDayMetric: document.getElementById("bestDayMetric"),
  yearIncomeMetric: document.getElementById("yearIncomeMetric"),
  yearIncomeMetricAnalytics: document.getElementById("yearIncomeMetricAnalytics"),
  yearOrdersMetric: document.getElementById("yearOrdersMetric"),
  activeMonthsMetric: document.getElementById("activeMonthsMetric"),
  averageMonthMetric: document.getElementById("averageMonthMetric"),
  focusList: document.getElementById("focusList"),
  compareChart: document.getElementById("compareChart"),
  comparisonCaption: document.getElementById("comparisonCaption"),
  yearLineChart: document.getElementById("yearLineChart"),
  yearTotalMetric: document.getElementById("yearTotalMetric"),
  insightGrid: document.getElementById("insightGrid"),
  daysList: document.getElementById("daysList"),
  debtorsList: document.getElementById("debtorsList"),
  lockScreen: document.getElementById("lockScreen"),
  lockModeLabel: document.getElementById("lockModeLabel"),
  lockTitle: document.getElementById("lockTitle"),
  lockText: document.getElementById("lockText"),
  lockForm: document.getElementById("lockForm"),
  lockPinInput: document.getElementById("lockPinInput"),
  lockPinConfirmWrap: document.getElementById("lockPinConfirmWrap"),
  lockPinConfirmInput: document.getElementById("lockPinConfirmInput"),
  lockError: document.getElementById("lockError"),
  lockSubmitBtn: document.getElementById("lockSubmitBtn"),
  biometricUnlockBtn: document.getElementById("biometricUnlockBtn"),
  securityDialog: document.getElementById("securityDialog"),
  securityForm: document.getElementById("securityForm"),
  securityCurrentPinWrap: document.getElementById("securityCurrentPinWrap"),
  securityCurrentPin: document.getElementById("securityCurrentPin"),
  securityNewPin: document.getElementById("securityNewPin"),
  securityConfirmPin: document.getElementById("securityConfirmPin"),
  securityError: document.getElementById("securityError"),
  biometricStatusText: document.getElementById("biometricStatusText"),
  enableBiometricBtn: document.getElementById("enableBiometricBtn"),
  lockNowBtn: document.getElementById("lockNowBtn"),
  sections: [...document.querySelectorAll(".app-section")],
};

initializeDefaults();
bindEvents();
render();
syncSecurityUi();
void detectBiometricAvailability();
void registerServiceWorker();
void requestPersistentStorage();

function initializeDefaults() {
  const realToday = new Date();
  const anchorMonth = getLatestMonthFromData() || formatMonthValue(realToday);
  const anchorYear = Number(anchorMonth.slice(0, 4));
  refs.monthFilter.value = anchorMonth;
  refs.rangeStart.value = getRelativeMonth(anchorMonth, -2);
  refs.rangeEnd.value = anchorMonth;
  refs.incomeForm.date.value = formatDateForInput(realToday);
  refs.debtorForm.deadline.value = formatDateForInput(realToday);
  refs.paymentForm.paymentDate.value = formatDateForInput(realToday);
  populateYearOptions(anchorYear);
  refs.yearFilter.value = String(anchorYear);
  syncFilterVisibility();
  syncSectionVisibility();
  refs.incomeForm.ordersCount.value = "0";
}

function bindEvents() {
  refs.viewTabs.addEventListener("click", handleViewTabClick);
  refs.sectionTabsDesktop.addEventListener("click", handleSectionClick);
  refs.sectionTabsMobile.addEventListener("click", handleSectionClick);
  refs.monthFilter.addEventListener("change", render);
  refs.rangeStart.addEventListener("change", handleRangeChange);
  refs.rangeEnd.addEventListener("change", handleRangeChange);
  refs.yearFilter.addEventListener("change", render);
  refs.entrySearch.addEventListener("input", render);
  refs.debtorSearch.addEventListener("input", render);
  refs.clientSelect.addEventListener("change", handleClientSelectChange);
  refs.securityBtn.addEventListener("click", openSecurityDialog);
  refs.openGoalBtn.addEventListener("click", openGoalDialog);
  refs.goalForm.addEventListener("submit", handleGoalSubmit);
  refs.incomeForm.addEventListener("submit", handleIncomeSubmit);
  refs.debtorForm.addEventListener("submit", handleDebtorSubmit);
  refs.paymentForm.addEventListener("submit", handlePaymentSubmit);
  refs.incomeEditForm.addEventListener("submit", handleIncomeEditSubmit);
  refs.debtorEditForm.addEventListener("submit", handleDebtorEditSubmit);
  refs.lockForm.addEventListener("submit", handleLockSubmit);
  refs.securityForm.addEventListener("submit", handleSecuritySubmit);
  refs.enableBiometricBtn.addEventListener("click", handleEnableBiometric);
  refs.biometricUnlockBtn.addEventListener("click", handleBiometricUnlock);
  refs.lockNowBtn.addEventListener("click", handleLockNow);
  refs.daysList.addEventListener("click", handleIncomeListClick);
  refs.debtorsList.addEventListener("click", handleDebtorListClick);
  refs.exportJsonBtn.addEventListener("click", exportJson);
  refs.exportCsvBtn.addEventListener("click", exportCsvBundle);
  refs.importBtn.addEventListener("click", () => refs.importInput.click());
  refs.importInput.addEventListener("change", importJson);
  refs.seedDemoBtn.addEventListener("click", seedDemoData);
  document.addEventListener("click", handleJumpClick);
  window.addEventListener("storage", handleExternalStorageSync);
  [
    refs.lockPinInput,
    refs.lockPinConfirmInput,
    refs.securityCurrentPin,
    refs.securityNewPin,
    refs.securityConfirmPin,
  ].forEach((input) => input.addEventListener("input", sanitizePinField));
}

function handleExternalStorageSync(event) {
  if (event.key === STORAGE_KEY) {
    const nextState = loadState();
    const currentUi = { ...state.ui };
    state.incomeEntries = nextState.incomeEntries;
    state.debtors = nextState.debtors;
    state.goals = nextState.goals;
    state.ui = currentUi;
    populateYearOptions();
    render();
    return;
  }

  if (event.key === SECURITY_KEY) {
    const nextSecurity = loadSecurity();
    security.pinHash = nextSecurity.pinHash;
    security.biometricCredentialId = nextSecurity.biometricCredentialId;
    syncSecurityUi();
    return;
  }

  if (event.key === SESSION_KEY) {
    syncSecurityUi();
  }
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const isSecureHost = window.location.protocol === "https:" || isLocalHost;
  if (!isSecureHost) {
    return;
  }

  try {
    await navigator.serviceWorker.register("sw.js");
  } catch (error) {
    console.warn("Service worker registration skipped.", error);
  }
}

async function requestPersistentStorage() {
  if (!navigator.storage?.persist) {
    return;
  }

  try {
    await navigator.storage.persist();
  } catch (error) {
    console.warn("Persistent storage request skipped.", error);
  }
}

function render() {
  populateYearOptions();
  syncFilterVisibility();
  syncSectionVisibility();

  const filter = getActiveFilter();
  const sliceEntries = filter.currentEntries;
  const filteredEntries = filterEntriesByQuery(sliceEntries, refs.entrySearch.value);
  const debtors = getDebtorsSnapshot();
  const groupedDebtors = groupDebtorsByClient(debtors);
  const filteredDebtors = filterDebtorsByQuery(groupedDebtors, refs.debtorSearch.value);
  const sliceMetrics = buildSliceMetrics(sliceEntries, filter.previousEntries, debtors);
  const yearMetrics = buildYearMetrics(filter.selectedYear);
  const goalData = buildGoalData(filter, sliceMetrics.totalIncome);

  renderClientSuggestions(debtors);
  renderHero(filter, sliceMetrics, goalData);
  renderStats(sliceMetrics, yearMetrics);
  renderFocus(filter, sliceMetrics, debtors);
  renderCompare(filter, sliceMetrics);
  renderYearChart(yearMetrics.monthTotals);
  renderInsights(filter, sliceMetrics, yearMetrics);
  renderIncomeList(filteredEntries);
  renderDebtorList(filteredDebtors);
}

function renderHero(filter, metrics, goalData) {
  refs.heroIncome.textContent = formatCurrency(metrics.totalIncome);
  refs.heroCaption.textContent = filter.caption;
  refs.selectionLabel.textContent = filter.label;
  refs.heroTrend.textContent = filter.trendLabel(metrics);
  refs.heroTrend.style.color = metrics.delta >= 0 ? "var(--accent)" : "var(--danger)";
  refs.sidebarIncome.textContent = formatCurrency(metrics.totalIncome);
  refs.sidebarLabel.textContent = filter.label;
  refs.goalAmount.textContent = goalData.target > 0 ? formatCurrency(goalData.target) : "Не задана";
  refs.goalMeta.textContent = goalData.target > 0 ? `${formatCurrency(goalData.remaining)} до цели · ${Math.round(goalData.progress)}% выполнено` : "Добавь цель, чтобы видеть прогресс";
  refs.goalProgress.style.width = `${goalData.progress}%`;

  refs.heroBars.innerHTML = "";
  const grouped = Object.entries(groupEntriesByDate(filter.currentEntries))
    .filter(([, item]) => item.amount > 0)
    .sort((left, right) => left[0].localeCompare(right[0]))
    .slice(-10);

  if (!grouped.length) {
    refs.heroBarsMeta.textContent = "Когда появятся поступления, здесь будет видно, в какие даты пришли деньги и сколько именно.";
    refs.heroBars.innerHTML = `<div class="chart-empty">Пока нет поступлений в выбранном периоде.</div>`;
    return;
  }

  refs.heroBarsMeta.textContent = grouped.length === 1
    ? "Показан один день, в который было поступление."
    : `Показаны последние ${grouped.length} дней, в которые были поступления.`;

  const max = Math.max(...grouped.map(([, item]) => item.amount), 1);
  for (const [date, item] of grouped) {
    const column = document.createElement("div");
    column.className = "hero-bar-item";
    column.innerHTML = `
      <span class="hero-bar-value">${compactCurrency(item.amount)}</span>
      <div class="hero-bar" style="height:${Math.max((item.amount / max) * 230, 18)}px" title="${formatDate(date)} · ${formatCurrency(item.amount)}"></div>
      <span class="hero-bar-label">${formatShortDate(date)}</span>
    `;
    refs.heroBars.appendChild(column);
  }
}

function renderStats(sliceMetrics, yearMetrics) {
  refs.ordersCountMetric.textContent = String(sliceMetrics.totalOrders);
  refs.averageDayMetric.textContent = formatCurrency(sliceMetrics.averagePerIncomeDay);
  refs.pendingDebtsMetric.textContent = formatCurrency(sliceMetrics.pendingDebts);
  refs.openDebtorsMetric.textContent = String(sliceMetrics.openDebtors);
  refs.bestDayMetric.textContent = sliceMetrics.bestDay ? `${formatShortDate(sliceMetrics.bestDay.date)} · ${formatCurrency(sliceMetrics.bestDay.amount)}` : "Нет";
  refs.yearIncomeMetric.textContent = formatCurrency(yearMetrics.totalIncome);
  refs.yearIncomeMetricAnalytics.textContent = formatCurrency(yearMetrics.totalIncome);
  refs.yearOrdersMetric.textContent = String(yearMetrics.totalOrders);
  refs.activeMonthsMetric.textContent = String(yearMetrics.activeMonths);
  refs.averageMonthMetric.textContent = formatCurrency(yearMetrics.averageMonth);
  refs.yearTotalMetric.textContent = formatCurrency(yearMetrics.totalIncome);
}

function renderFocus(filter, sliceMetrics, debtors) {
  refs.focusList.innerHTML = "";
  const biggestDebtor = [...groupDebtorsByClient(debtors)].sort((a, b) => b.remaining - a.remaining)[0];
  const overdueCount = debtors.filter((debtor) => debtor.total - debtor.paid > 0 && debtor.deadline < formatDateForInput(new Date())).length;
  const cards = [
    { title: "Деньги за период", text: `${filter.label}: ${formatCurrency(sliceMetrics.totalIncome)} и ${formatOrderCount(sliceMetrics.totalOrders)}.` },
    { title: "Динамика", text: sliceMetrics.delta === 0 ? "Показатели на уровне прошлого сопоставимого периода." : sliceMetrics.delta > 0 ? `Рост на ${formatCurrency(sliceMetrics.delta)} относительно прошлого периода.` : `Снижение на ${formatCurrency(Math.abs(sliceMetrics.delta))} относительно прошлого периода.` },
    { title: "Крупнейший долг", text: biggestDebtor ? `${escapeHtml(biggestDebtor.client)}: осталось ${formatCurrency(biggestDebtor.remaining)}.` : "Сейчас нет открытых долгов по клиентам." },
    { title: "Контроль оплат", text: overdueCount > 0 ? `Просроченных оплат: ${overdueCount}. Их лучше закрыть в первую очередь.` : "Просроченных оплат нет. Денежный поток под контролем." },
  ];

  for (const card of cards) {
    const article = document.createElement("article");
    article.className = "stack-card";
    article.innerHTML = `<strong>${card.title}</strong><p>${card.text}</p>`;
    refs.focusList.appendChild(article);
  }
}

function renderCompare(filter, metrics) {
  refs.comparisonCaption.textContent = `${filter.currentPeriodLabel} против ${filter.previousPeriodLabel}`;
  refs.compareChart.innerHTML = "";
  const rows = [
    { label: "Доход", current: metrics.totalIncome, previous: metrics.previousIncome, format: formatCurrency },
    { label: "Заказы", current: metrics.totalOrders, previous: metrics.previousOrders, format: (value) => `${value}` },
    { label: "Дней с записями", current: metrics.activeDays, previous: metrics.previousActiveDays, format: (value) => `${value}` },
  ];

  for (const row of rows) {
    const max = Math.max(row.current, row.previous, 1);
    const div = document.createElement("div");
    div.className = "compare-row";
    const delta = row.current - row.previous;
    div.innerHTML = `
      <div>
        <strong class="compare-title">${row.label}</strong>
        <div class="meta-text">${delta === 0 ? "Без изменений" : delta > 0 ? `Выше на ${row.format(Math.abs(delta))}` : `Ниже на ${row.format(Math.abs(delta))}`}</div>
      </div>
      <div class="compare-stack">
        <div class="compare-meta"><span>${filter.currentPeriodLabel}</span><strong>${row.format(row.current)}</strong></div>
        <div class="compare-track"><div class="compare-fill current" style="width:${(row.current / max) * 100}%"></div></div>
        <div class="compare-meta compare-meta-muted"><span>${filter.previousPeriodLabel}</span><strong>${row.format(row.previous)}</strong></div>
        <div class="compare-track"><div class="compare-fill previous" style="width:${(row.previous / max) * 100}%"></div></div>
      </div>
    `;
    refs.compareChart.appendChild(div);
  }
}

function renderYearChart(monthTotals) {
  refs.yearLineChart.innerHTML = "";
  const width = 860;
  const height = 240;
  const padding = 22;
  const max = Math.max(...monthTotals.map((item) => item.amount), 1);
  const step = (width - padding * 2) / 11;
  const points = monthTotals.map((item, index) => {
    const x = padding + step * index;
    const y = height - padding - ((item.amount / max) * (height - padding * 2));
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = `${path} L ${padding + step * 11} ${height - padding} L ${padding} ${height - padding} Z`;

  const stage = document.createElement("div");
  stage.className = "line-stage";
  stage.innerHTML = `
    <svg class="line-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="Доход по месяцам за год">
      <defs>
        <linearGradient id="yearArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(0,250,154,0.34)"></stop>
          <stop offset="100%" stop-color="rgba(0,250,154,0)"></stop>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#yearArea)"></path>
      <path d="${path}" fill="none" stroke="#00fa9a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
      ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4.5" fill="#effff8"></circle>`).join("")}
    </svg>
  `;

  const axis = document.createElement("div");
  axis.className = "axis-row";
  axis.innerHTML = monthTotals.map((item) => `<span class="axis-month">${item.label}</span>`).join("");
  refs.yearLineChart.append(stage, axis);
}

function renderInsights(filter, sliceMetrics, yearMetrics) {
  refs.insightGrid.innerHTML = "";
  const strongestMonth = [...yearMetrics.monthTotals].sort((a, b) => b.amount - a.amount)[0];
  const items = [
    { title: "Выбранный период", text: `${filter.label}. Поступило ${formatCurrency(sliceMetrics.totalIncome)}.` },
    { title: "Средняя нагрузка", text: sliceMetrics.activeDays ? `В среднем ${roundOne(sliceMetrics.totalOrders / sliceMetrics.activeDays)} заказа в день, где была запись.` : "В выбранном периоде пока нет активных дней." },
    { title: "Годовая база", text: `${yearMetrics.activeMonths} активных месяцев и ${formatCurrency(yearMetrics.averageMonth)} в среднем за активный месяц.` },
    { title: "Лучший месяц года", text: strongestMonth && strongestMonth.amount > 0 ? `${strongestMonth.label}: ${formatCurrency(strongestMonth.amount)}.` : "Пока нет активного месяца, из которого можно делать выводы." },
    { title: "Рекомендация", text: sliceMetrics.pendingDebts > sliceMetrics.totalIncome ? "Сейчас выгодно закрывать долги по клиентам: ожидаемая сумма выше дохода выбранного периода." : "Текущий денежный поток выглядит уверенно. Можно усиливать лучшие форматы и клиентов." },
  ];

  for (const item of items) {
    const article = document.createElement("article");
    article.className = "stack-card";
    article.innerHTML = `<strong>${item.title}</strong><p>${item.text}</p>`;
    refs.insightGrid.appendChild(article);
  }
}

function renderIncomeList(entries) {
  refs.daysList.innerHTML = "";
  if (!entries.length) {
    refs.daysList.innerHTML = `<div class="empty-state">Пока нет записей в журнале. Добавь день с заказами, деньгами или с обоими показателями.</div>`;
    return;
  }

  const grouped = Object.entries(groupEntriesByDate(entries)).sort((a, b) => b[0].localeCompare(a[0]));
  for (const [date, summary] of grouped) {
    const activityText = describeDay(summary);
    const lines = [...summary.entries]
      .sort((a, b) => {
        if (b.date !== a.date) {
          return b.date.localeCompare(a.date);
        }
        if (b.amount !== a.amount) {
          return b.amount - a.amount;
        }
        return b.ordersCount - a.ordersCount;
      })
      .map((entry) => `
        <div class="sub-entry">
          <div>
            <strong>${getEntryKindLabel(entry)}</strong>
            <p>${escapeHtml(entry.note || "Без комментария")}</p>
            <div class="badge-row compact-badges">
              <span class="badge">${entry.ordersCount > 0 ? formatOrderCount(entry.ordersCount) : "Без заказов"}</span>
              <span class="badge ${entry.amount > 0 ? "good" : ""}">${entry.amount > 0 ? formatCurrency(entry.amount) : "Без поступления"}</span>
            </div>
          </div>
          <div class="sub-entry-side">
            <span>${entry.amount > 0 ? formatCurrency(entry.amount) : "0 ₽"}</span>
            <div class="item-actions">
              <button class="chip-btn" data-action="edit-income" data-id="${entry.id}" type="button">Изменить</button>
              <button class="chip-btn danger" data-action="delete-income" data-id="${entry.id}" type="button">Удалить</button>
            </div>
          </div>
        </div>
      `)
      .join("");

    const dayCard = document.createElement("details");
    dayCard.className = "list-item income-day";
    dayCard.innerHTML = `
      <summary class="income-day-toggle">
        <div class="item-row">
          <div>
            <div class="item-title">${formatDate(date)}</div>
            <div class="meta-text">${activityText}</div>
          </div>
          <div class="day-summary-stats">
            <div class="day-summary-stat">
              <span>Заказы</span>
              <strong>${summary.ordersCount}</strong>
            </div>
            <div class="day-summary-stat">
              <span>Деньги</span>
              <strong>${summary.amount > 0 ? formatCurrency(summary.amount) : "0 ₽"}</strong>
            </div>
          </div>
        </div>
        <div class="badge-row">
          <span class="badge">${summary.entries.length} записей</span>
          <span class="badge">${summary.amount > 0 ? "Есть поступления" : "Без поступлений"}</span>
          <span class="badge ${summary.ordersCount > 0 ? "good" : "warn"}">${summary.ordersCount > 0 ? "Есть заказы" : "Без заказов"}</span>
          <span class="badge ${summary.hasDebtorPayments ? "good" : "warn"}">${summary.hasDebtorPayments ? "Есть оплаты клиентов" : "Без оплат клиентов"}</span>
        </div>
        <div class="item-footer">
          <span class="meta-text">Если денег не было, можно просто зафиксировать количество заказов. И наоборот.</span>
          <span class="toggle-hint">Открыть день</span>
        </div>
      </summary>
      <div class="sub-entry-list">${lines}</div>
    `;
    refs.daysList.appendChild(dayCard);
  }
}

function renderDebtorList(clients) {
  refs.debtorsList.innerHTML = "";
  if (!clients.length) {
    refs.debtorsList.innerHTML = `<div class="empty-state">Пока нет неоплаченных заказов. Добавь клиента и заказ, чтобы держать оплаты под контролем.</div>`;
    return;
  }

  for (const client of clients) {
    const clientStatusClass = client.remaining <= 0 ? "good" : client.hasOverdue ? "danger" : "warn";
    const clientStatusText = client.remaining <= 0 ? "Все оплачено" : client.hasOverdue ? "Есть просрочка" : "Ждет оплату";
    const ordersMarkup = client.orders.map((debtor) => {
      const remaining = clampMoney(debtor.total - debtor.paid);
      const statusClass = remaining <= 0 ? "good" : debtor.deadline < formatDateForInput(new Date()) ? "danger" : "warn";
      const statusText = remaining <= 0 ? "Оплачено" : debtor.deadline < formatDateForInput(new Date()) ? "Просрочено" : "Ожидается";
      const progress = debtor.total ? Math.min((debtor.paid / debtor.total) * 100, 100) : 0;
      const historyText = debtor.history.length ? debtor.history.slice(0, 2).map((item) => `${formatShortDate(item.date)} · ${formatCurrency(item.amount)}`).join(" / ") : "Оплат пока не было";
      return `
        <div class="client-order">
          <div class="item-row">
            <div>
              <div class="item-title">${escapeHtml(debtor.title)}</div>
              <div class="meta-text">Дедлайн ${formatShortDate(debtor.deadline)}</div>
            </div>
            <div class="item-amount">${formatCurrency(remaining)}</div>
          </div>
          <div class="badge-row">
            <span class="badge ${statusClass}">${statusText}</span>
            <span class="badge">Заказ на ${formatCurrency(debtor.total)}</span>
            <span class="badge good">Уже оплачено ${formatCurrency(debtor.paid)}</span>
          </div>
          <div class="progress-track" style="margin-top:12px;"><div class="progress-fill" style="width:${progress}%"></div></div>
          <div class="item-footer">
            <span class="meta-text">${historyText}</span>
            <div class="item-actions">
              ${remaining > 0 ? `<button class="chip-btn good" data-action="mark-paid-today" data-id="${debtor.id}" type="button">Оплачено сегодня</button>` : ""}
              ${remaining > 0 ? `<button class="chip-btn warn" data-action="payment" data-id="${debtor.id}" type="button">Частичная оплата</button>` : ""}
              <button class="chip-btn" data-action="edit-debtor" data-id="${debtor.id}" type="button">Изменить</button>
              <button class="chip-btn danger" data-action="delete-debtor" data-id="${debtor.id}" type="button">Удалить</button>
            </div>
          </div>
        </div>
      `;
    }).join("");
    const article = document.createElement("article");
    article.className = "list-item client-group";
    article.innerHTML = `
      <div class="item-row">
        <div>
          <div class="item-title">${escapeHtml(client.client)}</div>
          <div class="meta-text">${formatOrderCount(client.orders.length)} в ожидании оплаты</div>
        </div>
        <div class="item-amount">${formatCurrency(client.remaining)}</div>
      </div>
      <div class="badge-row">
        <span class="badge ${clientStatusClass}">${clientStatusText}</span>
        <span class="badge">Всего ${formatCurrency(client.total)}</span>
        <span class="badge good">Оплачено ${formatCurrency(client.paid)}</span>
      </div>
      <div class="client-order-list">${ordersMarkup}</div>
    `;
    refs.debtorsList.appendChild(article);
  }
}

function handleViewTabClick(event) {
  const button = event.target.closest("[data-view]");
  if (!button) {
    return;
  }
  state.ui.view = button.dataset.view;
  persist();
  render();
}

function handleSectionClick(event) {
  const button = event.target.closest("[data-section]");
  if (!button) {
    return;
  }
  state.ui.section = button.dataset.section;
  persist();
  syncSectionVisibility();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleJumpClick(event) {
  const closeButton = event.target.closest("[data-close-dialog]");
  if (closeButton) {
    const dialog = document.getElementById(closeButton.dataset.closeDialog);
    if (dialog) {
      dialog.close();
    }
    return;
  }
  const button = event.target.closest("[data-section-jump]");
  if (!button) {
    return;
  }
  state.ui.section = button.dataset.sectionJump;
  persist();
  syncSectionVisibility();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleRangeChange() {
  if (refs.rangeStart.value > refs.rangeEnd.value) {
    refs.rangeEnd.value = refs.rangeStart.value;
  }
  render();
}

function handleClientSelectChange(event) {
  const value = String(event.currentTarget.value || "").trim();
  if (value) {
    refs.debtorForm.client.value = value;
    refs.debtorForm.title.focus();
  }
}

function sanitizePinField(event) {
  event.currentTarget.value = normalizePin(event.currentTarget.value);
}

function isPinConfigured() {
  return Boolean(security.pinHash);
}

function isSessionUnlocked() {
  return !isPinConfigured() || sessionStorage.getItem(SESSION_KEY) === "1";
}

function unlockSession() {
  sessionStorage.setItem(SESSION_KEY, "1");
  refs.lockPinInput.value = "";
  refs.lockPinConfirmInput.value = "";
  setError(refs.lockError, "");
  syncSecurityUi();
}

function lockSession() {
  sessionStorage.removeItem(SESSION_KEY);
  if (refs.securityDialog.open) {
    refs.securityDialog.close();
  }
  refs.lockPinInput.value = "";
  refs.lockPinConfirmInput.value = "";
  setError(refs.lockError, "");
  syncSecurityUi();
  window.setTimeout(() => refs.lockPinInput.focus(), 0);
}

function syncSecurityUi() {
  const setupMode = !isPinConfigured();
  const unlocked = isSessionUnlocked();

  refs.lockScreen.classList.toggle("hidden", !setupMode && unlocked);
  document.body.classList.toggle("app-locked", setupMode || !unlocked);
  refs.lockModeLabel.textContent = setupMode ? "Первый вход" : "Безопасность";
  refs.lockTitle.textContent = setupMode ? "Создай PIN-код" : "Вход в приложение";
  refs.lockText.textContent = setupMode
    ? "Придумай PIN из 4 цифр. Он будет запрашиваться при каждом новом входе."
    : "Введи PIN-код из 4 цифр, чтобы открыть приложение.";
  refs.lockPinConfirmWrap.classList.toggle("hidden", !setupMode);
  refs.lockPinConfirmInput.disabled = !setupMode;
  refs.lockPinConfirmInput.required = setupMode;
  if (!setupMode) {
    refs.lockPinConfirmInput.value = "";
  }
  refs.lockSubmitBtn.textContent = setupMode ? "Сохранить PIN" : "Войти";
  refs.biometricUnlockBtn.textContent = biometric.label;
  refs.biometricUnlockBtn.classList.toggle("hidden", setupMode || !security.biometricCredentialId || !biometric.available);

  refs.securityCurrentPinWrap.classList.toggle("hidden", !isPinConfigured());
  refs.enableBiometricBtn.textContent = security.biometricCredentialId ? "Перенастроить Face ID / Touch ID" : "Включить Face ID / Touch ID";

  if (!isPinConfigured()) {
    refs.biometricStatusText.textContent = "Сначала создай PIN-код, затем можно включить быстрый вход.";
  } else if (security.biometricCredentialId) {
    refs.biometricStatusText.textContent = "Быстрый вход включен. На поддерживаемом устройстве можно входить через биометрию.";
  } else if (biometric.available) {
    refs.biometricStatusText.textContent = "Это устройство поддерживает быстрый биометрический вход.";
  } else if (biometric.checked) {
    refs.biometricStatusText.textContent = "Сейчас биометрический вход недоступен. Для него нужен iPhone / iPad с поддержкой биометрии и защищенная среда запуска.";
  } else {
    refs.biometricStatusText.textContent = "Проверяем, доступен ли биометрический вход на этом устройстве.";
  }

  if (setupMode || !unlocked) {
    window.setTimeout(() => refs.lockPinInput.focus(), 0);
  }
}

function openSecurityDialog() {
  if (!isSessionUnlocked()) {
    return;
  }
  refs.securityForm.reset();
  refs.securityCurrentPin.value = "";
  refs.securityNewPin.value = "";
  refs.securityConfirmPin.value = "";
  setError(refs.securityError, "");
  syncSecurityUi();
  refs.securityDialog.showModal();
  window.setTimeout(() => (isPinConfigured() ? refs.securityCurrentPin : refs.securityNewPin).focus(), 0);
}

function handleLockNow() {
  lockSession();
}

async function handleLockSubmit(event) {
  event.preventDefault();
  const pin = normalizePin(refs.lockPinInput.value);

  if (!isPinConfigured()) {
    const confirmation = normalizePin(refs.lockPinConfirmInput.value);
    if (pin.length !== 4) {
      setError(refs.lockError, "PIN-код должен состоять из 4 цифр.");
      return;
    }
    if (pin !== confirmation) {
      setError(refs.lockError, "PIN-коды не совпадают.");
      return;
    }
    security.pinHash = await hashPin(pin);
    persistSecurity();
    setError(refs.lockError, "");
    unlockSession();
    await detectBiometricAvailability();
    return;
  }

  if (pin.length !== 4) {
    setError(refs.lockError, "Введи PIN-код из 4 цифр.");
    return;
  }

  const matches = await verifyPin(pin);
  if (!matches) {
    setError(refs.lockError, "Неверный PIN-код.");
    return;
  }

  unlockSession();
}

async function handleSecuritySubmit(event) {
  event.preventDefault();
  const currentPin = normalizePin(refs.securityCurrentPin.value);
  const nextPin = normalizePin(refs.securityNewPin.value);
  const confirmPin = normalizePin(refs.securityConfirmPin.value);

  if (isPinConfigured()) {
    if (currentPin.length !== 4) {
      setError(refs.securityError, "Введи текущий PIN-код.");
      return;
    }
    const matches = await verifyPin(currentPin);
    if (!matches) {
      setError(refs.securityError, "Текущий PIN-код указан неверно.");
      return;
    }
  }

  if (nextPin.length !== 4) {
    setError(refs.securityError, "Новый PIN-код должен состоять из 4 цифр.");
    return;
  }
  if (nextPin !== confirmPin) {
    setError(refs.securityError, "Новый PIN-код и подтверждение не совпадают.");
    return;
  }

  security.pinHash = await hashPin(nextPin);
  persistSecurity();
  setError(refs.securityError, "");
  refs.securityDialog.close();
  syncSecurityUi();
}

async function detectBiometricAvailability() {
  biometric.checked = true;
  biometric.available = false;
  biometric.label = /iPhone|iPad|Mac/i.test(navigator.userAgent) ? "Face ID / Touch ID" : "Биометрия";

  if (!window.isSecureContext || !("PublicKeyCredential" in window)) {
    syncSecurityUi();
    return;
  }

  if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== "function") {
    syncSecurityUi();
    return;
  }

  try {
    biometric.available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (error) {
    biometric.available = false;
  }
  syncSecurityUi();
}

async function handleEnableBiometric() {
  setError(refs.securityError, "");

  if (!isPinConfigured()) {
    setError(refs.securityError, "Сначала создай PIN-код.");
    return;
  }

  if (!biometric.available) {
    await detectBiometricAvailability();
  }

  if (!biometric.available) {
    setError(refs.securityError, "Биометрический вход сейчас недоступен на этом устройстве.");
    return;
  }

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32),
        rp: { name: "LEITZ Flow" },
        user: {
          id: randomBytes(16),
          name: "leitz-flow-local-user",
          displayName: "LEITZ Flow",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "none",
      },
    });

    if (!credential) {
      setError(refs.securityError, "Не удалось включить биометрический вход.");
      return;
    }

    security.biometricCredentialId = encodeBase64Url(credential.rawId);
    persistSecurity();
    syncSecurityUi();
  } catch (error) {
    setError(refs.securityError, "Биометрический вход не был настроен. Попробуй еще раз на iPhone или в защищенной среде.");
  }
}

async function handleBiometricUnlock() {
  setError(refs.lockError, "");

  if (!security.biometricCredentialId || !biometric.available) {
    setError(refs.lockError, "Биометрический вход недоступен.");
    return;
  }

  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        allowCredentials: [
          {
            id: decodeBase64Url(security.biometricCredentialId),
            type: "public-key",
          },
        ],
        userVerification: "required",
        timeout: 60000,
      },
    });

    if (!assertion) {
      setError(refs.lockError, "Не удалось выполнить биометрический вход.");
      return;
    }

    unlockSession();
  } catch (error) {
    setError(refs.lockError, "Биометрический вход не выполнен. Введи PIN-код или попробуй еще раз.");
  }
}

function handleGoalSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const key = String(formData.get("goalKey"));
  const amount = clampMoney(formData.get("goalAmount"));
  if (amount > 0) {
    state.goals[key] = amount;
  } else {
    delete state.goals[key];
  }
  persist();
  refs.goalDialog.close();
  render();
}

function handleIncomeSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const amount = clampMoney(formData.get("amount"));
  const ordersCount = Math.max(0, Number(formData.get("ordersCount")));
  if (!amount && !ordersCount) {
    window.alert("Укажи хотя бы количество заказов или сумму поступления.");
    return;
  }
  state.incomeEntries.unshift({
    id: makeId(),
    date: String(formData.get("date")),
    ordersCount,
    amount,
    note: String(formData.get("note") || "").trim(),
    source: "manual",
  });
  persist();
  event.currentTarget.reset();
  refs.incomeForm.date.value = formatDateForInput(new Date());
  refs.incomeForm.ordersCount.value = "0";
  render();
}

function handleDebtorSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const total = clampMoney(formData.get("total"));
  if (!total) {
    return;
  }
  const rawClient = String(formData.get("client")).trim();
  const existingClient = state.debtors.find((item) => normalizeClientName(item.client) === normalizeClientName(rawClient));
  state.debtors.unshift({
    id: makeId(),
    client: existingClient ? existingClient.client : rawClient,
    title: String(formData.get("title")).trim(),
    deadline: String(formData.get("deadline")),
    total,
    paid: 0,
    history: [],
    createdAt: new Date().toISOString(),
  });
  persist();
  event.currentTarget.reset();
  refs.clientSelect.value = "";
  refs.debtorForm.deadline.value = formatDateForInput(new Date());
  render();
}

function handlePaymentSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const debtor = state.debtors.find((item) => item.id === formData.get("debtorId"));
  if (!debtor) {
    refs.paymentDialog.close();
    return;
  }
  const amount = Math.min(clampMoney(formData.get("paymentAmount")), clampMoney(debtor.total - debtor.paid));
  const date = String(formData.get("paymentDate"));
  const ordersCount = Math.max(0, Number(formData.get("ordersCount")));
  const note = String(formData.get("paymentNote") || "").trim();
  if (!amount) {
    return;
  }

  applyDebtorPayment(debtor, {
    amount,
    date,
    ordersCount,
    note: note || `Оплата от ${debtor.client}: ${debtor.title}`,
  });
  persist();
  refs.paymentDialog.close();
  event.currentTarget.reset();
  refs.paymentForm.paymentDate.value = formatDateForInput(new Date());
  render();
}

function handleIncomeEditSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const entry = state.incomeEntries.find((item) => item.id === formData.get("entryId"));
  if (!entry) {
    refs.incomeEditDialog.close();
    return;
  }
  const nextDate = String(formData.get("date"));
  const nextOrdersCount = Math.max(0, Number(formData.get("ordersCount")));
  const nextAmount = clampMoney(formData.get("amount"));
  if (!nextOrdersCount && !nextAmount) {
    window.alert("В записи дня должно остаться хотя бы количество заказов или сумма поступления.");
    return;
  }
  entry.date = nextDate;
  entry.ordersCount = nextOrdersCount;
  entry.amount = nextAmount;
  entry.note = String(formData.get("note") || "").trim();
  persist();
  refs.incomeEditDialog.close();
  render();
}

function handleDebtorEditSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const debtor = state.debtors.find((item) => item.id === formData.get("debtorId"));
  if (!debtor) {
    refs.debtorEditDialog.close();
    return;
  }
  const rawClient = String(formData.get("client")).trim();
  const existingClient = state.debtors.find((item) => item.id !== debtor.id && normalizeClientName(item.client) === normalizeClientName(rawClient));
  debtor.client = existingClient ? existingClient.client : rawClient;
  debtor.title = String(formData.get("title")).trim();
  debtor.deadline = String(formData.get("deadline"));
  debtor.total = clampMoney(formData.get("total"));
  debtor.paid = Math.min(debtor.paid, debtor.total);
  persist();
  refs.debtorEditDialog.close();
  render();
}

function handleIncomeListClick(event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }
  const { action, id } = button.dataset;
  if (action === "delete-income") {
    if (!window.confirm("Удалить эту запись дохода?")) {
      return;
    }
    state.incomeEntries = state.incomeEntries.filter((entry) => entry.id !== id);
    persist();
    render();
    return;
  }
  if (action === "edit-income") {
    openIncomeEditDialog(id);
  }
}

function handleDebtorListClick(event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }
  const { action, id } = button.dataset;
  if (action === "mark-paid-today") {
    const debtor = state.debtors.find((item) => item.id === id);
    if (!debtor) {
      return;
    }
    const remaining = clampMoney(debtor.total - debtor.paid);
    if (!remaining) {
      return;
    }
    applyDebtorPayment(debtor, {
      amount: remaining,
      date: formatDateForInput(new Date()),
      ordersCount: 0,
      note: `Быстрая оплата от ${debtor.client}: ${debtor.title}`,
    });
    persist();
    render();
    return;
  }
  if (action === "payment") {
    openPaymentDialog(id);
    return;
  }
  if (action === "edit-debtor") {
    openDebtorEditDialog(id);
    return;
  }
  if (action === "delete-debtor") {
    if (!window.confirm("Удалить этот заказ клиента?")) {
      return;
    }
    state.debtors = state.debtors.filter((debtor) => debtor.id !== id);
    persist();
    render();
  }
}

function openGoalDialog() {
  const filter = getActiveFilter();
  refs.goalForm.goalKey.value = filter.goalKey;
  refs.goalForm.goalAmount.value = state.goals[filter.goalKey] ? String(state.goals[filter.goalKey]) : "";
  refs.goalDialog.showModal();
}

function applyDebtorPayment(debtor, { amount, date, ordersCount = 0, note = "" }) {
  debtor.paid = clampMoney(debtor.paid + amount);
  debtor.history.unshift({
    id: makeId(),
    date,
    amount,
    note,
  });

  state.incomeEntries.unshift({
    id: makeId(),
    date,
    ordersCount: Math.max(0, Number(ordersCount) || 0),
    amount,
    note,
    source: "debtor-payment",
    debtorId: debtor.id,
  });
}

function openPaymentDialog(debtorId) {
  const debtor = state.debtors.find((item) => item.id === debtorId);
  if (!debtor) {
    return;
  }
  const remaining = clampMoney(debtor.total - debtor.paid);
  refs.paymentForm.reset();
  refs.paymentForm.debtorId.value = debtor.id;
  refs.paymentForm.paymentDate.value = formatDateForInput(new Date());
  refs.paymentForm.paymentAmount.value = String(remaining);
  refs.paymentDialogTitle.textContent = `${debtor.client} · ${debtor.title} · осталось ${formatCurrency(remaining)}`;
  refs.paymentDialog.showModal();
}

function openIncomeEditDialog(entryId) {
  const entry = state.incomeEntries.find((item) => item.id === entryId);
  if (!entry) {
    return;
  }
  refs.incomeEditForm.entryId.value = entry.id;
  refs.incomeEditForm.date.value = entry.date;
  refs.incomeEditForm.ordersCount.value = String(entry.ordersCount);
  refs.incomeEditForm.amount.value = String(entry.amount);
  refs.incomeEditForm.note.value = entry.note || "";
  refs.incomeEditDialog.showModal();
}

function openDebtorEditDialog(debtorId) {
  const debtor = state.debtors.find((item) => item.id === debtorId);
  if (!debtor) {
    return;
  }
  refs.debtorEditForm.debtorId.value = debtor.id;
  refs.debtorEditForm.client.value = debtor.client;
  refs.debtorEditForm.title.value = debtor.title;
  refs.debtorEditForm.deadline.value = debtor.deadline;
  refs.debtorEditForm.total.value = String(debtor.total);
  refs.debtorEditDialog.showModal();
}

function syncFilterVisibility() {
  const view = state.ui.view || "month";
  for (const button of refs.viewTabs.querySelectorAll("[data-view]")) {
    button.classList.toggle("is-active", button.dataset.view === view);
  }
  refs.singleMonthControl.classList.toggle("hidden", view !== "month");
  refs.rangeStartControl.classList.toggle("hidden", view !== "range");
  refs.rangeEndControl.classList.toggle("hidden", view !== "range");
  refs.yearControl.classList.toggle("hidden", view !== "year");
}

function syncSectionVisibility() {
  const active = state.ui.section || "overview";
  for (const section of refs.sections) {
    section.classList.toggle("hidden-section", section.dataset.section !== active);
  }
  toggleSectionButtons(refs.sectionTabsDesktop, active);
  toggleSectionButtons(refs.sectionTabsMobile, active);
}

function toggleSectionButtons(container, active) {
  for (const button of container.querySelectorAll("[data-section]")) {
    button.classList.toggle("is-active", button.dataset.section === active);
  }
}

function getActiveFilter() {
  const view = state.ui.view || "month";
  if (view === "range") {
    const start = refs.rangeStart.value;
    const end = refs.rangeEnd.value;
    const distance = getMonthDistance(start, end) + 1;
    const previousStart = getRelativeMonth(start, -distance);
    const previousEnd = getRelativeMonth(end, -distance);
    return {
      selectedYear: Number(end.slice(0, 4)),
      currentEntries: state.incomeEntries.filter((entry) => isEntryInMonthRange(entry.date, start, end)),
      previousEntries: state.incomeEntries.filter((entry) => isEntryInMonthRange(entry.date, previousStart, previousEnd)),
      caption: "Поступило денег за выбранный период",
      label: formatRangeLabel(start, end),
      goalKey: `range:${start}:${end}`,
      currentPeriodLabel: formatRangeLabel(start, end),
      previousPeriodLabel: formatRangeLabel(previousStart, previousEnd),
      trendLabel: (metrics) => `${metrics.delta >= 0 ? "+" : "-"}${metrics.trendPercent}% к прошлому периоду`,
    };
  }

  if (view === "year") {
    const year = Number(refs.yearFilter.value);
    return {
      selectedYear: year,
      currentEntries: state.incomeEntries.filter((entry) => entry.date.startsWith(String(year))),
      previousEntries: state.incomeEntries.filter((entry) => entry.date.startsWith(String(year - 1))),
      caption: "Поступило денег за выбранный год",
      label: String(year),
      goalKey: `year:${year}`,
      currentPeriodLabel: String(year),
      previousPeriodLabel: String(year - 1),
      trendLabel: (metrics) => `${metrics.delta >= 0 ? "+" : "-"}${metrics.trendPercent}% к прошлому году`,
    };
  }

  const month = refs.monthFilter.value;
  const previousMonth = getRelativeMonth(month, -1);
  return {
    selectedYear: Number(month.slice(0, 4)),
    currentEntries: state.incomeEntries.filter((entry) => entry.date.startsWith(month)),
    previousEntries: state.incomeEntries.filter((entry) => entry.date.startsWith(previousMonth)),
    caption: "Поступило денег за выбранный месяц",
    label: formatMonthLabel(month),
    goalKey: `month:${month}`,
    currentPeriodLabel: formatMonthLabel(month),
    previousPeriodLabel: formatMonthLabel(previousMonth),
    trendLabel: (metrics) => `${metrics.delta >= 0 ? "+" : "-"}${metrics.trendPercent}% к прошлому месяцу`,
  };
}

function buildSliceMetrics(entries, previousEntries, debtors) {
  const grouped = groupEntriesByDate(entries);
  const previousGrouped = groupEntriesByDate(previousEntries);
  const totalIncome = sumField(entries, "amount");
  const previousIncome = sumField(previousEntries, "amount");
  const totalOrders = sumField(entries, "ordersCount");
  const previousOrders = sumField(previousEntries, "ordersCount");
  const activeDays = Object.keys(grouped).length;
  const previousActiveDays = Object.keys(previousGrouped).length;
  const bestDay = Object.entries(grouped)
    .map(([date, item]) => ({ date, amount: item.amount }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)[0];
  const delta = totalIncome - previousIncome;
  const trendPercent = previousIncome === 0 ? (totalIncome > 0 ? 100 : 0) : Math.round((Math.abs(delta) / previousIncome) * 100);
  const pendingDebts = debtors.reduce((sum, debtor) => sum + Math.max(debtor.total - debtor.paid, 0), 0);
  const openDebtors = new Set(debtors.filter((debtor) => debtor.total - debtor.paid > 0).map((debtor) => debtor.client.toLocaleLowerCase("ru-RU"))).size;
  const incomeDays = Object.values(grouped).filter((item) => item.amount > 0).length;

  return {
    totalIncome,
    previousIncome,
    totalOrders,
    previousOrders,
    activeDays,
    previousActiveDays,
    bestDay,
    delta,
    trendPercent,
    averagePerIncomeDay: incomeDays ? totalIncome / incomeDays : 0,
    pendingDebts,
    openDebtors,
  };
}

function buildYearMetrics(year) {
  const monthTotals = Array.from({ length: 12 }, (_, index) => {
    const key = `${year}-${String(index + 1).padStart(2, "0")}`;
    const entries = state.incomeEntries.filter((entry) => entry.date.startsWith(key));
    return {
      label: MONTH_SHORT[index],
      amount: sumField(entries, "amount"),
      orders: sumField(entries, "ordersCount"),
    };
  });
  const totalIncome = monthTotals.reduce((sum, item) => sum + item.amount, 0);
  const totalOrders = monthTotals.reduce((sum, item) => sum + item.orders, 0);
  const activeMonths = monthTotals.filter((item) => item.amount > 0 || item.orders > 0).length;

  return {
    monthTotals,
    totalIncome,
    totalOrders,
    activeMonths,
    averageMonth: activeMonths ? totalIncome / activeMonths : 0,
  };
}

function buildGoalData(filter, income) {
  const target = Number(state.goals[filter.goalKey] || 0);
  const progress = target > 0 ? Math.min((income / target) * 100, 100) : 0;
  return {
    target,
    progress,
    remaining: Math.max(target - income, 0),
  };
}

function groupEntriesByDate(entries) {
  return entries.reduce((grouped, entry) => {
    const date = String(entry.date);
    if (!grouped[date]) {
      grouped[date] = {
        amount: 0,
        ordersCount: 0,
        entries: [],
        hasDebtorPayments: false,
      };
    }

    grouped[date].amount += clampMoney(entry.amount);
    grouped[date].ordersCount += Math.max(0, Number(entry.ordersCount) || 0);
    grouped[date].entries.push({
      ...entry,
      amount: clampMoney(entry.amount),
      ordersCount: Math.max(0, Number(entry.ordersCount) || 0),
    });
    grouped[date].hasDebtorPayments = grouped[date].hasDebtorPayments || entry.source === "debtor-payment";
    return grouped;
  }, {});
}

function groupDebtorsByClient(debtors) {
  const grouped = debtors.reduce((accumulator, debtor) => {
    const remaining = clampMoney(debtor.total - debtor.paid);
    if (remaining <= 0) {
      return accumulator;
    }
    const key = normalizeClientName(debtor.client);
    if (!accumulator[key]) {
      accumulator[key] = {
        client: debtor.client,
        orders: [],
        total: 0,
        paid: 0,
        remaining: 0,
        openOrders: 0,
        hasOverdue: false,
      };
    }

    accumulator[key].orders.push({
      ...debtor,
      remaining,
    });
    accumulator[key].total += debtor.total;
    accumulator[key].paid += debtor.paid;
    accumulator[key].remaining += remaining;
    accumulator[key].openOrders += remaining > 0 ? 1 : 0;
    accumulator[key].hasOverdue = accumulator[key].hasOverdue || (remaining > 0 && debtor.deadline < formatDateForInput(new Date()));
    return accumulator;
  }, {});

  return Object.values(grouped)
    .map((group) => ({
      ...group,
      total: clampMoney(group.total),
      paid: clampMoney(group.paid),
      remaining: clampMoney(group.remaining),
      orders: group.orders.sort((left, right) => {
        if ((left.remaining <= 0) !== (right.remaining <= 0)) {
          return left.remaining <= 0 ? 1 : -1;
        }
        if (left.deadline !== right.deadline) {
          return left.deadline.localeCompare(right.deadline);
        }
        return right.remaining - left.remaining;
      }),
    }))
    .sort((left, right) => {
      if (left.hasOverdue !== right.hasOverdue) {
        return left.hasOverdue ? -1 : 1;
      }
      if (left.remaining !== right.remaining) {
        return right.remaining - left.remaining;
      }
      return left.client.localeCompare(right.client, "ru-RU");
    });
}

function getDebtorsSnapshot() {
  const today = formatDateForInput(new Date());
  return state.debtors
    .map((debtor) => ({
      ...debtor,
      total: clampMoney(debtor.total),
      paid: clampMoney(debtor.paid),
      history: Array.isArray(debtor.history)
        ? debtor.history
            .map((item) => ({
              id: item.id || makeId(),
              date: String(item.date || ""),
              amount: clampMoney(item.amount),
              note: String(item.note || "").trim(),
            }))
            .sort((a, b) => b.date.localeCompare(a.date))
        : [],
    }))
    .sort((left, right) => {
      const leftRemaining = clampMoney(left.total - left.paid);
      const rightRemaining = clampMoney(right.total - right.paid);
      const leftRank = leftRemaining <= 0 ? 2 : left.deadline < today ? 0 : 1;
      const rightRank = rightRemaining <= 0 ? 2 : right.deadline < today ? 0 : 1;
      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }
      if (rightRemaining !== leftRemaining) {
        return rightRemaining - leftRemaining;
      }
      return String(left.deadline).localeCompare(String(right.deadline));
    });
}

function filterEntriesByQuery(entries, query) {
  const needle = String(query || "").trim().toLocaleLowerCase("ru-RU");
  if (!needle) {
    return entries;
  }
  return entries.filter((entry) => {
    const haystack = [
      entry.date,
      formatDate(entry.date),
      formatShortDate(entry.date),
      entry.note,
      getEntryKindLabel(entry),
      `${entry.ordersCount} заказ`,
      formatCurrency(entry.amount),
    ]
      .join(" ")
      .toLocaleLowerCase("ru-RU");
    return haystack.includes(needle);
  });
}

function filterDebtorsByQuery(debtors, query) {
  const needle = String(query || "").trim().toLocaleLowerCase("ru-RU");
  if (!needle) {
    return debtors;
  }
  return debtors.filter((debtor) => {
    const haystack = [
      debtor.client,
      formatCurrency(debtor.total),
      formatCurrency(debtor.paid),
      formatCurrency(debtor.remaining),
      ...debtor.orders.flatMap((order) => [
        order.title,
        order.deadline,
        formatDate(order.deadline),
        formatCurrency(order.total),
        formatCurrency(order.paid),
        formatCurrency(order.remaining),
      ]),
    ]
      .join(" ")
      .toLocaleLowerCase("ru-RU");
    return haystack.includes(needle);
  });
}

function renderClientSuggestions(debtors) {
  const currentSelectValue = refs.clientSelect.value;
  const clients = [...debtors.reduce((map, debtor) => {
    const name = String(debtor.client || "").trim();
    const key = normalizeClientName(name);
    if (name && !map.has(key)) {
      map.set(key, name);
    }
    return map;
  }, new Map()).values()].sort((left, right) => left.localeCompare(right, "ru-RU"));

  refs.clientSuggestions.innerHTML = clients
    .map((client) => `<option value="${escapeHtml(client)}"></option>`)
    .join("");
  refs.clientSelect.innerHTML = [
    `<option value="">Новый клиент</option>`,
    ...clients.map((client) => `<option value="${escapeHtml(client)}">${escapeHtml(client)}</option>`),
  ].join("");
  refs.clientSelect.value = clients.includes(currentSelectValue) ? currentSelectValue : "";
}

function exportJson() {
  const payload = {
    version: 4,
    exportedAt: new Date().toISOString(),
    state,
  };
  downloadFile(
    `leitz-flow-${formatDateForInput(new Date())}.json`,
    JSON.stringify(payload, null, 2),
    "application/json;charset=utf-8",
  );
}

function exportCsvBundle() {
  const rows = [
    ["Раздел", "Дата", "Заказы", "Сумма", "Комментарий", "Источник", "Клиент", "Проект", "Дедлайн", "Всего", "Оплачено", "Осталось"],
  ];

  for (const entry of [...state.incomeEntries].sort((a, b) => b.date.localeCompare(a.date))) {
    rows.push([
      "Доход",
      entry.date,
      entry.ordersCount,
      clampMoney(entry.amount),
      entry.note || "",
      entry.source === "debtor-payment" ? "Оплата клиента" : "Ручная запись",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
  }

  for (const debtor of getDebtorsSnapshot()) {
    rows.push([
      "Клиент",
      "",
      "",
      "",
      debtor.history[0]?.note || "",
      "",
      debtor.client,
      debtor.title,
      debtor.deadline,
      debtor.total,
      debtor.paid,
      clampMoney(debtor.total - debtor.paid),
    ]);
  }

  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(";")).join("\n")}`;
  downloadFile(`leitz-flow-${formatDateForInput(new Date())}.csv`, csv, "text/csv;charset=utf-8");
}

function importJson(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      const nextState = normalizeState(parsed.state || parsed);
      state.incomeEntries = nextState.incomeEntries;
      state.debtors = nextState.debtors;
      state.goals = nextState.goals;
      state.ui = nextState.ui;
      initializeDefaults();
      persist();
      render();
    } catch (error) {
      window.alert("Не удалось импортировать файл. Проверь, что это корректный JSON из приложения.");
    } finally {
      refs.importInput.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function seedDemoData() {
  if (!window.confirm("Загрузить демонстрационные данные? Текущие записи будут заменены.")) {
    return;
  }

  const today = new Date();
  const month = formatMonthValue(today);
  const previous = getRelativeMonth(month, -1);
  const earlier = getRelativeMonth(month, -2);
  const year = month.slice(0, 4);
  const buildDate = (monthValue, day) => `${monthValue}-${String(day).padStart(2, "0")}`;
  const onyxId = makeId();
  const onyxSecondId = makeId();
  const hotelId = makeId();
  const coffeeId = makeId();

  state.incomeEntries = [
    { id: makeId(), date: buildDate(month, 3), ordersCount: 1, amount: 6800, note: "Лендинг для личного бренда", source: "manual" },
    { id: makeId(), date: buildDate(month, 6), ordersCount: 2, amount: 0, note: "Сделал две афиши, оплат еще не было", source: "manual" },
    { id: makeId(), date: buildDate(month, 8), ordersCount: 2, amount: 12400, note: "Две афиши и сторис-пакет", source: "manual" },
    { id: makeId(), date: buildDate(month, 10), ordersCount: 0, amount: 1500, note: "Частичная оплата от клуба ONYX", source: "debtor-payment", debtorId: onyxId },
    { id: makeId(), date: buildDate(month, 12), ordersCount: 0, amount: 3200, note: "Доплата по старому проекту без новых заказов", source: "manual" },
    { id: makeId(), date: buildDate(month, 14), ordersCount: 1, amount: 5200, note: "Обновление меню и баннеры", source: "manual" },
    { id: makeId(), date: buildDate(previous, 7), ordersCount: 1, amount: 4100, note: "Рекламный постер", source: "manual" },
    { id: makeId(), date: buildDate(previous, 21), ordersCount: 3, amount: 18900, note: "Серия визуалов для заведения", source: "manual" },
    { id: makeId(), date: buildDate(earlier, 18), ordersCount: 2, amount: 9600, note: "Фирменные обложки и баннеры", source: "manual" },
    { id: makeId(), date: `${year}-01-22`, ordersCount: 1, amount: 7500, note: "Редизайн презентации", source: "manual" },
  ];

  state.debtors = [
    {
      id: onyxId,
      client: "Клуб ONYX",
      title: "Афиша вечеринки «Старая кассета»",
      deadline: buildDate(month, 27),
      total: 3000,
      paid: 1500,
      history: [{ id: makeId(), date: buildDate(month, 10), amount: 1500, note: "Первая часть" }],
      createdAt: new Date().toISOString(),
    },
    {
      id: onyxSecondId,
      client: "Клуб ONYX",
      title: "Серия сторис для анонса вечеринки",
      deadline: buildDate(month, 29),
      total: 4200,
      paid: 0,
      history: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: hotelId,
      client: "Hotel Volga",
      title: "Пакет рекламных сторис на открытие сезона",
      deadline: buildDate(month, 24),
      total: 8600,
      paid: 0,
      history: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: coffeeId,
      client: "Coffee Point",
      title: "Меню-борд и промо-постер",
      deadline: buildDate(previous, 29),
      total: 5400,
      paid: 5400,
      history: [{ id: makeId(), date: buildDate(previous, 30), amount: 5400, note: "Полная оплата" }],
      createdAt: new Date().toISOString(),
    },
  ];

  state.goals = {
    [`month:${month}`]: 45000,
    [`range:${earlier}:${month}`]: 120000,
    [`year:${year}`]: 520000,
  };
  state.ui.view = "month";
  state.ui.section = "overview";

  refs.monthFilter.value = month;
  refs.rangeStart.value = earlier;
  refs.rangeEnd.value = month;
  populateYearOptions(Number(year));
  refs.yearFilter.value = year;

  persist();
  render();
}

function populateYearOptions(fallbackYear = new Date().getFullYear()) {
  const currentValue = refs.yearFilter.value;
  const years = new Set([fallbackYear, fallbackYear - 1, fallbackYear + 1]);

  for (const entry of state.incomeEntries) {
    if (entry.date) {
      years.add(Number(String(entry.date).slice(0, 4)));
    }
  }

  for (const debtor of state.debtors) {
    if (debtor.deadline) {
      years.add(Number(String(debtor.deadline).slice(0, 4)));
    }
  }

  refs.yearFilter.innerHTML = [...years]
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => a - b)
    .map((year) => `<option value="${year}">${year}</option>`)
    .join("");

  if ([...refs.yearFilter.options].some((option) => option.value === currentValue)) {
    refs.yearFilter.value = currentValue;
  } else {
    refs.yearFilter.value = String(fallbackYear);
  }
}

function loadSecurity() {
  try {
    const raw = localStorage.getItem(SECURITY_KEY);
    if (!raw) {
      return { ...initialSecurityState };
    }
    const parsed = JSON.parse(raw);
    return {
      pinHash: String(parsed.pinHash || ""),
      biometricCredentialId: String(parsed.biometricCredentialId || ""),
    };
  } catch (error) {
    return { ...initialSecurityState };
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return normalizeState(initialState);
    }
    return normalizeState(JSON.parse(raw));
  } catch (error) {
    return normalizeState(initialState);
  }
}

function normalizeState(source) {
  const next = {
    incomeEntries: [],
    debtors: [],
    goals: {},
    ui: {
      view: "month",
      section: "overview",
    },
  };

  if (!source || typeof source !== "object") {
    return next;
  }

  if (Array.isArray(source.incomeEntries)) {
    next.incomeEntries = source.incomeEntries
      .map((entry) => ({
        id: entry.id || makeId(),
        date: String(entry.date || ""),
        ordersCount: Math.max(0, Number(entry.ordersCount) || 0),
        amount: clampMoney(entry.amount),
        note: String(entry.note || "").trim(),
        source: entry.source === "debtor-payment" ? "debtor-payment" : "manual",
        debtorId: entry.debtorId ? String(entry.debtorId) : "",
      }))
      .filter((entry) => entry.date);
  }

  if (Array.isArray(source.debtors)) {
    next.debtors = source.debtors
      .map((debtor) => {
        const total = clampMoney(debtor.total);
        return {
          id: debtor.id || makeId(),
          client: String(debtor.client || "").trim(),
          title: String(debtor.title || "").trim(),
          deadline: String(debtor.deadline || ""),
          total,
          paid: Math.min(clampMoney(debtor.paid), total),
          history: Array.isArray(debtor.history)
            ? debtor.history.map((item) => ({
                id: item.id || makeId(),
                date: String(item.date || ""),
                amount: clampMoney(item.amount),
                note: String(item.note || "").trim(),
              }))
            : [],
          createdAt: debtor.createdAt || new Date().toISOString(),
        };
      })
      .filter((debtor) => debtor.client && debtor.title && debtor.deadline);
  }

  if (source.goals && typeof source.goals === "object") {
    next.goals = Object.fromEntries(
      Object.entries(source.goals)
        .map(([key, value]) => [String(key), clampMoney(value)])
        .filter(([, value]) => value > 0),
    );
  }

  if (source.ui && typeof source.ui === "object") {
    next.ui.view = ["month", "range", "year"].includes(source.ui.view) ? source.ui.view : "month";
    next.ui.section = ["overview", "income", "receivables", "analytics"].includes(source.ui.section) ? source.ui.section : "overview";
  }

  return next;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function persistSecurity() {
  localStorage.setItem(SECURITY_KEY, JSON.stringify(security));
}

async function verifyPin(pin) {
  return security.pinHash === await hashPin(pin);
}

async function hashPin(pin) {
  const normalized = String(pin);
  if (globalThis.crypto?.subtle) {
    const buffer = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
    return [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, "0")).join("");
  }
  let hash = 0;
  for (const character of normalized) {
    hash = ((hash << 5) - hash) + character.charCodeAt(0);
    hash |= 0;
  }
  return `fallback-${Math.abs(hash)}`;
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
  }
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

function encodeBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodeBase64Url(value) {
  const normalized = String(value).replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function normalizePin(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 4);
}

function setError(node, message) {
  if (!node) {
    return;
  }
  node.textContent = message;
  node.classList.toggle("hidden", !message);
}

function sumField(list, field) {
  return list.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
}

function getRelativeMonth(monthValue, delta) {
  const [year, month] = String(monthValue).split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return formatMonthValue(date);
}

function getMonthDistance(start, end) {
  const [startYear, startMonth] = String(start).split("-").map(Number);
  const [endYear, endMonth] = String(end).split("-").map(Number);
  return (endYear - startYear) * 12 + (endMonth - startMonth);
}

function isEntryInMonthRange(date, start, end) {
  const month = String(date).slice(0, 7);
  return month >= start && month <= end;
}

function formatMonthLabel(monthValue) {
  const [year, month] = String(monthValue).split("-").map(Number);
  return `${MONTH_FULL[month - 1]} ${year}`;
}

function formatRangeLabel(start, end) {
  if (start === end) {
    return formatMonthLabel(start);
  }
  const [startYear, startMonth] = String(start).split("-").map(Number);
  const [endYear, endMonth] = String(end).split("-").map(Number);
  if (startYear === endYear) {
    return `${MONTH_FULL[startMonth - 1]} - ${MONTH_FULL[endMonth - 1]} ${startYear}`;
  }
  return `${formatMonthLabel(start)} - ${formatMonthLabel(end)}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(clampMoney(value));
}

function compactCurrency(value) {
  const amount = clampMoney(value);
  if (amount >= 1000000) {
    return `${roundOne(amount / 1000000)} млн`;
  }
  if (amount >= 1000) {
    return `${roundOne(amount / 1000)}k`;
  }
  return `${amount.toLocaleString("ru-RU")} ₽`;
}

function formatOrderCount(count) {
  return `${count} ${pluralize(count, ["заказ", "заказа", "заказов"])}`;
}

function pluralize(count, forms) {
  const absolute = Math.abs(Number(count)) % 100;
  const remainder = absolute % 10;
  if (absolute > 10 && absolute < 20) {
    return forms[2];
  }
  if (remainder > 1 && remainder < 5) {
    return forms[1];
  }
  if (remainder === 1) {
    return forms[0];
  }
  return forms[2];
}

function describeDay(summary) {
  if (summary.ordersCount > 0 && summary.amount > 0) {
    return `Заказы и деньги в один день`;
  }
  if (summary.ordersCount > 0) {
    return `Только заказы без поступления денег`;
  }
  if (summary.amount > 0) {
    return `Только поступления денег без новых заказов`;
  }
  return "Пустая запись";
}

function getEntryKindLabel(entry) {
  if (entry.source === "debtor-payment") {
    return "Оплата клиента";
  }
  if (entry.ordersCount > 0 && entry.amount > 0) {
    return "Заказы и поступление";
  }
  if (entry.ordersCount > 0) {
    return "Только заказы";
  }
  if (entry.amount > 0) {
    return "Только поступление";
  }
  return "Ручная запись";
}

function formatDate(value) {
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(value) {
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatDateForInput(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonthValue(value) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatDeltaText(delta) {
  if (!delta) {
    return "На уровне прошлого периода";
  }
  return delta > 0 ? `Выше прошлого периода на ${formatCurrency(delta)}` : `Ниже прошлого периода на ${formatCurrency(Math.abs(delta))}`;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 400);
}

function escapeCsv(value) {
  const string = String(value ?? "");
  return /[;"\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}

function clampMoney(value) {
  const numeric = typeof value === "string" ? Number(value.replace(/\s+/g, "").replace(",", ".")) : Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.round(numeric * 100) / 100);
}

function roundOne(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function makeId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getLatestMonthFromData() {
  const months = [
    ...state.incomeEntries.map((entry) => String(entry.date).slice(0, 7)),
    ...state.debtors.map((debtor) => String(debtor.deadline).slice(0, 7)),
  ].filter((value) => /^\d{4}-\d{2}$/.test(value));
  return months.sort().at(-1) || "";
}

function normalizeClientName(value) {
  return String(value || "").trim().toLocaleLowerCase("ru-RU");
}
