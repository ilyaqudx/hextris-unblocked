#!/usr/bin/env python3
"""
EMD (Exact Match Domain) Availability & DNS Quick Checker
Checks if popular TLDs are resolved or available for a given viral keyword.
Usage: python3 check_emd_whois.py "hit the road dude"
"""

import sys
import re
import socket
import urllib.request
import json

COMMON_TLDS = [".com", ".space", ".org", ".net", ".fun", ".top", ".xyz", ".ai"]

def clean_slug(keyword: str) -> str:
    # Remove special characters and spaces
    return re.sub(r"[^a-zA-Z0-9]", "", keyword).lower()

def check_dns(domain: str) -> bool:
    try:
        socket.gethostbyname(domain)
        return True # Domain resolves, likely registered & hosted
    except socket.gaierror:
        return False # Does not resolve

def check_rdap(domain: str):
    # Free public RDAP lookup
    url = f"https://rdap.org/domain/{domain}"
    req = urllib.request.Request(url, headers={"User-Agent": "curl/7.68.0", "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=4) as res:
            if res.status == 200:
                data = json.loads(res.read().decode("utf-8"))
                events = data.get("events", [])
                created_date = "Unknown"
                for ev in events:
                    if ev.get("eventAction") == "registration":
                        created_date = ev.get("eventDate", "Unknown")
                return {"registered": True, "created": created_date}
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {"registered": False, "created": None}
    except Exception:
        pass
    return None

def check_domains(keyword: str):
    slug = clean_slug(keyword)
    print(f"\n=======================================================")
    print(f"🌐 Checking EMD (Exact Match Domain) for: [{slug}]")
    print(f"=======================================================\n")
    
    print(f"{'Domain':<28} | {'DNS Status':<15} | {'RDAP Registration Date'}")
    print("-" * 70)
    
    available_tlds = []
    
    for tld in COMMON_TLDS:
        domain = f"{slug}{tld}"
        resolves = check_dns(domain)
        dns_status = "🟢 Resolving" if resolves else "⚪ No DNS (Check)"
        
        rdap_info = check_rdap(domain)
        if rdap_info:
            if rdap_info["registered"]:
                reg_status = f"Registered ({rdap_info['created'][:10] if rdap_info['created'] else 'Active'})"
            else:
                reg_status = "🎉 POTENTIALLY AVAILABLE!"
                available_tlds.append(domain)
        else:
            reg_status = "Registered" if resolves else "Available or Unresolved"
            if not resolves:
                available_tlds.append(domain)
                
        print(f"{domain:<28} | {dns_status:<15} | {reg_status}")
        
    print("\n-------------------------------------------------------")
    if available_tlds:
        print(f"🚀 Low-cost EMD Candidates: {', '.join(available_tlds[:3])}")
        print("💡 Tip: .space and .top domains can usually be registered for ~$1 to $2 on Spaceship / Namecheap.")
    else:
        print("⚠️ All common TLDs resolve. The trend has high competition or is fully staked.")
    print("-------------------------------------------------------\n")

if __name__ == "__main__":
    kw = sys.argv[1] if len(sys.argv) > 1 else "hit the road dude"
    check_domains(kw)
