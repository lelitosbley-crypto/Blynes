"""
Script de teste - baixa imagens do Unsplash para os 50 primeiros produtos
e adiciona a marca d'água "Imagem ilustrativa" no centro.

⚙️ Como usar:
1. Coloque este script na mesma pasta de "products.json"
2. Crie (ou garanta que existe) a pasta "images/"
3. Cole sua Access Key Unsplash abaixo
4. Rode no terminal:  python baixar_imagens_teste.py
"""

import requests
import json
import os
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from time import sleep

# 🟢 COLE SUA CHAVE AQUI
UNSPLASH_KEY = "aYm-rVrfBBomOUq5lC3tK_2MC9NX4Bx7WfufmfcZqjQ"

# Configurações
INPUT_FILE = "products.json"
OUTPUT_FILE = "products.json"
IMG_DIR = "images"
PER_PAGE = 1           # 1 imagem por produto
DELAY = 1.2            # segundos entre requisições
TEXT = "Imagem ilustrativa"
TEST_LIMIT = 50        # número de produtos para teste

os.makedirs(IMG_DIR, exist_ok=True)

# Carrega produtos
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    produtos = json.load(f)

print(f"🔍 Teste com os primeiros {TEST_LIMIT} produtos de {len(produtos)}...\n")
produtos = produtos[:TEST_LIMIT]

for i, produto in enumerate(produtos, 1):
    nome = produto.get("name", "").strip()
    categoria = produto.get("category", "").strip()
    busca = f"{nome} {categoria}".strip()
    img_nome = f"{produto.get('id', 'item')}.jpg"
    img_path = os.path.join(IMG_DIR, img_nome)

    url = f"https://api.unsplash.com/search/photos?query={busca}&per_page={PER_PAGE}&client_id={UNSPLASH_KEY}"
    try:
        r = requests.get(url, timeout=10)
        dados = r.json()
        if not dados.get("results"):
            print(f"⚠️ {i}/{TEST_LIMIT} - Nenhum resultado para: {busca}")
            continue

        img_url = dados["results"][0]["urls"]["regular"]

        resp = requests.get(img_url, timeout=10)
        imagem = Image.open(BytesIO(resp.content)).convert("RGB")

        draw = ImageDraw.Draw(imagem)
        largura, altura = imagem.size
        font_size = int(min(largura, altura) / 15)
        try:
            fonte = ImageFont.truetype("arial.ttf", font_size)
        except:
            fonte = ImageFont.load_default()
        text_largura, text_altura = draw.textsize(TEXT, font=fonte)
        pos_x = (largura - text_largura) / 2
        pos_y = (altura - text_altura) / 2
        draw.text((pos_x, pos_y), TEXT, fill=(255, 255, 255, 180), font=fonte, stroke_width=2, stroke_fill=(0, 0, 0))

        imagem.save(img_path, quality=85)
        produto["image"] = f"images/{img_nome}"

        print(f"✅ {i}/{TEST_LIMIT} - {nome[:45]}...")
        sleep(DELAY)

    except Exception as e:
        print(f"❌ {i}/{TEST_LIMIT} - Erro com {nome}: {e}")
        continue

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(produtos, f, ensure_ascii=False, indent=2)

print("\n🎉 Teste concluído! Verifique a pasta 'images/' e o arquivo 'products.json'.")
