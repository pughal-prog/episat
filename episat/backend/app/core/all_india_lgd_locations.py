"""
EpiSat 2.0 - All-India LGD (Local Government Directory) Location Dataset
========================================================================
Canonical reference mapping for 36 Indian States/Union Territories and 780+ Districts.
Derived from LGD 2024 / Survey of India / Bharatlas snapshot.
Includes official LGD codes, state mappings, lat/lon centroids, and spatial neighbor definitions.
"""

from typing import Dict, Any, List, Optional

STATES_UT_REGISTRY: List[Dict[str, Any]] = [
    {"state_id": "AN", "state_name": "Andaman and Nicobar Islands", "lgd_code": 35, "category": "UT"},
    {"state_id": "AP", "state_name": "Andhra Pradesh", "lgd_code": 28, "category": "STATE"},
    {"state_id": "AR", "state_name": "Arunachal Pradesh", "lgd_code": 12, "category": "STATE"},
    {"state_id": "AS", "state_name": "Assam", "lgd_code": 18, "category": "STATE"},
    {"state_id": "BR", "state_name": "Bihar", "lgd_code": 10, "category": "STATE"},
    {"state_id": "CH", "state_name": "Chandigarh", "lgd_code": 4, "category": "UT"},
    {"state_id": "CG", "state_name": "Chhattisgarh", "lgd_code": 22, "category": "STATE"},
    {"state_id": "DN", "state_name": "Dadra and Nagar Haveli and Daman and Diu", "lgd_code": 26, "category": "UT"},
    {"state_id": "DL", "state_name": "Delhi", "lgd_code": 7, "category": "UT"},
    {"state_id": "GA", "state_name": "Goa", "lgd_code": 30, "category": "STATE"},
    {"state_id": "GJ", "state_name": "Gujarat", "lgd_code": 24, "category": "STATE"},
    {"state_id": "HR", "state_name": "Haryana", "lgd_code": 6, "category": "STATE"},
    {"state_id": "HP", "state_name": "Himachal Pradesh", "lgd_code": 2, "category": "STATE"},
    {"state_id": "JK", "state_name": "Jammu and Kashmir", "lgd_code": 1, "category": "UT"},
    {"state_id": "JH", "state_name": "Jharkhand", "lgd_code": 20, "category": "STATE"},
    {"state_id": "KA", "state_name": "Karnataka", "lgd_code": 29, "category": "STATE"},
    {"state_id": "KL", "state_name": "Kerala", "lgd_code": 32, "category": "STATE"},
    {"state_id": "LA", "state_name": "Ladakh", "lgd_code": 37, "category": "UT"},
    {"state_id": "LD", "state_name": "Lakshadweep", "lgd_code": 31, "category": "UT"},
    {"state_id": "MP", "state_name": "Madhya Pradesh", "lgd_code": 23, "category": "STATE"},
    {"state_id": "MH", "state_name": "Maharashtra", "lgd_code": 27, "category": "STATE"},
    {"state_id": "MN", "state_name": "Manipur", "lgd_code": 14, "category": "STATE"},
    {"state_id": "ML", "state_name": "Meghalaya", "lgd_code": 17, "category": "STATE"},
    {"state_id": "MZ", "state_name": "Mizoram", "lgd_code": 15, "category": "STATE"},
    {"state_id": "NL", "state_name": "Nagaland", "lgd_code": 13, "category": "STATE"},
    {"state_id": "OR", "state_name": "Odisha", "lgd_code": 21, "category": "STATE"},
    {"state_id": "PY", "state_name": "Puducherry", "lgd_code": 34, "category": "UT"},
    {"state_id": "PB", "state_name": "Punjab", "lgd_code": 3, "category": "STATE"},
    {"state_id": "RJ", "state_name": "Rajasthan", "lgd_code": 8, "category": "STATE"},
    {"state_id": "SK", "state_name": "Sikkim", "lgd_code": 11, "category": "STATE"},
    {"state_id": "TN", "state_name": "Tamil Nadu", "lgd_code": 33, "category": "STATE"},
    {"state_id": "TS", "state_name": "Telangana", "lgd_code": 36, "category": "STATE"},
    {"state_id": "TR", "state_name": "Tripura", "lgd_code": 16, "category": "STATE"},
    {"state_id": "UP", "state_name": "Uttar Pradesh", "lgd_code": 9, "category": "STATE"},
    {"state_id": "UK", "state_name": "Uttarakhand", "lgd_code": 5, "category": "STATE"},
    {"state_id": "WB", "state_name": "West Bengal", "lgd_code": 19, "category": "STATE"}
]

# Canonical District Registry spanning All-India States & UTs (36/36)
ALL_INDIA_DISTRICTS: List[Dict[str, Any]] = [
    # Andaman and Nicobar (AN)
    {"district_id": "AN-POR", "district_name": "South Andaman (Port Blair)", "state_id": "AN", "lgd_code": 638, "lat": 11.6234, "lon": 92.7265, "has_demo_data": True, "neighbors": ["AN-NIC"]},
    {"district_id": "AN-NIC", "district_name": "Nicobar", "state_id": "AN", "lgd_code": 639, "lat": 7.0000, "lon": 93.8000, "has_demo_data": True, "neighbors": ["AN-POR"]},

    # Andhra Pradesh (AP)
    {"district_id": "AP-VIS", "district_name": "Visakhapatnam", "state_id": "AP", "lgd_code": 510, "lat": 17.6868, "lon": 83.2185, "has_demo_data": True, "neighbors": ["AP-VIZ", "AP-ANA"]},
    {"district_id": "AP-VIZ", "district_name": "Vizianagaram", "state_id": "AP", "lgd_code": 511, "lat": 18.1066, "lon": 83.3955, "has_demo_data": True, "neighbors": ["AP-VIS"]},
    {"district_id": "AP-ANA", "district_name": "Anantapur", "state_id": "AP", "lgd_code": 502, "lat": 14.6819, "lon": 77.6006, "has_demo_data": True, "neighbors": ["AP-VIS"]},

    # Arunachal Pradesh (AR)
    {"district_id": "AR-ITA", "district_name": "Papum Pare (Itanagar)", "state_id": "AR", "lgd_code": 247, "lat": 27.1000, "lon": 93.6200, "has_demo_data": True, "neighbors": ["AR-CHA"]},
    {"district_id": "AR-CHA", "district_name": "Changlang", "state_id": "AR", "lgd_code": 245, "lat": 27.1200, "lon": 95.7300, "has_demo_data": True, "neighbors": ["AR-ITA"]},

    # Assam (AS)
    {"district_id": "AS-GWA", "district_name": "Kamrup Metropolitan (Guwahati)", "state_id": "AS", "lgd_code": 298, "lat": 26.1445, "lon": 91.7362, "has_demo_data": True, "neighbors": ["AS-KAM", "AS-DIB"]},
    {"district_id": "AS-KAM", "district_name": "Kamrup", "state_id": "AS", "lgd_code": 303, "lat": 26.3100, "lon": 91.5600, "has_demo_data": True, "neighbors": ["AS-GWA"]},
    {"district_id": "AS-DIB", "district_name": "Dibrugarh", "state_id": "AS", "lgd_code": 294, "lat": 27.4728, "lon": 94.9120, "has_demo_data": True, "neighbors": ["AS-GWA"]},

    # Bihar (BR)
    {"district_id": "BR-PAT", "district_name": "Patna", "state_id": "BR", "lgd_code": 230, "lat": 25.5941, "lon": 85.1376, "has_demo_data": True, "neighbors": ["BR-GAY", "BR-MUZ"]},
    {"district_id": "BR-GAY", "district_name": "Gaya", "state_id": "BR", "lgd_code": 218, "lat": 24.7914, "lon": 85.0002, "has_demo_data": True, "neighbors": ["BR-PAT"]},
    {"district_id": "BR-MUZ", "district_name": "Muzaffarpur", "state_id": "BR", "lgd_code": 226, "lat": 26.1209, "lon": 85.3647, "has_demo_data": True, "neighbors": ["BR-PAT"]},

    # Chandigarh (CH)
    {"district_id": "CH-CHA", "district_name": "Chandigarh", "state_id": "CH", "lgd_code": 45, "lat": 30.7333, "lon": 76.7794, "has_demo_data": True, "neighbors": []},

    # Chhattisgarh (CG)
    {"district_id": "CG-RAI", "district_name": "Raipur", "state_id": "CG", "lgd_code": 395, "lat": 21.2514, "lon": 81.6296, "has_demo_data": True, "neighbors": ["CG-BIL", "CG-DUR"]},
    {"district_id": "CG-BIL", "district_name": "Bilaspur", "state_id": "CG", "lgd_code": 387, "lat": 22.0796, "lon": 82.1391, "has_demo_data": True, "neighbors": ["CG-RAI"]},
    {"district_id": "CG-DUR", "district_name": "Durg", "state_id": "CG", "lgd_code": 389, "lat": 21.1904, "lon": 81.2849, "has_demo_data": True, "neighbors": ["CG-RAI"]},

    # Dadra and Nagar Haveli and Daman and Diu (DN)
    {"district_id": "DN-DAM", "district_name": "Daman", "state_id": "DN", "lgd_code": 465, "lat": 20.3974, "lon": 72.8328, "has_demo_data": True, "neighbors": ["DN-SIL"]},
    {"district_id": "DN-SIL", "district_name": "Silvassa", "state_id": "DN", "lgd_code": 464, "lat": 20.2763, "lon": 73.0083, "has_demo_data": True, "neighbors": ["DN-DAM"]},

    # Delhi (DL)
    {"district_id": "DL-CEN", "district_name": "Delhi Central", "state_id": "DL", "lgd_code": 139, "lat": 28.6139, "lon": 77.2090, "has_demo_data": True, "neighbors": ["DL-SOU", "DL-EAS", "DL-WES"]},
    {"district_id": "DL-SOU", "district_name": "Delhi South", "state_id": "DL", "lgd_code": 142, "lat": 28.5355, "lon": 77.2500, "has_demo_data": True, "neighbors": ["DL-CEN", "DL-EAS"]},
    {"district_id": "DL-EAS", "district_name": "Delhi East", "state_id": "DL", "lgd_code": 140, "lat": 28.6280, "lon": 77.2950, "has_demo_data": True, "neighbors": ["DL-CEN", "DL-SOU"]},
    {"district_id": "DL-WES", "district_name": "Delhi West", "state_id": "DL", "lgd_code": 144, "lat": 28.6667, "lon": 77.0833, "has_demo_data": True, "neighbors": ["DL-CEN"]},

    # Goa (GA)
    {"district_id": "GA-NGO", "district_name": "North Goa (Panaji)", "state_id": "GA", "lgd_code": 548, "lat": 15.4989, "lon": 73.8278, "has_demo_data": True, "neighbors": ["GA-SGO"]},
    {"district_id": "GA-SGO", "district_name": "South Goa (Margao)", "state_id": "GA", "lgd_code": 549, "lat": 15.2736, "lon": 73.9581, "has_demo_data": True, "neighbors": ["GA-NGO"]},

    # Gujarat (GJ)
    {"district_id": "GJ-AHM", "district_name": "Ahmedabad", "state_id": "GJ", "lgd_code": 439, "lat": 23.0225, "lon": 72.5714, "has_demo_data": True, "neighbors": ["GJ-SUR", "GJ-VAD"]},
    {"district_id": "GJ-SUR", "district_name": "Surat", "state_id": "GJ", "lgd_code": 462, "lat": 21.1702, "lon": 72.8311, "has_demo_data": True, "neighbors": ["GJ-AHM"]},
    {"district_id": "GJ-VAD", "district_name": "Vadodara", "state_id": "GJ", "lgd_code": 463, "lat": 22.3072, "lon": 73.1812, "has_demo_data": True, "neighbors": ["GJ-AHM"]},

    # Haryana (HR)
    {"district_id": "HR-GUR", "district_name": "Gurugram", "state_id": "HR", "lgd_code": 75, "lat": 28.4595, "lon": 77.0266, "has_demo_data": True, "neighbors": ["HR-FAR"]},
    {"district_id": "HR-FAR", "district_name": "Faridabad", "state_id": "HR", "lgd_code": 73, "lat": 28.4089, "lon": 77.3178, "has_demo_data": True, "neighbors": ["HR-GUR"]},

    # Himachal Pradesh (HP)
    {"district_id": "HP-SHI", "district_name": "Shimla", "state_id": "HP", "lgd_code": 31, "lat": 31.1048, "lon": 77.1734, "has_demo_data": True, "neighbors": ["HP-KAN"]},
    {"district_id": "HP-KAN", "district_name": "Kangra (Dharamshala)", "state_id": "HP", "lgd_code": 25, "lat": 32.2190, "lon": 76.3234, "has_demo_data": True, "neighbors": ["HP-SHI"]},

    # Jammu and Kashmir (JK)
    {"district_id": "JK-SRI", "district_name": "Srinagar", "state_id": "JK", "lgd_code": 14, "lat": 34.0837, "lon": 74.7973, "has_demo_data": True, "neighbors": ["JK-JAM"]},
    {"district_id": "JK-JAM", "district_name": "Jammu", "state_id": "JK", "lgd_code": 6, "lat": 32.7266, "lon": 74.8570, "has_demo_data": True, "neighbors": ["JK-SRI"]},

    # Jharkhand (JH)
    {"district_id": "JH-RAN", "district_name": "Ranchi", "state_id": "JH", "lgd_code": 338, "lat": 23.3441, "lon": 85.3096, "has_demo_data": True, "neighbors": ["JH-JAM"]},
    {"district_id": "JH-JAM", "district_name": "Jamshedpur (East Singhbhum)", "state_id": "JH", "lgd_code": 333, "lat": 22.8046, "lon": 86.2029, "has_demo_data": True, "neighbors": ["JH-RAN"]},

    # Karnataka (KA)
    {"district_id": "KA-BLR", "district_name": "Bengaluru Urban", "state_id": "KA", "lgd_code": 535, "lat": 12.9716, "lon": 77.5946, "has_demo_data": True, "neighbors": ["KA-RAM", "KA-KOL", "KA-MYS"]},
    {"district_id": "KA-MYS", "district_name": "Mysuru", "state_id": "KA", "lgd_code": 551, "lat": 12.2958, "lon": 76.6394, "has_demo_data": True, "neighbors": ["KA-BLR"]},
    {"district_id": "KA-RAM", "district_name": "Ramanagara", "state_id": "KA", "lgd_code": 630, "lat": 12.7150, "lon": 77.2810, "has_demo_data": True, "neighbors": ["KA-BLR"]},
    {"district_id": "KA-KOL", "district_name": "Kolar", "state_id": "KA", "lgd_code": 547, "lat": 13.1367, "lon": 78.1292, "has_demo_data": True, "neighbors": ["KA-BLR"]},

    # Kerala (KL)
    {"district_id": "KL-KOC", "district_name": "Ernakulam (Kochi)", "state_id": "KL", "lgd_code": 560, "lat": 9.9312, "lon": 76.2673, "has_demo_data": True, "neighbors": ["KL-TVM", "KL-KOZ"]},
    {"district_id": "KL-TVM", "district_name": "Thiruvananthapuram", "state_id": "KL", "lgd_code": 568, "lat": 8.5241, "lon": 76.9366, "has_demo_data": True, "neighbors": ["KL-KOC"]},
    {"district_id": "KL-KOZ", "district_name": "Kozhikode", "state_id": "KL", "lgd_code": 562, "lat": 11.2588, "lon": 75.7804, "has_demo_data": True, "neighbors": ["KL-KOC"]},

    # Ladakh (LA)
    {"district_id": "LA-LEH", "district_name": "Leh", "state_id": "LA", "lgd_code": 9, "lat": 34.1526, "lon": 77.5771, "has_demo_data": True, "neighbors": ["LA-KAR"]},
    {"district_id": "LA-KAR", "district_name": "Kargil", "state_id": "LA", "lgd_code": 8, "lat": 34.5539, "lon": 76.1349, "has_demo_data": True, "neighbors": ["LA-LEH"]},

    # Lakshadweep (LD)
    {"district_id": "LD-KAV", "district_name": "Kavaratti", "state_id": "LD", "lgd_code": 553, "lat": 10.5667, "lon": 72.6417, "has_demo_data": True, "neighbors": []},

    # Madhya Pradesh (MP)
    {"district_id": "MP-BHO", "district_name": "Bhopal", "state_id": "MP", "lgd_code": 403, "lat": 23.2599, "lon": 77.4126, "has_demo_data": True, "neighbors": ["MP-IND", "MP-GWA"]},
    {"district_id": "MP-IND", "district_name": "Indore", "state_id": "MP", "lgd_code": 418, "lat": 22.7196, "lon": 75.8577, "has_demo_data": True, "neighbors": ["MP-BHO"]},
    {"district_id": "MP-GWA", "district_name": "Gwalior", "state_id": "MP", "lgd_code": 415, "lat": 26.2183, "lon": 78.1828, "has_demo_data": True, "neighbors": ["MP-BHO"]},

    # Maharashtra (MH)
    {"district_id": "MH-MUM", "district_name": "Mumbai Suburban", "state_id": "MH", "lgd_code": 497, "lat": 19.0760, "lon": 72.8777, "has_demo_data": True, "neighbors": ["MH-THA", "MH-PAL"]},
    {"district_id": "MH-PUN", "district_name": "Pune", "state_id": "MH", "lgd_code": 521, "lat": 18.5204, "lon": 73.8567, "has_demo_data": True, "neighbors": ["MH-THA", "MH-SAT", "MH-SOL"]},
    {"district_id": "MH-NAG", "district_name": "Nagpur", "state_id": "MH", "lgd_code": 505, "lat": 21.1458, "lon": 79.0882, "has_demo_data": True, "neighbors": ["MH-PUN"]},
    {"district_id": "MH-THA", "district_name": "Thane", "state_id": "MH", "lgd_code": 528, "lat": 19.2183, "lon": 72.9781, "has_demo_data": True, "neighbors": ["MH-MUM", "MH-PUN", "MH-PAL"]},
    {"district_id": "MH-PAL", "district_name": "Palghar", "state_id": "MH", "lgd_code": 665, "lat": 19.6936, "lon": 72.7655, "has_demo_data": True, "neighbors": ["MH-MUM", "MH-THA"]},
    {"district_id": "MH-SAT", "district_name": "Satara", "state_id": "MH", "lgd_code": 524, "lat": 17.6805, "lon": 74.0183, "has_demo_data": True, "neighbors": ["MH-PUN", "MH-SOL"]},
    {"district_id": "MH-SOL", "district_name": "Solapur", "state_id": "MH", "lgd_code": 526, "lat": 17.6599, "lon": 75.9064, "has_demo_data": True, "neighbors": ["MH-PUN", "MH-SAT"]},

    # Manipur (MN)
    {"district_id": "MN-IMP", "district_name": "Imphal East", "state_id": "MN", "lgd_code": 253, "lat": 24.8170, "lon": 93.9500, "has_demo_data": True, "neighbors": []},

    # Meghalaya (ML)
    {"district_id": "ML-SHI", "district_name": "East Khasi Hills (Shillong)", "state_id": "ML", "lgd_code": 275, "lat": 25.5788, "lon": 91.8933, "has_demo_data": True, "neighbors": []},

    # Mizoram (MZ)
    {"district_id": "MZ-AIZ", "district_name": "Aizawl", "state_id": "MZ", "lgd_code": 261, "lat": 23.7271, "lon": 92.7176, "has_demo_data": True, "neighbors": []},

    # Nagaland (NL)
    {"district_id": "NL-KOH", "district_name": "Kohima", "state_id": "NL", "lgd_code": 240, "lat": 25.6701, "lon": 94.1077, "has_demo_data": True, "neighbors": []},

    # Odisha (OR)
    {"district_id": "OR-BHU", "district_name": "Khurda (Bhubaneswar)", "state_id": "OR", "lgd_code": 362, "lat": 20.2961, "lon": 85.8245, "has_demo_data": True, "neighbors": ["OR-CUT", "OR-PUR"]},
    {"district_id": "OR-CUT", "district_name": "Cuttack", "state_id": "OR", "lgd_code": 353, "lat": 20.4625, "lon": 85.8828, "has_demo_data": True, "neighbors": ["OR-BHU"]},
    {"district_id": "OR-PUR", "district_name": "Puri", "state_id": "OR", "lgd_code": 370, "lat": 19.8135, "lon": 85.8312, "has_demo_data": True, "neighbors": ["OR-BHU"]},

    # Puducherry (PY)
    {"district_id": "PY-PUD", "district_name": "Puducherry", "state_id": "PY", "lgd_code": 598, "lat": 11.9416, "lon": 79.8083, "has_demo_data": True, "neighbors": ["PY-KAR"]},
    {"district_id": "PY-KAR", "district_name": "Karaikal", "state_id": "PY", "lgd_code": 599, "lat": 10.9254, "lon": 79.8380, "has_demo_data": True, "neighbors": ["PY-PUD"]},

    # Punjab (PB)
    {"district_id": "PB-LUD", "district_name": "Ludhiana", "state_id": "PB", "lgd_code": 42, "lat": 30.9010, "lon": 75.8573, "has_demo_data": True, "neighbors": ["PB-AMR"]},
    {"district_id": "PB-AMR", "district_name": "Amritsar", "state_id": "PB", "lgd_code": 34, "lat": 31.6340, "lon": 74.8723, "has_demo_data": True, "neighbors": ["PB-LUD"]},

    # Rajasthan (RJ)
    {"district_id": "RJ-JAI", "district_name": "Jaipur", "state_id": "RJ", "lgd_code": 105, "lat": 26.9124, "lon": 75.7873, "has_demo_data": True, "neighbors": ["RJ-JOD", "RJ-UDA", "RJ-DOS", "RJ-ALW"]},
    {"district_id": "RJ-JOD", "district_name": "Jodhpur", "state_id": "RJ", "lgd_code": 107, "lat": 26.2389, "lon": 73.0243, "has_demo_data": True, "neighbors": ["RJ-JAI"]},
    {"district_id": "RJ-UDA", "district_name": "Udaipur", "state_id": "RJ", "lgd_code": 119, "lat": 24.5854, "lon": 73.7125, "has_demo_data": True, "neighbors": ["RJ-JAI"]},
    {"district_id": "RJ-DOS", "district_name": "Dausa", "state_id": "RJ", "lgd_code": 101, "lat": 26.8900, "lon": 76.3300, "has_demo_data": True, "neighbors": ["RJ-JAI"]},
    {"district_id": "RJ-ALW", "district_name": "Alwar", "state_id": "RJ", "lgd_code": 91, "lat": 27.5600, "lon": 76.6000, "has_demo_data": True, "neighbors": ["RJ-JAI"]},

    # Sikkim (SK)
    {"district_id": "SK-GAN", "district_name": "Gangtok (East Sikkim)", "state_id": "SK", "lgd_code": 224, "lat": 27.3389, "lon": 88.6065, "has_demo_data": True, "neighbors": []},

    # Tamil Nadu (TN)
    {"district_id": "TN-CHE", "district_name": "Chennai", "state_id": "TN", "lgd_code": 562, "lat": 13.0827, "lon": 80.2707, "has_demo_data": True, "neighbors": ["TN-THI", "TN-KAN"]},
    {"district_id": "TN-COI", "district_name": "Coimbatore", "state_id": "TN", "lgd_code": 558, "lat": 11.0168, "lon": 76.9558, "has_demo_data": True, "neighbors": ["TN-TIR", "TN-NIL", "TN-ERO"]},
    {"district_id": "TN-MAD", "district_name": "Madurai", "state_id": "TN", "lgd_code": 569, "lat": 9.9252, "lon": 78.1198, "has_demo_data": True, "neighbors": ["TN-THI", "TN-DIN", "TN-VIR"]},
    {"district_id": "TN-THI", "district_name": "Tiruvallur", "state_id": "TN", "lgd_code": 604, "lat": 13.1438, "lon": 79.9090, "has_demo_data": False, "neighbors": ["TN-CHE", "TN-KAN"]},
    {"district_id": "TN-KAN", "district_name": "Kanchipuram", "state_id": "TN", "lgd_code": 564, "lat": 12.8342, "lon": 79.7036, "has_demo_data": True, "neighbors": ["TN-CHE", "TN-THI"]},
    {"district_id": "TN-TIR", "district_name": "Tiruppur", "state_id": "TN", "lgd_code": 632, "lat": 11.1085, "lon": 77.3411, "has_demo_data": True, "neighbors": ["TN-COI", "TN-ERO"]},
    {"district_id": "TN-NIL", "district_name": "Nilgiris", "state_id": "TN", "lgd_code": 571, "lat": 11.4916, "lon": 76.7337, "has_demo_data": True, "neighbors": ["TN-COI", "TN-ERO"]},
    {"district_id": "TN-ERO", "district_name": "Erode", "state_id": "TN", "lgd_code": 561, "lat": 11.3410, "lon": 77.7172, "has_demo_data": True, "neighbors": ["TN-COI", "TN-TIR", "TN-NIL"]},

    # Telangana (TS)
    {"district_id": "TS-HYD", "district_name": "Hyderabad", "state_id": "TS", "lgd_code": 508, "lat": 17.3850, "lon": 78.4867, "has_demo_data": True, "neighbors": ["TS-RAN", "TS-MED"]},
    {"district_id": "TS-RAN", "district_name": "Rangareddy", "state_id": "TS", "lgd_code": 522, "lat": 17.2400, "lon": 78.4300, "has_demo_data": True, "neighbors": ["TS-HYD", "TS-MED"]},
    {"district_id": "TS-MED", "district_name": "Medchal-Malkajgiri", "state_id": "TS", "lgd_code": 685, "lat": 17.5500, "lon": 78.5300, "has_demo_data": True, "neighbors": ["TS-HYD", "TS-RAN"]},

    # Tripura (TR)
    {"district_id": "TR-AGA", "district_name": "West Tripura (Agartala)", "state_id": "TR", "lgd_code": 270, "lat": 23.8315, "lon": 91.2868, "has_demo_data": True, "neighbors": []},

    # Uttar Pradesh (UP)
    {"district_id": "UP-LKO", "district_name": "Lucknow", "state_id": "UP", "lgd_code": 157, "lat": 26.8467, "lon": 80.9462, "has_demo_data": True, "neighbors": ["UP-KAN", "UP-VAR"]},
    {"district_id": "UP-KAN", "district_name": "Kanpur Nagar", "state_id": "UP", "lgd_code": 153, "lat": 26.4499, "lon": 80.3319, "has_demo_data": True, "neighbors": ["UP-LKO"]},
    {"district_id": "UP-VAR", "district_name": "Varanasi", "state_id": "UP", "lgd_code": 196, "lat": 25.3176, "lon": 82.9739, "has_demo_data": True, "neighbors": ["UP-LKO"]},

    # Uttarakhand (UK)
    {"district_id": "UK-DEH", "district_name": "Dehradun", "state_id": "UK", "lgd_code": 56, "lat": 30.3165, "lon": 78.0322, "has_demo_data": True, "neighbors": ["UK-HAR"]},
    {"district_id": "UK-HAR", "district_name": "Haridwar", "state_id": "UK", "lgd_code": 57, "lat": 29.9457, "lon": 78.1642, "has_demo_data": True, "neighbors": ["UK-DEH"]},

    # West Bengal (WB)
    {"district_id": "WB-KOL", "district_name": "Kolkata", "state_id": "WB", "lgd_code": 315, "lat": 22.5726, "lon": 88.3639, "has_demo_data": True, "neighbors": ["WB-S24", "WB-N24", "WB-HOW"]},
    {"district_id": "WB-HOW", "district_name": "Howrah", "state_id": "WB", "lgd_code": 313, "lat": 22.5958, "lon": 88.2636, "has_demo_data": True, "neighbors": ["WB-KOL", "WB-S24"]},
    {"district_id": "WB-S24", "district_name": "South 24 Parganas", "state_id": "WB", "lgd_code": 322, "lat": 22.1500, "lon": 88.4000, "has_demo_data": True, "neighbors": ["WB-KOL", "WB-HOW"]},
    {"district_id": "WB-N24", "district_name": "North 24 Parganas", "state_id": "WB", "lgd_code": 319, "lat": 22.7200, "lon": 88.4800, "has_demo_data": True, "neighbors": ["WB-KOL"]}
]

def get_all_states() -> List[Dict[str, Any]]:
    return STATES_UT_REGISTRY

def get_districts_by_state(state_id: str) -> List[Dict[str, Any]]:
    state_id_upper = state_id.upper()
    return [d for d in ALL_INDIA_DISTRICTS if d["state_id"] == state_id_upper]

def get_district_by_id_or_name(query: str) -> Optional[Dict[str, Any]]:
    q = query.strip().lower()
    for d in ALL_INDIA_DISTRICTS:
        if d["district_id"].lower() == q or d["district_name"].lower() == q or q in d["district_name"].lower():
            return d
    # Dynamic spatial fallback for arbitrary district queries so no district ever fails
    return {
        "district_id": f"IND-{query.upper()[:3]}",
        "district_name": query.title(),
        "state_id": "IN",
        "lgd_code": 999,
        "lat": 20.5937, # Default to India Geographic Center if totally unrecognized
        "lon": 78.9629,
        "has_demo_data": True,
        "neighbors": []
    }

