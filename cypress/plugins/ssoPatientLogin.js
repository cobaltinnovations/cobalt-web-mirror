const puppeteer = require('puppeteer');

module.exports = async function patientLogin(url, username, password) {
	const browser = await puppeteer.launch({
			headless: true,
			ignoreHTTPSErrors: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
			devtools: true
		});

		const page = await browser.newPage();
		try {
			await page.setViewport({ width: 1280, height: 800 });
			await page.setRequestInterception(true);
			page.on('request', preventApplicationRedirect())

			await page.goto(`${url}/patient-sign-in`);

			await clickPatientLogin({page});

			// Enter credentials.
			await writeUsername({ page }, username);
			await writePassword({ page }, password);

			// press login.
			await clickLogin({ page });
			// click next button in pen med form
			await clickNextButton({ page });
			await clickNextButton({ page });
			// click allow button in pen med form
			await clickRedirectButton({ page });

			await page.waitForRequest(request => request.url() === `${url}/pic/home` && request.method() === 'GET');

			const { cookies } = await page._client.send('Network.getAllCookies', {});
			return cookies;

		} finally {
			await page.close();
			await browser.close();
		}
};

async function writeUsername({ page } = {}, username) {
	await page.waitForSelector('#Login');
	await page.type('#Login', username);
}

async function writePassword({ page } = {}, password) {
	await page.waitForSelector('#Password', { visible: true });
	await page.type('#Password', password);
}

async function clickPatientLogin({ page } = {}) {
	await page.waitForSelector('#signInButton', {
		visible: true,
		timeout: 5000
	});

	const [response] = await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('#signInButton')]);
	return response;
}

async function clickLogin({ page } = {}) {
	await page.waitForSelector('#submit', {
		visible: true,
		timeout: 5000
	});

	const [response] = await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('#submit')]);
	return response;
}

async function clickNextButton({ page } = {}) {
	await page.waitForSelector('#nextButton', {
		visible: true,
		timeout: 5000
	});

	const [response] = await Promise.all([page.click('#nextButton')]);
	return response;
}

async function clickRedirectButton({ page } = {}) {
	await page.waitForSelector('#allowDataSharing', {
		visible: true,
		timeout: 5000
	});

	const [response] = await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('#allowDataSharing')]);
	return response;
}

function preventApplicationRedirect() {
	return (request) => {
		request.continue()

	};
}
