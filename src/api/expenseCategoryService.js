const BASE = process.env.REACT_APP_API_URL + '/settings/expense-categories';
export const fetchExpensesCategories = async () => {
  const r = await fetch(BASE);
  if (!r.ok) throw new Error('Failed');
  return r.json();
};
export const createExpenseCategory  = data => fetch(BASE, {
  method:'POST', headers:{'Content-Type':'application/json'},
  body:JSON.stringify(data)
}).then(r=>r.ok? r.json(): Promise.reject());
export const updateExpenseCategory = (id,d) => fetch(`${BASE}/${id}`, {
  method:'PUT', headers:{'Content-Type':'application/json'},
  body:JSON.stringify(d)
}).then(r=>r.ok? r.json(): Promise.reject());
export const deleteExpenseCategory = id => fetch(`${BASE}/${id}`,{method:'DELETE'})
  .then(r=>r.ok? r.json(): Promise.reject());
