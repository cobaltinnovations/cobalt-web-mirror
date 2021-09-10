import {
	Before,
	Given,
	When,
	Then,
	After
} from 'cypress-cucumber-preprocessor/steps';
import patientProfile from '../../fixtures/epicDadPatient.json';


let url;

Before(() => {
	url = Cypress.env('HOST') === 'local' ?
		Cypress.env('LOCAL_URL') :
		Cypress.env('DEV_URL');

	cy.task('login', url).then(cookies => {
		const accessToken = cookies.find(cookie => cookie.name === 'accessToken');
		const piccobalt_patientcontext = cookies.find(cookie => cookie.name === 'piccobalt_patientcontext');

		localStorage.setItem('accessToken', JSON.stringify(accessToken));
		localStorage.setItem('piccobalt_patientcontext', JSON.stringify(piccobalt_patientcontext));
	});
});

/** SIGN FLOW: login as a patient into pic/home */
Given('I login in as a patient', () => {
	const businessHours = new Date(2020, 3, 22, 1, 45).getTime();
	cy.clock(businessHours);
	cy.visit(`${url}/patient-sign-in`);

	const accessToken = JSON.parse(localStorage.getItem('accessToken'));
	const piccobalt_patientcontext = JSON.parse(localStorage.getItem('piccobalt_patientcontext'));

	cy.setCookie(accessToken.name, accessToken.value);
	cy.setCookie(piccobalt_patientcontext.name, piccobalt_patientcontext.value);

	cy.visit(`${url}/pic/home`);
});

Then('I expect to see the home screen', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq(`${url}/pic/home`);
	});

	cy.get('h2').contains(`Welcome to Cobalt Integrated Care, ${patientProfile.epicProfile.name[0].given[0]}`);
});

/** REUSEABLE  Assertions for Patient stepping through the first part of the assessment */
When('I click on take assessment button', () => {
	cy.get('[data-cy="take-screening"]').click();
});

/** demographics screening */

Then('I should see a screen with general information about the assessment', () => {
	cy.get('h3').contains('Take the assessment');
});

When('I click on lets continue button', () => {
	cy.get('[data-cy=start-assessment]').click();
});

Then('I should see a screen with my general demographics', () => {
	cy.get('#lastName').contains(`${patientProfile.epicProfile.name[0].family}`);
	cy.get('#preferredName').contains(`${patientProfile.epicProfile.name[0].given[0]}`);
	cy.get('#city').contains(`${patientProfile.epicProfile.address[0].city}`);
});

When('I click on continue button', () => {
	cy.get('[data-cy=continue-assessment]').click();
});

/** specific diagnosis screening */

Then('I should see a prompt asking if I have a specific diagnosis', () => {
	cy.get('h3').contains('a specific diagnosis?');
});


When('I click NO button on the specific diagnosis', () => {
	cy.get('[data-cy=symptoms-button]').click();
});

Then('I should a screen with symptoms I want help to address', () => {
	cy.get('h3').contains('Do you want help with any of these symptoms?');
	cy.get('label[id="worry"]').should('exist');
	cy.get('label[id="sadness"]').should('exist');
	cy.get('label[id="grief"]').should('exist');
	cy.get('label[id="sleep"]').should('exist');
	cy.get('label[id="chronicPain"]').should('exist');
	cy.get('label[id="drugAlcohol"]').should('exist');
	cy.get('label[id="other"]').should('exist');
});

When('I click on the next button', () => {
	cy.get('[data-cy=next-button]').click();
});

Then('I should see a screen asking about if my family or I have been in the military', () => {
	cy.get('[data-cy=pre911-button]').contains('Yes, I or an immediate family member served in the military before 9/11/01');
	cy.get('[data-cy=post911-button]').contains('Yes, I or an immediate family member served in the military after 9/11/01');
});

/** military screening */
When('I click NO on the military screening', () => {
	cy.get('[data-cy="no-button"]').click();
});

Then('I should see a screen letting me know I am going to be asked questions about my safety', () => {
	cy.get('p:first').contains(`Thank you, ${patientProfile.epicProfile.name[0].given[0]}. That background really helps.`);
});

/** CSSRS prompt screen */
When('I click continue on the prompt about safety screening', () => {
	cy.get('[data-cy="intermediate-next-button"]').click();
});

Then('I should see a questions asking if I wished I was dead', () => {
	cy.get('h3').contains('Have you wished you were dead or wished you could go to sleep and not wake up?');
});

/** CRISIS FLOW PATIENT: login as a patient and answer yes to CSSRS questions */
Given('I am a authenticated patient', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq(`${url}/pic/home`);
	});

	cy.get('h2').contains(`Welcome to Cobalt Integrated Care, ${patientProfile.epicProfile.name[0].given[0]}`);
});

// RUNS reuseable assertions to move patient through the  assessment to the military questions and into the CSSRS

When('I click YES to the first question in the safety screening', () => {
	cy.get('button:first').click();
});

Then('I should see a question asking if I had thoughts about killing myself', () => {
	cy.get('h3').contains('Have you actually had any thoughts of killing yourself?')
});

When('I click YES to the second question asking if I had thought of killing myself', () => {
	cy.get('button:first').click();
});

Then('I should see a question asking if I have prepared to end my life', () => {
	cy.get('h3').contains('Have you ever done anything, started to do anything, or prepared to do anything to end your life?');
})

When('I click YES to the third question about having prepared to end my life', () => {
	cy.get('button:first').click();
});

Then('I should see the end of the assessment and a screen with contact information about crisis care', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq(`${url}/pic/home`);
	});

	cy.get('h5').contains('If you think you might harm yourself or others, please immediately contact one of the following');
	cy.get('a[href="tel:800-273-8255"]').should('exist');
	cy.get('a[href="tel:741 741"]').should('exist');
	cy.get('a[href="tel:215-555-1212"]').should('exist');
	cy.get('a[href="tel:911"]').should('exist');
});

/** CRISIS FLOW MHIC: login as a mhic and view patient who answered yes to the CSSRS questions as having safety flag needs initial safety planning*/
Given('I am a authenticated mhic', () => {
	cy.visit(`${url}/pic/mhic`)

	cy.location().should((loc) => {
		expect(loc.href).to.eq(`${url}/sign-in-email`);
	});

	cy.get('input[name="emailAddress"]').should('exist');
	cy.get('input[name="password"]').should('exist');

	cy.get('input[name="emailAddress"]').clear().type('maa+mhic1@xmog.com');
	cy.get('input[name="password"]').clear().type('test1234');
	cy.get('button[type="submit"]').click();
});

Then('I see patient with with a  safety flag Needs initial safety planning', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq(`${url}/pic/mhic`);
	});
	cy.wait(5000);
	cy.get('table').should('exist');

	cy.get(`#${patientProfile.epicProfile.name[0].family}`).then($row => {
		const expectedFlag = 'Needs initial safety planning';
		const parent = $row.parent();
		const patientRow = parent[0];
		const flag = $row.prev().text();

		cy.expect(flag).eq(expectedFlag)

		cy.get(patientRow).click();
		cy.wait(5000);

		// Change patient to graduated
		cy.get('[data-cy=mhic-patient-view]').should('exist');
		cy.get('[data-cy=triage-tab]').click();
		cy.get('[data-cy=change-triage-button]').click();
		cy.get('.modal-content').should('exist');

		cy.get('input[name="Graduated"]').click({ force: true });
		cy.get('[data-cy=update-triage-save-button]').click();
		return;
	});
});

After(() => {
	cy.clearCookies();
	localStorage.removeItem('accessToken');
	localStorage.removeItem('piccobalt_patientcontext');
});
