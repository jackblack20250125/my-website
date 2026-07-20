import sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

URL = "http://localhost:8765/index.html"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    logs = []
    page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))

    # Disable cache to force fresh load
    context = browser.new_context(
        bypass_csp=True,
        extra_http_headers={"Cache-Control": "no-cache, no-store"}
    )
    page = context.new_page()
    page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))

    page.goto(URL, timeout=15000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(4000)

    cards = page.locator(".unit-card").all()
    print(f"Cards: {len(cards)}")

    if cards:
        cards[0].click()
        page.wait_for_timeout(5000)

        row_count = page.locator("#modalRowCount").text_content()
        foot = page.locator("#modalFootCount").text_content()
        table_rows = page.locator(".modal-table tbody tr").count()
        print(f"Modal row count text: {row_count}")
        print(f"Modal footer: {foot}")
        print(f"Table rows: {table_rows}")

        page.screenshot(path="d:/jackblack/00資訊組/10_python/00_antigravity/my-website/IOT/test_modal.png")
        print("Screenshot saved: test_modal.png")

        # Check the ACTUAL filterKey used by the updated code
        actual_filter = page.evaluate("""() => {
            if (!iotCache || iotCache.length === 0) return 'no cache';
            const allKeys = Object.keys(iotCache[0]);
            // Reproduce the FIXED logic
            let filterKey =
              allKeys.find(k => k === '負責處室') ||
              allKeys.find(k => k.includes('處室')) ||
              (allKeys.length > 14 ? allKeys[14] : null);
            
            const sampleVals = iotCache.slice(0, 5).map(r => (r[filterKey] || '').trim());
            return { filterKey, sampleVals, totalRows: iotCache.length };
        }""")
        print(f"\nFixed filterKey result: {json.dumps(actual_filter, ensure_ascii=False, indent=2)}")

    browser.close()
    context.close()
