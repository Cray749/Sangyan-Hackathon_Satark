"""Draws the Satark pause-sign icon as PNG files, using only the standard library.

Run: python scripts/make-icons.py
It writes public/icons/icon-192.png, icon-512.png and icon-maskable-512.png.
"""
import math
import os
import struct
import zlib

INK = (27, 25, 21)
RED = (196, 48, 28)
PAPER = (243, 234, 216)


def png(path, size, draw):
    rows = []
    for y in range(size):
        row = bytearray([0])  # filter byte
        for x in range(size):
            row += bytes(draw(x / size, y / size))
        rows.append(bytes(row))
    raw = b"".join(rows)

    def chunk(kind, data):
        body = kind + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    header = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    data = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)


def make(maskable):
    # a maskable icon has the artwork in the middle 80%, so a phone can crop it to any shape
    scale = 0.8 if maskable else 1.0

    def draw(u, v):
        x = (u - 0.5) / scale
        y = (v - 0.5) / scale
        r = math.hypot(x, y)
        if maskable and (abs(u - 0.5) > 0.5 or abs(v - 0.5) > 0.5):
            return (*PAPER, 255)
        if r > 0.5:
            return (*PAPER, 255) if maskable else (0, 0, 0, 0)
        if r > 0.455:
            return (*INK, 255)
        # two pause bars
        if 0.27 <= y + 0.5 <= 0.73 and (0.30 <= x + 0.5 <= 0.45 or 0.55 <= x + 0.5 <= 0.70):
            return (*PAPER, 255)
        return (*RED, 255)

    return draw


png("public/icons/icon-192.png", 192, make(False))
png("public/icons/icon-512.png", 512, make(False))
png("public/icons/icon-maskable-512.png", 512, make(True))
print("icons written")
