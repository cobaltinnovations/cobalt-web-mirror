export * from './url-utils';

// TODO: Figure out how to TS a yup schema so we dont need the ignores
export const getRequiredYupFields = <T>(schema: any) => {
	const requiredFields = Object.entries(schema.fields).reduce((fields, [fieldName, fieldSchema]) => {
		// @ts-ignore
		const { tests } = fieldSchema.describe();
		// @ts-ignore
		const isRequired = !!tests.find((test) => test.name === 'required');

		fields[fieldName] = isRequired;

		return fields;
	}, {} as Record<string, boolean>) as Record<keyof T, boolean>;

	return requiredFields;
};
