export const patientInformationForm = [
	{
		fieldName: 'lastName',
		inputType: 'text',
	},
	{
		fieldName: 'preferredName',
		inputType: 'text',
	},
	{
		fieldName: 'age',
		inputType: 'number',
	},
	{
		fieldName: 'phoneNumber',
		inputType: 'tel',
		placeholderTextKey: 'phoneNumberPlaceholderText',
	},
	{
		fieldName: 'genderIdentity',
		inputType: 'text',
	},
	{
		fieldName: 'city',
		inputType: 'text',
	},
	{
		fieldName: 'state',
		inputType: 'select',
	},
	{
		fieldName: 'email',
		inputType: 'email',
		placeholderTextKey: 'emailPlaceholderText'
	}
];

export const demographicsInformationForm = [
	{
		fieldName: 'dob',
		inputType: 'datepicker',
	},
	{
		fieldName: 'address',
		inputType: 'text',
	},
	{
		fieldName: 'age',
		inputType: 'number',
	},
	{
		fieldName: 'zip',
		inputType: 'number',
	},
	{
		fieldName: 'insurance',
		inputType: 'select',
	},
	{
		fieldName: 'race',
		inputType: 'checkbox',
	},
	{
		fieldName: 'genderIdentity',
		inputType: 'select',
	},
	{
		fieldName: 'ethnicity',
		inputType: 'select',
	},
	{
		fieldName: 'preferredLanguage',
		inputType: 'select',
	}
];

export const fiftyStates = [
	{ value: 'AL', label: 'Alabama' },
	{ value: 'AK', label: 'Alaska' },
	{ value: 'AZ', label: 'Arizona' },
	{ value: 'AR', label: 'Arkansas' },
	{ value: 'CA', label: 'California' },
	{ value: 'CO', label: 'Colorado' },
	{ value: 'CT', label: 'Connecticut' },
	{ value: 'DE', label: 'Delaware' },
	{ value: 'DC', label: 'District Of Columbia' },
	{ value: 'FL', label: 'Florida' },
	{ value: 'GA', label: 'Georgia' },
	{ value: 'HI', label: 'Hawaii' },
	{ value: 'ID', label: 'Idaho' },
	{ value: 'IL', label: 'Illinois' },
	{ value: 'IN', label: 'Indiana' },
	{ value: 'IA', label: 'Iowa' },
	{ value: 'KS', label: 'Kansas' },
	{ value: 'KY', label: 'Kentucky' },
	{ value: 'LA', label: 'Louisiana' },
	{ value: 'ME', label: 'Maine' },
	{ value: 'MD', label: 'Maryland' },
	{ value: 'MA', label: 'Massachusetts' },
	{ value: 'MI', label: 'Michigan' },
	{ value: 'MN', label: 'Minnesota' },
	{ value: 'MS', label: 'Mississippi' },
	{ value: 'MO', label: 'Missouri' },
	{ value: 'MT', label: 'Montana' },
	{ value: 'NE', label: 'Nebraska' },
	{ value: 'NV', label: 'Nevada' },
	{ value: 'NH', label: 'New Hampshire' },
	{ value: 'NJ', label: 'New Jersey' },
	{ value: 'NM', label: 'New Mexico' },
	{ value: 'NY', label: 'New York' },
	{ value: 'NC', label: 'North Carolina' },
	{ value: 'ND', label: 'North Dakota' },
	{ value: 'OH', label: 'Ohio' },
	{ value: 'OK', label: 'Oklahoma' },
	{ value: 'OR', label: 'Oregon' },
	{ value: 'PA', label: 'Pennsylvania' },
	{ value: 'RI', label: 'Rhode Island' },
	{ value: 'SC', label: 'South Carolina' },
	{ value: 'SD', label: 'South Dakota' },
	{ value: 'TN', label: 'Tennessee' },
	{ value: 'TX', label: 'Texas' },
	{ value: 'UT', label: 'Utah' },
	{ value: 'VT', label: 'Vermont' },
	{ value: 'VA', label: 'Virginia' },
	{ value: 'WA', label: 'Washington' },
	{ value: 'WV', label: 'West Virginia' },
	{ value: 'WI', label: 'Wisconsin' },
	{ value: 'WY', label: 'Wyoming' },
];

export const genders = [
	{ value: 'female', label: 'Female' },
	{ value: 'male', label: 'Male' },
	{ value: 'tFemale', label: 'Transgender Female/Male to Female' },
	{ value: 'tMale', label: 'Transgender Male/Female to Male' },
	{ value: 'other', label: 'Other' },
];

export const preferredLanguages = [
	{ value: 'english', label: 'English' },
	{ value: 'spanish', label: 'Spanish' },
	{ value: 'dutch', label: 'Dutch' },
	{ value: 'german', label: 'German' },
	{ value: 'mandarin', label: 'Mandarin' },
	{ value: 'italian', label: 'Italian' },
	{ value: 'french', label: 'French' },
	{ value: 'vietnamese', label: 'Vietnamese' },
	{ value: 'russian', label: 'Russian' },
	{ value: 'arabic', label: 'Arabic' },
	{ value: 'korean', label: 'Korean' },
	{ value: 'hindi', label: 'Hindi' },
	{ value: 'other', label: 'Other' }
];

export const insurances = [
	{ value: 'blue cross blue shield national medicare advantage PPO', label: 'Blue Cross Blue Shield National Medicare Advantage PPO' },
	{ value: 'blue cross blue shield federal', label: 'Blue Cross Blue Shield Federal' },
	{ value: 'Blue Shield – All Plans', label: 'Blue Shield – All Plans' },
	{ value: 'Independence Blue Cross', label: 'Independence Blue Cross' },
	{ value: 'Independence Blue Cross HMO', label: 'Independence Blue Cross HMO' },
	{ value: 'Independence Blue Cross PPO', label: 'Independence Blue Cross PPO' },
	{ value: 'Independence Blue Cross Personal Choice Exchange', label: 'Independence Blue Cross Personal Choice Exchange' },
	{ value: 'IBC PPO Exchange', label: 'IBC PPO Exchange' },
	{ value: 'ICD10 BC Personal Choice', label: 'ICD10 BC Personal Choice' },
	{ value: 'Keystone First', label: 'Keystone First' },
	{ value: 'Keystone 65', label: 'Keystone 65' },
	{ value: 'Keystone 65 HMO Select', label: 'Keystone 65 HMO Select' },
	{ value: 'Keystone Health Plan East', label: 'Keystone Health Plan East' },
	{ value: 'Keystone Health Plan East Babies', label: 'Keystone Health Plan East Babies' },
	{ value: 'Keystone Health Plan East Exchange', label: 'Keystone Health Plan East Exchange' },
	{ value: 'Keystone HMO Proactive Exchange', label: 'Keystone HMO Proactive Exchange' },
	{ value: 'PA Health & Wellness Ambetter', label: 'PA Health & Wellness Ambetter' },
	{ value: 'PA Health & Wellness Allwell', label: 'PA Health & Wellness Allwell' },
	{ value: 'PA Medicaid', label: 'PA Medicaid' },
	{ value: 'CHC PA Health & Wellness', label: 'CHC PA Health & Wellness' },
	{ value: 'Personal Choice', label: 'Personal Choice' },
	{ value: 'Personal Choice 65', label: 'Personal Choice 65' },
	{ value: 'Medicare', label: 'Medicare' },
	{ value: 'Oscar Health – All Plans', label: 'Oscar Health – All Plans' },
	{ value: 'University Personal Choice', label: 'University Personal Choice' },
	{ value: 'Cobalt Personal Choice / Cobalt Care', label: 'Cobalt Personal Choice / Cobalt Care' },
	{ value: 'Pay out - of - pocket', label: 'Pay out - of - pocket' },
];

export const races = [
	{ value: 'White', label: 'White' },
	{ value: 'Black or African American', label: 'Black or African American' },
	{ value: 'American Indian or Alaska Native', label: 'American Indian or Alaska Native' },
	{ value: 'Asian', label: 'Asian' },
	{ value: 'Native Hawaiian or Other Pacific Islander', label: 'Native Hawaiian or Other Pacific Islander' },
	{ value: 'Unknown', label: 'Unknown' }

];

export const ethnicities = [
	{ value: 'hispanic', label: 'Hispanic/Latino' },
	{ value: 'non-hispanic', label: 'Not Hispanic/Latino' },
	{ value: '', label: 'Not entered' },
];

export const eductionLevels = [
	{ value: 'No schooling completed, or less than 1 year', label: 'No schooling completed, or less than 1 year' },
	{ value: 'Nursery, kindergarten, and elementary (grades 1-8)', label: 'Nursery, kindergarten, and elementary (grades 1-8)' },
	{ value: 'High school (grades 9-12, no degree)', label: 'High school (grades 9-12, no degree)' },
	{ value: 'High school graduate (or equivalent)', label: 'High school graduate (or equivalent)' },
	{ value: 'Some college (1-4 years, no degree)', label: 'Some college (1-4 years, no degree)' },
	{ value: 'Associate\'s degree(including occupational or academic degrees)', label: 'Associate\'s degree(including occupational or academic degrees)' },
	{ value: 'Bachelor\'s degree', label: 'Bachelor\'s degree' },
	{ value: 'Master\'s degree', label: 'Master\'s degree' },
	{ value: 'Professional school degree', label: 'Professional school degree' },
	{ value: 'Doctorate degree', label: 'Doctorate degree' },
];

