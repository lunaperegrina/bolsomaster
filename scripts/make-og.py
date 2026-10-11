#!/usr/bin/env python3
"""Gera public/og-default.png (1200x630) — preview de compartilhamento do site.

Rodar uma vez (ou quando a marca mudar): python3 scripts/make-og.py
Não faz parte do build; o PNG é commitado no repositório.
"""
from PIL import Image, ImageDraw, ImageFont

PALE = '#f6f7f4'
INK = '#202320'
MUTED = '#6c706c'
RED = '#aa372c'
WHITE = '#ffffff'

FONTS = '/System/Library/Fonts/Supplemental'


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(f'{FONTS}/{name}', size)


W, H = 1200, 630
img = Image.new('RGB', (W, H), PALE)
d = ImageDraw.Draw(img)

# Marca: quadrado vermelho com "e" itálico + barra (espelho do favicon.svg)
d.rounded_rectangle([72, 84, 192, 204], radius=22, fill=RED)
e_italic = font('Arial Bold Italic.ttf', 88)
d.text((104, 112), 'e', font=e_italic, fill=WHITE)
d.rectangle([148, 116, 157, 180], fill=WHITE)

brand = font('Arial Bold.ttf', 56)
d.text((226, 112), 'a verdade', font=brand, fill=INK)
w = d.textlength('a verdade', font=brand)
d.text((226 + w, 112), '.', font=brand, fill=RED)

# Eyebrow com espaçamento manual de letras
eyebrow = font('Arial Bold.ttf', 25)
text = 'ELEIÇÕES 2026 · ACERVO COM 106 REGISTROS E FONTES'
x = 74
for ch in text:
    d.text((x, 296), ch, font=eyebrow, fill=MUTED)
    x += d.textlength(ch, font=eyebrow) + 2.6

h1 = font('Arial Bold.ttf', 82)
d.text((70, 336), 'Acusações contra', font=h1, fill=INK)
d.text((70, 430), 'Flávio Bolsonaro.', font=h1, fill=INK)

foot = font('Arial.ttf', 24)
d.text((72, 566), 'Documento original · reportagens de referência · registro por registro', font=foot, fill=MUTED)

img.save('public/og-default.png', optimize=True)
print('ok: public/og-default.png')
