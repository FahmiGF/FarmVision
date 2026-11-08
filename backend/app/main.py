import os
import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.store import store, Field, HarvestRecord, WorkOrder
from app.ai_vision import ai_vision_engine
from app.ml_models import ml_models_engine
from app.iot_simulator import iot_engine
from app.satellite_ndvi import satellite_engine

app = FastAPI(
    title="FarmVision API",
    description="Intelligent Agriculture & Crop Optimization Platform Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ACTIVE_USER = {
    "id": "usr-001",
    "name": "Fahmi Gunawan, S.Tr.P",
    "email": "fahmi@farmvision.id",
    "role": "Farm Manager",
    "organization": "Nusantara Agri Corpora Mandiri",
    "active_farm": "FRM-001"
}

# --- Health & Metadata ---
@app.get("/api/v1/health")
def health():
    return {
        "status": "healthy",
        "service": "FarmVision Precision Ag Core Engine",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "version": "1.0.0",
        "active_farm": store.active_farm_id,
        "online_sensors": len([d for d in iot_engine.devices.values() if d["status"] == "ONLINE"]),
        "ai_vision_models": ["EfficientNet-B0 (Plant Pathology v2.4)", "FAO-56 Irrigation Engine", "XGBoost Yield Regressor"]
    }

@app.get("/api/v1/kpis")
def get_kpis():
    return store.get_kpis()

# --- Auth & RBAC ---
@app.get("/api/v1/auth/me")
def get_me():
    return ACTIVE_USER

@app.post("/api/v1/auth/switch-role")
def switch_role(role: str = Body(..., embed=True)):
    valid_roles = ["Super Admin", "Farm Owner", "Farm Manager", "Agronomist", "Field Worker", "IoT Technician"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Choices: {valid_roles}")
    ACTIVE_USER["role"] = role
    return {"message": f"Role switched to {role}", "user": ACTIVE_USER}

# --- Farms & Fields Management ---
@app.get("/api/v1/farms")
def get_farms():
    return list(store.farms.values())

@app.post("/api/v1/farms/switch/{id}")
def switch_active_farm(id: str):
    if id.upper() not in store.farms:
        raise HTTPException(status_code=404, detail="Farm not found")
    store.active_farm_id = id.upper()
    ACTIVE_USER["active_farm"] = id.upper()
    return {"message": f"Active farm switched to {store.farms[id.upper()].name}", "active_farm_id": id.upper()}

@app.get("/api/v1/fields")
def get_fields():
    # Return fields belonging to active farm
    return [f for f in store.fields.values() if f.farm_id == store.active_farm_id]

class CreateFieldRequest(BaseModel):
    name: str
    crop: str
    crop_variety: str
    area_ha: float
    soil_type: str
    irrigation_system: str

@app.post("/api/v1/fields")
def create_field(payload: CreateFieldRequest):
    new_id = f"FLD-00{len(store.fields) + 1}"
    new_field = Field(
        id=new_id,
        farm_id=store.active_farm_id,
        name=payload.name,
        crop=payload.crop,
        crop_variety=payload.crop_variety,
        area_ha=payload.area_ha,
        soil_type=payload.soil_type,
        planting_date=datetime.datetime.now().strftime("%Y-%m-%d"),
        days_after_planting=1,
        growth_stage="Persemaian / Transplanting",
        health_status="HEALTHY",
        irrigation_system=payload.irrigation_system,
        polygon_coordinates=[[-6.500, 107.720], [-6.500, 107.725], [-6.504, 107.725], [-6.504, 107.720]]
    )
    store.fields[new_id] = new_field
    return {"message": "Field created successfully", "field": new_field}

# --- AI Plant Disease Scanner (Modul B) ---
@app.get("/api/v1/disease-scans")
def get_disease_scans():
    return ai_vision_engine.diagnoses_history

class AnalyzeScanRequest(BaseModel):
    crop_hint: Optional[str] = None
    disease_override: Optional[str] = None

@app.post("/api/v1/disease-scans/analyze")
def analyze_plant_disease(payload: AnalyzeScanRequest):
    diagnosis = ai_vision_engine.analyze_leaf_image(
        crop_hint=payload.crop_hint,
        disease_override=payload.disease_override
    )
    # If high severity, trigger policy alert
    if diagnosis.severity_level in ["HIGH", "CRITICAL"]:
        store.alerts.insert(0, {
            "id": f"ALT-{len(store.alerts) + 101}",
            "farm_id": store.active_farm_id,
            "field_id": "FLD-001",
            "severity": "CRITICAL",
            "title": f"Deteksi AI: {diagnosis.disease_name}",
            "message": f"Terdeteksi patogen {diagnosis.pathogen} dengan keparahan {diagnosis.affected_area_pct}%. Segera review tindakan.",
            "source": "AI_VISION",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "is_acknowledged": False
        })
    return diagnosis

class AgronomistReviewRequest(BaseModel):
    status: str  # APPROVED, REVISED, REJECTED
    notes: Optional[str] = None

@app.post("/api/v1/disease-scans/{id}/review")
def review_disease_scan(id: str, payload: AgronomistReviewRequest):
    updated = ai_vision_engine.update_agronomist_review(id, payload.status, payload.notes)
    if not updated:
        raise HTTPException(status_code=404, detail="Scan record not found")
    return {"message": f"Scan {id} status updated to {payload.status}", "scan": updated}

# --- IoT Sensors & Telemetry (Modul C) ---
@app.get("/api/v1/sensors")
def get_sensors():
    return list(iot_engine.devices.values())

@app.get("/api/v1/sensors/telemetry")
def get_telemetry():
    return iot_engine.telemetry_history[:30]

@app.post("/api/v1/sensors/tick")
def trigger_sensor_tick():
    readings = iot_engine.tick_telemetry()
    return {"message": f"Generated {len(readings)} live telemetry packets", "readings": readings}

class InjectAnomalyRequest(BaseModel):
    sensor_id: str
    anomaly_type: str  # MOISTURE_CRITICAL_DROP, SOIL_ACIDIC_SPIKE, SENSOR_DISCONNECTED

@app.post("/api/v1/sensors/inject-anomaly")
def inject_sensor_anomaly(payload: InjectAnomalyRequest):
    res = iot_engine.inject_anomaly(payload.sensor_id, payload.anomaly_type)
    return {"message": f"Injected {payload.anomaly_type} to {payload.sensor_id}", "reading": res}

# --- Intelligent Irrigation Prediction (Modul D) ---
@app.get("/api/v1/predictions/irrigation/{field_id}")
def get_irrigation_prediction(field_id: str):
    field = store.fields.get(field_id.upper())
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    # Get latest reading or default
    latest_readings = iot_engine.get_latest_readings_by_field()
    sensor_reading = latest_readings.get(field.id)
    current_moisture = sensor_reading.soil_moisture_pct if sensor_reading else 58.0

    return ml_models_engine.calculate_irrigation_demand(
        field_id=field.id,
        field_name=field.name,
        crop=field.crop,
        area_ha=field.area_ha,
        current_moisture_pct=current_moisture,
        growth_stage=field.growth_stage
    )

class IrrigationOverrideRequest(BaseModel):
    field_id: str
    action: str  # START_PUMP, EMERGENCY_SHUTOFF
    duration_minutes: int = 30

@app.post("/api/v1/irrigation/override")
def override_irrigation(payload: IrrigationOverrideRequest):
    return {
        "message": f"Irrigation command '{payload.action}' executed for field {payload.field_id}",
        "field_id": payload.field_id,
        "action": payload.action,
        "duration_minutes": payload.duration_minutes,
        "safeguards_active": True,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

# --- Crop Yield Prediction (Modul E) ---
@app.get("/api/v1/predictions/yield/{field_id}")
def get_yield_prediction(field_id: str):
    field = store.fields.get(field_id.upper())
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return ml_models_engine.predict_crop_yield(
        field_id=field.id,
        crop=field.crop,
        area_ha=field.area_ha,
        dap=field.days_after_planting,
        growth_stage=field.growth_stage
    )

class SimulateYieldRequest(BaseModel):
    field_id: str
    crop: str
    area_ha: float
    dap: int
    soil_ph: float
    avg_moisture: float
    nitrogen_kg: float
    phosphorus_kg: float
    potassium_kg: float
    rainfall_mm: float

@app.post("/api/v1/predictions/yield/simulate")
def simulate_crop_yield(payload: SimulateYieldRequest):
    return ml_models_engine.predict_crop_yield(
        field_id=payload.field_id,
        crop=payload.crop,
        area_ha=payload.area_ha,
        dap=payload.dap,
        growth_stage="Simulated Projection",
        soil_ph=payload.soil_ph,
        avg_moisture=payload.avg_moisture,
        nitrogen_kg=payload.nitrogen_kg,
        phosphorus_kg=payload.phosphorus_kg,
        potassium_kg=payload.potassium_kg,
        rainfall_accumulation_mm=payload.rainfall_mm
    )

# --- Satellite & Drone NDVI / NDWI (Modul K) ---
@app.get("/api/v1/satellite/ndvi/{field_id}")
def get_field_ndvi(field_id: str):
    field = store.fields.get(field_id.upper())
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return satellite_engine.analyze_field_ndvi(
        field_id=field.id,
        field_name=field.name,
        crop=field.crop,
        growth_stage=field.growth_stage
    )

# --- Smart Planting Calendar & Rotation (Modul F) ---
@app.get("/api/v1/planting/recommendations")
def get_planting_recommendations():
    return [
        {
            "crop": "Padi Sawah (Oryza sativa)",
            "season": "Musim Hujan Rendengan (Oktober - Maret)",
            "suitability_score": 96,
            "soil_compatibility": "Tanah Liat Berlempung (pH 5.8 - 6.8)",
            "water_requirement": "Tinggi (1.200 - 1.500 mm/musim)",
            "recommended_variety": "Inpari 32 HDB, Inpari 42, Ciherang",
            "rotation_strategy": "Rotasi dengan Kedelai / Jagung pada Musim Gadu untuk memutus siklus Wereng & Blas"
        },
        {
            "crop": "Jagung Hibrida (Zea mays)",
            "season": "Musim Kemarau I / Gadu (April - Juli)",
            "suitability_score": 92,
            "soil_compatibility": "Lempung Berpasir Gembur (pH 6.0 - 7.0)",
            "water_requirement": "Sedang (500 - 800 mm/musim)",
            "recommended_variety": "Bisi 18, NK 7328, Pioneer P35",
            "rotation_strategy": "Ideal ditanam setelah panen padi sawah saat lengas tanah masih tersimpan"
        },
        {
            "crop": "Cabai Merah Keriting (Capsicum annuum)",
            "season": "Awal Kemarau (Mei - September)",
            "suitability_score": 88,
            "soil_compatibility": "Andosol / Aluvial Berdrainase Baik (pH 6.2 - 6.8)",
            "water_requirement": "Sedang Teratur (Tetes/Drip)",
            "recommended_variety": "Lado F1, Kastilo F1, PM 999",
            "rotation_strategy": "Jangan rotasi setelah famili solanaceae (Tomat/Terong) untuk mencegah layu bakteri"
        },
        {
            "crop": "Kedelai (Glycine max)",
            "season": "Musim Kemarau II (Juli - Oktober)",
            "suitability_score": 94,
            "soil_compatibility": "Lempung Aluvial (pH 6.0 - 7.2)",
            "water_requirement": "Rendah (350 - 500 mm/musim)",
            "recommended_variety": "Anjasmoro, Grobogan, Dega 1",
            "rotation_strategy": "Bintil akar mengikat nitrogen bebas, menyuburkan tanah untuk musim tanam padi berikutnya"
        }
    ]

# --- Inventory & Harvest Management (Modul M & N) ---
@app.get("/api/v1/inventory")
def get_inventory():
    return store.inventory

@app.get("/api/v1/harvests")
def get_harvests():
    return store.harvest_records

@app.post("/api/v1/harvests")
def log_harvest(payload: HarvestRecord):
    store.harvest_records.insert(0, payload)
    return {"message": "Harvest record logged successfully", "record": payload}

# --- Work Orders & Agronomist Task Center ---
@app.get("/api/v1/work-orders")
def get_work_orders():
    return store.work_orders

@app.post("/api/v1/work-orders")
def create_work_order(payload: WorkOrder):
    store.work_orders.insert(0, payload)
    return {"message": "Work order created", "work_order": payload}

@app.post("/api/v1/work-orders/{id}/status")
def update_work_order_status(id: str, status: str = Body(..., embed=True)):
    for wo in store.work_orders:
        if wo.id.upper() == id.upper():
            wo.status = status
            return {"message": f"Work order {id} status updated to {status}", "work_order": wo}
    raise HTTPException(status_code=404, detail="Work order not found")

# --- Policy Alerts (Modul 13) ---
@app.get("/api/v1/alerts")
def get_alerts():
    return store.alerts

@app.post("/api/v1/alerts/{id}/ack")
def acknowledge_alert(id: str):
    for a in store.alerts:
        if (isinstance(a, dict) and a["id"].upper() == id.upper()):
            a["is_acknowledged"] = True
            return {"message": "Alert acknowledged", "alert": a}
        elif hasattr(a, "id") and a.id.upper() == id.upper():
            a.is_acknowledged = True
            return {"message": "Alert acknowledged", "alert": a}
    raise HTTPException(status_code=404, detail="Alert not found")

# --- AI Agricultural Assistant (Chat RAG - Modul G) ---
class AIChatRequest(BaseModel):
    message: str

@app.post("/api/v1/ai/assistant")
def chat_ai_assistant(payload: AIChatRequest):
    msg = payload.message.lower()
    kpis = store.get_kpis()

    if "kondisi" in msg or "lahan" in msg or "overview" in msg:
        reply = (
            f"🌾 **Laporan Status Lahan `{kpis['farm_name']}` ({kpis['location']})**:\n"
            f"- **Luas Terkelola**: {kpis['managed_fields_area_ha']} ha dari total {kpis['total_farm_area_ha']} ha ({kpis['active_fields_count']} petak aktif).\n"
            f"- **Kesehatan Tanaman**: **{kpis['healthy_crop_pct']}%** tanaman berada dalam status sehat prima.\n"
            f"- **Sensor IoT**: **{kpis['online_sensors_count']}/{kpis['total_sensors_count']}** node ESP32 aktif mentransmisikan data segar.\n"
            f"- **Estimasi Hasil Panen**: Terproyeksi **{kpis['total_upcoming_yield_ton']} ton** komoditas pertanian."
        )
    elif "irigasi" in msg or "air" in msg or "kelembapan" in msg:
        reply = (
            "💧 **Rekomendasi Irigasi Presisi (FAO-56 Penman-Monteith)**:\n"
            "- Petak **Ciherang A (Padi)**: Kelembapan 64.5% (Tercukupi, lanjutkan pengairan berselang).\n"
            "- Petak **Kebun Cabai Lembang**: Kelembapan 52.0% (Butuh irigasi tetes 18.000 liter pada pukul 16:30 WIB).\n"
            "- Proteksi pompa otomatis aktif dengan batas cut-off kelembapan 62%."
        )
    elif "penyakit" in msg or "hama" in msg or "blas" in msg or "patek" in msg:
        reply = (
            "🔬 **Deteksi Penyakit & PHT (Pengendalian Hama Terpadu)**:\n"
            "- Terdeteksi indikasi **Antraknosa Cabai (Colletotrichum)** pada Kebun Lembang dengan keparahan 41.2%.\n"
            "- **Tindakan Cepat**: Pruning buah/daun terinfeksi, bakar di luar bedengan, semprot bio-fungisida *Trichoderma harzianum* 5 ml/L dan perbaiki drainase bedengan agar tidak tergenang."
        )
    elif "panen" in msg or "hasil" in msg or "yield" in msg:
        reply = (
            f"📈 **Proyeksi Panen & Yield Forecasting (Ensemble XGBoost)**:\n"
            f"- **Padi Inpari 32 (Petak A)**: Estimasi 6.1 ton/ha (Total ~27.4 ton, jadwal panen 10–20 Desember 2026).\n"
            f"- **Jagung Bisi 18 (Kediri)**: Estimasi 7.4 ton/ha (Total ~45.8 ton).\n"
            f"- Keseimbangan hara NPK tanah terpantau mendukung pembentukan malai dan tongkol."
        )
    else:
        reply = (
            f"Halo {ACTIVE_USER['name']}! Saya **FarmVision AI Agronomist**. Anda dapat berkonsultasi seputar:\n"
            f"1. *Kondisi real-time tanah dan kelembapan sensor IoT*\n"
            f"2. *Jadwal dan volume kebutuhan air irigasi FAO-56*\n"
            f"3. *Diagnosis penyakit tanaman dan resep pengendalian hayati*\n"
            f"4. *Estimasi hasil panen dan kalender tanam pergiliran varietas*"
        )

    return {
        "reply": reply,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "source": "FarmVision Agronomic Knowledge Base & Telemetry Engine"
    }

# --- Stress Test Benchmark (Modul 10) ---
class StressBenchmarkRequest(BaseModel):
    target_tps: int = 200
    duration_sec: int = 3
    concurrency: int = 20

@app.post("/api/v1/system/stress-test")
def execute_stress_test(payload: StressBenchmarkRequest):
    return store.run_stress_benchmark(
        target_tps=payload.target_tps,
        duration_sec=payload.duration_sec,
        concurrency=payload.concurrency
    )

# --- Mount Frontend Static Assets ---
dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = os.path.join(dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_path, "index.html"))
