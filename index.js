const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let startGoogleResult = 0;

console.clear();
console.log(`             )   (      (     
  *   )  ( /(   )\\ )   )\\ )  
' )  /(  )\\()) (()/(  (()/(  
 ( )(_) ((_)\\   /(_))  /(_)) 
(_(_())  _((_) (_))   (_))   
|_   _| | || | | |    / __|  
  | |   | __ | | |__  \\__ \\  
  |_|   |_||_| |____| |___/  
                              
📌 Witamy w programie do generowania ruchu na stronie.`);
console.log(`📌 Wersja: 1.0.6`);
console.log(`📌 Autor: TheLoloS`);
console.log(`📌 Licencja: MIT`);
console.log(`📌 Strona: https://thls.pl/`);
console.log(`📌 Miłego korzystania!`);


let counter = 0;
let clickedCounter = [];
const pathToUrbanVpn = path.join(process.cwd(), "urban-vpn");
const config = JSON.parse(fs.readFileSync("./config.json"));
const getActualTime = () => {
	const date = new Date().toLocaleString("pl-PL", {
		timeZone: "Europe/Warsaw",
	});
	const [day, time] = date.split(", ");
	return `[${time}]`;
};

const chromePath = path.join(
	process.cwd(),
	"puppeteer",
	"chrome",
	"win64-119.0.6045.105",
	"chrome-win64",
	"chrome.exe",
);


puppeteer.use(StealthPlugin());
const { instances, targets } = config;

async function bot() {
	console.log(" ");
console.log(
	(() => {
		const date = new Date().toLocaleString("pl-PL", {
			timeZone: "Europe/Warsaw",
		});
		const [day, time] = date.split(", ");
		return `[${time}]`;
	})(),
	`⚡: Wczytywanie...`,
);
if (config) {
	console.log(getActualTime(), "⚡: Załadowano plik konfiguracyjny");
} else {
	console.log(getActualTime(), "⚡: Nie można załadować pliku konfiguracyjnego");
	process.exit(0);
}
	for (const target of targets) {
		let views = 0;
		let serverIndex = 42;

		for (let i = 0; i < instances; i++) {
			const browser = await puppeteer.launch({
				headless: false, // Change to true if needed for production
				executablePath: chromePath,
				caches: false,
				args: [
					`--disable-extensions-except=${pathToUrbanVpn}`,
					`--load-extension=${pathToUrbanVpn}`,
				],
			});

			console.log(getActualTime(), `⚡: Otwieranie przeglądarki nr: ${i}`);
			const [extPage, shuffle] = await urbanVPN(browser, i, serverIndex);
			console.log(
				getActualTime(),
				`⚡: Czyszczecznie ciasteczek i cachu przeglądarki ${i}`,
			);
			await extPage.deleteCookie();
			await extPage.setCacheEnabled(false);
			

			for (views; views < target.count; views++) {
				try {
					await visit(extPage, browser, i, target);
					await shuffle();
					console.log(getActualTime(), `⚡: Zmiana serwera [${i}]`);
				} catch (error) {
					console.error(getActualTime(), "⚡: wystąpił błąd bot > for", error);
					break; // Exit loop on error
				}
			}

			await browser.close();
		}
	}
	console.log(getActualTime(), "⚡: Zakońcono");
	bot();
}

async function visit(page, browser, instanceIndex, target) {
	try {
		await page.goto(target.url + `&num=100&start=${startGoogleResult}`, {
			timeout: 5000,
		});
		await page
			.waitForSelector("#L2AGLb")
			.then((e) => e.click())
			.catch((e) =>
				console.log(
					getActualTime(),
					`⚡: Nie wykryto przycisku zgody (to jest OK)`,
				),
			);
		// try {
		//   const agreeButton = await page.$("#L2AGLb");
		//   if (agreeButton) {
		//     await agreeButton.click();
		//   }
		// } catch (error) {
		//   console.error(getActualTime(),`⚡: Nie wykryto przycisku zgody (to jest OK)`);
		// }
		await clickLink(page);
		console.log(
			getActualTime(),
			`⚡: [${instanceIndex}] Generated ${views + 1} visits.`,
		);
	} catch (error) {
		console.error(getActualTime(), "⚡: wystąpił błąd w visit", error);
		//  ! Bug
		counter = 0;
		clickedCounter = [];
		throw error; // Propagate the error to break the loop
	}
	// finally {
	//   // Clean up resources, close the page, etc.
	//  console.log(`[${instanceIndex}] Closing page`);
	//   counter = 0;
	//   clickedCounter = [];
	//   await page.close();
	// }
	async function clickLink(page) {
		console.log(
			getActualTime(),
			`⚡: counter: ${counter}, clickedCounter: ${clickedCounter.length}`,
		);
		await page.waitForTimeout(Math.floor(Math.random() * 500) + 1000);
		try {
			const elements = await page.$$(
				"div > div > div > div > div > div > div > span > a",
			);
			// try {
			//   const agreeButton = await page.$("#L2AGLb");
			//   if (agreeButton) {
			//     await agreeButton.click();
			//   }
			// } catch (error) {
			//   console.error(getActualTime(),`⚡: Nie wykryto przycisku zgody (to jest OK)`);
			// }

			// Sprawdź czy indeks mieści się w zakresie
			if (counter >= 0 && counter < elements.length) {
				// await page.evaluate(() => {
				//   try {

				//     const elem = document.querySelector("a.T7sFge.sW9g3e.VknLRd");
				//     const elemAvabile = elem.getAttribute("style").includes(1);
				//     if (elemAvabile) {
				//       elem.click();
				//     }
				//   }catch(error){
				//     console.log("⚡: Wystąpił błąd w page.evaluate > clickLink", error);
				//   }
				// });
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
				// console.log(elements[randomInt], randomInt);
				// console.table(elements);
				// const isButton = await elements[randomInt].getProperty("class");

				// if (isButton === "GS5rRd") {
				//   throw new Error("Button");
				// }

				// jeżeli element da sie kliknąć to kliknij go w przeciwnym wypadku wywołaj ponownie funkcje
				await elements[randomInt].scrollIntoView();
				await elements[randomInt].click();

				// Poczekaj na załadowanie nowej strony
				await page.waitForNavigation({ waitUntil: "domcontentloaded" });
				await page.waitForTimeout(Math.floor(Math.random() * 1000) + 1000);
				// wybierz losowy przycisk na stronie i kliknij go

				await page.evaluate(async () => {
					const elements = document.querySelectorAll("a");
					const filterdElements = Array.from(elements).filter((link) =>
						link.getAttribute("href").includes("https://stawiarski.pl"),
					);
					const randomButtonInt = Math.floor(
						Math.random() * filterdElements.length,
					);
					console.log(filterdElements[randomButtonInt], randomButtonInt);
					filterdElements[randomButtonInt].scrollIntoView({
						behavior: "smooth",
					});
					await new Promise(function (resolve) {
						setTimeout(resolve, 1000);
					});
					filterdElements[randomButtonInt].click();
				});
				await page.waitForTimeout(Math.floor(Math.random() * 1000) + 1000);
				await page.goBack({ waitUntil: "domcontentloaded" });
				await page.waitForTimeout(Math.floor(Math.random() * 1000) + 1000);
				// usun cookies i cash z przegladarki

				await page.goBack({ waitUntil: "domcontentloaded" });
			} else {
				// if page is not google try go back
				if (!page.url().includes("google")) {
					await page.goBack({ waitUntil: "domcontentloaded" });
					return;
				}
				console.log(getActualTime(), "⚡: Nie znaleziono indexu", counter);
				throw new Error("Nie znaleziono indexu");
			}
		} catch (error) {
			// if error type is Mixed Content: go back
			if (error.includes("Mixed Content")) {
				console.log(getActualTime(), "⚡: Wystąpił błąd: strona nie istnieje");
				await page.goBack({ waitUntil: "domcontentloaded" });
				return;
			} else {
				console.log(getActualTime(), "⚡: ", counter, clickedCounter);
				console.log(getActualTime(), "⚡: Wystąpił błąd w clickLink", error);
				counter--;
			}
		} finally {
			// await page.deleteCookie();
			// await page.evaluate(() => {
			//   window.localStorage.clear();
			//   window.sessionStorage.clear();
			// });
			// const client = await page.target().createCDPSession();
			// await client.send('Network.clearBrowserCookies');
			// Tutaj możesz wykonać dodatkowe operacje na nowo załadowanej stronie
			// np. pobieranie danych, zamykanie strony itp.
			if (counter >= target.count) {
				await page.close();
				return;
				
			}
			counter++;
			// console.log(counter);
			await clickLink(page);
		}
	}
}
rl.question('📌 Naciśnij Enter, aby uruchomić program... 🎉', (answer) => {
	bot().then(() => {
		process.exit(0);
	});
});

// Urban VPN
async function urbanVPN(browser, instanceIndex, serverIndex) {
	const extension = await browser.waitForTarget((target) =>
		target.url().includes(`chrome-extension://`),
	);

	browser.on("targetcreated", async (target) => {
		if (target.type() !== "page") return;

		const ignore = "action=INSTALL";

		const pageUrl = target.url();

		if (pageUrl.includes(ignore)) {
			const newPage = await target.page();
			await new Promise((r) => setTimeout(r, 100));
			await newPage.close();
		}
	});
	// console.log(extension.url());
	const partialExtensionUrl = extension.url() || "";
	const [, , extensionId] = partialExtensionUrl.split("/");

	const [extPage] = await browser.pages();
	const extensionUrl = `chrome-extension://${extensionId}/popup/index.html`;
	const buttonSelector = "button.button--pink.consent-text-controls__action";
	const selectSelector = ".select-location__input";
	const listItemsSelector = ".locations__item";
	const loaderSelector = ".loader";

	const playButtonPlayingSelector = ".play-button.play-button--pause";

	try {
		await extPage.goto(extensionUrl, { waitUntil: "domcontentloaded" });

		// Wait for the button to be present in the DOM
		await extPage
			.waitForSelector(buttonSelector, { visible: true })
			.then((el) => el.click());

		await new Promise((r) => setTimeout(r, 100));
		// Wait for the button to be present in the DOM
		await extPage
			.waitForSelector(buttonSelector, { visible: true })
			.then((el) => el.click());
		await new Promise((r) => setTimeout(r, 100));

		async function shuffle() {
			console.log(getActualTime(), "⚡: Konfiguracja VPN oraz pobieranie nowego IP");
			await extPage
				.waitForSelector(selectSelector, { visible: true })
				.then((el) => el.click());
			const listElements = await extPage.$$(listItemsSelector);
			async function clickServer() {
				if (serverIndex >= 0 && serverIndex < listElements.length) {
					// Find "Poland" in the list
					await listElements.map(async (el, index) => {
						const text = await el.evaluate((node) => node.innerText);
						if (text.includes("Poland")) {
							await el.click();
							serverIndex = index;
						}
					});

					await extPage.waitForSelector(playButtonPlayingSelector, {
						visible: true,
					});
					await extPage.waitForSelector(loaderSelector, { hidden: true });
					extPage.on("console", (msg) => {
						if (msg.type() === "warning") {
							console.log(getActualTime(), "⚡:", msg.text());
						}
					});
					await extPage.evaluate(async () => {
						await fetch("https://api.myip.com", {
							method: "POST",
							body: "",
							redirect: "follow",
						})
							.then((response) => response.json())
							.then((result) =>

								console.warn(
									"Ip: " +
										result.ip +
										" Kraj: " +
										result.country,
								),
							)
							.catch((error) => console.warn("error", error));
					});

					console.info(
						getActualTime(),
						`⚡: Wybrano serwer ${serverIndex} dla instancji ${instanceIndex}`,
					);
				} else {
					console.warn(
						getActualTime(),
						`⚡: Nie znaleziono indexu ${instanceIndex}`,
					);
				}
			}
			await clickServer();
		}

		await shuffle();
		return [extPage, shuffle];
	} catch (error) {
		console.error(
			getActualTime(),
			`⚡: Error: w funkcji shuffle wystąpił błąd`,
		);
	}
}
