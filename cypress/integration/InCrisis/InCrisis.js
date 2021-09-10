Given('I am visiting the site before 8am', () => {
	const before8 = new Date(2020, 1, 1, 7, 58).getTime();
	cy.clock(before8);
	cy.visit('/patient-sign-in');
});
Given('I am visiting the site after 530pm', () => {
	const after530 = new Date(2020, 1, 1, 19, 32).getTime();
	cy.clock(after530);
	cy.visit('/patient-sign-in');
});
Given('I am visiting the site at noon and have not authenticated', () => {
	const noon = new Date(2020, 1, 1, 12).getTime();
	cy.clock(noon);
	cy.visit('/patient-sign-in');
});

When('I select the in crisis modal toggle in the header', () => {
	cy.get('div').contains('In Crisis?').click();
});
When('I authenticate and click again', () => {
	cy.get('button').contains('dismiss').click();
	cy.get('button').contains('anonymously').click();
	cy.get('div').contains('In Crisis?').click();
});

Then('I see the pop-up with a 911 prompt', () => {
	cy.get('h3').contains('If you are in crisis').should('exist');
	cy.get('div').contains('Unfortunately, no LCSW is currently available').should('exist');
});

Then('I see a contact modal for LCSW', () => {
	cy.get('div').contains('Call 215-555-1212').should('exist');
});
