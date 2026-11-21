async function request(path, options) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Permintaan pesanan gagal')
  return data
}

export async function createOrder(order) {
  const data = await request('/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify(order)
  })
  return data.order
}

export async function fetchOrders() {
  const data = await request('/api/v1/orders')
  return data.orders
}

export async function fetchOrderByNumber(nota) {
  const data = await request(`/api/v1/orders?nota=${encodeURIComponent(nota)}`)
  return data.order
}

export async function completeOrderPayment(orderId, bayar) {
  const data = await request(`/api/v1/orders/${encodeURIComponent(orderId)}/payment`, {
    method: 'PATCH',
    body: JSON.stringify({ bayar })
  })
  return data.order
}
