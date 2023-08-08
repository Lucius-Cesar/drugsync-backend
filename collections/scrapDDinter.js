const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const Interaction = require("../models/interactions");
require("../models/connection.js")


async function scrapDDinter(interNumber, maxRetries = 20, timeout = 10000) {
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Scraping timeout")), timeout)
      );

      const scrapePromise = (async () => {
        try {
          await page.goto(`http://ddinter.scbdd.com/ddinter/interact/${interNumber}/`);
;

      const interaction = await page.evaluate(() => {
        function extractDrugsFromSentence(drugSentence) {
          const regex = /between\s+(.*?)\s+and\s+(.*?)(?:\s|$)/i;
          const matches = drugSentence.match(regex);
          if (matches) {
            const [, term1, term2] = matches;
            return [term1, term2];
          } else {
            return [];
          }
        }
    
        const descriptionContent = document.querySelector('tbody tr:nth-child(3) td:nth-child(2)').textContent.trim().split('\n')[0].trim();
        const description = descriptionContent === "-" ? "" : descriptionContent;
    
        const managementContent =  document.querySelector("tbody tr:nth-child(4) td:nth-child(2)").textContent.trim()
        const management = managementContent === "-" ? "" : managementContent;
    
        return {
          drugsPair: extractDrugsFromSentence(document.querySelector(".title").textContent),
          DDinterPair: [
            document.querySelector('tbody tr:nth-child(2) td:nth-child(2) a:nth-child(1)').textContent,
            document.querySelector('tbody tr:nth-child(2) td:nth-child(2) a:nth-child(2)').textContent,
          ],
          severity: document.querySelector(".badge.rounded-pill").textContent,
          mechanism: document.querySelector(".badge.rounded-pill:nth-child(3)").textContent,
          description: description,
          management: management
        }
      });
    
      await browser.close();
      return interaction;
    } catch (error) {
      // Rethrow the error with an identifiable type
      throw new Error("Scraping error: " + error.message);
    } finally {
      await browser.close();
    }
  })();

  const interaction = await Promise.race([timeoutPromise, scrapePromise]);
  return interaction;
} catch (error) {
  if (error.message === "Scraping timeout") {
    console.error(`Attempt ${attempt} timed out.`);
  } else {
    console.error(`Attempt ${attempt} failed:`, error.message);
  }
  attempt++;
}
}

throw new Error(`Failed to scrape interNumber ${interNumber} after ${maxRetries} attempts.`);
}

async function scrapeAndSaveData() {
  const start = 1017338;
  const end = 1027337;
  const interactionData = [];

  for (let i = start; i <= end; i++) {
    console.log(i);
    const interaction = await scrapDDinter(i);
    interaction.inter = i
    const newInteraction = new Interaction({
      inter: interaction.inter,
      drugsPair: interaction.drugsPair,
      DDinterPair: interaction.DDinterPair,
      severity: interaction.severity,
      mechanism: interaction.mechanism,
      description: interaction.description,
      management: interaction.management,
    })
    newInteraction.save()
    interactionData.push(interaction);
  }

  const jsonData = JSON.stringify(interactionData, null, 2);

  try {
    await fs.writeFile( `interactions${start}_${end}.json`, jsonData);
    console.log('Le fichier data.json a été sauvegardé avec succès !');
  } catch (err) {
    console.error('Erreur lors de l\'écriture du fichier :', err);
  }
}

// Call the async function to start the scraping and saving process
scrapeAndSaveData();

// index were tested manually in the website
//startIndex = 947337
//endIndex = 1184170


//  const start = 997392;
// const end = 1097337;