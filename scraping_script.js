/* Steal Deal - DOM-Only Scraper v7 (FINAL) */
/* Run on a CATEGORY page. Pure DOM extraction — no amalgamObject dependency */
(async () => {
    console.log("%c🚀 DOM Scraper v7 Starting...", "color: #ae2f2d; font-size: 14px; font-weight: bold;");
    const API_BASE = "http://localhost:5000/api";
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // Get category info from page
    const h1 = document.querySelector('h1');
    // const catTitle = h1?.innerText?.trim() || "Trending Gifts";
    const catTitle = h1?.innerText?.trim();
    // Try to get category image from meta or og tags
    const ogImage = document.querySelector('meta[property="og:image"]');
    const catImage = ogImage?.content || "";
    console.log(`📂 Category: "${catTitle}"`);

    // --- STEP 1 & 2: Scroll slowly and continuously extract products (fixes virtualized lists) ---
    console.log("   ➤ Scrolling and extracting products...");

    // We will store products as we see them to prevent losing them if they get removed from the DOM
    const extractedProducts = new Map();

    let previousTotal = 0;
    let stalled = 0;

    while (stalled < 12) {
        // Scroll window + all scrollable containers
        window.scrollBy(0, 800);
        document.querySelectorAll('div, section, main').forEach(el => {
            if (el.scrollHeight > el.clientHeight + 10) el.scrollBy(0, 800);
        });
        await delay(1200);

        // Find ALL leaf-level "ADD TO CART" text elements currently in view
        const currentATCButtons = [];
        document.querySelectorAll('*').forEach(el => {
            if (el.innerText?.trim() === "ADD TO CART" && el.children.length === 0) {
                currentATCButtons.push(el);
            }
        });

        currentATCButtons.forEach(btn => {
            // Walk up MAX 6 levels to find the product card
            let card = null;
            let el = btn.parentElement;
            for (let depth = 0; depth < 6 && el && el.tagName !== 'BODY'; depth++) {
                // A product card should have: at least 1 image AND a price
                const hasImg = el.querySelector('img');
                const hasPrice = el.innerText?.includes('₹') || el.innerText?.includes('€');

                if (hasImg && hasPrice) {
                    card = el;
                    break; // Take the CLOSEST (smallest) matching ancestor
                }
                el = el.parentElement;
            }

            if (!card) return;

            // Extract image
            const imgEl = card.querySelector('img');
            const img = imgEl?.getAttribute('data-src') || imgEl?.getAttribute('data-original') || imgEl?.src || '';

            // Extract name and price from text
            const textLines = card.innerText.split('\n').map(l => l.trim()).filter(l => l && l !== 'ADD TO CART');

            let name = "Unknown";
            let price = 0;

            for (let i = 0; i < textLines.length; i++) {
                const line = textLines[i];
                if (line.includes('₹') || line.includes('€') || /^\d+$/.test(line)) {
                    price = parseInt(line.replace(/[^\d]/g, '') || '0');
                    // Name is the line BEFORE the price
                    if (i > 0) name = textLines[i - 1];
                    break;
                }
            }

            if (price > 0 && name !== "Unknown" && name !== catTitle) {
                // Deduplicate by image URL natively as we extract
                const key = img || name;
                if (!extractedProducts.has(key)) {
                    extractedProducts.set(key, { name, price, img });
                }
            }
        });

        if (extractedProducts.size > previousTotal) {
            console.log(`   ▶ Extracted ${extractedProducts.size} unique products so far...`);
            previousTotal = extractedProducts.size;
            stalled = 0;
        } else {
            stalled++;
        }
    }

    const uniqueProducts = Array.from(extractedProducts.values());
    console.log(`   ✅ Scrolling & Extraction done. Total unique products: ${uniqueProducts.length}`);

    // Handle name collisions (different products with same name)
    const nameCounts = {};
    const scrapedData = uniqueProducts.map(p => {
        nameCounts[p.name] = (nameCounts[p.name] || 0) + 1;
        const uniqueName = nameCounts[p.name] > 1 ? `${p.name} (${nameCounts[p.name]})` : p.name;
        return {
            name: uniqueName,
            price: p.price,
            description: uniqueName,
            imageUrl: p.img,
            images: [{ url: p.img, order: 0, isMain: true }],
            stockQuantity: 10,
            isActive: true
        };
    });

    console.log(`✅ Final: ${scrapedData.length} products ready to sync.`);
    if (scrapedData.length === 0) return console.error("❌ No products extracted.");

    // --- STEP 4: Sync Category ---
    let categoryId;
    let finalCatImage = catImage;
    // Fallback: If category image is missing, use the first product's image
    if (!finalCatImage && scrapedData.length > 0) {
        finalCatImage = scrapedData[0].imageUrl;
    }

    try {
        const catRes = await fetch(`${API_BASE}/categories`);
        const localCats = await catRes.json();
        const existingCat = localCats.find(c => c.name.toLowerCase() === catTitle.toLowerCase());
        const catPayload = { name: catTitle, description: "Imported from QuickSell" };
        if (finalCatImage) {
            catPayload.image = finalCatImage;
        }
        if (existingCat) {
            categoryId = existingCat._id;
            await fetch(`${API_BASE}/categories/${categoryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catPayload) });
            console.log(`📂 Updated: ${catTitle}`);
        } else {
            const nRes = await fetch(`${API_BASE}/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catPayload) });
            categoryId = (await nRes.json())?._id;
            console.log(`📂 Created: ${catTitle}`);
        }
    } catch (e) { return console.error("❌ Local DB offline!"); }

    // --- STEP 5: Intelligent Product Upsert & Sync ---
    const pRes = await fetch(`${API_BASE}/products?category=${categoryId}&limit=5000&includeInactive=true`);
    const { products: existingList } = await pRes.json();
    let added = 0, updated = 0, skipped = 0, failed = 0, deleted = 0;

    const matchedExistingIds = new Set();

    for (const p of scrapedData) {
        const payload = { ...p, category: categoryId };

        // Deduplicate existing strictly based on image and category
        // The API returns 'image' or 'images', not 'imageUrl' directly on the database model
        const existing = existingList.find(ep => {
            const dbImage = ep.image || (ep.images && ep.images.length > 0 ? ep.images[0].url : null);
            const sameImage = dbImage && dbImage === p.imageUrl;
            const sameCategory = ep.category === categoryId || ep.category?._id === categoryId;
            return sameImage && sameCategory;
        });

        let method = 'POST', url = `${API_BASE}/products`, go = true;

        if (existing) {
            matchedExistingIds.add(existing._id);
            // Re-activate if it was soft-deleted or marked out of stock
            const needsReactivation = !existing.isActive || existing.outOfStock;

            if (p.price === existing.price && !needsReactivation) {
                skipped++;
                go = false;
            } else if (p.price !== existing.price || needsReactivation) {
                method = 'PUT';
                url = `${API_BASE}/products/${existing._id}`;
                // Ensure the payload sets it to active and in-stock if we're updating
                payload.isActive = true;
                payload.outOfStock = false;
                payload.stockQuantity = 10; // Reset stock to default 10
            } else {
                skipped++;
                go = false;
            }
        }

        if (go) {
            try {
                const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (res.ok) { method === 'POST' ? added++ : updated++; } else { failed++; }
            } catch (e) { failed++; }
        }
        await delay(50);
    }

    // --- STEP 6: Deactivate Stale Products (Soft Delete) ---
    console.log("   ➤ Syncing: Deactivating stale products (preserving order history)...");
    let deactivated = 0;
    for (const ep of existingList) {
        if (!matchedExistingIds.has(ep._id)) {
            try {
                // Soft delete to protect order history: Set inactive and out of stock
                const res = await fetch(`${API_BASE}/products/${ep._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: false, outOfStock: true, stockQuantity: 0 })
                });
                if (res.ok) { deactivated++; } else { failed++; }
            } catch (e) { failed++; }
            await delay(50);
        }
    }

    console.log(`%c✨ SYNC COMPLETE!
  ✅ Added: ${added}
  ↗️  Updated: ${updated}
  ⏭️  Skipped: ${skipped}
  🗄️  Deactivated: ${deactivated}
  ❌ Failed: ${failed}`, "color: green; font-weight: bold; font-size: 13px;");
})();
