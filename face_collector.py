import os
import shutil
import cv2
from deepface import DeepFace
from insightface.app import FaceAnalysis

input_dir = "faces"
output_dir = "faces/new_faces"

os.makedirs(output_dir, exist_ok=True)

groups = {
    "female_22_27": (22, 27, "Woman"),
    "female_27_32": (27, 32, "Woman"),
    "male_22_27": (22, 27, "Man"),
    "male_27_32": (27, 32, "Man")
}

# InsightFace init
app = FaceAnalysis(name="buffalo_l")
app.prepare(ctx_id=0, det_size=(640, 640))

def get_group(age, gender):
    for g, (a1, a2, gen) in groups.items():
        if gen == gender and a1 <= age <= a2:
            return g
    return None

def gender_map(g):
    return "Woman" if g.lower() in ["woman", "female"] else "Man"

files = [f for f in os.listdir(input_dir) if f.endswith(".jpg")]

for i, file in enumerate(files):
    path = os.path.join(input_dir, file)

    try:
        img = cv2.imread(path)

        # AI #1 — DeepFace
        d = DeepFace.analyze(
            img_path=path,
            actions=["age", "gender"],
            enforce_detection=False
        )[0]

        age1 = int(d["age"])
        gender1 = gender_map(d["dominant_gender"])
        conf1 = d.get("gender", {})

        # AI #2 — InsightFace
        faces = app.get(img)

        if len(faces) == 0:
            print(f"[{i}] no face → delete")
            os.remove(path)
            continue

        f = faces[0]

        age2 = int(f.age)
        gender2 = "Man" if f.gender == 1 else "Woman"
        conf2 = f.det_score  # detection confidence

        # ===== CHECKS =====
        age_diff = abs(age1 - age2)
        gender_match = gender1 == gender2

        if age_diff <= 3 and gender_match and conf2 > 0.85:
            group = get_group((age1 + age2)//2, gender1)

            if group:
                target = os.path.join(output_dir, group)
                os.makedirs(target, exist_ok=True)

                shutil.move(path, os.path.join(target, file))
                print(f"[{i}] KEEP → {group} (age≈{age1}/{age2})")
            else:
                os.remove(path)
                print(f"[{i}] no group match → delete")

        else:
            os.remove(path)
            print(f"[{i}] REJECT (age diff={age_diff}, gender mismatch)")

    except Exception as e:
        print(f"[{i}] error {file}: {e}")
        try:
            os.remove(path)
        except:
            pass