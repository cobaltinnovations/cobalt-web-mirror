/** FIRST FLOW: A patient is looking for a specific diagnosis */
Given('I have been authenticated', () => {
	cy.visit('/pic/first-step');
});
When('I am visiting Cobalt', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/first-step');
	});
});
Then('I see a welcoming screen ready to take me through my assessments', () => {
	cy.get('[data-cy=take-screening]').contains('Take the screening').should('exist');
});
When('I click the take the screening button', () => {
	cy.get('[data-cy=take-screening]').click();
});
Then("I am taken to the let's get started page", () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/lets-get-started');
	});
	cy.get('[data-cy=start-assessment]').contains("Yes, let's continue").should('exist');
});
When('I click the continue button', () => {
	cy.get('[data-cy=start-assessment]').click();
});
Then('I am taken to the personal information page', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/non-clinical-assessment');
	});
	cy.get('[data-cy=continue-assessment]').contains('This is correct, continue').should('exist');
});

When('I assert my personal information is correct', () => {
	cy.get('[data-cy=continue-assessment]').click();
});
Then('I am taken to the diagnosis and symptom prompt', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/looking-for');
	});
	cy.get('h3').contains('a specific diagnosis?').should('exist');
	cy.get('[data-cy=diagnoses-button]').contains('Yes').should('exist');
	cy.get('[data-cy=symptoms-button]').contains('No').should('exist');
});

When('I click I am looking for a diagnosis', () => {
	cy.get('[data-cy=diagnoses-button]').click();
});
Then('I am taken to the list of diagnoses page', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/diagnoses');
	});
	cy.get('[data-cy=next-button]').contains('Next').should('exist');
});

When('I confirm the diagnosis I am looking for', () => {
	cy.get('[data-cy=next-button]').click();
});

/** Resuable Assertions */
Then("I am taken to the let's keep going page", () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/intermediate/letsKeepGoing');
	});
});
When('I keep going', () => {
	cy.get('[data-cy=intermediate-next-button]').contains("Let's keep going").click();
});
Then('I am taken to the CSSRS assessment intro', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/intermediate/precssrs');
	});
});
/** End Reusable Assertions */

/** SECOND FLOW: A patient is not looking for a specific diagnosis */
Given('I have begun the assessment flow', () => {
	cy.visit('/pic/looking-for');
});
When('I am shown the diagnosis prompt page', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/looking-for');
	});
});
Then('I see a prompt asking if I am looking for a diagnosis', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/looking-for');
	});
	cy.get('[data-cy=symptoms-button]').contains('No').should('exist');
});
When('I click I am not looking for a diagnosis', () => {
	cy.get('[data-cy=symptoms-button]').click();
});
Then('I am taken to the list of symptoms page', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/symptoms');
	});
	cy.get('[data-cy=next-button]').contains('Next').should('exist');
});
When('I confirm the symptoms I am looking for', () => {
	cy.get('[data-cy=next-button]').click();
});
Then('I am taken to the military and national guard assessment', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/military-national-guard');
	});
	cy.get('[data-cy=yes-button]').contains('Yes').should('exist');
	cy.get('[data-cy=no-button]').contains('No').should('exist');
});
When('I confirm I have not served in the military or national guard', () => {
	cy.get('[data-cy=no-button]').click();
});

/**FLOW 3: A patient has served in the military or national guard */
Given('I have reached the military or national guard questionnaire', () => {
	cy.visit('/pic/military-national-guard');
});
When('I am shown the military or national guard questionnaire', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/military-national-guard');
	});
});
Then('I see a prompt asking if I have served in the military or national guard', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/military-national-guard');
	});
	cy.get('[data-cy=yes-button]').contains('Yes').should('exist');
	cy.get('[data-cy=no-button]').contains('No').should('exist');
});
When('I click that I have served in the military or national guard', () => {
	cy.get('[data-cy=yes-button]').click();
});
Then('I see a button asking if it was myself or a family member', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/military-national-guard');
	});
	cy.get('[data-cy=family-button]').contains('Family member').should('exist');
	cy.get('[data-cy=self-button]').contains('Self').should('exist');
});
When('I select myself', () => {
	cy.get('[data-cy=self-button]').click();
});
Then('I see a button asking if it was before or after 9-11-2001', () => {
	cy.get('[data-cy=pre911-button]').contains('Pre 9/11/2001').should('exist');
	cy.get('[data-cy=post911-button]').contains('Post 9/11/2001').should('exist');
});
When('I select a pre-911', () => {
	cy.get('[data-cy=pre911-button]').click();
});
