export default async function urbanVPN(browser, instanceIndex, serverIndex) {
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
			console.log("shuffle");
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
          extPage.on('console', msg => {
            if(msg.type() === "warning"){  console.log('PAGE LOG:', msg.text()) } 
          });
          await extPage.evaluate(async() => {
            await fetch("https://api.myip.com", {
              method: 'POST',
              body: "",
              redirect: 'follow'
            })
            .then(response => response.text())
            .then(result => console.warn("Ip: " + result))
            .catch(error => console.error('error', error));
          });

					console.info(`[${instanceIndex}] Selected server ${serverIndex}`);
				} else {
					console.warn(`${instanceIndex} Invalid index or element not found.`);
				}
			}
			await clickServer();
		}

		await shuffle();
		return [extPage, shuffle];
	} catch (error) {
		console.error(`Error: shuffle failed.`);
	}
}
