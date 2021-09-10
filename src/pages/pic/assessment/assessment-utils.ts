import {
	IQuestionnaireResponse,
	IQuestionnaireResponse_Item,
	IQuestionnaireResponse_Answer,
	QuestionnaireResponseStatusKind,
} from '@ahryman40k/ts-fhir-types/lib/R4';

export const arrayToQuestionnaireResponse = (attributesArray: string[], questionnaireURI: string, otherDescription?: string) => {
	const answers: IQuestionnaireResponse_Item[] = attributesArray.reduce((array: IQuestionnaireResponse_Item[], attribute) => {
		const answerItem = attribute === 'other' ? { valueString: otherDescription } : { valueBoolean: true };
		const answer: IQuestionnaireResponse_Item = {
			linkId: attribute,
			answer: [answerItem],
		};
		array.push(answer);
		return array;
	}, []);

	const response: IQuestionnaireResponse = {
		resourceType: 'QuestionnaireResponse',
		questionnaire: questionnaireURI,
		status: QuestionnaireResponseStatusKind._inProgress,
		item: answers,
	};
	return response;
};

export const optionsToQuestionnaireResponse = (
	options: { value: string; selected: boolean }[],
	questionnaireURI: string,
	otherDescription?: string
): IQuestionnaireResponse => {
	const answers: IQuestionnaireResponse_Item[] = options.reduce((array: IQuestionnaireResponse_Item[], option) => {
		const answerItem =
			option.value.split('/').includes('other') && option.selected === true ? { valueString: otherDescription } : { valueBoolean: option.selected };
		const answer: IQuestionnaireResponse_Item = {
			linkId: option.value,
			answer: [answerItem],
		};
		array.push(answer);
		return array;
	}, []);

	const response: IQuestionnaireResponse = {
		resourceType: 'QuestionnaireResponse',
		questionnaire: questionnaireURI,
		status: QuestionnaireResponseStatusKind._inProgress,
		item: answers,
	};
	return response;
};

export const stringQuestionnaireResponse = (value: string, questionnaireURI: string, otherDescription?: string) => {
	const answers = [
		{
			linkId: questionnaireURI,
			answer: [{ valueString: value }],
		},
	];

	const response: IQuestionnaireResponse = {
		resourceType: 'QuestionnaireResponse',
		questionnaire: questionnaireURI,
		status: QuestionnaireResponseStatusKind._inProgress,
		item: answers,
	};
	return response;
};

export const getSingleAnswer = (responses: IQuestionnaireResponse, linkId: string): IQuestionnaireResponse_Answer | undefined => {
	const item = responses.item?.find((r) => r.linkId === linkId);
	const answer = item?.answer;
	return answer && answer[0];
};

export const getAnswers = (responses: IQuestionnaireResponse, linkId: string): IQuestionnaireResponse_Answer[] | undefined => {
	const item = responses.item?.find((r) => r.linkId === linkId);
	return item?.answer;
};
