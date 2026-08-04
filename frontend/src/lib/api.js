// ============================================================
// LegacyX OTC Marketplace — API client
//
// Talks to the backend described in API_CONTRACT.md. If VITE_API_BASE_URL
// isn't set (no backend deployed yet), every call falls back to local mock
// data so the frontend keeps working during development. Once a real
// backend exists, set VITE_API_BASE_URL in a .env file and everything
// switches over automatically — no other code changes needed.
// ============================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || null;
const MOCK_MODE = !BASE_URL;

// ---- Mock fallback data (used only when MOCK_MODE is true) ----
let mockOrders = [
  { id:'LX-8821', asset:'FXRP', amountRange:'100-500', status:'matched', createdAt: Date.now()-2*60000  },
  { id:'LX-8820', asset:'FXRP', amountRange:'500-1000',status:'pending', createdAt: Date.now()-8*60000  },
  { id:'LX-8819', asset:'FLR',  amountRange:'50-100',  status:'matched', createdAt: Date.now()-15*60000 },
];
let mockStats = { priceUsd: 0.5214, volume24hUsd: 284000, tradesSettled: 142 };
let mockSettlements = []; // empty by default — the live page shows real (currently none) data, not fake data

function bucketAmount(n) {
  const v = parseFloat(n) || 0;
  if (v <= 100) return '0-100';
  if (v <= 500) return '100-500';
  if (v <= 1000) return '500-1000';
  return '1000+';
}

async function request(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

/** GET /api/orders — public, redacted list of active trades. No wallet needed. */
export async function fetchListings() {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 300));
    return [...mockOrders].sort((a, b) => b.createdAt - a.createdAt);
  }
  return request('/api/orders');
}

/** GET /api/stats — price / volume / trades-settled for the stats row. */
export async function fetchStats() {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 200));
    return mockStats;
  }
  return request('/api/stats');
}

/**
 * POST /api/orders — create a new private sell order. Requires a connected wallet.
 * @param {{asset:string, amount:string, minPrice:string, sellerAddress:string}} data
 */
export async function createOrder(data) {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 400));
    const order = {
      id: 'LX-' + (8825 + mockOrders.length),
      asset: data.asset,
      amountRange: bucketAmount(data.amount),
      status: 'pending',
      createdAt: Date.now(),
    };
    mockOrders = [order, ...mockOrders];
    return order;
  }
  return request('/api/orders', { method: 'POST', body: JSON.stringify(data) });
}

/** GET /api/orders/mine?address=0x... — the connected wallet's own orders, full detail. */
export async function fetchMyOrders(address) {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 250));
    return [];
  }
  return request('/api/orders/mine?address=' + encodeURIComponent(address));
}

/** GET /api/settlements — recent completed trades. Public, redacted like /orders. */
export async function fetchSettlements() {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 250));
    return mockSettlements;
  }
  return request('/api/settlements');
}

export const apiMode = MOCK_MODE ? 'mock' : 'live';
