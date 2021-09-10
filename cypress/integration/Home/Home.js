/** OFF HOURS FLOW: a patient is unable to take an assessment off hours */
Given('I am visiting the site during off hours', () => {
	const before8 = new Date(2020, 1, 1, 7, 58).getTime();
	cy.clock(before8);
	cy.visit('/pic/home');
});

When('I am on the home page', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/home');
	});
});
Then('I see the prompt for off hours', () => {
	cy.get('p').contains('We’re sorry for the inconvenience, but the assessment is not available').should('exist');
});

