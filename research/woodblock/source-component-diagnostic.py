#!/usr/bin/env python3
"""Fixed P120 color-connectivity diagnostic; not material segmentation."""
import argparse
from collections import deque
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "references/great-wave-off-kanagawa-met-DP130155.jpg"
PIN = "cbb9988f2f18b9180a1cc0cf5dbb0e3bbf8f2e85d17930cf6ca9ab36fac36303"
CROP = (850, 480, 1650, 1100)
SEED = (450, 470)
THRESHOLDS = (90, 110, 130)


def component(crop, threshold):
    width, height = crop.size
    pixels = crop.load()

    def eligible(x, y):
        red, _, blue = pixels[x, y]
        return red < threshold and blue > red * 1.15

    retained = set()
    seed_eligible = eligible(*SEED)
    queue = deque([SEED] if seed_eligible else [])
    if seed_eligible:
        retained.add(SEED)
    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x-1, y), (x+1, y), (x, y-1), (x, y+1)):
            if (0 <= nx < width and 0 <= ny < height
                    and (nx, ny) not in retained and eligible(nx, ny)):
                retained.add((nx, ny))
                queue.append((nx, ny))
    return retained, seed_eligible


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=ROOT / "research/output/agent-phase-2026-11-09/P120")
    args = parser.parse_args()
    before = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    if before != PIN:
        raise SystemExit("Canonical source SHA256 mismatch; no output written")
    with Image.open(SOURCE) as source:
        crop = source.convert("RGB").crop(CROP)
    args.output.mkdir(parents=True, exist_ok=True)
    crop.save(args.output / "source-crop.png")
    width, height = crop.size
    metrics = {
        "phase": "P120", "source": str(SOURCE.relative_to(ROOT)),
        "source_sha256": before, "crop_box_xyxy_exclusive": CROP,
        "seed_source_xy": [1300, 950], "seed_crop_xy": SEED,
        "seed_rgb": crop.getpixel(SEED), "connectivity": 4,
        "predicate": "R < threshold and B > R * 1.15",
        "boundary": "retained pixels with any unretained four-neighbor, including outside crop",
        "bbox_convention": "xyxy, right and bottom exclusive",
        "limitation": "Color components are not material segmentation or area truth.",
        "thresholds": [],
    }
    for threshold in THRESHOLDS:
        retained, seed_eligible = component(crop, threshold)
        mask = Image.new("L", crop.size, 0)
        overlay = crop.copy()
        mask_pixels, overlay_pixels = mask.load(), overlay.load()
        boundary_count = 0
        for x, y in retained:
            mask_pixels[x, y] = 255
            if any(neighbor not in retained for neighbor in
                   ((x-1, y), (x+1, y), (x, y-1), (x, y+1))):
                overlay_pixels[x, y] = (0, 255, 0)
                boundary_count += 1
        bbox = mask.getbbox()
        mask.save(args.output / f"component-{threshold}.png")
        overlay.save(args.output / f"boundary-{threshold}.png")
        metrics["thresholds"].append({
            "threshold": threshold, "seed_eligible": seed_eligible,
            "pixel_count": len(retained), "boundary_pixel_count": boundary_count,
            "bbox_crop_xyxy": bbox,
            "bbox_source_xyxy": ([bbox[0]+CROP[0], bbox[1]+CROP[1],
                                   bbox[2]+CROP[0], bbox[3]+CROP[1]] if bbox else None),
            "crop_edge_contact": {
                "left": any(x == 0 for x, y in retained),
                "right": any(x == width-1 for x, y in retained),
                "top": any(y == 0 for x, y in retained),
                "bottom": any(y == height-1 for x, y in retained),
            },
        })
    after = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    if after != before:
        raise SystemExit("Canonical source changed during diagnostic")
    metrics["source_sha256_after"] = after
    (args.output / "metrics.json").write_text(json.dumps(metrics, indent=2) + "\n")


if __name__ == "__main__":
    main()
