#!/usr/bin/env python3
"""
Google Suggest & Long-tail Intent Checker
Inspects Google Suggest API for viral meme search spillover and intent expansion.
Usage: python3 check_google_suggest.py "hit the road dude"
"""

import sys
import json
import urllib.request
import urllib.parse

INTENT_KEYWORDS = ["ai", "generator", "template", "filter", "video", "meme", "song", "app", "make", "create"]

def query_google_suggest(query: str):
    encoded = urllib.parse.quote(query)
    url = f"https://suggestqueries.google.com/complete/search?client=chrome&q={encoded}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
            # Format: [query, [suggestions...], [types...], ...]
            suggestions = data[1] if len(data) > 1 else []
            return suggestions
    except Exception as e:
        print(f"Error querying Google Suggest: {e}", file=sys.stderr)
        return []

def analyze_intent(keyword: str):
    print(f"\n=======================================================")
    print(f"🔍 Analyzing Google Search Intent Spillover for: [{keyword}]")
    print(f"=======================================================\n")
    
    # 1. Base query
    base_suggestions = query_google_suggest(keyword)
    print(f"1. Base Suggestion Output ({len(base_suggestions)} items):")
    for s in base_suggestions:
        print(f"   • {s}")
    
    # 2. Check intent extensions
    detected_intents = []
    for s in base_suggestions:
        lower_s = s.lower()
        for intent in INTENT_KEYWORDS:
            if intent in lower_s.split() and intent not in detected_intents:
                detected_intents.append(intent)
                
    print(f"\n2. Detected High-Value Creation Intents:")
    if detected_intents:
        for it in detected_intents:
            print(f"   ✅ '{it}' found in suggestions")
    else:
        print("   ⚠️  No tool/creation intents detected in top suggestions yet.")
        
    # 3. Check combined queries
    print(f"\n3. Probing Specific Creation Queries:")
    for probe in [f"{keyword} ai", f"{keyword} generator", f"{keyword} template"]:
        probe_res = query_google_suggest(probe)
        has_match = len(probe_res) > 0
        status = f"✅ Active ({len(probe_res)} completions)" if has_match else "⚪ No completions"
        print(f"   • '{probe}': {status}")
        if has_match:
            for p in probe_res[:3]:
                print(f"      - {p}")

    print("\n-------------------------------------------------------")
    if "ai" in detected_intents or "generator" in detected_intents:
        print("🚀 VERDICT: HIGH SEARCH SPILLOVER. User demand for web tools is active!")
    else:
        print("⏳ VERDICT: Early or purely entertainment-focused. Continue monitoring.")
    print("-------------------------------------------------------\n")

if __name__ == "__main__":
    kw = sys.argv[1] if len(sys.argv) > 1 else "hit the road dude"
    analyze_intent(kw)
