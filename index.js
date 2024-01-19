// ! trzeba dodać restartowanie przeglądarki po błedach i opcje losowania np 40 przycisków

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
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
                              
$ Witamy w programie do generowania ruchu na stronie.`);
console.log(`$ Wersja: 1.0.6`);
console.log(`$ Autor: TheLoloS`);
console.log(`$ Licencja: MIT`);
console.log(`$ Strona: https://thls.pl/`);
console.log(`$ Miłego korzystania!`);

let site = "stawiarski.pl";
let instances = 1;
const pathToUrbanVpn = path.join(process.cwd(), "urban-vpn");
const getActualTime = () => {
	const date = new Date().toLocaleString("pl-PL", {
		timeZone: "Europe/Warsaw",
	});
	const string = "[" + date.split(" ")[1] + "] ->";
	return string;
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

async function bot(i) {
	console.log(getActualTime(), `Uruchamianie instancji [${i}]`);
	console.log(
		(() => {
			const date = new Date().toLocaleString("pl-PL", {
				timeZone: "Europe/Warsaw",
			});
			const string = "[" + date.split(" ")[1] + "] ->";
			return string;
		})(),
		`Wczytywanie...`,
	);
	// if (config) {
	// 	console.log(getActualTime(), "Załadowano plik konfiguracyjny");
	// } else {
	// 	console.log(getActualTime(), "Nie można załadować pliku konfiguracyjnego");
	// 	process.exit(0);
	// }
	// for (let i = 0; i < instances; i++) {
	let serverIndex = 42;

	// for (let i = 0; i < instances; i++) {
	const browser = await puppeteer.launch({
		headless: false, // Change to true if needed for production
		executablePath: chromePath,
		caches: false,
		args: [
			`--disable-extensions-except=${pathToUrbanVpn}`,
			`--load-extension=${pathToUrbanVpn}`,
		],
	});

	console.log(getActualTime(), `Otwieranie przeglądarki [${i}]`);
	const [extPage] = await urbanVPN(browser, i, serverIndex);
	console.log(
		getActualTime(),
		`Czyszczecznie ciasteczek i cachu przeglądarki [${i}]`,
	);
	await extPage.deleteCookie();
	await extPage.setCacheEnabled(false);
	try {
		await visit(extPage, browser, i, site);
		await browser.close();
		console.log(getActualTime(), `Zamykanie przeglądarki [${i}]`);
		bot(i);
	} catch (error) {
		console.error(getActualTime(), "wystąpił błąd bot > for", error);
		await browser.close();
		bot(i);
	}
	console.log(getActualTime(), "Zakońcono");
}

async function visit(page, browser, instanceIndex, target) {
	let counter = 0;
	let clickedCounter = [];
	try {
		await page.goto(
			"https://www.google.com/search?q=site%3A" +
				site +
				`&num=100&start=${startGoogleResult}`,
			{
				timeout: 5000,
			},
		);
		await page
			.waitForSelector("#L2AGLb")
			.then((e) => e.click())
			.catch((e) =>
				console.log(
					getActualTime(),
					`Nie wykryto przycisku zgody (to jest OK)`,
				),
			);
		// try {
		//   const agreeButton = await page.$("#L2AGLb");
		//   if (agreeButton) {
		//     await agreeButton.click();
		//   }
		// } catch (error) {
		//   console.error(getActualTime(),`Nie wykryto przycisku zgody (to jest OK)`);
		// }

		// generuje losowa liczbe od 10 do 40 chyba że strona ma mniej elementów
		const elements = await page.$$(
			"div > div > div > div > div > div > div > span > a",
		);
		const views =
			elements.length < 60
				? Math.floor(Math.random() * elements.length) + 5
				: Math.floor(Math.random() * 60) + 5;
		console.log(
			getActualTime(),
			`[${instanceIndex}] Generuje ${views} wizyt`,
		);

		await clickLink(page, views);
		console.log(
			getActualTime(),
			`[${instanceIndex}] Generated ${views + 1} visits.`,
		);
	} catch (error) {
		console.error(getActualTime(), "wystąpił błąd w visit", error);
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
	//   await browser.close();

	// }
	async function clickLink(page, count) {
		console.log(
			getActualTime(),
			`counter: ${counter}, clickedCounter: ${clickedCounter.length}`,
		);
		await page.waitForTimeout(Math.floor(Math.random() * 500) + 1000);
		try {
			const elements = await page.$$(
				"div > div > div > div > div > div > div > span > a",
			);
			// Sprawdź czy indeks mieści się w zakresie
			if (counter >= 0 && counter < elements.length) {
				const getUniqueRandomIntFromElements = () => {
					const randomInt = Math.floor(Math.random() * elements.length);
					if (clickedCounter.includes(randomInt)) {
						return getUniqueRandomIntFromElements();
					}
					clickedCounter.push(randomInt);
					return randomInt;
				};
				const randomInt = getUniqueRandomIntFromElements();
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
				console.log(getActualTime(), "Nie znaleziono indexu", counter);
				throw new Error("Nie znaleziono indexu");
			}
		} catch (error) {
			// if error type is Mixed Content: go back
			if (error.includes("Mixed Content")) {
				console.log(getActualTime(), "Wystąpił błąd: strona nie istnieje");
				await page.goBack({ waitUntil: "domcontentloaded" });
				return;
			} else {
				console.log(getActualTime(), "", counter, clickedCounter);
				console.log(getActualTime(), "Wystąpił błąd w clickLink", error);
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
			console.log(counter, count);
			if (counter >= count) {
				return;
			}
			counter++;
			// console.log(counter);
			await clickLink(page, count);
		}
	}
}
const questionForSite = () => {
	return new Promise((resolve, reject) => {
		console.log(`○ Podaj numer strony: `);
		console.log(`○ 1. stawiarski.pl`);
		console.log(`○ 2. stawiarski.com.pl`);
		console.log(`○ 3. opiniesadowe.pl`);
		console.log(`○ 4. bieglyrzeczoznawca.pl`);
		rl.question("○: ", (answer) => {
			switch (answer) {
				case "1":
					site = "stawiarski.pl";
					break;
				case "2":
					site = "stawiarski.com.pl";
					break;
				case "3":
					site = "opiniesadowe.pl";
					break;
				case "4":
					site = "bieglyrzeczoznawca.pl";
					break;
				default:
					console.log(`○ Podano błedne dane. Wybieram 1 opcje.`);
					site = "stawiarski.pl";
			}
			resolve();
		});
	});
};

const questionForInstance = () => {
	return new Promise((resolve, reject) => {
		console.log(`○ Podaj ilość instancji: `);
		rl.question("○: ", (answer) => {
			if (answer == 0) {
				console.log(`○ Nie można wykonać 0 instancji, wybieranie 1`);
				instances = 1;
			}
			if (answer < 0) {
				console.log(`○ Nie można wykonać mniej niż 0 instancji, wybieranie 1`);
				instances = 1;
			}
			if (answer == "") {
				console.log(`○ Nie można wykonać pustych instancji, wybieranie 1`);
				instances = 1;
			}
			instances = Number(answer);
			resolve();
		});
	});
};

// uruchomienie botów
const runBotsConcurrently = async () => {
	await questionForSite();
	await questionForInstance();
	console.log(`○ Strona: ${site}`);
	console.log(`○ Ilość instancji: ${instances}`);
	// Promises array to store promises for each bot instance
	const botPromises = [];

	// Iterate over the range of instances (0 to 4) and create promises for each bot
	Array.from({ length: Number(instances) }).forEach(async (_, i) => {
		botPromises.push(bot(i));
	});

	// Wait for all promises to resolve
	await Promise.all(botPromises);
};

// inicjalizacja botów
runBotsConcurrently();

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
			console.log(
				getActualTime(),
				"Konfiguracja VPN oraz pobieranie nowego IP",
			);
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
								console.warn("Ip: " + result.ip + " Kraj: " + result.country),
							)
							.catch((error) => console.warn("error", error));
					});

					console.info(
						getActualTime(),
						`Wybrano serwer ${serverIndex} dla instancji ${instanceIndex}`,
					);
				} else {
					console.warn(
						getActualTime(),
						`Nie znaleziono indexu ${instanceIndex}`,
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
			`Error: w funkcji shuffle wystąpił błąd`,
		);
	}
}
