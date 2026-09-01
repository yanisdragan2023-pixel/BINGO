"""Generate PWA icons for 'Bingo în predicare'.
Motif: a 3x3 tile grid (echoing the bingo card) on a navy-teal rounded
square, with a gold center tile and one coral 'marked' tile bearing a
check — the same visual language used inside the app itself.
"""
from PIL import Image, ImageDraw

BG = (16, 32, 42, 255)        # deep navy-teal (--bg dark)
TILE = (234, 243, 242, 255)   # off-white tile
GOLD = (227, 169, 59, 255)    # accent-primary (free space / center)
CORAL = (225, 82, 82, 255)    # accent-marked
INK = (16, 32, 42, 255)

def rounded_square(size, radius_ratio=0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(size * radius_ratio)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BG)

    pad = size * 0.14
    grid = size - 2 * pad
    gap = grid * 0.09
    cell = (grid - 2 * gap) / 3
    tile_r = max(2, int(cell * 0.22))

    for row in range(3):
        for col in range(3):
            x0 = pad + col * (cell + gap)
            y0 = pad + row * (cell + gap)
            x1 = x0 + cell
            y1 = y0 + cell
            if row == 1 and col == 1:
                fill = GOLD
            elif row == 0 and col == 2:
                fill = CORAL
            else:
                fill = TILE
            d.rounded_rectangle([x0, y0, x1, y1], radius=tile_r, fill=fill)

    # checkmark on the coral 'marked' tile (row 0, col 2)
    cx0 = pad + 2 * (cell + gap)
    cy0 = pad
    cw = cell
    lw = max(2, int(cell * 0.12))
    p1 = (cx0 + cw * 0.22, cy0 + cw * 0.52)
    p2 = (cx0 + cw * 0.42, cy0 + cw * 0.72)
    p3 = (cx0 + cw * 0.80, cy0 + cw * 0.28)
    d.line([p1, p2, p3], fill=TILE, width=lw, joint="curve")
    d.ellipse([p1[0]-lw/2, p1[1]-lw/2, p1[0]+lw/2, p1[1]+lw/2], fill=TILE)
    d.ellipse([p3[0]-lw/2, p3[1]-lw/2, p3[0]+lw/2, p3[1]+lw/2], fill=TILE)

    return img

for size in (192, 512):
    img = rounded_square(size)
    img.save(f"icons/icon-{size}.png")

# maskable version: same art but scaled into the safe zone (bg fills edge-to-edge)
def maskable(size):
    img = Image.new("RGBA", (size, size), BG)
    inner = rounded_square(int(size * 0.72), radius_ratio=0.22)
    # strip inner's own rounded bg corners issue: paste centered, inner already has BG bg+radius
    offset = (size - inner.width) // 2
    img.paste(inner, (offset, offset), inner)
    return img

maskable(512).save("icons/icon-512-maskable.png")

# favicon (multi-size ico)
fav = rounded_square(64)
fav.save("icons/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# apple touch icon (no transparency, iOS ignores alpha/rounds itself)
apple = Image.new("RGBA", (180, 180), BG)
art = rounded_square(180, radius_ratio=0.0)
apple.paste(art, (0, 0), art)
apple.convert("RGB").save("icons/apple-touch-icon.png")

print("done")
