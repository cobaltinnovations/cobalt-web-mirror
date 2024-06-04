export interface FaqTopicModel {
	faqTopicId: string;
	urlName: string;
	name: string;
}

export interface FaqModel {
	faqId: string;
	faqTopicId: string;
	urlName: string;
	question: string;
	answer: string;
	shortAnswer?: string;
	permitEllipsizing: boolean;
	faqSubtopics: FaqSubtopicModel[];
}

export interface FaqSubtopicModel {
	faqSubtopicId: string;
	faqId: string;
	urlName: string;
	name: string;
	description: string;
}
