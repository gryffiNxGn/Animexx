// Tests for main functions on Animexx Website
const main = require('../Frontend/js/main');
const puppeteer = require('puppeteer');
const bootstrap = require('bootstrap');
const popperjs = require('@popperjs/core');
const regenerator = require('regenerator-runtime');
const request = require('supertest');
const app = require('../server.js');

let user = {
    email: 'gryffin@gmx.net',
    password: '123456',
};

test('should correctly hash passwords in textfields', () => {
	const password = "123456";
	const hash = main.stringToHash(password);
	expect(hash).toBe(1450575459);
});

test('Unit test: Get TournamentPlaner Brackets', async () => {
    const response = await request(app.app).post('/api/tournament/tournamentPlaner').send({
        id: 1,
    }).expect(200);
    console.log("***************************" + response.body.daten);
    expect(response.body.daten).toStrictEqual([[ 'gryffin', 'Soul' ],[ 'Hunter', null ],[ 'Darkness', 'Dark' ],[ 'Cherry', null ]]);
}, 30000);

test('should correctly generate and sign webtoken when logging in', async () => {
	const response = await request(app.app)
		.post('/api/user/check')
		.send({
			email: user.email,
			password: '1450575459',
		}).expect(200)
	expect(response.body.accessToken).toMatch(new RegExp("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImdyeWZmaW5AZ214Lm5ldCIsImlhdCI6MTYyNDg"));
	const jwt = response.body.accessToken;
},10000);

test('should correctly fill webtoken with user data when logging in', async () => {
	const response = await request(app.app)
		.post('/api/user/check')
		.send({
			email: user.email,
			password: '1450575459',
		}).expect(200)
	const jwt = "Bearer " + response.body.accessToken + "";

	const response2 = await request(app.app)
		.post('/api/user/tokenToUsername')
		.set({ Authorization: jwt }).expect(200)
	expect(response2.body.username).toBe(user.email);
	console.log("Username: " + user.email + "\n" + "TokenUsername: " + response2.body.username + "");
},10000);

test('should be correctly logging in existing user over UI', async () => {
	const browser = await puppeteer.launch({
		headless: true,
		slowMo: 80,
		args: ['--windows-size=1920,1080']
	});
	const page = await browser.newPage();
	await page.goto(
		'https://raw.githack.com/gryffiNxGn/Testing/main/Frontend/index.html'
	);
	await page.click('#loginBtn');
	await page.click('#loginEmail');
	await page.type('#loginEmail', user.email);
	await page.type('#loginPassword', user.password);
	await page.click('#loginButton');
	await page.waitForSelector('.loggedIn');
	await browser.close();
},10000);

afterAll(async () => {
	app.server.close();
});
