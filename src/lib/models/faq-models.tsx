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
}
