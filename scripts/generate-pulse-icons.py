#!/usr/bin/env python3
"""Regenerate app / web / Android icons from assets/brand/pulse-p3.png (Pulse blue P)."""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets/brand/pulse-p3.png'
PULSE_BLUE = (1, 74, 188, 255)


def main() -> None:
    img = Image.open(SRC).convert('RGBA')
    if img.size != (1024, 1024):
        raise SystemExit(f'Expected 1024×1024 source, got {img.size}')

    assets = ROOT / 'assets'
    for name in ('icon.png', 'splash-icon.png', 'android-icon-foreground.png'):
        img.save(assets / name, optimize=True)

    img.resize((48, 48), Image.Resampling.LANCZOS).save(assets / 'favicon.png', optimize=True)

    Image.new('RGBA', (1024, 1024), PULSE_BLUE).save(assets / 'android-icon-background.png', optimize=True)

    mono = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    src_px = img.load()
    mono_px = mono.load()
    for y in range(1024):
        for x in range(1024):
            r, g, b, a = src_px[x, y]
            if a > 32 and r > 200 and g > 200 and b > 200:
                mono_px[x, y] = (255, 255, 255, 255)
    mono.save(assets / 'android-icon-monochrome.png', optimize=True)

    public = ROOT / 'public'
    public.mkdir(exist_ok=True)
    shutil.copy(assets / 'favicon.png', public / 'favicon.png')
    for size in (16, 32, 192, 512):
        img.resize((size, size), Image.Resampling.LANCZOS).save(public / f'icon-{size}.png', optimize=True)
    img.resize((180, 180), Image.Resampling.LANCZOS).save(public / 'apple-touch-icon.png', optimize=True)

    print('Pulse icons written to assets/ and public/')


if __name__ == '__main__':
    main()
