import datetime
import random
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class DiseaseDiagnosis(BaseModel):
    id: str
    crop: str
    disease_name: str
    disease_code: str
    pathogen: str
    confidence: float
    severity_level: str  # LOW, MODERATE, HIGH, CRITICAL, NONE
    affected_area_pct: float
    symptoms: List[str]
    organic_recommendation: str
    chemical_recommendation: str
    prevention_steps: List[str]
    agronomist_status: str  # PENDING_REVIEW, APPROVED, REVISED
    agronomist_notes: Optional[str] = None
    created_at: str

# Knowledge Base of Plant Pathology for Indonesian Key Crops
DISEASE_KNOWLEDGE_BASE = {
    "TOMATO_EARLY_BLIGHT": {
        "crop": "Tomat (Tomato)",
        "name": "Hawar Daun Dini (Early Blight)",
        "code": "TOMATO_EARLY_BLIGHT",
        "pathogen": "Alternaria solani",
        "severity_level": "MODERATE",
        "affected_area_range": (15.0, 32.0),
        "symptoms": [
            "Bercak cokelat melingkar konsentris menyerupai sasaran tembak pada daun tua bagian bawah",
            "Daun menguning di sekitar bercak lesi dan rontok prematur",
            "Penurunan luas permukaan fotosintesis hingga 25%"
        ],
        "organic_recommendation": "Semprot ekstrak daun mimba (neem oil) konsentrasi 5 ml/L dan bakteri antagonis Trichoderma harzianum pada pangkal batang.",
        "chemical_recommendation": "Aplikasi fungisida protektan berbahan aktif Difenokonazol atau Tembaga Hidroksida (konsentrasi 1.5 g/L).",
        "prevention_steps": [
            "Pangkas daun-daun tua bagian bawah (pruning) untuk sirkulasi udara optimal",
            "Gunakan mulsa plastik hitam perak untuk mencegah spora tanah memercik ke daun",
            "Hindari penyiraman dari atas daun pada sore hari"
        ]
    },
    "RICE_BLAST": {
        "crop": "Padi (Rice)",
        "name": "Penyakit Blas Daun & Leher (Rice Blast)",
        "code": "RICE_BLAST",
        "pathogen": "Pyricularia oryzae (Magnaporthe oryzae)",
        "severity_level": "HIGH",
        "affected_area_range": (25.0, 48.0),
        "symptoms": [
            "Bercak belah ketupat runcing di kedua ujung dengan pusat berwarna kelabu keputihan",
            "Tepi bercak berwarna cokelat kemerahan gelap pada helaian daun",
            "Risiko patah leher malai (neck blast) jika memasuki fase generatif"
        ],
        "organic_recommendation": "Aplikasi agens hayati Pseudomonas fluorescens dan fermentasi urin sapi + ekstrak kunyit pada pagi hari.",
        "chemical_recommendation": "Fungisida sistemik berbahan aktif Trisiklazol 75 WP atau Isoprotiolan 400 EC dosis 1.0 - 1.5 ml/L.",
        "prevention_steps": [
            "Kurangi dosis pupuk Nitrogen (Urea) berlebih dan seimbangkan dengan Kalium (KCl)",
            "Gunakan benih bersertifikat tahan blas (seperti Inpari 32 HDB atau Inpari 42)",
            "Lakukan pengaturan pengairan berselang (intermittent irrigation)"
        ]
    },
    "CHILI_ANTHRACNOSE": {
        "crop": "Cabai Merah (Chili)",
        "name": "Antraknosa / Patek (Chili Anthracnose)",
        "code": "CHILI_ANTHRACNOSE",
        "pathogen": "Colletotrichum gloeosporioides",
        "severity_level": "CRITICAL",
        "affected_area_range": (30.0, 55.0),
        "symptoms": [
            "Bercak melekuk melingkar berwarna cokelat kehitaman dengan bintik spora konsentris",
            "Buah cabai mengering mengerut seperti jerami dan gugur",
            "Bercak nekrotik pada tulang daun cabai yang lembap"
        ],
        "organic_recommendation": "Penyemprotan ekstrak bawang putih dan Trichoderma sp. 10 g/L air setiap 4 hari sekali.",
        "chemical_recommendation": "Rotasi fungisida Azoksistrobin + Difenokonazol dengan fungisida kontak Mankozeb 80 WP.",
        "prevention_steps": [
            "Tinggikan bedengan hingga 40-50 cm untuk mencegah genangan air saat musim hujan",
            "Petik dan bakar buah atau daun yang telah terinfeksi agar tidak menular lewat angin",
            "Rapatkan jarak tanam hanya bila sirkulasi angin bedengan lancar"
        ]
    },
    "CORN_NORTHERN_BLIGHT": {
        "crop": "Jagung (Corn)",
        "name": "Hawar Daun Jagung (Northern Corn Leaf Blight)",
        "code": "CORN_NORTHERN_BLIGHT",
        "pathogen": "Exserohilum turcicum",
        "severity_level": "MODERATE",
        "affected_area_range": (18.0, 36.0),
        "symptoms": [
            "Bercak memanjang berbentuk cerutu atau perahu berwarna abu-abu kehijauan",
            "Bercak melebar sejajar tulang daun mencapai 5-15 cm",
            "Daun terbakar prematur mengganggu pengisian tongkol jagung"
        ],
        "organic_recommendation": "Semprotan bio-fungisida Bacillus subtilis dan pemupukan silika cair untuk memperkuat dinding sel daun.",
        "chemical_recommendation": "Aplikasi fungisida sistemik Piraklostrobin atau Propikonazol 250 EC.",
        "prevention_steps": [
            "Lakukan pergiliran tanaman dengan famili kacang-kacangan (kedelai / kacang hijau)",
            "Benamkan sisa-sisa jerami jagung pasca panen ke dalam tanah",
            "Tanam varietas hibrida tahan hawar (seperti NK 7328 atau Pioneer P35)"
        ]
    },
    "HEALTHY_LEAF": {
        "crop": "Multi-Crop",
        "name": "Daun Sehat Prima (Healthy Foliage)",
        "code": "HEALTHY_LEAF",
        "pathogen": "None (Tanpa Patogen)",
        "severity_level": "NONE",
        "affected_area_range": (0.0, 2.0),
        "symptoms": [
            "Helaian daun hijau cerah merata dengan turgor sel yang kuat",
            "Klorofil optimal tanpa bercak nekrotik, klorosis, atau deformasi bentuk",
            "Pertumbuhan kanopi simetris dan laju fotosintesis maksimal"
        ],
        "organic_recommendation": "Pertahankan aplikasi pupuk hayati cair (POC) dan asam amino untuk merangsang kekebalan sistemik tanaman.",
        "chemical_recommendation": "Tidak memerlukan aplikasi pestisida kimia sintetis.",
        "prevention_steps": [
            "Lanjutkan pemantauan kelembapan tanah dan nutrisi NPK berkala",
            "Jaga kebersihan gulma di sekitar piringan tanaman",
            "Pertahankan jadwal irigasi presisi sesuai rekomendasi harian"
        ]
    }
}

class AIVisionEngine:
    """
    Computer Vision Inference Engine for Plant Pathology Diagnosis.
    Simulates CNN classification (EfficientNet-B0 / MobileNetV3) with image feature analysis,
    confidence estimation, severity grading, and agronomist validation workflows.
    """
    def __init__(self):
        self.diagnoses_history: List[DiseaseDiagnosis] = []
        self._init_history()

    def _init_history(self):
        # Initial scan history
        samples = [
            ("SCAN-901", "Tomat", "TOMATO_EARLY_BLIGHT", 0.942, 22.4, "APPROVED", "Gejala tipikal Alternaria solani terkonfirmasi pada petak Blok B. Rekomendasi pruning disetujui."),
            ("SCAN-902", "Padi", "RICE_BLAST", 0.965, 34.0, "PENDING_REVIEW", None),
            ("SCAN-903", "Cabai", "CHILI_ANTHRACNOSE", 0.918, 41.2, "APPROVED", "Infeksi tinggi pada musim hujan. Segera isolasi bedengan petak 4."),
            ("SCAN-904", "Jagung", "CORN_NORTHERN_BLIGHT", 0.887, 19.5, "PENDING_REVIEW", None),
            ("SCAN-905", "Padi", "HEALTHY_LEAF", 0.989, 0.5, "APPROVED", "Kondisi vegetatif prima pada varietas Inpari 32."),
        ]
        for scan_id, crop, code, conf, aff, status, notes in samples:
            kb = DISEASE_KNOWLEDGE_BASE[code]
            diag = DiseaseDiagnosis(
                id=scan_id,
                crop=crop,
                disease_name=kb["name"],
                disease_code=code,
                pathogen=kb["pathogen"],
                confidence=conf,
                severity_level=kb["severity_level"],
                affected_area_pct=aff,
                symptoms=kb["symptoms"],
                organic_recommendation=kb["organic_recommendation"],
                chemical_recommendation=kb["chemical_recommendation"],
                prevention_steps=kb["prevention_steps"],
                agronomist_status=status,
                agronomist_notes=notes,
                created_at=(datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=random.randint(2, 72))).isoformat()
            )
            self.diagnoses_history.append(diag)

    def analyze_leaf_image(self, crop_hint: Optional[str] = None, image_filename: Optional[str] = None, disease_override: Optional[str] = None) -> DiseaseDiagnosis:
        """
        Perform AI Plant Pathology diagnosis on uploaded image or simulated camera input.
        """
        # Determine disease key
        if disease_override and disease_override in DISEASE_KNOWLEDGE_BASE:
            key = disease_override
        else:
            if crop_hint:
                crop_lower = crop_hint.lower()
                if "tomat" in crop_lower or "tomato" in crop_lower:
                    key = random.choice(["TOMATO_EARLY_BLIGHT", "HEALTHY_LEAF"])
                elif "padi" in crop_lower or "rice" in crop_lower:
                    key = random.choice(["RICE_BLAST", "HEALTHY_LEAF"])
                elif "cabai" in crop_lower or "chili" in crop_lower:
                    key = random.choice(["CHILI_ANTHRACNOSE", "HEALTHY_LEAF"])
                elif "jagung" in crop_lower or "corn" in crop_lower:
                    key = random.choice(["CORN_NORTHERN_BLIGHT", "HEALTHY_LEAF"])
                else:
                    key = random.choice(list(DISEASE_KNOWLEDGE_BASE.keys()))
            else:
                key = random.choice(list(DISEASE_KNOWLEDGE_BASE.keys()))

        kb = DISEASE_KNOWLEDGE_BASE[key]
        conf = round(random.uniform(0.895, 0.985), 3)
        aff_range = kb["affected_area_range"]
        aff_pct = round(random.uniform(aff_range[0], aff_range[1]), 1)

        scan_id = f"SCAN-{len(self.diagnoses_history) + 901}"
        diagnosis = DiseaseDiagnosis(
            id=scan_id,
            crop=kb["crop"],
            disease_name=kb["name"],
            disease_code=key,
            pathogen=kb["pathogen"],
            confidence=conf,
            severity_level=kb["severity_level"],
            affected_area_pct=aff_pct,
            symptoms=kb["symptoms"],
            organic_recommendation=kb["organic_recommendation"],
            chemical_recommendation=kb["chemical_recommendation"],
            prevention_steps=kb["prevention_steps"],
            agronomist_status="PENDING_REVIEW",
            agronomist_notes=None,
            created_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
        )
        self.diagnoses_history.insert(0, diagnosis)
        return diagnosis

    def update_agronomist_review(self, scan_id: str, status: str, notes: Optional[str] = None) -> Optional[DiseaseDiagnosis]:
        for d in self.diagnoses_history:
            if d.id.upper() == scan_id.upper():
                d.agronomist_status = status
                if notes:
                    d.agronomist_notes = notes
                return d
        return None

ai_vision_engine = AIVisionEngine()
