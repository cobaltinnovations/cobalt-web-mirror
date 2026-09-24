import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

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

it('shows grouped locations together and allows selection across groups', () => {
	const onInstitutionLocationSelect = jest.fn();
	const onContinue = jest.fn();
	const groupedLocations = [
		{
			institutionId: 'cobalt',
			institutionLocationId: 'pah',
			name: 'Pennsylvania Hospital (PAH)',
			institutionLocationGroup: {
				institutionLocationGroupId: 'uphs-group',
				name: 'University of Pennsylvania Health System (UPHS)',
				displayOrder: 1,
			},
		},
		{
			institutionId: 'cobalt',
			institutionLocationId: 'hup',
			name: 'Hospital of the University of Pennsylvania (HUP)',
			institutionLocationGroup: {
				institutionLocationGroupId: 'uphs-group',
				name: 'University of Pennsylvania Health System (UPHS)',
				displayOrder: 1,
			},
		},
		{
			institutionId: 'cobalt',
			institutionLocationId: 'psom',
			name: 'Perelman School of Medicine (PSOM)',
			institutionLocationGroup: {
				institutionLocationGroupId: 'upenn-group',
				name: 'University of Pennsylvania (UPenn)',
				displayOrder: 2,
			},
		},
		{
			institutionId: 'cobalt',
			institutionLocationId: 'cobalt-general',
			name: 'Cobalt General',
		},
	] as InstitutionLocation[];

	const { rerender } = render(
		<EmployerSelectionModal
			show
			institutionLocations={groupedLocations}
			selectedInstitutionLocationId="psom"
			onInstitutionLocationSelect={onInstitutionLocationSelect}
			onContinue={onContinue}
		/>
	);

	const uphsGroup = screen.getByRole('region', { name: 'University of Pennsylvania Health System (UPHS)' });
	const upennGroup = screen.getByRole('region', { name: 'University of Pennsylvania (UPenn)' });
	expect(within(uphsGroup).getByRole('radio', { name: 'Pennsylvania Hospital (PAH)' })).toBeVisible();
	expect(within(uphsGroup).getByRole('radio', { name: 'Hospital of the University of Pennsylvania (HUP)' })).toBeVisible();
	expect(within(upennGroup).getByRole('radio', { name: 'Perelman School of Medicine (PSOM)' })).toBeVisible();
	expect(screen.getByRole('radio', { name: 'Cobalt General' })).toBeVisible();
	expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();

	fireEvent.click(within(uphsGroup).getByRole('radio', { name: 'Pennsylvania Hospital (PAH)' }));
	expect(onInstitutionLocationSelect).toHaveBeenCalledWith('pah');
	rerender(
		<EmployerSelectionModal
			show
			institutionLocations={groupedLocations}
			selectedInstitutionLocationId="pah"
			onInstitutionLocationSelect={onInstitutionLocationSelect}
			onContinue={onContinue}
		/>
	);
	expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
	fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
	expect(onContinue).toHaveBeenCalledTimes(1);
});

it('supports the alternate not-sure value used by support pages', () => {
	const onInstitutionLocationSelect = jest.fn();
	render(
		<EmployerSelectionModal
			show
			institutionLocations={institutionLocations}
			selectedInstitutionLocationId=""
			notSureValue="NA"
			onInstitutionLocationSelect={onInstitutionLocationSelect}
			onContinue={jest.fn()}
		/>
	);

	fireEvent.click(screen.getByRole('radio', { name: "I'm not sure / I'd rather not say" }));
	expect(onInstitutionLocationSelect).toHaveBeenCalledWith('NA');
});
