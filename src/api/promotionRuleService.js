const BASE = process.env.REACT_APP_API_URL + '/cell-group-promotion-rules';

export const getPromotionRule = () => fetch(BASE).then(r => r.json());
export const updatePromotionRule = (id, data) =>
  fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json());