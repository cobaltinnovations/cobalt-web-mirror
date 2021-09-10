Feature: SmokeScreen
	I want to be able to follow the lifecycle of a disposition get determined correctly for a patient from the patient assessment to the mhic panel

	@focus
	Scenario: As a patient I want to be able to sign in into the patient portal and view an assessment
		Given I login in as a patient
		Then I expect to see the home screen

	@focus
	Scenario: As a patient if I answer yes to all 3 CRSSRS questions I want to be directed with crisis help
		Given I am a authenticated patient

		When I click on take assessment button
		Then I should see a screen with general information about the assessment

		When I click on lets continue button
		Then I should see a screen with my general demographics

		When I click on continue button
		Then I should see a prompt asking if I have a specific diagnosis


		When I click NO button on the specific diagnosis
		Then I should a screen with symptoms I want help to address

		When I click on the next button
		Then I should see a screen asking about if my family or I have been in the military

		When I click NO on the military screening
		Then I should see a screen letting me know I am going to be asked questions about my safety

		When I click continue on the prompt about safety screening
		Then I should see a questions asking if I wished I was dead

		When I click YES to the first question in the safety screening
		Then I should see a question asking if I had thoughts about killing myself

		When I click YES to the second question asking if I had thought of killing myself
		Then I should see a question asking if I have prepared to end my life

		When I click YES to the third question about having prepared to end my life
		Then I should see the end of the assessment and a screen with contact information about crisis care

	@focus
	Scenario: As a mhic I can view patient in panel  that reported YES to all 3 CRSSRS questions, I expect to see patient flagged in crisis
		Given I am a authenticated mhic
		Then I see patient with with a  safety flag Needs initial safety planning





