/* Steal Deal - Master Auto-Crawler v2 (Window/Popup Method) */
(async () => {
    console.log("%c🚀 Steal Deal Master Crawler v2 Initializing...", "color: #ae2f2d; font-size: 16px; font-weight: bold;");
    const API_BASE = "http://localhost:5000/api";

    // Detect if we are running in the Main Window or a popup category window
    const isCategoryWindow = window.location.pathname.startsWith('/s/') && window.location.pathname.split('/').length > 2;

    if (isCategoryWindow) {
        // --- CHILD WINDOW LOGIC (Runs when the script is injected into the opened popup) ---
        console.log("👉 Child Window detected. Preparing to extract...");

        // Wait for QuickSell React app to hydrate and render DOM
        await new Promise(r => setTimeout(r, 4000));

        const addToCartElements = Array.from(document.querySelectorAll('*')).filter(el => el.innerText?.trim() === "ADD TO CART");
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
            if (price > 0 && img) {
                pageData.push({
                    name: name, price: price, description: name, imageUrl: img,
                    images: [{ url: img, order: 0, isMain: true }], stockQuantity: 10, isActive: true
                });
            }
        });

        // Deduplicate
        const unique = [];
        const seen = new Set();
        pageData.forEach(p => { if (!seen.has(p.imageUrl)) { seen.add(p.imageUrl); unique.push(p); } });

        console.log(`✅ Extracted ${unique.length} products! Sending back to master...`);

        // Save to localStorage for the master window to read
        localStorage.setItem('steal_deal_child_data', JSON.stringify({
            ready: true,
            products: unique,
            url: window.location.href
        }));
        return; // Child window job done.
    }

    // --- MASTER WINDOW LOGIC ---
    console.log("   ➤ Auto-scrolling MAIN page to load all categories...");
    const delay = ms => new Promise(res => setTimeout(res, ms));
    let previousMainHeight = 0;
    let mainScrollAttempts = 0;

    // First scroll the main window to uncover all lazy-loaded categories
    while (mainScrollAttempts < 4) {
        // Scroll down slightly over time to trigger lazy rendering
        const scrollStep = 800; // pixels to scroll at a time
        for (let i = 0; i < 5; i++) {
            window.scrollBy(0, scrollStep);
            await delay(500); // 0.5s pause between small scrolls
        }

        let currentHeight = document.body.scrollHeight;
        if (currentHeight === previousMainHeight) {
            mainScrollAttempts++;
        } else {
            mainScrollAttempts = 0; // reset because page grew
            previousMainHeight = currentHeight;
        }
    }

    // Now all catalogues should be in the global state
    const catalogues = window.amalgamObject?.catalogues;
    if (!catalogues || catalogues.length === 0) {
        return console.error("❌ Run this script on the MAIN store Home Page (https://thekeychainsstore.catalog.to/)");
    }

    console.log(`✅ Found ${catalogues.length} categories to scrape. Beginning Popup sequence...`);

    // NOTE TO USER: The browser might block popups! You must ALLOW popups for this site.

    // Clear any stale localstorage data
    localStorage.removeItem('steal_deal_child_data');

    let totalProductsAdded = 0;
    const pRes = await fetch(`${API_BASE}/products?limit=5000`);
    const { products: existingList } = await pRes.json();

    for (let i = 0; i < catalogues.length; i++) {
        const cat = catalogues[i];
        const catUrl = `https://thekeychainsstore.catalog.to/s/${cat.slug}`;
        console.log(`\n⏳ [${i + 1}/${catalogues.length}] Processing: ${cat.title}`);

        // 1. Sync Category
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
        } catch (e) { return console.error("❌ Local Database offline! Aborting."); }

        // 2. Open Child Window
        const childWin = window.open(catUrl, '_blank', 'width=800,height=600');
        if (!childWin) {
            return console.error("🚨 POPUP BLOCKED! You MUST click 'Always allow popups' in the URL bar, close this, and try again!");
        }

        console.log(`   ➤ Window opened. Waiting 5 seconds for page load...`);
        await new Promise(r => setTimeout(r, 5000)); // give it time to load the HTML

        console.log(`   ➤ Injecting scraper into child window...`);
        // We evaluate the exact same script inside the child window
        try {
            // Cannot use eval across domains usually, but works if on same domain. Using local storage communication wrapper.
            const childScript = `
                const delay = ms => new Promise(res => setTimeout(res, ms));
                (async () => {
                    console.log("   ➤ Auto-scrolling to load all products...");
                    let scrollAttempts = 0;
                    let lastFoundCount = 0;
                    
                    while (scrollAttempts < 10) { // Try up to 10 times if we're stuck
                        const scrollableElements = Array.from(document.querySelectorAll('*')).filter(el => el.scrollHeight > el.clientHeight);
                        window.scrollBy(0, 1500);
                        scrollableElements.forEach(el => el.scrollBy(0, 1500));
                        
                        await delay(1500); 
                        
                        const currentCount = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === "ADD TO CART").length;
                        if (currentCount > lastFoundCount) {
                            console.log("   ▶ Found " + currentCount + " products so far...scrolling more.");
                            lastFoundCount = currentCount;
                            scrollAttempts = 0; 
                        } else {
                            window.scrollTo(0, document.body.scrollHeight);
                            scrollAttempts++; 
                        }
                    }

                    console.log("   ➤ Extracting data...");
                    const addToCartElements = Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.trim() === "ADD TO CART");
                    const cardSet = new Set();
                    addToCartElements.forEach(btn => {
                        let card = btn.parentElement;
                        while(card && card.tagName !== 'BODY') {
                            if (card.querySelector('img') && (card.innerText.includes('₹') || card.innerText.includes('€'))) {
                                cardSet.add(card);
                                break;
                            }
                            card = card.parentElement;
                        }
                    });

                    let pageData = [];
                    cardSet.forEach(card => {
                        const imgEl = card.querySelector('img');
                        const img = imgEl?.getAttribute('data-src') || imgEl?.getAttribute('data-original') || imgEl?.src || '';
                        
                        const lines = card.innerText.split('\\n').map(l => l.trim()).filter(l => l);
                        let name = "Unknown", price = 0;
                        for (let j = 0; j < lines.length; j++) {
                            if (lines[j].includes('₹') || lines[j].includes('€') || /^\\d+$/.test(lines[j])) {
                                price = parseInt(lines[j].replace(/[^\\d]/g, '') || '0');
                                if (j > 0) name = lines[j-1];
                                break;
                            }
                        }
                        if (price > 0 && img !== "" && name !== "${cat.title}") {
                            pageData.push({
                                name: name, price: price, description: name, imageUrl: img,
                                images: [{ url: img, order: 0, isMain: true }], stockQuantity: 10, isActive: true
                            });
                        }
                    });
                    
                    const unique = [];
                    const seen = new Set();
                    pageData.forEach(p => { 
                        const key = p.name + "_" + p.price;
                        if (!seen.has(key)) { seen.add(key); unique.push(p); } 
                    });
                    
                    localStorage.setItem('steal_deal_child_data', JSON.stringify({ ready: true, products: unique }));
                })();
            `;
            // Execute inside child context
            childWin.eval(childScript);
        } catch (e) {
            console.error("   ❌ Cross-origin restriction hit using eval. Aborting this category.");
            childWin.close();
            continue;
        }

        // Wait for child to write to localStorage (Polling)
        console.log(`   ➤ Waiting for child to auto-scroll and report back (can take up to 60s)...`);
        let scrapedData = [];
        let attempts = 0;

        while (attempts < 180) { // wait up to ~90 seconds max
            await new Promise(r => setTimeout(r, 500));
            const raw = localStorage.getItem('steal_deal_child_data');
            if (raw) {
                const data = JSON.parse(raw);
                if (data.ready) {
                    scrapedData = data.products;
                    break;
                }
            }
            attempts++;
        }

        localStorage.removeItem('steal_deal_child_data'); // clean up
        childWin.close(); // Close the popup!

        if (scrapedData.length === 0) {
            console.log(`   ⚠️ Got 0 products. QuickSell layout may vary heavily here.`);
            continue;
        }

        console.log(`   ✅ Extracted ${scrapedData.length} unique products from popup. Syncing...`);

        // 3. Intelligent Upsert Phase
        let success = 0;
        const nameCounts = {};
        for (const p of scrapedData) {
            nameCounts[p.name] = (nameCounts[p.name] || 0) + 1;
            const uniqueName = nameCounts[p.name] > 1 ? `${p.name} (${nameCounts[p.name]})` : p.name;

            const payload = { ...p, name: uniqueName, category: categoryId };
            const existing = existingList.find(ep => ep.name === uniqueName);

            let shouldUpload = true; let method = 'POST'; let url = `${API_BASE}/products`;
            if (existing) {
                if (payload.price === existing.price) { shouldUpload = false; }
                else if (payload.price > existing.price) { method = 'PUT'; url = `${API_BASE}/products/${existing._id}`; }
                else { shouldUpload = false; }
            }

            if (shouldUpload) {
                try {
                    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    if (res.ok) success++;
                } catch (e) { }
            } else {
                // Counts as handled if we gracefully skipped it
                success++;
            }
        }

        totalProductsAdded += success;
        console.log(`   📦 Category ${cat.title} complete! (${success}/${scrapedData.length} handled)`);
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\n%c🎉 GRAND TOTAL: ${totalProductsAdded} product interactions across ${catalogues.length} categories!`, "color: green; font-size: 16px; font-weight: bold;");
})();
