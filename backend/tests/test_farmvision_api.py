import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "FarmVision" in data["service"]

def test_get_kpis():
    res = client.get("/api/v1/kpis")
    assert res.status_code == 200
    data = res.json()
    assert "total_farm_area_ha" in data
    assert data["healthy_crop_pct"] >= 0

def test_farms_and_fields():
    res = client.get("/api/v1/farms")
    assert res.status_code == 200
    farms = res.json()
    assert len(farms) >= 3

    # Switch farm
    res_sw = client.post("/api/v1/farms/switch/FRM-002")
    assert res_sw.status_code == 200

    # Get fields for active farm
    res_f = client.get("/api/v1/fields")
    assert res_f.status_code == 200
    fields = res_f.json()
    assert len(fields) >= 1

    # Switch back
    client.post("/api/v1/farms/switch/FRM-001")

def test_create_field():
    payload = {
        "name": "Petak Percobaan Jagung Manis",
        "crop": "Jagung (Corn)",
        "crop_variety": "Bonanza F1",
        "area_ha": 1.8,
        "soil_type": "Lempung Berpasir",
        "irrigation_system": "Sprinkler"
    }
    res = client.post("/api/v1/fields", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["field"]["name"] == "Petak Percobaan Jagung Manis"

def test_disease_scan_and_agronomist_review():
    # 1. Get history
    res = client.get("/api/v1/disease-scans")
    assert res.status_code == 200
    scans = res.json()
    assert len(scans) >= 1

    # 2. Analyze new scan
    res_scan = client.post("/api/v1/disease-scans/analyze", json={"crop_hint": "Tomat", "disease_override": "TOMATO_EARLY_BLIGHT"})
    assert res_scan.status_code == 200
    diag = res_scan.json()
    assert diag["disease_code"] == "TOMATO_EARLY_BLIGHT"
    assert diag["confidence"] > 0.8
    assert diag["agronomist_status"] == "PENDING_REVIEW"

    # 3. Agronomist Review
    res_rev = client.post(f"/api/v1/disease-scans/{diag['id']}/review", json={
        "status": "APPROVED",
        "notes": "Diagnosis Alternaria solani diverifikasi oleh Tim Agronomi."
    })
    assert res_rev.status_code == 200
    assert res_rev.json()["scan"]["agronomist_status"] == "APPROVED"

def test_iot_sensors_and_telemetry():
    res = client.get("/api/v1/sensors")
    assert res.status_code == 200
    devices = res.json()
    assert len(devices) >= 5

    res_t = client.get("/api/v1/sensors/telemetry")
    assert res_t.status_code == 200
    assert len(res_t.json()) >= 1

    # Tick telemetry
    res_tick = client.post("/api/v1/sensors/tick")
    assert res_tick.status_code == 200
    assert "Generated" in res_tick.json()["message"]

    # Inject anomaly
    res_anom = client.post("/api/v1/sensors/inject-anomaly", json={
        "sensor_id": "ESP32-SUB-01",
        "anomaly_type": "MOISTURE_CRITICAL_DROP"
    })
    assert res_anom.status_code == 200
    reading = res_anom.json()["reading"]
    assert reading["is_abnormal"] is True

def test_irrigation_prediction_and_override():
    res = client.get("/api/v1/predictions/irrigation/FLD-001")
    assert res.status_code == 200
    irr = res.json()
    assert "evapotranspiration_et0_mm" in irr
    assert "recommended_water_volume_liters" in irr

    # Override
    res_ov = client.post("/api/v1/irrigation/override", json={
        "field_id": "FLD-001",
        "action": "START_PUMP",
        "duration_minutes": 45
    })
    assert res_ov.status_code == 200
    assert res_ov.json()["duration_minutes"] == 45

def test_yield_prediction_and_simulation():
    res = client.get("/api/v1/predictions/yield/FLD-001")
    assert res.status_code == 200
    yp = res.json()
    assert yp["predicted_yield_ton_per_ha"] > 0
    assert yp["total_estimated_production_ton"] > 0

    # Simulate
    sim_payload = {
        "field_id": "FLD-001",
        "crop": "Padi (Rice)",
        "area_ha": 4.5,
        "dap": 60,
        "soil_ph": 6.5,
        "avg_moisture": 65.0,
        "nitrogen_kg": 130.0,
        "phosphorus_kg": 60.0,
        "potassium_kg": 80.0,
        "rainfall_mm": 400.0
    }
    res_sim = client.post("/api/v1/predictions/yield/simulate", json=sim_payload)
    assert res_sim.status_code == 200
    assert res_sim.json()["yield_health_score"] >= 40

def test_satellite_ndvi():
    res = client.get("/api/v1/satellite/ndvi/FLD-001")
    assert res.status_code == 200
    data = res.json()
    assert 0.0 <= data["mean_ndvi"] <= 1.0
    assert len(data["spatial_raster_grid"]) == 6

def test_planting_recommendations():
    res = client.get("/api/v1/planting/recommendations")
    assert res.status_code == 200
    recs = res.json()
    assert len(recs) >= 3

def test_inventory_and_harvest():
    res_inv = client.get("/api/v1/inventory")
    assert res_inv.status_code == 200
    assert len(res_inv.json()) >= 3

    res_hrv = client.get("/api/v1/harvests")
    assert res_hrv.status_code == 200
    assert len(res_hrv.json()) >= 1

def test_work_orders():
    res = client.get("/api/v1/work-orders")
    assert res.status_code == 200
    wos = res.json()
    assert len(wos) >= 1

    # Update status
    res_st = client.post(f"/api/v1/work-orders/{wos[0]['id']}/status", json={"status": "COMPLETED"})
    assert res_st.status_code == 200
    assert res_st.json()["work_order"]["status"] == "COMPLETED"

def test_alerts_and_ai_assistant():
    res_al = client.get("/api/v1/alerts")
    assert res_al.status_code == 200
    alerts = res_al.json()
    assert len(alerts) >= 1

    # AI assistant
    res_ai = client.post("/api/v1/ai/assistant", json={"message": "Bagaimana kondisi kelembapan tanah dan irigasi?"})
    assert res_ai.status_code == 200
    assert "Irigasi" in res_ai.json()["reply"] or "Lahan" in res_ai.json()["reply"]

def test_system_stress_benchmark():
    res = client.post("/api/v1/system/stress-test", json={"target_tps": 150, "duration_sec": 2, "concurrency": 15})
    assert res.status_code == 200
    data = res.json()
    assert data["success_rate_pct"] == 100.0
    assert data["p95_latency_ms"] < 50.0

def test_disease_outbreak_risk_matrix():
    res = client.get("/api/v1/predictions/disease-risk")
    assert res.status_code == 200
    threats = res.json()
    assert len(threats) >= 3
    assert any("Blas" in t["disease_name"] for t in threats)

def test_fertilizer_dosage_calculator():
    payload = {
        "crop": "Padi (Rice)",
        "area_ha": 3.0,
        "soil_ph": 5.4,
        "current_n": 100.0,
        "current_p": 45.0,
        "current_k": 70.0,
        "target_yield_ton": 6.5
    }
    res = client.post("/api/v1/fertilizers/calculate-dose", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["urea_kg"] > 0
    assert data["dolomite_lime_kg"] > 0  # Since pH is 5.4 < 6.0
    assert len(data["application_schedule"]) == 3

def test_official_audit_report():
    res = client.get("/api/v1/reports/official-audit")
    assert res.status_code == 200
    data = res.json()
    assert "REP-AGRI" in data["report_id"]
    assert "IndoGAP" in data["authority"]

