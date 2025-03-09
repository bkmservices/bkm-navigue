const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

// Fonction pour rechercher sur Google et récupérer les résultats
async function searchGoogle(query) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${query}`);
    
    // Récupérer les titres et les liens des résultats
    const results = await page.evaluate(() => {
        const items = [];
        const elements = document.querySelectorAll('h3');
        
        elements.forEach(element => {
            const title = element.innerText;
            const link = element.parentElement.href;
            items.push({ title, link });
        });
        
        return items;
    });

    await browser.close();
    return results;
}

// Définir la route GET pour récupérer les résultats de recherche
app.get('/search', async (req, res) => {
    const query = req.query.query;  // Récupérer la recherche via query string

    if (!query) {
        return res.status(400).json({ error: 'A search query is required.' });
    }

    try {
        const results = await searchGoogle(query);
        res.json({ results });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
