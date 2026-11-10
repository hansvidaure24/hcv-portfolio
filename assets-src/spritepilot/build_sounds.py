"""Make the site's sounds from SpritePilot's Sound Effects pack (CC0, see
sound-effects-ogg/LICENSE.txt).

    python assets-src/spritepilot/build_sounds.py public/sounds

Each sound is decoded, cut to start at its first audible sample (a gap
before the click makes a button feel slow), shortened with a fade-out,
peak-normalized (UI sounds to -2 dBFS, so the MP3 encoder's overshoot stays
under 0) and saved as mono 44.1 kHz MP3, which every browser plays (Safari
doesn't play the pack's OGG). Needs ffmpeg and numpy.
"""
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "sound-effects-ogg", "ogg")
RATE = 44100

# (output, source, longest it may run in seconds, fade-out seconds, peak dBFS)
JOBS = [
    # The UI sounds (ASSET-SPECS.md #8): one family, from the pack's interface set.
    ("button.mp3", "interface/click.ogg", 0.20, 0.03, -2),
    ("menu-navigation.mp3", "interface/toggle.ogg", 0.10, 0.02, -2),
    ("press-start.mp3", "interface/confirm.ogg", 1.00, 0.20, -2),
    # One short blip; the Contact typing line repeats it.
    ("type.mp3", "interface/tap.ogg", 0.045, 0.015, -4),
    # What each critter in the hero says when clicked: short and quieter.
    ("critters/bee.mp3", "creatures/insect-buzz.ogg", 0.60, 0.25, -7),
    ("critters/bird.mp3", "creatures/creature-squeak.ogg", 0.55, 0.20, -7),
    ("critters/beetle.mp3", "interface/tap.ogg", 0.25, 0.10, -7),
    ("critters/slime.mp3", "creatures/slime.ogg", 0.80, 0.25, -7),
    ("critters/bat.mp3", "creatures/bat-wings.ogg", 0.60, 0.20, -7),
    ("critters/ghost.mp3", "magic/spell-cast.ogg", 0.80, 0.30, -9),
    ("critters/spider.mp3", "creatures/creature-squeak.ogg", 0.35, 0.15, -9),
    # Finding a gem or a star in the hero's grass, and finding all three.
    ("finds/gem.mp3", "pickups/gem.ogg", 1.00, 0.30, -6),
    ("finds/star.mp3", "pickups/coin-glockenspiel.ogg", 1.00, 0.30, -6),
    ("finds/level-up.mp3", "pickups/power-up.ogg", 1.50, 0.40, -5),
]


def decode(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(RATE), "-f", "f32le", "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def encode(samples, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(RATE), "-ac", "1", "-i", "-",
         "-codec:a", "libmp3lame", "-b:a", "64k", path],
        input=samples.astype(np.float32).tobytes(),
        check=True,
    )


def build(out_dir):
    for name, src, longest, fade, peak_db in JOBS:
        x = decode(os.path.join(SRC, src))
        loud = np.nonzero(np.abs(x) > 10 ** (-40 / 20))[0]
        start = max(0, int(loud[0]) - RATE // 2000) if len(loud) else 0  # keep 0.5 ms before the attack
        x = x[start:start + int(longest * RATE)]
        n_fade = min(len(x), int(fade * RATE))
        if n_fade:
            x[-n_fade:] *= np.linspace(1, 0, n_fade)
        x[: RATE // 1000] *= np.linspace(0, 1, RATE // 1000)  # 1 ms fade-in, no click
        x *= 10 ** (peak_db / 20) / max(1e-9, float(np.max(np.abs(x))))
        out = os.path.join(out_dir, name)
        encode(x, out)
        print(f"{name:22s} {len(x) / RATE:5.3f}s  {os.path.getsize(out):6d} B  from {src} (lead {start / RATE * 1000:.0f} ms cut)")


if __name__ == "__main__":
    build(sys.argv[1])
