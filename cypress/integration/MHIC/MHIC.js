/** SIGN FLOW: login as a mhic */
Given('I have authenticated as an mhic', () => {
	cy.visit('/pic/mhic');
	cy.wait(2000);
});

When('I enter my credentials as an mhic', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/sign-in-email');
	});

	cy.get('input[name="emailAddress"]').should('exist');
	cy.get('input[name="password"]').should('exist');

	cy.get('input[name="emailAddress"]').clear().type('maa+mhic1@xmog.com');
	cy.get('input[name="password"]').clear().type('test1234');
	cy.get('button[type="submit"]').click();
});

Then('I am redirected the the mhic panel view and can view patients records', () => {
	cy.location().should((loc) => {
		expect(loc.href).to.eq('http://localhost:3000/pic/mhic');
	});
	cy.get('table').should('exist');
});


/** FIRST FLOW: A MHCI is looking on the dashboard interacting with table*/
Given('I am visiting the mhic site', () => {
	cy.visit('/pic/mhic');
});

When('I click on bhp review checkbox on the table', () => {
	cy.get('[data-cy=table-bhp-review-input]:first').then((ele) => {
		if (ele.is(':checked')) {
			return
		} else {
			cy.wrap(ele).click()
		}
	})
});
Then('I should be able to mark it as  bhp reviewed on the table', () => {
	cy.get('[data-cy=table-bhp-review-input]:first').should('be.checked')
});

When('I click on psy review checkbox on the table', () => {
	cy.get('[data-cy=table-psy-review-input]:first').then((ele) => {
		if (ele.is(':checked')) {
			return
		} else {
			cy.wrap(ele).click()
		}
	})
});

Then('I should be able to mark it as psy reviewed on the table', () => {
	cy.get('[data-cy=table-psy-review-input]:first').should('be.checked');
});

/** SECOND FLOW: A MHIC is looking  at specific patient detail view */

Given('I have reached the MHIC dashboard', () => {
	cy.visit('/pic/mhic');
});

When('I click on a specific table row', () => {
	cy.get('[data-cy=patient-table-row]:first').click();

});

Then('I should see a detailed view of that specific patient', () => {
	cy.get('[data-cy=mhic-patient-view]').should('exist');
});

When('I click on the triage tab', () => {
	cy.get('[data-cy=triage-tab]').click();
});
Then('I should see content about the patients triage status', () => {
	cy.get('[data-cy=triage-tab-content]').should('exist');
});

When('I click on the contact information tab', () => {
	cy.get('[data-cy=contact-info-tab]').click();
});
Then('I should see content about the patients contact information', () => {
	cy.get('[data-cy=contact-info-tab-content]').should('exist');
});

When('I click on the notes tab', () => {
	cy.get('[data-cy=notes-tab]').click();
});
Then('I should see content notes left from mhic\'s about patient status', () => {
	cy.get('[data-cy=notes-tab-content]').should('exist');
});

When('I click on the demographics tab', () => {
	cy.get('[data-cy=demographics-tab]').click();
});
Then('I should see content about the patients demographics', () => {
	cy.get('[data-cy=demographics-tab-content]').should('exist');
});

/** THIRD FLOW: A MHIC is looking  at patient demographics */
Given('I have clicked into the patient view of the mhic dashboard I can read demographics of a patient', () => {
	cy.visit('/pic/mhic');
});

When('I click on edit demographics button', () => {
	cy.get('[data-cy=patient-table-row]:first').click();
	cy.get('[data-cy=demographics-tab-content]').should('exist');
	cy.get('[data-cy=edit-demographics-button]').click();
});
Then('I should see a modal open with a detailed list of all of patients demographics', () => {
	cy.get('.modal-content').should('exist');
});

When('I select a updated preferred language of a patient', () => {
	cy.get('#preferredLanguage').select('spanish');

});
Then('I should be able to save the updated patients demographics and view on the main page', () => {
	cy.get('[data-cy=save-demographics-button]').click();
	cy.get('.modal-content').should('not.exist');
});


// /** FOURTH FLOW: A MHIC is looking  at patient triage */
Given('I am in the mhic dashboard', () => {
	cy.visit('/pic/mhic');
});

When('I am in the patient-view I can click on the triage tab', () => {
	cy.get('[data-cy=patient-table-row]:first').click();
	cy.get('[data-cy=mhic-patient-view]').should('exist');
	cy.get('[data-cy=triage-tab]').click();
});
Then('I should see content about the patients triage status detail', () => {
	cy.get('[data-cy=triage-tab-content]').should('exist');
});

When('I click on bhp review checkbox', () => {
	cy.get('input[name="bhpReview"]').then((ele) => {
		if (ele.is(':checked')) {
			return
		} else {
			cy.wrap(ele).click()
		}
	})

});
Then('I should be able to mark it as reviewed', () => {
	cy.get('input[name="bhpReview"]').should('be.checked');
});

When('I click on the change triage button', () => {
	cy.get('[data-cy=change-triage-button]').click();

});
Then('I should see a modal open where I can adjust a patients triage status', () => {
	cy.get('.modal-content').should('exist');
});

When('I click on a updated triage status for a patient', () => {
	cy.get('input[name="Crisis care"]').click({force: true})
});
Then('I should be able to see that updated triage status reflected in the modal', () => {
	cy.get('[data-cy=update-triage-save-button]').click();
	cy.get('.modal-content').should('not.exist');
	cy.get('[data-cy=change-triage-button]').click();
	cy.get('.modal-content').should('exist');
	cy.get('[data-cy=triage-label]').contains('Crisis care');
	cy.get('[data-cy=close-triage-modal-button]').click();

});

When('I view the patient assessment progress', () => {
	cy.get('[data-cy=triage-assessment-card]').should('exist');
});
Then('I should gain knowledge of the patients progress on various assessments', () => {
	cy.get('[data-cy=patient-last-assessment-label]').should('exist');
	cy.get('[data-cy=patient-acuity-label]').should('exist');
});

When('I click on a specific assessment', () => {
	cy.get('[data-cy=assessment-modal-button]:first').click();
});
Then('I should be able to see a detailed view of that assessment with the responses form a patient', () => {
	cy.get('.modal-content').should('exist');
});


// /** FIFTH FLOW: A MHIC is looking at patient contact information and contact history */
Given('I am in the mhic dashboard', () => {
	cy.visit('/pic/mhic');
});

When('I am in the patient-view I can click on the the contact information tab', () => {
	cy.get('[data-cy=patient-table-row]:first').click();
	cy.get('[data-cy=mhic-patient-view]').should('exist');
	cy.get('[data-cy=contact-info-tab]').click();
});
Then('I should see content about the patients contact information in detail', () => {
	cy.get('[data-cy=contact-info-tab-content]').should('exist');
});

When('I click on the edit contact info button', () => {
	cy.get('[data-cy=edit-contact-button]').click();
});
Then('I should see a modal open where I can edit a patients contact information', () => {
	cy.get('.modal-content').should('exist');
	cy.get('#update-patient-number').should('exist');
	cy.get('#update-patient-email').should('exist');
});

When('I edit a patients email address', () => {
	cy.get('#update-patient-email').clear().type('bob@gmail.com');
	cy.get('[data-cy=save-updated-contact-button]').click();

});
Then('I should be able to see the updated patients email address on the contact view', () => {
	cy.get('[data-cy=contact-info-patient-email]').should('exist').contains('bob@gmail.com');
});

When('I click add contact attempt button', () => {
	cy.get('[data-cy=add-contact-attempt-button]').click()

});
Then('I should  see a modal where I can write a contact attempt made towards a patient', () => {
	cy.get('.modal-content').should('exist');
	cy.get('select[name="contactHistory"]').should('exist');
	cy.get('select[name="contactCallResult"]').should('exist');
	cy.get('input[name="contactAttemptComment"]').should('exist');
});

When('I add a contact attempt for a patient', () => {
	cy.get('select[name="contactHistory"]').select('Cobalt Family Care 989');
	cy.get('select[name="contactCallResult"]').select('No answer');
	cy.get('input[name="contactAttemptComment"]').type('left message for customer, third attempt');
	cy.get('[data-cy=contact-attempt-save-button]').click();
});
Then('I should be able to read the added contact attempt to the contact history log', () => {
	cy.get('[data-cy=contact-history-log] > div:first [data-cy=contact-call-result-label]').contains('No answer');
	cy.get('[data-cy=contact-history-log]  > div:first [data-cy=contact-attempt-comment-label]').contains('left message for customer, third attempt');
});

// /** SIXTH FLOW: A MHIC is looking at patient notes history */

Given('I am in the mhic dashboard', () => {
	cy.visit('/pic/mhic');
});

When('I am in the patient-view I can click on the the notes tab', () => {
	cy.get('[data-cy=patient-table-row]:first').click();
	cy.get('[data-cy=mhic-patient-view]').should('exist');
	cy.get('[data-cy=notes-tab]').click();
});
Then('I should be able to read a history of past notes left about a patient', () => {
	cy.get('[data-cy=notes-tab-content]').should('exist');
	cy.get('[data-cy=note-history-log]').should('exist');
});

When('I enter a new update about a patient', () => {
	cy.get('input[name=notes-comments]').type('patient took assessment over the phone');
	cy.get('[data-cy=submit-note-button]').click();
});
Then('I should be able to read that updated note on the update history log', () => {
	cy.get('[data-cy=note-history-log] > div:first > [data-cy=note-content]').contains('patient took assessment over the phone');
});
