/* Steal Deal - Master Multi-Category DOM Scraper v8 */
/* Extracts ALL categories dynamically handling virtualized lists via iframe scrolling */
(async () => {
    console.log("%c🚀 DOM Scraper v8 (Multi-Category) Starting...", "color: #ae2f2d; font-size: 14px; font-weight: bold;");
    const API_BASE = "http://localhost:5000/api";
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // --- CONFIGURATION ---
    // list titles EXACTLY as they appear (e.g. ["Katanas", "Keychains"])
    const INCLUDE_CATEGORIES = ["Diacast models"]; // If not empty, ONLY these will be processed
    const EXCLUDE_CATEGORIES = []; // These will always be skipped
    // ---------------------

    console.log("%c   ➤ Aggressive Category Collector started...", "color: #2daeae; font-weight: bold;");

    let allCataloguesMap = new Map();
    let previousMapSize = 0;
    let stagnantIterations = 0;

    // Aggressively scroll and collect categories from BOTH state and DOM as they appear
    while (stagnantIterations < 15) {
        // 1. Collect from State object (if reliable)
        const currentCats = window.amalgamObject?.catalogues || [];
        currentCats.forEach(cat => {
            if (cat.slug && !allCataloguesMap.has(cat.slug)) {
                allCataloguesMap.set(cat.slug, cat);
                console.log(`      + Found (State): ${cat.title} (${allCataloguesMap.size} total)`);
            }
        });

        // 2. Collect from DOM (Links containing /s/)
        document.querySelectorAll('a').forEach(a => {
            const href = a.getAttribute('href') || '';
            const match = href.match(/\/s\/([^\/?#]+)/);
            if (match) {
                const slug = match[1];
                if (!allCataloguesMap.has(slug)) {
                    // Try to get title from child spans or text
                    const title = a.innerText.trim().split('\n')[0] || slug;
                    const img = a.querySelector('img')?.src || '';
                    allCataloguesMap.set(slug, { slug, title, pictureUrl: img });
                    console.log(`      + Found (DOM): ${title} (${allCataloguesMap.size} total)`);
                }
            }
        });

        // 3. Multi-Container Scroll
        window.scrollBy(0, 1000);
        document.querySelectorAll('div, section, main').forEach(el => {
            if (el.scrollHeight > el.clientHeight + 10) el.scrollBy(0, 1000);
        });

        await delay(1200);

        if (allCataloguesMap.size === previousMapSize) {
            stagnantIterations++;
            // State shaking
            window.scrollBy(0, -600);
            await delay(400);
            window.scrollBy(0, 1200);
        } else {
            stagnantIterations = 0;
            previousMapSize = allCataloguesMap.size;
        }
    }

    const catalogues = Array.from(allCataloguesMap.values());
    if (!catalogues || catalogues.length === 0) {
        return console.error("❌ Could not find categories. Run this script on the MAIN store Home Page (https://thekeychainsstore.catalog.to/) where window.amalgamObject is fully populated.");
    }

    console.log(`✅ Found ${catalogues.length} categories to scrape. Beginning sequence...`);
    let totalProductsAdded = 0;
    let totalProductsUpdated = 0;

    for (let c = 0; c < catalogues.length; c++) {
        const cat = catalogues[c];
        const catUrl = `/s/${cat.slug}`;
        const catTitle = (cat.title || "").trim();

        // Filter Logic
        if (INCLUDE_CATEGORIES.length > 0 && !INCLUDE_CATEGORIES.some(c => c.trim().toLowerCase() === catTitle.toLowerCase())) {
            console.log(`\n⏭️ Skipping category (NOT in INCLUDE list): ${catTitle}`);
            continue;
        }
        if (EXCLUDE_CATEGORIES.some(c => c.trim().toLowerCase() === catTitle.toLowerCase())) {
            console.log(`\n⏭️ Skipping category (in EXCLUDE list): ${catTitle}`);
            continue;
        }

        const catImage = cat.pictureUrl || "";

        console.log(`\n======================================================`);
        console.log(`⏳ [${c + 1}/${catalogues.length}] Loading category: ${catTitle}...`);

        // 1. Sync Category
        let categoryId;
        try {
            const catRes = await fetch(`${API_BASE}/categories`);
            if (!catRes.ok) throw new Error(`HTTP ${catRes.status}`);
            const localCats = await catRes.json();
            const existingCat = localCats.find(c => (c.name || "").trim().toLowerCase() === catTitle.toLowerCase());
            const catPayload = { name: catTitle, description: "Imported from QuickSell", image: catImage };

            if (existingCat) {
                categoryId = existingCat._id;
                // Only update category if we need to set the image, to save API calls
                if (catImage && !existingCat.image) {
                    await fetch(`${API_BASE}/categories/${categoryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catPayload) });
                }
                console.log(`   📂 Found existing category: ${catTitle}`);
            } else {
                const nRes = await fetch(`${API_BASE}/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catPayload) });
                const nData = await nRes.json();
                if (nRes.ok) {
                    categoryId = nData._id;
                    console.log(`   📂 Created new category: ${catTitle}`);
                } else {
                    console.error(`   ❌ Failed to create category: ${catTitle}`, nData);
                }
            }
        } catch (e) {
            console.error(`   ❌ Failed to sync category ${catTitle}. Skipping.`, e);
            continue;
        }

        // 2. Load Category in Iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        iframe.style.opacity = '0.001';
        iframe.style.pointerEvents = 'none';
        iframe.style.zIndex = '-9999';
        document.body.appendChild(iframe);

        console.log(`   ➤ Waiting for iframe to render...`);

        const uniqueProducts = await new Promise(resolve => {
            iframe.onload = async () => {
                await delay(3000);

                try {
                    const win = iframe.contentWindow;
                    const doc = iframe.contentDocument || win.document;

                    const extractedProducts = new Map();
                    let previousTotal = 0;
                    let stalled = 0;

                    console.log(`   ➤ Scrolling iframe to extract products...`);

                    // Scroll and extract loop
                    while (stalled < 10) {
                        win.scrollBy(0, 800);
                        doc.querySelectorAll('div, section, main').forEach(el => {
                            if (el.scrollHeight > el.clientHeight + 10) el.scrollBy(0, 800);
                        });
                        await delay(1200);

                        // Extract products from current view
                        const currentATCButtons = [];
                        doc.querySelectorAll('*').forEach(el => {
                            if (el.innerText?.trim() === "ADD TO CART" && el.children.length === 0) {
                                currentATCButtons.push(el);
                            }
                        });

                        currentATCButtons.forEach(btn => {
                            let card = null;
                            let el = btn.parentElement;
                            for (let depth = 0; depth < 6 && el && el.tagName !== 'BODY'; depth++) {
                                const hasImg = el.querySelector('img');
                                const hasPrice = el.innerText?.includes('₹') || el.innerText?.includes('€');
                                if (hasImg && hasPrice) {
                                    card = el;
                                    break;
                                }
                                el = el.parentElement;
                            }

                            if (!card) return;

                            const imgEl = card.querySelector('img');
                            const img = imgEl?.getAttribute('data-src') || imgEl?.getAttribute('data-original') || imgEl?.src || '';
                            const textLines = card.innerText.split('\n').map(l => l.trim()).filter(l => l && l !== 'ADD TO CART');

                            let name = "Unknown";
                            let price = 0;

                            for (let i = 0; i < textLines.length; i++) {
                                const line = textLines[i];
                                if (line.includes('₹') || line.includes('€') || /^\d+$/.test(line)) {
                                    price = parseInt(line.replace(/[^\d]/g, '') || '0');
                                    if (i > 0) name = textLines[i - 1];
                                    break;
                                }
                            }

                            if (price > 0 && name !== "Unknown" && name !== catTitle) {
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

                    resolve(Array.from(extractedProducts.values()));
                } catch (err) {
                    console.error(`   ❌ Failed to extract from iframe for ${catTitle}`, err);
                    resolve([]);
                }
            };
            iframe.src = catUrl;
        });

        document.body.removeChild(iframe);
        console.log(`   ✅ Extraction done. Total unique products: ${uniqueProducts.length}`);

        if (uniqueProducts.length === 0) {
            console.log(`   ⚠️ No products found for ${catTitle}. Skipping sync.`);
            continue;
        }

        if (!categoryId) {
            console.error(`   ❌ Cannot sync products because categoryId is missing for ${catTitle}. Skipping sync.`);
            continue;
        }

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

        console.log(`   ➤ Syncing products to database...`);
        let existingList = [];
        try {
            const pRes = await fetch(`${API_BASE}/products?category=${categoryId}&limit=5000&includeInactive=true`);
            if (!pRes.ok) throw new Error(`HTTP ${pRes.status}`);
            const pData = await pRes.json();
            existingList = pData.products || [];
        } catch (e) {
            console.error(`   ❌ Failed to fetch existing products for ${catTitle}. Skipping sync.`, e);
            continue;
        }

        let added = 0, updated = 0, skipped = 0, failed = 0, deactivated = 0;
        const matchedExistingIds = new Set();

        for (const p of scrapedData) {
            const payload = { ...p, category: categoryId };
            const existing = existingList.find(ep => {
                const dbImage = ep.image || (ep.images && ep.images.length > 0 ? ep.images[0].url : null);
                return dbImage && dbImage === p.imageUrl;
            });

            let method = 'POST', url = `${API_BASE}/products`, go = true;

            if (existing) {
                matchedExistingIds.add(existing._id);
                if (p.price === existing.price && existing.isActive && !existing.outOfStock) {
                    skipped++;
                    go = false;
                } else {
                    method = 'PUT';
                    url = `${API_BASE}/products/${existing._id}`;
                    payload.isActive = true;
                    payload.outOfStock = false;
                    payload.stockQuantity = 10;
                }
            }

            if (go) {
                try {
                    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    if (res.ok) { method === 'POST' ? added++ : updated++; } else { failed++; }
                } catch (e) { failed++; }
            }
            await delay(10);
        }

        for (const ep of existingList) {
            if (!matchedExistingIds.has(ep._id) && (ep.isActive || !ep.outOfStock)) {
                try {
                    await fetch(`${API_BASE}/products/${ep._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isActive: false, outOfStock: true, stockQuantity: 0 })
                    });
                    deactivated++;
                } catch (e) { failed++; }
            }
        }

        console.log(`   📦 Sync Results for ${catTitle}: Added: ${added} | Updated: ${updated} | Skipped: ${skipped} | Deactivated: ${deactivated} | Failed: ${failed}`);
        totalProductsAdded += added;
        totalProductsUpdated += updated;
        await delay(2000);
    }

    console.log(`\n======================================================`);
    console.log(`%c🎉 GRAND TOTAL: ${totalProductsAdded} new products added, ${totalProductsUpdated} updated across ${catalogues.length} categories!`, "color: green; font-size: 16px; font-weight: bold;");
    console.log(`======================================================`);
})();