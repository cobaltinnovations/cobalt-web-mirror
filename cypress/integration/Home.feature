Feature: Home
	I want to see the correct home screen content
	@focus
	Scenario: As a user, when I am visiting before business hours, I want to see contact info for of hours
		Given I am visiting the site during off hours
		When I am on the home page
        Then I see the prompt for off hours
