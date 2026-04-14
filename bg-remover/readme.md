# Background Remover — Quick Setup & Commands

## Installation

Install required tools:

```bash
brew install ffmpeg
pip install backgroundremover
```

Optional: update pip

```bash
pip install --upgrade pip
```

---

# Image Background Removal

### From local file

```bash
backgroundremover -i LEGO-Logo-1960-1964.png -o output.png
```

### Using pipe

```bash
cat LEGO-Logo-1960-1964.png | backgroundremover > output.png
```

---

# Video Background Removal

### Transparent video output

```bash
backgroundremover -i wan_animate_output_00047-audio.mp4 -o output.mov -tv
```

---

# Faster Model (optional)

```bash
backgroundremover -m u2netp -i wan_animate_output_00047-audio.mp4 -o output.mov -tv
```

---

# Limit Frames (for testing)

```bash
backgroundremover -i wan_animate_output_00047-audio.mp4 -o output.mov -tv -fl 200
```

---

# Example: Image From URL

```bash
curl -L "https://sb.kaleidousercontent.com/67418/960x550/d1e78c2a25/individuals-a.png" | backgroundremover > output.png
```
