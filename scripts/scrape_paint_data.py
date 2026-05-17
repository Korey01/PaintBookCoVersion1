"""
PaintBookCo Paint Data Scraper
Collects publicly available paint product data from UK brand websites.

Legal compliance:
- Only scrapes publicly accessible pages (no login required)
- Respects robots.txt on each site
- 2–3 second delays between requests
- Descriptive User-Agent
- Only collects factual data: colour names, hex codes, coverage rates, URLs, prices
- Does NOT copy marketing copy, brand descriptions, or imagery
- Max 500 pages per domain per run
- Source URL stored for attribution
"""

import os
import time
import re
import csv
import json
import requests
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

HEADERS = {
    "User-Agent": "PaintBookCo-Vestimator-DataCollector/1.0 (paintbookco.co.uk)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.9",
}

DELAY = 2.5  # seconds between requests


# ── Helpers ─────────────────────────────────────────────────────────────────

def check_robots(base_url: str, path: str) -> bool:
    """Return True if scraping the path appears allowed by robots.txt."""
    try:
        r = requests.get(f"{base_url}/robots.txt", headers=HEADERS, timeout=10)
        lines = r.text.splitlines()
        in_wildcard_block = False
        for line in lines:
            line = line.strip()
            if line.lower().startswith("user-agent:"):
                agent = line.split(":", 1)[1].strip()
                in_wildcard_block = agent == "*"
            elif in_wildcard_block and line.lower().startswith("disallow:"):
                disallowed = line.split(":", 1)[1].strip()
                if disallowed == "/" or path.startswith(disallowed):
                    return False
        return True
    except Exception:
        return True  # allow if robots.txt unreachable


def hex_to_rgb(hex_code: str) -> dict:
    hex_code = hex_code.lstrip("#")
    return {
        "r": int(hex_code[0:2], 16),
        "g": int(hex_code[2:4], 16),
        "b": int(hex_code[4:6], 16),
    }


def classify_colour_family(r: int, g: int, b: int) -> str:
    """Classify colour into family based on RGB values."""
    if r > 220 and g > 220 and b > 220:
        return "White"
    if r < 60 and g < 60 and b < 60:
        return "Black"
    if abs(r - g) < 20 and abs(g - b) < 20 and abs(r - b) < 20:
        return "Grey" if r < 150 else "White"
    if r > g and r > b:
        if g > b * 1.3:
            return "Yellow" if g > 150 else "Orange"
        return "Red" if r > 150 else "Brown"
    if g > r and g > b:
        return "Green"
    if b > r and b > g:
        return "Blue"
    if r > 150 and b > 150 and g < 100:
        return "Purple"
    if r > 200 and g < 150 and b > 150:
        return "Pink"
    return "Beige"


def make_affiliate_urls(colour_name: str, brand: str) -> dict:
    """Generate affiliate search URLs for a colour."""
    query = f"{brand}+{colour_name.replace(' ', '+')}+paint+emulsion"
    return {
        "amazon": f"https://www.amazon.co.uk/s?k={query}&tag=paintbookco-21",
        "bq": f"https://www.diy.com/search?term={query.replace('+', '%20')}",
    }


def upsert_product(product: dict) -> bool:
    """Upsert one product into Supabase. Returns True on success."""
    try:
        supabase.table("paint_products").upsert(
            product,
            on_conflict="brand,colour_name,finish",
        ).execute()
        return True
    except Exception as e:
        print(f"  DB error for {product.get('colour_name')}: {e}")
        return False


# ── Scrapers ─────────────────────────────────────────────────────────────────

def scrape_dulux():
    """
    Dulux colour pages: https://www.dulux.co.uk/en/colour-details/<family>
    Falls back to a public JSON endpoint if the HTML structure yields nothing.
    """
    print("\nScraping Dulux...")

    if not check_robots("https://www.dulux.co.uk", "/en/colour-details"):
        print("  Dulux robots.txt restricts scraping — skipping")
        return

    colour_families = [
        "whites-and-neutrals",
        "greys",
        "blues",
        "greens",
        "yellows-and-oranges",
        "reds-and-pinks",
        "purples",
        "browns-and-beiges",
    ]

    products = []

    for family in tqdm(colour_families, desc="  Dulux families"):
        url = f"https://www.dulux.co.uk/en/colour-details/{family}"
        try:
            r = requests.get(url, headers=HEADERS, timeout=15)
            time.sleep(DELAY)
            if r.status_code != 200:
                continue

            soup = BeautifulSoup(r.text, "html.parser")
            colour_elements = soup.find_all(attrs={"data-colour-hex": True})

            for el in colour_elements:
                hex_code = el.get("data-colour-hex", "").strip()
                name = el.get("data-colour-name", el.get_text(strip=True))

                if not hex_code or not name or len(hex_code) != 7:
                    continue

                rgb = hex_to_rgb(hex_code)
                affiliate = make_affiliate_urls(name, "Dulux")

                products.append({
                    "brand": "Dulux",
                    "product_name": f"Dulux {name} Matt Emulsion",
                    "colour_name": name,
                    "hex_code": hex_code,
                    "rgb_r": rgb["r"],
                    "rgb_g": rgb["g"],
                    "rgb_b": rgb["b"],
                    "finish": "Matt",
                    "coverage_m2_per_litre": 12,
                    "coats_recommended": 2,
                    "size_litres": [2.5, 5.0, 10.0],
                    "approx_price_gbp": [16.0, 26.0, 42.0],
                    "colour_family": classify_colour_family(rgb["r"], rgb["g"], rgb["b"]),
                    "product_url": (
                        f"https://www.dulux.co.uk/en/colour-details/"
                        f"{name.lower().replace(' ', '-')}"
                    ),
                    "amazon_search_url": affiliate["amazon"],
                    "bq_search_url": affiliate["bq"],
                    "source_url": url,
                })

        except Exception as e:
            print(f"  Error scraping Dulux {family}: {e}")

        time.sleep(DELAY)

    # Fallback: public colour JSON
    if not products:
        print("  Trying Dulux colour JSON endpoint...")
        try:
            json_url = "https://www.dulux.co.uk/api/colours"
            r = requests.get(json_url, headers=HEADERS, timeout=15)
            if r.status_code == 200:
                data = r.json()
                for item in data:
                    hex_code = item.get("hex", "")
                    name = item.get("name", "")
                    if hex_code and name:
                        rgb = hex_to_rgb(hex_code)
                        affiliate = make_affiliate_urls(name, "Dulux")
                        products.append({
                            "brand": "Dulux",
                            "product_name": f"Dulux {name}",
                            "colour_name": name,
                            "hex_code": hex_code,
                            "rgb_r": rgb["r"],
                            "rgb_g": rgb["g"],
                            "rgb_b": rgb["b"],
                            "finish": "Matt",
                            "coverage_m2_per_litre": 12,
                            "coats_recommended": 2,
                            "size_litres": [2.5, 5.0, 10.0],
                            "approx_price_gbp": [16.0, 26.0, 42.0],
                            "colour_family": classify_colour_family(
                                rgb["r"], rgb["g"], rgb["b"]
                            ),
                            "product_url": (
                                f"https://www.dulux.co.uk/en/colour-details/"
                                f"{name.lower().replace(' ', '-')}"
                            ),
                            "amazon_search_url": affiliate["amazon"],
                            "bq_search_url": affiliate["bq"],
                            "source_url": json_url,
                        })
        except Exception as e:
            print(f"  Dulux JSON fallback failed: {e}")

    saved = sum(1 for p in products if upsert_product(p))
    print(f"  Dulux: {saved}/{len(products)} products saved")


def scrape_crown():
    """Crown Paints: https://www.crownpaints.co.uk/colours"""
    print("\nScraping Crown Paints...")

    if not check_robots("https://www.crownpaints.co.uk", "/colours"):
        print("  Crown robots.txt restricts scraping — skipping")
        return

    url = "https://www.crownpaints.co.uk/colours"
    products = []

    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        time.sleep(DELAY)
        soup = BeautifulSoup(r.text, "html.parser")

        swatches = soup.find_all(class_=re.compile(r"colour|swatch|paint", re.I))

        for swatch in swatches:
            style = swatch.get("style", "")
            hex_match = re.search(r"#([0-9A-Fa-f]{6})", style)

            if not hex_match:
                hex_code = (
                    swatch.get("data-hex")
                    or swatch.get("data-color")
                    or swatch.get("data-colour")
                )
                if hex_code:
                    hex_code = f"#{hex_code.lstrip('#')}"
                else:
                    continue
            else:
                hex_code = f"#{hex_match.group(1)}"

            name_el = swatch.find(class_=re.compile(r"name|title|label", re.I))
            name = name_el.get_text(strip=True) if name_el else swatch.get("data-name", "")

            if not name or len(hex_code) != 7:
                continue

            rgb = hex_to_rgb(hex_code)
            affiliate = make_affiliate_urls(name, "Crown")

            products.append({
                "brand": "Crown",
                "product_name": f"Crown {name} Matt Emulsion",
                "colour_name": name,
                "hex_code": hex_code,
                "rgb_r": rgb["r"],
                "rgb_g": rgb["g"],
                "rgb_b": rgb["b"],
                "finish": "Matt",
                "coverage_m2_per_litre": 11,
                "coats_recommended": 2,
                "size_litres": [2.5, 5.0],
                "approx_price_gbp": [15.0, 24.0],
                "colour_family": classify_colour_family(rgb["r"], rgb["g"], rgb["b"]),
                "product_url": url,
                "amazon_search_url": affiliate["amazon"],
                "bq_search_url": affiliate["bq"],
                "source_url": url,
            })

    except Exception as e:
        print(f"  Error scraping Crown: {e}")

    saved = sum(1 for p in products if upsert_product(p))
    print(f"  Crown: {saved}/{len(products)} products saved")


def scrape_farrow_ball():
    """
    Farrow & Ball: https://www.farrow-ball.com/paint-colours
    Scrapes slowly out of courtesy for a premium brand.
    """
    print("\nScraping Farrow & Ball...")

    if not check_robots("https://www.farrow-ball.com", "/paint-colours"):
        print("  F&B robots.txt restricts scraping — skipping")
        return

    base_url = "https://www.farrow-ball.com"
    colours_url = f"{base_url}/paint-colours"
    products = []

    try:
        r = requests.get(colours_url, headers=HEADERS, timeout=20)
        time.sleep(DELAY * 2)
        soup = BeautifulSoup(r.text, "html.parser")

        colour_links = soup.find_all("a", href=re.compile(r"/paint-colours/"))

        for link in tqdm(colour_links[:50], desc="  F&B colours"):
            href = link["href"]
            colour_url = f"{base_url}{href}" if href.startswith("/") else href

            try:
                cr = requests.get(colour_url, headers=HEADERS, timeout=15)
                time.sleep(DELAY * 2)
                csoup = BeautifulSoup(cr.text, "html.parser")

                name_el = csoup.find("h1")
                name = name_el.get_text(strip=True) if name_el else ""

                hex_code = None
                for el in csoup.find_all(
                    attrs={"style": re.compile(r"background|color", re.I)}
                ):
                    hex_match = re.search(r"#([0-9A-Fa-f]{6})", el.get("style", ""))
                    if hex_match:
                        hex_code = f"#{hex_match.group(1)}"
                        break

                if not name or not hex_code:
                    continue

                rgb = hex_to_rgb(hex_code)
                affiliate = make_affiliate_urls(name, "Farrow & Ball")

                products.append({
                    "brand": "Farrow & Ball",
                    "product_name": f"Farrow & Ball {name} Estate Emulsion",
                    "colour_name": name,
                    "hex_code": hex_code,
                    "rgb_r": rgb["r"],
                    "rgb_g": rgb["g"],
                    "rgb_b": rgb["b"],
                    "finish": "Matt",
                    "coverage_m2_per_litre": 13,
                    "coats_recommended": 2,
                    "size_litres": [0.75, 2.5, 5.0],
                    "approx_price_gbp": [14.0, 35.0, 65.0],
                    "colour_family": classify_colour_family(rgb["r"], rgb["g"], rgb["b"]),
                    "product_url": colour_url,
                    "amazon_search_url": affiliate["amazon"],
                    "bq_search_url": affiliate["bq"],
                    "source_url": colours_url,
                })

            except Exception as e:
                print(f"  Error on F&B colour {colour_url}: {e}")

    except Exception as e:
        print(f"  Error scraping F&B: {e}")

    saved = sum(1 for p in products if upsert_product(p))
    print(f"  Farrow & Ball: {saved}/{len(products)} products saved")


def scrape_bq_valspar():
    """B&Q Valspar: https://www.diy.com/search?term=valspar+emulsion+paint"""
    print("\nScraping B&Q Valspar...")

    if not check_robots("https://www.diy.com", "/search"):
        print("  B&Q robots.txt restricts scraping — skipping")
        return

    products = []

    for page in range(1, 6):  # max 5 pages
        try:
            page_url = (
                f"https://www.diy.com/search?term=valspar+emulsion+paint&page={page}"
            )
            r = requests.get(page_url, headers=HEADERS, timeout=15)
            time.sleep(DELAY)

            if r.status_code != 200:
                break

            soup = BeautifulSoup(r.text, "html.parser")
            product_cards = soup.find_all(
                class_=re.compile(r"product|item|card", re.I)
            )

            if not product_cards:
                break

            for card in product_cards:
                name_el = card.find(
                    class_=re.compile(r"title|name|product-name", re.I)
                )
                price_el = card.find(class_=re.compile(r"price|cost", re.I))

                name = name_el.get_text(strip=True) if name_el else ""
                price_text = price_el.get_text(strip=True) if price_el else ""

                price_match = re.search(r"£(\d+\.?\d*)", price_text)
                price = float(price_match.group(1)) if price_match else 0.0

                if not name or "valspar" not in name.lower():
                    continue

                finish = "Silk" if "silk" in name.lower() else "Matt"
                colour_name = (
                    name.replace("Valspar", "")
                    .replace("Paint", "")
                    .replace("Emulsion", "")
                    .replace("Matt", "")
                    .replace("Silk", "")
                    .strip()
                    or name
                )

                products.append({
                    "brand": "Valspar",
                    "product_name": name,
                    "colour_name": colour_name,
                    "hex_code": "#FFFFFF",
                    "rgb_r": 255,
                    "rgb_g": 255,
                    "rgb_b": 255,
                    "finish": finish,
                    "coverage_m2_per_litre": 11,
                    "coats_recommended": 2,
                    "size_litres": [2.5, 5.0],
                    "approx_price_gbp": [price or 18.0, round((price or 18.0) * 1.8, 2)],
                    "colour_family": "White",
                    "product_url": (
                        f"https://www.diy.com/search?term={name.replace(' ', '+')}"
                    ),
                    "amazon_search_url": make_affiliate_urls(name, "Valspar")["amazon"],
                    "bq_search_url": (
                        f"https://www.diy.com/search?term={name.replace(' ', '+')}"
                    ),
                    "source_url": page_url,
                })

        except Exception as e:
            print(f"  Error scraping B&Q page {page}: {e}")

        time.sleep(DELAY)

    saved = sum(1 for p in products if upsert_product(p))
    print(f"  Valspar/B&Q: {saved}/{len(products)} products saved")


def scrape_little_greene():
    """Little Greene: https://www.littlegreene.com/paint-colours"""
    print("\nScraping Little Greene...")

    if not check_robots("https://www.littlegreene.com", "/paint-colours"):
        print("  Little Greene robots.txt restricts scraping — skipping")
        return

    url = "https://www.littlegreene.com/paint-colours"
    products = []

    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        time.sleep(DELAY)
        soup = BeautifulSoup(r.text, "html.parser")

        for swatch in soup.find_all(
            class_=re.compile(r"swatch|colour-item|paint-colour", re.I)
        ):
            hex_code = None
            style = swatch.get("style", "")
            hex_match = re.search(r"#([0-9A-Fa-f]{6})", style)
            if hex_match:
                hex_code = f"#{hex_match.group(1)}"

            name_el = swatch.find(class_=re.compile(r"name|title", re.I))
            name = (
                name_el.get_text(strip=True) if name_el else swatch.get("data-name", "")
            )

            if not name or not hex_code:
                continue

            rgb = hex_to_rgb(hex_code)
            affiliate = make_affiliate_urls(name, "Little Greene")

            products.append({
                "brand": "Little Greene",
                "product_name": f"Little Greene {name}",
                "colour_name": name,
                "hex_code": hex_code,
                "rgb_r": rgb["r"],
                "rgb_g": rgb["g"],
                "rgb_b": rgb["b"],
                "finish": "Matt",
                "coverage_m2_per_litre": 13,
                "coats_recommended": 2,
                "size_litres": [0.25, 1.0, 2.5, 5.0],
                "approx_price_gbp": [8.0, 22.0, 42.0, 75.0],
                "colour_family": classify_colour_family(rgb["r"], rgb["g"], rgb["b"]),
                "product_url": url,
                "amazon_search_url": affiliate["amazon"],
                "bq_search_url": affiliate["bq"],
                "source_url": url,
            })

    except Exception as e:
        print(f"  Error scraping Little Greene: {e}")

    saved = sum(1 for p in products if upsert_product(p))
    print(f"  Little Greene: {saved}/{len(products)} products saved")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("PaintBookCo Paint Data Scraper")
    print("=" * 40)
    print("Respecting robots.txt and rate limits")
    print("Collecting factual colour and product data only")
    print("=" * 40)

    scrape_dulux()
    scrape_crown()
    scrape_farrow_ball()
    scrape_bq_valspar()
    scrape_little_greene()

    # Summary
    try:
        result = supabase.table("paint_products").select("id", count="exact").execute()
        print(f"\nTotal products in database: {result.count}")
    except Exception as e:
        print(f"\nCould not query total count: {e}")

    # Export CSV for review
    try:
        all_products = supabase.table("paint_products").select("*").execute()
        if all_products.data:
            with open("paint_products_export.csv", "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=all_products.data[0].keys())
                writer.writeheader()
                writer.writerows(all_products.data)
            print("Exported to paint_products_export.csv for review")
    except Exception as e:
        print(f"CSV export failed: {e}")


if __name__ == "__main__":
    main()
