Given('I am visiting the site', () => {
	cy.visit('/');
});

When('I am unauthenticated', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/sign-in');
	});
	cy.get('div').contains('sign in').should('exist');
});
Then('I see options to log in anonymously or with my Cobalt account', () => {
	cy.get('button').contains('anonymously').should('exist');
	cy.get('button').contains('with my Cobalt Account').should('exist');
});

When('I click the anonymous sign in button', () => {
	cy.get('button').contains('anonymously').click();
});
Then('I am signed in anonymously', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/');
	});
	cy.get('button').contains('connect with support').should('exist');
});

When('I open the side drawer and click sign out', () => {
	cy.get('[data-cy=hamburger-toggle]').click();
	cy.get('a').contains('sign out').click();
});

Then('I am taken back to the login page', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/sign-in');
	});
	cy.get('div').contains('sign in').should('exist');
});
