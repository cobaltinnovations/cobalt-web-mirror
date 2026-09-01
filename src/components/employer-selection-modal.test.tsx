import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { InstitutionLocation } from '@/lib/models';
import { ALL_INSTITUTION_LOCATIONS_ID } from '@/lib/utils';
import EmployerSelectionModal from './employer-selection-modal';

const institutionLocations = [
	{
		institutionLocationId: 'uphs-id',
		name: 'University of Pennsylvania Health System',
		shortName: 'UPHS',
	},
	{
		institutionLocationId: 'upenn-id',
		name: 'University of Pennsylvania',
		shortName: 'UPenn',
	},
] as InstitutionLocation[];

it('requires an employer selection and returns the selected persisted value', () => {
	const onInstitutionLocationSelect = jest.fn();
	const onContinue = jest.fn();

	const { rerender } = render(
		<EmployerSelectionModal
			show
			institutionLocations={institutionLocations}
			selectedInstitutionLocationId=""
			onInstitutionLocationSelect={onInstitutionLocationSelect}
			onContinue={onContinue}
			onHide={jest.fn()}
		/>
	);

	expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
	fireEvent.click(screen.getByRole('radio', { name: /UPenn/ }));
	expect(onInstitutionLocationSelect).toHaveBeenCalledWith('upenn-id');

	rerender(
		<EmployerSelectionModal
			show
			institutionLocations={institutionLocations}
			selectedInstitutionLocationId="upenn-id"
			onInstitutionLocationSelect={onInstitutionLocationSelect}
			onContinue={onContinue}
			onHide={jest.fn()}
		/>
	);

	fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
	expect(onContinue).toHaveBeenCalledTimes(1);
});

it('offers the privacy-preserving not-sure option', () => {
	const onInstitutionLocationSelect = jest.fn();

	render(
		<EmployerSelectionModal
			show
			institutionLocations={institutionLocations}
			selectedInstitutionLocationId=""
			onInstitutionLocationSelect={onInstitutionLocationSelect}
			onContinue={jest.fn()}
			onHide={jest.fn()}
		/>
	);

	fireEvent.click(screen.getByRole('radio', { name: "I'm not sure / I'd rather not say" }));
	expect(onInstitutionLocationSelect).toHaveBeenCalledWith(ALL_INSTITUTION_LOCATIONS_ID);
});
