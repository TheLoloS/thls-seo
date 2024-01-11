import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import urbanVPN from "./urban_vpn_loader.js";

let counter = 0;
let clickedCounter = [];
const pathToUrbanVpn = path.join(process.cwd(), "urban-vpn");
const config = JSON.parse(fs.readFileSync("./config.json"));

if (config) {
  puppeteer.use(StealthPlugin());
  const { instances, targets } = config;


  async function bot() {
    for (const target of targets) {
      let views = 0;
      let serverIndex = 42;

      for (let i = 0; i < instances; i++) {
        const browser = await puppeteer.launch({
          headless: false, // Change to true if needed for production
          args: [
            `--disable-extensions-except=${pathToUrbanVpn}`,
            `--load-extension=${pathToUrbanVpn}`,
          ],
        });

       console.log(`[${i}] Instance started`);

        const [extPage, shuffle] = await urbanVPN(browser, i, serverIndex);

        for (views; views < target.count; views++) {
          try {
            await visit(extPage, browser, i, target);
            await shuffle();
           console.log(`[${i}] Changing server`);
          } catch (error) {
           console.log("wystąpił błąd");
            break; // Exit loop on error
          }
        }

        await browser.close();
      }
    }
   console.log("Finished", "green");
   bot();
  }

  async function visit(page, browser, instanceIndex, target) {
    try {
      await page.goto(target.url, { timeout: 5000 });
  
      // Handle any pop-ups, e.g., Google's "I agree" button
      const agreeButton = await page.$("#L2AGLb");
      if (agreeButton) {
        await agreeButton.click();
      }
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });
      await clickLink(page);
      // Your additional logic here, e.g., clicking links, interacting with the page
  
     console.log(`[${instanceIndex}] Generated ${views + 1} visits.`);
    } catch (error) {
     console.log("wystąpił błąd");
    //  ! Bug
      counter = 0;
      clickedCounter = [];
      throw error; // Propagate the error to break the loop
    } finally {
      // Clean up resources, close the page, etc.
     console.log(`[${instanceIndex}] Closing page`);
      counter = 0;
      clickedCounter = [];
      await page.close();
    }
    async function clickLink(page) {
      const elements = await page.$$(
        "div > div > div > div > div > div > div > span > a"
      );

      // Sprawdź czy indeks mieści się w zakresie
      if (counter >= 0 && counter < elements.length) {
        await page.evaluate(() => {
          const elem = document.querySelector("a.T7sFge.sW9g3e.VknLRd");
          const elemAvabile = elem.getAttribute("style").includes(1);
          if (elemAvabile) {
            elem.click();
          }
        });

        const getUniqueRandomIntFromElements = () => {
          const randomInt = Math.floor(Math.random() * elements.length);
          if (clickedCounter.includes(randomInt)) {
            return getUniqueRandomIntFromElements();
          }
          clickedCounter.push(randomInt);
          return randomInt;
        };
        const randomInt = getUniqueRandomIntFromElements();
        // scrollIntoView - przewiń do elementu, jeśli jest poza widokiem

        // jeżeli przycisk zawiera klase GS5rRd nie wykonuj dalszego kodu
        const isButton = await elements[randomInt].getProperty("class");

        if (isButton === "GS5rRd") {
          throw new Error("Button");
        }

        await elements[randomInt].scrollIntoView();
        await elements[randomInt].click();

        // Poczekaj na załadowanie nowej strony
        await page.waitForNavigation({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(
          Math.floor(Math.random() * 1000) + 1000,
        );
        // wybierz losowy przycisk na stronie i kliknij go

        await page.evaluate(async () => {
          const elements = document.querySelectorAll("a");
          const filterdElements = Array.from(elements).filter((link) =>
            link.getAttribute("href").includes("https://stawiarski.pl"),
          );
          const randomButtonInt = Math.floor(
            Math.random() * filterdElements.length,
          );
          console.log(
            filterdElements[randomButtonInt],
            randomButtonInt,
          );
          filterdElements[randomButtonInt].scrollIntoView({
            behavior: "smooth",
          });
          await new Promise(function (resolve) {
            setTimeout(resolve, 1000);
          });
          filterdElements[randomButtonInt].click();
        });
        await page.waitForTimeout(
          Math.floor(Math.random() * 1000) + 1000,
        );
        await page.goBack({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(
          Math.floor(Math.random() * 1000) + 1000,
        );
        // usun cookies i cash z przegladarki

        await page.deleteCookie();
        await page.evaluate(() => {
          window.localStorage.clear();
          window.sessionStorage.clear();
        });

        await page.goBack({ waitUntil: "domcontentloaded" });

        // Tutaj możesz wykonać dodatkowe operacje na nowo załadowanej stronie
        // np. pobieranie danych, zamykanie strony itp.
        counter++;
        console.log(counter);
        await clickLink(page);
      }
    }
  }
  bot().then(() => {
    process.exit(0);
  });
  }

