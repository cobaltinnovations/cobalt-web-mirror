export const triagesPICOptions = [
	{ value: { care: 0, diagnoses: 100 }, label: 'Crisis care' },
	{ value: { care: 1, diagnoses: 8 }, label: 'General' },
	{ value: { care: 1, diagnoses: 10 }, label: 'Grief' },
	{ value: { care: 1, diagnoses: 9 }, label: 'Insomnia' },
	{ value: { care: 1, diagnoses: 11 }, label: 'Opioid use disorder' },
	{ value: { care: -1, diagnoses: -1 }, label: 'Sub-clinical symptoms' },
];

export const triagesSpecialtiesOptions = [
	{ value: { care: 2, diagnoses: 1 }, label: 'Evaluation' },
	{ value: { care: 2, diagnoses: 2 }, label: 'Psychotheraphy and/or MM' },
	{ value: { care: 2, diagnoses: 3 }, label: 'ADHD' },
	{ value: { care: 2, diagnoses: 4 }, label: 'Trauma' },
	{ value: { care: 2, diagnoses: 5 }, label: 'SUD' },
	{ value: { care: 2, diagnoses: 6 }, label: 'Eating disorder' },
	{ value: { care: 2, diagnoses: 7 }, label: 'Alcohol use disorder' },
	{ value: { care: 2, diagnoses: 0 }, label: 'LCSW capacity' },
	{ value: { care: 16, diagnoses: 16 }, label: 'Graduated' }, // this is a flag gets sent to endpoint /flag instead of /outcome
	{ value: { care: 17, diagnoses: 17 }, label: 'Connected to care' }, // this is a flag gets sent to endpoint /flag instead of /outcome
	{ value: { care: 18, diagnoses: 18 }, label: 'Lost contact' }, // this is a flag gets sent to endpoint /flag instead of /outcome
];

export const triages = [
	{ value: { care: 0, diagnoses: 100 }, label: 'Crisis care' },
	{ value: { care: 1, diagnoses: 8 }, label: 'General' },
	{ value: { care: 1, diagnoses: 10 }, label: 'Grief' },
	{ value: { care: 1, diagnoses: 9 }, label: 'Insomnia' },
	{ value: { care: 1, diagnoses: 11 }, label: 'Opioid use disorder' },
	{ value: { care: 2, diagnoses: 1 }, label: 'Evaluation' },
	{ value: { care: 2, diagnoses: 2 }, label: 'Psychotheraphy and/or MM' },
	{ value: { care: 2, diagnoses: 3 }, label: 'ADHD' },
	{ value: { care: 2, diagnoses: 4 }, label: 'Trauma' },
	{ value: { care: 2, diagnoses: 5 }, label: 'SUD' },
	{ value: { care: 2, diagnoses: 6 }, label: 'Eating disorder' },
	{ value: { care: 2, diagnoses: 7 }, label: 'Alcohol use disorder' },
	{ value: { care: 2, diagnoses: 0 }, label: 'LCSW capacity' },
	{ value: { care: -1, diagnoses: -1 }, label: 'Sub-clinical symptoms' },
	{ value: { care: 16, diagnoses: 16 }, label: 'Graduated' }, // this is a flag gets sent to endpoint /flag instead of /outcome
];
