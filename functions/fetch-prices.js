export default {
    async fetch(request, env) {
        try {
            // Fetch TGJU page
            const response = await fetch('https://www.tgju.org', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            
            // Parse HTML
            const data = parseTGJUData(html);
            
            return new Response(JSON.stringify({
                success: true,
                data: data
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                message: error.message
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};

function parseTGJUData(html) {
    // This is a simplified parser - you may need to adjust based on TGJU's actual HTML structure
    const dollarPrice = extractPrice(html, 'price_dollar_rl');
    const coinPrice = extractPrice(html, 'coin-geram18');
    const halfCoinPrice = extractPrice(html, 'sekke-nim');
    const quarterCoinPrice = extractPrice(html, 'sekke-rob');
    
    return {
        dollar: {
            price: dollarPrice.value,
            change: dollarPrice.change,
            changePercent: dollarPrice.changePercent
        },
        coin: {
            price: coinPrice.value,
            change: coinPrice.change,
            changePercent: coinPrice.changePercent
        },
        halfcoin: {
            price: halfCoinPrice.value,
            change: halfCoinPrice.change,
            changePercent: halfCoinPrice.changePercent
        },
        quartercoin: {
            price: quarterCoinPrice.value,
            change: quarterCoinPrice.change,
            changePercent: quarterCoinPrice.changePercent
        },
        lastUpdate: new Date().toISOString()
    };
}

function extractPrice(html, marketRowId) {
    const regex = new RegExp(`data-market-row="${marketRowId}".*?<td class="nf">([^<]+).*?<td class="pc">([^<]+)`);
    const match = html.match(regex);
    
    if (!match) {
        throw new Error(`Could not find data for ${marketRowId}`);
    }
    
    const price = parseFloat(match[1].replace(/,/g, ''));
    const changeParts = match[2].trim().split(' ');
    const change = parseFloat(changeParts[0].replace(/,/g, ''));
    const changePercent = parseFloat(changeParts[1]);
    
    return {
        value: price,
        change: change,
        changePercent: changePercent
    };
}
