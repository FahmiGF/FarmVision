const BASE_URL = '/api/v1';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const res = await fetch(url, config);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `HTTP Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Metadata & KPIs
  getKPIs: () => request('/kpis'),
  getMe: () => request('/auth/me'),
  switchRole: (role) => request('/auth/switch-role', { method: 'POST', body: JSON.stringify({ role }) }),

  // Farms & Fields
  getFarms: () => request('/farms'),
  switchFarm: (id) => request(`/farms/switch/${id}`, { method: 'POST' }),
  getFields: () => request('/fields'),
  createField: (data) => request('/fields', { method: 'POST', body: JSON.stringify(data) }),

  // AI Disease Scanner
  getDiseaseScans: () => request('/disease-scans'),
  analyzeDisease: (cropHint, diseaseOverride) => request('/disease-scans/analyze', {
    method: 'POST',
    body: JSON.stringify({ crop_hint: cropHint, disease_override: diseaseOverride })
  }),
  reviewDiseaseScan: (id, status, notes) => request(`/disease-scans/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ status, notes })
  }),

  // IoT Sensors & Telemetry
  getSensors: () => request('/sensors'),
  getTelemetry: () => request('/sensors/telemetry'),
  tickSensors: () => request('/sensors/tick', { method: 'POST' }),
  injectAnomaly: (sensorId, anomalyType) => request('/sensors/inject-anomaly', {
    method: 'POST',
    body: JSON.stringify({ sensor_id: sensorId, anomaly_type: anomalyType })
  }),

  // Irrigation
  getIrrigation: (fieldId) => request(`/predictions/irrigation/${fieldId}`),
  overrideIrrigation: (fieldId, action, durationMinutes = 30) => request('/irrigation/override', {
    method: 'POST',
    body: JSON.stringify({ field_id: fieldId, action, duration_minutes: durationMinutes })
  }),

  // Yield Forecasting
  getYield: (fieldId) => request(`/predictions/yield/${fieldId}`),
  simulateYield: (data) => request('/predictions/yield/simulate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Satellite NDVI
  getNdvi: (fieldId) => request(`/satellite/ndvi/${fieldId}`),

  // Smart Planting
  getPlantingRecs: () => request('/planting/recommendations'),

  // Inventory & Harvest
  getInventory: () => request('/inventory'),
  getHarvests: () => request('/harvests'),
  logHarvest: (data) => request('/harvests', { method: 'POST', body: JSON.stringify(data) }),

  // Work Orders
  getWorkOrders: () => request('/work-orders'),
  createWorkOrder: (data) => request('/work-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkOrderStatus: (id, status) => request(`/work-orders/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status })
  }),

  // Alerts
  getAlerts: () => request('/alerts'),
  ackAlert: (id) => request(`/alerts/${id}/ack`, { method: 'POST' }),

  // AI Assistant Chatbot
  chatAI: (message) => request('/ai/assistant', {
    method: 'POST',
    body: JSON.stringify({ message })
  }),

  // Stress Test
  runStressTest: (targetTps = 200, durationSec = 3, concurrency = 20) => request('/system/stress-test', {
    method: 'POST',
    body: JSON.stringify({ target_tps: targetTps, duration_sec: durationSec, concurrency })
  }),

  // Pest & Disease Risk Outbreak Radar
  getDiseaseRisk: () => request('/predictions/disease-risk'),

  // Fertilizer & Nutrient Dose Calculator
  calculateFertilizerDose: (data) => request('/fertilizers/calculate-dose', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Official Audit & IndoGAP Certification Report
  getOfficialAuditReport: () => request('/reports/official-audit'),
};
