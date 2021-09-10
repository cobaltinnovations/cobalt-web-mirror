Feature: MHIC
	As a mhic I can view panel of patient data
	@focus
	Scenario: As a mhic I want to be able to sign in to the mhic panel and see the table
		Given I have authenticated as an mhic
		When I enter my credentials as an mhic
		Then I am redirected the the mhic panel view and can view patients records


	@focus
	Scenario: As a user, when I am visiting the mhic dashboard I want to see a table of recent patients who completed the assessment
		Given I am visiting the mhic site
		When I enter my credentials as an mhic
		Then I am redirected the the mhic panel view and can view patients records

		When I click on bhp review checkbox on the table
		Then I should be able to mark it as  bhp reviewed on the table

		When I click on psy review checkbox on the table
		Then I should be able to mark it as psy reviewed on the table


	@focus
	Scenario: As a mhic, I can click on a specific patient in the table to get more detailed information on that patient
		Given I have reached the MHIC dashboard
		When I enter my credentials as an mhic
		Then I am redirected the the mhic panel view and can view patients records

		When I click on a specific table row
		Then I should see a detailed view of that specific patient

		When I click on the triage tab
		Then I should see content about the patients triage status

		When I click on the contact information tab
		Then I should see content about the patients contact information

		When I click on the notes tab
		Then I should see content notes left from mhic's about patient status

		When I click on the demographics tab
		Then I should see content about the patients demographics

	@focus
	Scenario: As a mhic, I can view patients demographics and modify demographics of a patient when needed
		Given I have clicked into the patient view of the mhic dashboard I can read demographics of a patient
		When I enter my credentials as an mhic
		Then I am redirected the the mhic panel view and can view patients records

		When I click on edit demographics button
		Then I should see a modal open with a detailed list of all of patients demographics

		When I select a updated preferred language of a patient
		Then I should be able to save the updated patients demographics and view on the main page

	@focus
	Scenario: As a mhic, I can view patients triage status, I can update a current status of a patient and I can view assessment results
		Given I am in the mhic dashboard
		When I enter my credentials as an mhic
		Then I am redirected the the mhic panel view and can view patients records

		When I am in the patient-view I can click on the triage tab
		Then I should see content about the patients triage status detail

		When I click on bhp review checkbox
		Then I should be able to mark it as reviewed

		When I click on the change triage button
		Then I should see a modal open where I can adjust a patients triage status

		When I click on a updated triage status for a patient
		Then I should be able to see that updated triage status reflected in the modal

		When I view the patient assessment progress
		Then I should gain knowledge of the patients progress on various assessments

		When I click on a specific assessment
		Then I should be able to see a detailed view of that assessment with the responses form a patient


	@focus
	Scenario: As a mhic, I can view patients contact information and modify content
		Given I am in the mhic dashboard
		When I enter my credentials as an mhic
		Then I am redirected the the mhic panel view and can view patients records

		When I am in the patient-view I can click on the the contact information tab
		Then I should see content about the patients contact information in detail

		When I click on the edit contact info button
		Then I should see a modal open where I can edit a patients contact information

		When I edit a patients email address
		Then I should be able to see the updated patients email address on the contact view

		When I click add contact attempt button
		Then I should  see a modal where I can write a contact attempt made towards a patient

		When I add a contact attempt for a patient
		Then I should be able to read the added contact attempt to the contact history log

	@focus
	Scenario: As a mhic, I can read notes left perviously for a client and leave new ones
		Given I am in the mhic dashboard
		When I enter my credentials as an mhic
		Then I am redirected the the mhic panel view and can view patients records
		
		When I am in the patient-view I can click on the the notes tab
		Then I should be able to read a history of past notes left about a patient

		When I enter a new update about a patient
		Then I should be able to read that updated note on the update history log








