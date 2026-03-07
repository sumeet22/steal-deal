/* Deep scan - find where QuickSell stores product data */
const ao = window.amalgamObject;
console.log("=== amalgamObject ALL keys ===");
console.log(Object.keys(ao));
console.log("Total keys:", Object.keys(ao).length);

// Check if there's a different global with data
console.log("\n=== Scanning ALL window globals for product data ===");
const dominated = ['amalgamObject'];
for (const key of Object.getOwnPropertyNames(window)) {
    try {
        const val = window[key];
        if (val && typeof val === 'object' && !Array.isArray(val) && val !== window && val !== document) {
            const subKeys = Object.keys(val);
            if (subKeys.length > 5) {
                // Check if any subkey has 'catalogue', 'products', 'inventory', 'productList'
                const interesting = subKeys.filter(k =>
                    k.includes('catalogue') || k.includes('product') || k.includes('catalog') ||
                    k.includes('inventory') || k.startsWith('-O')
                );
                if (interesting.length > 0) {
                    console.log(`✅ window.${key} has ${subKeys.length} keys, interesting: `, interesting.slice(0, 10));
                }
            }
        }
    } catch (e) { }
}

// Check React/Redux stores
console.log("\n=== Checking React state ===");
const root = document.getElementById('root');
if (root) {
    const fiberKey = Object.keys(root).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternals'));
    console.log("React fiber key:", fiberKey ? "FOUND" : "NOT FOUND");
}

// Check for __NEXT_DATA__ or similar SSR stores
['__NEXT_DATA__', '__NUXT__', '__INITIAL_STATE__'].forEach(k => {
    if (window[k]) console.log(`Found window.${k}`);
});

console.log("\n=== Current page title from DOM ===");
const h1 = document.querySelector('h1');
const h2 = document.querySelector('h2');
console.log("H1:", h1?.innerText);
console.log("H2:", h2?.innerText);

// Count ADD TO CART buttons as sanity check
const atcCount = Array.from(document.querySelectorAll('*')).filter(el => el.innerText?.trim() === "ADD TO CART" && el.offsetParent !== null).length;
console.log("Visible ADD TO CART buttons:", atcCount);
