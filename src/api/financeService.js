const BASE = `${process.env.REACT_APP_API_URL}/finance`;

async function parseJSON(res) {
  const txt = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${txt}`);
  try { return JSON.parse(txt); } catch { return txt; }
}

// ── Income ────────────────────────────────────────────────────────────────
export function createIncome(data) {
  return fetch(`${BASE}/income`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(parseJSON);
}

export function fetchIncome({ memberId, fromDate, toDate }) {
  const params = new URLSearchParams();
  if (memberId) params.set('memberId', memberId);
  if (fromDate ) params.set('fromDate',  fromDate);
  if (toDate   ) params.set('toDate',    toDate);
  return fetch(`${BASE}/income?${params}`,).then(parseJSON);
}

// ── Expense ───────────────────────────────────────────────────────────────
export function createExpense(data) {
  return fetch(`${BASE}/expense`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(parseJSON);
}

export function fetchExpense({ department, fromDate, toDate }) {
  const params = new URLSearchParams();
  if (department) params.set('department', department);
  if (fromDate  ) params.set('fromDate',  fromDate);
  if (toDate    ) params.set('toDate',    toDate);
  return fetch(`${BASE}/expense?${params}`,).then(parseJSON);
}
// ── Budgets ───────────────────────────────────────────────────────────────
export function createBudget(data) {
  return fetch(`${BASE}/budget`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data),
  }).then(parseJSON);
}

export function fetchBudgets({ department, fromDate, toDate }) {
  const params = new URLSearchParams();
  if (department) params.set('department', department);
  if (fromDate)   params.set('fromDate',   fromDate);
  if (toDate)     params.set('toDate',     toDate);
  return fetch(`${BASE}/budget?${params}`).then(parseJSON);
}
// ── Accounts ─────────────────────────────────────────────────────────────
export function fetchAccounts() {
  return fetch(`${BASE}/accounts`).then(parseJSON);
}

// ── Account Transactions ─────────────────────────────────────────────────
export function createTxn(data) {
  return fetch(`${BASE}/txn`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data),
  }).then(parseJSON);
}
export function fetchTxns({ accountId, fromDate, toDate }) {
  const params = new URLSearchParams();
  if (accountId) params.set('accountId', accountId);
  if (fromDate ) params.set('fromDate',   fromDate);
  if (toDate   ) params.set('toDate',     toDate);
  return fetch(`${BASE}/txn?${params}`).then(parseJSON);
}

export function createRecurring(data) {
  return fetch(`${BASE}/recurring`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data),
  }).then(parseJSON);
}



// ── Income ────────────────────────────────────────────────────────────────
export function updateIncome(id, data) {
  return fetch(`${BASE}/income/${id}`, {
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data)
  }).then(parseJSON);
}
export function deleteIncome(id) {
  return fetch(`${BASE}/income/${id}`, {
    method:'DELETE'
  }).then(parseJSON);
}

// ── Expense ───────────────────────────────────────────────────────────────
export function updateExpense(id, data) {
  return fetch(`${BASE}/expense/${id}`, {
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data)
  }).then(parseJSON);
}
export function deleteExpense(id) {
  return fetch(`${BASE}/expense/${id}`, { method:'DELETE' }).then(parseJSON);
}

// ── Budget ────────────────────────────────────────────────────────────────
export function updateBudget(id, data) {
  return fetch(`${BASE}/budget/${id}`, {
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data)
  }).then(parseJSON);
}
export function deleteBudget(id) {
  return fetch(`${BASE}/budget/${id}`, { method:'DELETE' }).then(parseJSON);
}

// ── Txn ──────────────────────────────────────────────────────────────────
export function updateTxn(id, data) {
  return fetch(`${BASE}/txn/${id}`, {
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data)
  }).then(parseJSON);
}
export function deleteTxn(id) {
  return fetch(`${BASE}/txn/${id}`, { method:'DELETE' }).then(parseJSON);
}

// ── Recurring ────────────────────────────────────────────────────────────
export function updateRecurring(id, data) {
  return fetch(`${BASE}/recurring/${id}`, {
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data)
  }).then(parseJSON);
}
export function cancelRecurring(id) {
  return fetch(`${BASE}/recurring/${id}`, { method:'DELETE' }).then(parseJSON);
}

export function fetchSummary() {
  return fetch(`${BASE}/summary`)
    .then(parseJSON)
    .catch(error => {
      console.error("Error fetching summary:", error);
      throw error;
    });
}
// Add the fetchRecurring function to your service
export function fetchRecurring({ memberId }) {
  const params = new URLSearchParams();
  if (memberId) params.set('memberId', memberId);

  return fetch(`${BASE}/recurring?${params}`)
    .then(parseJSON)
    .catch(error => {
      console.error("Error fetching recurring donations:", error);
      throw error;
    });
}
