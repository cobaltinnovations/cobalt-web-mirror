Feature: InCrisis
	I want to see the correct in crisis modal content
	@focus
	Scenario: As a user, when I am visiting before business hours, I want to see contact info for 911
		Given I am visiting the site before 8am
		When I select the in crisis modal toggle in the header
        Then I see the pop-up with a 911 prompt

	@focus
	Scenario: As a user, when I am visiting after business hours, I want to see contact info for 911
		Given I am visiting the site after 530pm
		When I select the in crisis modal toggle in the header
		Then I see the pop-up with a 911 prompt

	@focus
	Scenario: As a user, when it is within LCSW working hours, I want to see the appropriate in crisis content
		Given I am visiting the site at noon and have not authenticated
		When I select the in crisis modal toggle in the header
		Then I see a contact modal for LCSW
