Feature: Patient Information
	When I authenticate as a new patient I want to see a prompt to start the patient assessment.
	@focus
	Scenario: As a new patient, I want to be led through the patient assessment flow
		Given I have been authenticated
		When I am visiting Cobalt
		Then I see a welcoming screen ready to take me through my assessments

		When I click the take the screening button
		Then I am taken to the let's get started page

		When I click the continue button
		Then I am taken to the personal information page

		When I assert my personal information is correct
		Then I am taken to the diagnosis and symptom prompt

		When I click I am looking for a diagnosis
		Then I am taken to the list of diagnoses page

		When I confirm the diagnosis I am looking for
		Then I am taken to the let's keep going page

		When I keep going
		Then I am taken to the CSSRS assessment intro

	@focus
	Scenario: As a patient, if I'm not looking for a specific diagnosis, I want to be taken through the proper question flow
		Given I have begun the assessment flow
		When I am shown the diagnosis prompt page
		Then I see a prompt asking if I am looking for a diagnosis

		When I click I am not looking for a diagnosis
		Then I am taken to the list of symptoms page

		When I confirm the symptoms I am looking for
		Then I am taken to the military and national guard assessment

		When I confirm I have not served in the military or national guard
		Then I am taken to the let's keep going page

		When I keep going
		Then I am taken to the CSSRS assessment intro

	@focus
	Scenario: As a patient, if I have served in the military or national guard, I want to be taken through the proper question flow
		Given I have reached the military or national guard questionnaire
		When I am shown the military or national guard questionnaire
		Then I see a prompt asking if I have served in the military or national guard

		When I click that I have served in the military or national guard
		Then I see a button asking if it was myself or a family member

		When I select myself
		Then I see a button asking if it was before or after 9-11-2001

		When I select a pre-911
		Then I am taken to the let's keep going page

		When I keep going
		Then I am taken to the CSSRS assessment intro
