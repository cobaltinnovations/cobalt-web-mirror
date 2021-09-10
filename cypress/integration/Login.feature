Feature: Login
	I want to see log in buttons when I visit the site unauthenticated
	@focus
	Scenario: As a user, I want to be able to log in anonymously
		Given I am visiting the site
		When I am unauthenticated
		Then I see options to log in anonymously or with my Cobalt account

		When I click the anonymous sign in button
		Then I am signed in anonymously

		When I open the side drawer and click sign out
		Then I am taken back to the login page
