import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:5000/api';
const HTML_DIR = path.join(__dirname, 'html_dumps');

// Make sure the data directory exists
if (!fs.existsSync(HTML_DIR)) {
    fs.mkdirSync(HTML_DIR);
    console.log(`📂 Created directory: ${HTML_DIR}`);
    console.log(`Please save your downloaded HTML files into the 'html_dumps' folder and run this script again.`);
    process.exit(0);
}

async function syncCategory(name) {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        const cats = await res.json();
        let cat = cats.find(c => c.name.toLowerCase() === name.toLowerCase());

        if (cat) {
            console.log(`📂 Category exists: ${name}`);
            return cat._id;
        }

        const createRes = await fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description: 'Imported from HTML', image: '' })
        });
        cat = await createRes.json();
        console.log(`📂 Created Category: ${name}`);
        return cat._id;
    } catch (err) {
        console.error(`❌ Error syncing category '${name}':`, err.message);
        throw err;
    }
}

async function syncProducts(products, categoryId) {
    try {
        const res = await fetch(`${API_BASE}/products?limit=5000`);
        const { products: existing } = await res.json();

        let added = 0, updated = 0, skipped = 0;

        for (const p of products) {
            const pExists = existing.find(ep => ep.name === p.name);
            p.category = categoryId;

            if (pExists) {
                if (p.price > pExists.price) {
                    await fetch(`${API_BASE}/products/${pExists._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(p)
                    });
                    updated++;
                } else {
                    skipped++;
                }
            } else {
                await fetch(`${API_BASE}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(p)
                });
                added++;
            }
        }
        return { added, updated, skipped };
    } catch (err) {
        console.error('❌ Error syncing products:', err.message);
    }
}

async function processHtmlFiles() {
    const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));

    if (files.length === 0) {
        console.log(`⚠️ No .html files found in ${HTML_DIR}. Download some page HTMLs and put them there!`);
        return;
    }

    console.log(`🚀 Found ${files.length} HTML file(s) to process.\n`);

    for (const file of files) {
        console.log(`\n📄 Processing: ${file}...`);
        const filePath = path.join(HTML_DIR, file);
        const html = fs.readFileSync(filePath, 'utf-8');
        const $ = cheerio.load(html);

        // 1. Find Category Title
        let catTitle = $('h1').text().trim() || file.replace('.html', '').replace(/[\-_]/g, ' ');
        console.log(`   🏷️  Target Category: ${catTitle}`);

        const categoryId = await syncCategory(catTitle);
        if (!categoryId) continue;

        // 2. Find Products
        // We'll look for product cards containing "ADD TO CART" or rupee/Euro symbols
        const productsMap = new Map();

        // Let's find all images, usually products are linked to images
        $('img').each((i, el) => {
            const imgUrl = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-original');
            // Skip tiny icons, logos
            if (!imgUrl || imgUrl.includes('logo') || imgUrl.includes('icon') || imgUrl.includes('svg')) return;

            // Walk up 3-5 parents to find the text container
            let parent = $(el).parent();
            for (let depth = 0; depth < 5; depth++) {
                if (!parent || parent[0]?.name === 'body') break;

                const textContent = parent.text();
                // Check if card has price
                if (textContent.includes('₹') || textContent.includes('€')) {
                    // Split lines to find Name + Price
                    const lines = textContent.replace(/\s+/g, ' ') // Collapse multiple spaces
                        .replace(/([a-zA-Z])(₹|\u20AC)/g, '$1 $2') // Add space between letters and currency
                        .trim().split(/\s{2,}|\n/); // basic split attempt

                    // Better splitting logic using raw children
                    const rawLines = [];
                    parent.find('*').each((idx, child) => {
                        // Leaf nodes with text
                        if ($(child).children().length === 0 && $(child).text().trim()) {
                            rawLines.push($(child).text().trim());
                        }
                    });

                    let price = 0;
                    let name = "Unknown";

                    for (let j = 0; j < rawLines.length; j++) {
                        const line = rawLines[j];
                        if (line.includes('₹') || line.includes('€') || /^\d+$/.test(line)) {
                            price = parseInt(line.replace(/[^\d]/g, '') || '0');
                            if (j > 0) name = rawLines[j - 1]; // Text directly above price is usually name
                            break;
                        }
                    }

                    if (price > 0 && name !== "Unknown" && name !== catTitle && name !== "ADD TO CART") {
                        const key = `${name}_${price}`;
                        if (!productsMap.has(key)) {
                            productsMap.set(key, {
                                name,
                                description: name,
                                price,
                                imageUrl: imgUrl,
                                images: [{ url: imgUrl, order: 0, isMain: true }],
                                stockQuantity: 10,
                                isActive: true
                            });
                        }
                        break; // Stop going up parents, we found the item
                    }
                }
                parent = parent.parent();
            }
        });

        const extracted = Array.from(productsMap.values());
        console.log(`   ✅ Found ${extracted.length} valid, unique products in HTML.`);

        if (extracted.length > 0) {
            console.log(`   ➤ Syncing to database...`);
            const stats = await syncProducts(extracted, categoryId);
            console.log(`   ✨ Results - Added: ${stats.added} | Updated: ${stats.updated} | Skipped: ${stats.skipped}`);
        } else {
            console.log(`   ⚠️ No products found. Make sure you scrolled to bottom before saving!`);
        }
    }
    console.log(`\n🎉 All files processed!`);
}

processHtmlFiles();
