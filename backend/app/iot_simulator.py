import random
import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class SensorTelemetry(BaseModel):
    sensor_id: str
    field_id: str
    field_name: str
    sensor_type: str  # MULTI_SOIL_ENV, RAIN_GAUGE, WATER_FLOW, NPK_OPTICAL
    soil_moisture_pct: float
    soil_temperature_c: float
    air_temperature_c: float
    air_humidity_pct: float
    soil_ph: float
    nitrogen_mg_kg: float
    phosphorus_mg_kg: float
    potassium_mg_kg: float
    electrical_conductivity_us_cm: float
    battery_level_pct: int
    signal_rssi_dbm: int
    freshness_status: str  # FRESH, STALE, OFFLINE
    is_abnormal: bool
    abnormal_reason: Optional[str] = None
    timestamp: str

class IoTSimulatorEngine:
    """
    ESP32 / LoRaWAN IoT Agricultural Gateway Telemetry Simulator.
    Generates realistic soil, atmospheric, and nutrient sensor readings with diurnal cycles.
    """
    def __init__(self):
        self.devices: Dict[str, Dict[str, Any]] = {}
        self.telemetry_history: List[SensorTelemetry] = []
        self._init_sensors()

    def _init_sensors(self):
        # Realistic initial sensors mapped to field parcels
        sensor_configs = [
            {"id": "ESP32-SUB-01", "field_id": "FLD-001", "field_name": "Petak Sawah Ciherang A", "type": "MULTI_SOIL_ENV", "base_moisture": 68.5, "base_ph": 6.4, "n": 135, "p": 58, "k": 82},
            {"id": "ESP32-SUB-02", "field_id": "FLD-002", "field_name": "Petak Sawah Ciherang B", "type": "MULTI_SOIL_ENV", "base_moisture": 64.0, "base_ph": 6.3, "n": 128, "p": 54, "k": 79},
            {"id": "ESP32-LMB-01", "field_id": "FLD-003", "field_name": "Kebun Cabai Keriting Lembang", "type": "MULTI_SOIL_ENV", "base_moisture": 52.0, "base_ph": 6.6, "n": 112, "p": 76, "k": 118},
            {"id": "ESP32-LMB-02", "field_id": "FLD-004", "field_name": "Greenhouse Tomat Servo", "type": "MULTI_SOIL_ENV", "base_moisture": 56.4, "base_ph": 6.5, "n": 142, "p": 88, "k": 136},
            {"id": "ESP32-KDR-01", "field_id": "FLD-005", "field_name": "Lahan Jagung Hibrida Kediri", "type": "MULTI_SOIL_ENV", "base_moisture": 47.8, "base_ph": 6.2, "n": 148, "p": 68, "k": 94},
            {"id": "ESP32-KDR-02", "field_id": "FLD-006", "field_name": "Petak Kedelai Grobogan", "type": "MULTI_SOIL_ENV", "base_moisture": 50.2, "base_ph": 6.7, "n": 62, "p": 52, "k": 68},
            {"id": "ESP32-METEO-01", "field_id": "FLD-001", "field_name": "Stasiun Cuaca Mikro Subang", "type": "RAIN_GAUGE", "base_moisture": 60.0, "base_ph": 6.5, "n": 100, "p": 50, "k": 80},
            {"id": "ESP32-IRR-01", "field_id": "FLD-004", "field_name": "Debit Pompa Irigasi Greenhouse", "type": "WATER_FLOW", "base_moisture": 58.0, "base_ph": 6.5, "n": 120, "p": 60, "k": 90},
        ]

        now = datetime.datetime.now(datetime.timezone.utc)
        for cfg in sensor_configs:
            self.devices[cfg["id"]] = {
                "id": cfg["id"],
                "field_id": cfg["field_id"],
                "field_name": cfg["field_name"],
                "sensor_type": cfg["type"],
                "firmware_version": "v2.4.1-esp32-freertos",
                "hardware_model": "ESP32-WROOM-32D + RS485 NPK + SHT31",
                "status": "ONLINE",
                "battery_pct": random.randint(82, 98),
                "rssi_dbm": random.randint(-74, -58),
                "last_calibrated": (now - datetime.timedelta(days=random.randint(5, 30))).strftime("%Y-%m-%d"),
                "base_moisture": cfg["base_moisture"],
                "base_ph": cfg["base_ph"],
                "base_n": cfg["n"],
                "base_p": cfg["p"],
                "base_k": cfg["k"],
            }
            # Generate initial reading
            reading = self._create_reading(cfg["id"], offset_minutes=0)
            self.telemetry_history.append(reading)

    def _create_reading(self, device_id: str, offset_minutes: int = 0, anomaly_type: Optional[str] = None) -> SensorTelemetry:
        dev = self.devices[device_id]
        now = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=offset_minutes)

        # Diurnal fluctuation based on hour
        hour = now.hour
        is_daytime = 6 <= hour <= 18
        air_temp = round(28.0 + (3.5 if is_daytime else -2.5) + random.uniform(-0.8, 0.8), 1)
        air_hum = round(82.0 - (12.0 if is_daytime else -6.0) + random.uniform(-2.0, 2.0), 1)
        soil_temp = round(air_temp - random.uniform(1.2, 2.5), 1)

        soil_moisture = round(dev["base_moisture"] + random.uniform(-1.5, 1.5), 1)
        soil_ph = round(dev["base_ph"] + random.uniform(-0.08, 0.08), 2)
        n_val = round(dev["base_n"] + random.uniform(-3, 3), 1)
        p_val = round(dev["base_p"] + random.uniform(-2, 2), 1)
        k_val = round(dev["base_k"] + random.uniform(-3, 3), 1)
        ec_val = round(1200.0 + random.uniform(-40, 40), 1)

        is_abnormal = False
        reason = None
        status = "FRESH"

        if anomaly_type == "MOISTURE_CRITICAL_DROP":
            soil_moisture = 19.4
            is_abnormal = True
            reason = "Kelembapan tanah anjlok drastis di bawah titik layu permanen (19.4%). Potensi kekeringan akar!"
        elif anomaly_type == "SOIL_ACIDIC_SPIKE":
            soil_ph = 4.2
            is_abnormal = True
            reason = "pH tanah anjlok ke 4.2 (Sangat Masam). Risiko keracunan Aluminium dan defisiensi Fosfat!"
        elif anomaly_type == "SENSOR_DISCONNECTED":
            status = "OFFLINE"
            is_abnormal = True
            reason = "Sensor tidak merespons heartbeat LoRaWAN selama lebih dari 45 menit."

        # Keep values in plausible ranges
        soil_moisture = max(10.0, min(95.0, soil_moisture))
        soil_ph = max(3.5, min(9.0, soil_ph))
        air_hum = max(30.0, min(99.0, air_hum))

        return SensorTelemetry(
            sensor_id=device_id,
            field_id=dev["field_id"],
            field_name=dev["field_name"],
            sensor_type=dev["sensor_type"],
            soil_moisture_pct=soil_moisture,
            soil_temperature_c=soil_temp,
            air_temperature_c=air_temp,
            air_humidity_pct=air_hum,
            soil_ph=soil_ph,
            nitrogen_mg_kg=n_val,
            phosphorus_mg_kg=p_val,
            potassium_mg_kg=k_val,
            electrical_conductivity_us_cm=ec_val,
            battery_level_pct=dev["battery_pct"],
            signal_rssi_dbm=dev["rssi_dbm"],
            freshness_status=status,
            is_abnormal=is_abnormal,
            abnormal_reason=reason,
            timestamp=now.isoformat()
        )

    def tick_telemetry(self) -> List[SensorTelemetry]:
        """Trigger a live telemetry tick across all active field nodes."""
        new_readings = []
        for dev_id in self.devices:
            r = self._create_reading(dev_id, offset_minutes=0)
            self.telemetry_history.insert(0, r)
            new_readings.append(r)
        # Keep latest 500 readings in memory
        self.telemetry_history = self.telemetry_history[:500]
        return new_readings

    def inject_anomaly(self, device_id: str, anomaly_type: str) -> SensorTelemetry:
        if device_id not in self.devices:
            raise ValueError(f"Perangkat {device_id} tidak terdaftar")
        r = self._create_reading(device_id, offset_minutes=0, anomaly_type=anomaly_type)
        self.telemetry_history.insert(0, r)
        return r

    def get_latest_readings_by_field(self) -> Dict[str, SensorTelemetry]:
        latest_map = {}
        for r in self.telemetry_history:
            if r.field_id not in latest_map:
                latest_map[r.field_id] = r
        return latest_map

iot_engine = IoTSimulatorEngine()
