/* Steal Deal - Master Auto-Crawler */
(async () => {
    console.log("%c🚀 Steal Deal Master Crawler Initializing...", "color: #ae2f2d; font-size: 16px; font-weight: bold;");
    const API_BASE = "http://localhost:5000/api";

    // 1. Get all catalogues from the initial state
    const catalogues = window.amalgamObject?.catalogues;
    if (!catalogues || catalogues.length === 0) {
        return console.error("❌ Run this script on the MAIN store Home Page (https://thekeychainsstore.catalog.to/)");
    }

    console.log(`✅ Found ${catalogues.length} categories to scrape. Beginning sequence...`);
    let totalProductsAdded = 0;

    // We do this sequentially to not overwhelm your browser or Steal Deal's backend
    for (let i = 0; i < catalogues.length; i++) {
        const cat = catalogues[i];
        const catUrl = `/s/${cat.slug}`;
        console.log(`\n⏳ [${i + 1}/${catalogues.length}] Loading category: ${cat.title}...`);

        // 2. Ensure Category exists locally
        let categoryId;
        try {
            const catRes = await fetch(`${API_BASE}/categories`);
            const localCats = await catRes.json();
            const existingCat = localCats.find(c => c.name.toLowerCase() === cat.title.toLowerCase());

            const catPayload = { name: cat.title, description: "Imported from QuickSell", image: cat.pictureUrl };
            if (existingCat) {
                categoryId = existingCat._id;
                await fetch(`${API_BASE}/categories/${categoryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catPayload) });
            } else {
                const nRes = await fetch(`${API_BASE}/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catPayload) });
                categoryId = (await nRes.json())?._id;
            }
        } catch (e) {
            return console.error("❌ Local Database offline! Aborting.");
        }

        // 3. Create IFRAME to load the category page in the background
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-10000px';
        document.body.appendChild(iframe);

        // 4. Extract data once the IFrame renders
        const scrapedData = await new Promise(resolve => {
            iframe.onload = async () => {
                console.log(`   ➤ Page loaded. Waiting 3 seconds for QuickSell JS...`);
                await new Promise(r => setTimeout(r, 3000));

                try {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    const addToCartElements = Array.from(doc.querySelectorAll('*')).filter(el => el.innerText?.trim() === "ADD TO CART");

                    const cardSet = new Set();
                    addToCartElements.forEach(btn => {
                        let card = btn.parentElement;
                        while (card && card.tagName !== 'BODY') {
                            if (card.querySelector('img') && (card.innerText.includes('₹') || card.innerText.includes('€'))) {
                                cardSet.add(card);
                                break;
                            }
                            card = card.parentElement;
                        }
                    });

                    let pageData = [];
                    cardSet.forEach(card => {
                        const img = card.querySelector('img')?.src;
                        const lines = card.innerText.split('\n').map(l => l.trim()).filter(l => l);
                        let name = "Unknown", price = 0;
                        for (let j = 0; j < lines.length; j++) {
                            if (lines[j].includes('₹') || lines[j].includes('€') || /^\d+$/.test(lines[j])) {
                                price = parseInt(lines[j].replace(/[^\d]/g, '') || '0');
                                if (j > 0) name = lines[j - 1];
                                break;
                            }
                        }
                        if (price > 0 && img && name !== cat.title) {
                            pageData.push({
                                name: name, price: price, description: name, imageUrl: img,
                                images: [{ url: img, order: 0, isMain: true }], stockQuantity: 10, isActive: true
                            });
                        }
                    });

                    // Remove hidden layout duplicates
                    const unique = [];
                    const seen = new Set();
                    pageData.forEach(p => { if (!seen.has(p.imageUrl)) { seen.add(p.imageUrl); unique.push(p); } });
                    resolve(unique);
                } catch (err) {
                    console.error(`   ❌ Failed to read iframe for ${cat.title}`, err);
                    resolve([]);
                }
            };
            iframe.src = catUrl;
        });

        document.body.removeChild(iframe);
        console.log(`   ✅ Extracted ${scrapedData.length} unique products. Syncing...`);

        // 5. Intelligent Backend Upsert
        const pRes = await fetch(`${API_BASE}/products?limit=5000`);
        const { products: existingList } = await pRes.json();

        let success = 0;
        const nameCounts = {};
        for (const p of scrapedData) {
            nameCounts[p.name] = (nameCounts[p.name] || 0) + 1;
            const uniqueName = nameCounts[p.name] > 1 ? `${p.name} (${nameCounts[p.name]})` : p.name;

            const payload = { ...p, name: uniqueName, category: categoryId };
            const existing = existingList.find(ep => ep.name === uniqueName);

            let shouldUpload = true;
            let method = 'POST';
            let url = `${API_BASE}/products`;

            if (existing) {
                if (payload.price === existing.price) {
                    shouldUpload = false;
                    // Optional: console.log(`   ⏭️ Skipped (Unchanged): ${uniqueName}`);
                } else if (payload.price > existing.price) {
                    method = 'PUT';
                    url = `${API_BASE}/products/${existing._id}`;
                    console.log(`   ↗️ Updating Price: ${uniqueName} (${existing.price} -> ${payload.price})`);
                } else {
                    shouldUpload = false; // Skip if new price is lower, based on instruction
                    // Optional: console.log(`   ⏭️ Skipped (Lower price): ${uniqueName}`);
                }
            }

            if (shouldUpload) {
                try {
                    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    if (res.ok) success++;
                } catch (e) { }
            }
        }

        totalProductsAdded += success;
        console.log(`   📦 Category ${cat.title} complete! (${success}/${scrapedData.length} records saved)`);

        // Pause 2s to be nice to the network
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`\n%c🎉 GRAND TOTAL: ${totalProductsAdded} products synchronized across ${catalogues.length} categories!`, "color: green; font-size: 16px; font-weight: bold;");
})();
