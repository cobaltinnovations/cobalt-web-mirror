export interface InteractionInstance {
	interactionInstanceId: string;
	interactionId: string;
	startDateTime: string;
	startDateTimeDescription: string;
	timeZone: string;
	completedFlag: boolean;
	metadata: {
		gad7Answers: string;
		phoneNumber: string;
		phq4Answers: string;
		phq9Answers: string;
		pcptsdAnswers: string;
		phoneNumberForDisplay: string;
		endUserHtmlRepresentation: string;
	};
	hipaaCompliantMetadata: {
		phoneNumber: string;
		phoneNumberForDisplay: string;
		endUserHtmlRepresentation: string;
	};
	caseNumber: string;
}

export interface InteractionOption {
	interactionOptionId: string;
	interactionId: string;
	optionDescription: string;
	optionResponse: string;
	finalFlag: boolean;
	optionOrder: number;
	optionUrl: string;
}
