import { v4 as uuidv4 } from 'uuid';
import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { AlignType } from 'react-bootstrap/esm/types';
import classNames from 'classnames';

import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import {
	PatientOrderConsentStatusId,
	PatientOrderOutreachStatusId,
	PatientOrderSafetyPlanningStatusId,
	PatientOrderTriageStatusId,
} from '@/lib/models';

interface DropdownSection {
	dropdownSectionId: string;
	dropdownMenuItems: DropdownItem[];
}

interface DropdownItem {
	dropdownItemId: string;
	title: string;
	apiParameters: {
		patientOrderOutreachStatusId?: PatientOrderOutreachStatusId;
		patientOrderConsentStatusId?: PatientOrderConsentStatusId;
		patientOrderTriageStatusId?: PatientOrderTriageStatusId;
		patientOrderSafetyPlanningStatusId?: PatientOrderSafetyPlanningStatusId;
	};
}

const dropdownMenuSections: DropdownSection[] = [
	{
		dropdownSectionId: uuidv4(),
		dropdownMenuItems: [
			{
				dropdownItemId: uuidv4(),
				title: 'All',
				apiParameters: {},
			},
		],
	},
	{
		dropdownSectionId: uuidv4(),
		dropdownMenuItems: [
			{
				dropdownItemId: uuidv4(),
				title: 'New Review',
				apiParameters: {
					patientOrderOutreachStatusId: PatientOrderOutreachStatusId.NO_OUTREACH,
				},
			},
			{
				dropdownItemId: uuidv4(),
				title: 'Waiting for Consent',
				apiParameters: {
					patientOrderConsentStatusId: PatientOrderConsentStatusId.UNKNOWN,
				},
			},
			{
				dropdownItemId: uuidv4(),
				title: 'Need Assessment',
				apiParameters: {
					patientOrderTriageStatusId: PatientOrderTriageStatusId.NEEDS_ASSESSMENT,
				},
			},
		],
	},
	{
		dropdownSectionId: uuidv4(),
		dropdownMenuItems: [
			{
				dropdownItemId: uuidv4(),
				title: 'Safety Planning',
				apiParameters: {
					patientOrderSafetyPlanningStatusId: PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
				},
			},
			{
				dropdownItemId: uuidv4(),
				title: 'Specialty Care',
				apiParameters: {
					patientOrderTriageStatusId: PatientOrderTriageStatusId.SPECIALTY_CARE,
				},
			},
			{
				dropdownItemId: uuidv4(),
				title: 'MHP',
				apiParameters: {
					patientOrderTriageStatusId: PatientOrderTriageStatusId.MHP,
				},
			},
			{
				dropdownItemId: uuidv4(),
				title: 'Subclinical',
				apiParameters: {
					patientOrderTriageStatusId: PatientOrderTriageStatusId.SUBCLINICAL,
				},
			},
		],
	},
];

const flattenedDropdownMenuItems = dropdownMenuSections.reduce((accumulator, currentValue) => {
	return [...accumulator, ...currentValue.dropdownMenuItems];
}, [] as DropdownItem[]);

const availableQueryParams = flattenedDropdownMenuItems.reduce((accumulator, currentValue) => {
	return [...accumulator, ...Object.keys(currentValue.apiParameters)];
}, [] as string[]);

export function parseMhicViewDropdownQueryParamsFromURL(url: URL) {
	const parsed: Record<string, string[]> = {};

	for (const param of availableQueryParams) {
		parsed[param] = url.searchParams.getAll(param);
	}

	return parsed;
}

interface MhicViewDropdownProps {
	align?: AlignType;
	className?: string;
}

export const MhicViewDropdown = ({ align, className }: MhicViewDropdownProps) => {
	const [show, setShow] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();

	const handleDropdownItemClick = useCallback(
		(option: DropdownItem) => {
			const unselectedItems = flattenedDropdownMenuItems.filter(
				(flatOption) => flatOption.dropdownItemId !== option.dropdownItemId
			);

			unselectedItems.forEach((unselectedItem) => {
				Object.keys(unselectedItem.apiParameters).forEach((key) => {
					searchParams.delete(key);
				});
			});

			Object.entries(option.apiParameters).forEach(([key, value]) => {
				searchParams.set(key, value);
			});

			setSearchParams(searchParams);
			setShow(false);
		},
		[searchParams, setSearchParams]
	);

	return (
		<Dropdown
			className={classNames('d-flex align-items-center', className)}
			autoClose="outside"
			show={show}
			onToggle={setShow}
		>
			<Dropdown.Toggle
				as={DropdownToggle}
				className="d-inline-flex align-items-center"
				id="order-filters--add-filter"
			>
				<span>View</span>
			</Dropdown.Toggle>
			<Dropdown.Menu
				as={DropdownMenu}
				align={align ?? 'start'}
				flip={false}
				popperConfig={{ strategy: 'fixed' }}
				renderOnMount
			>
				{dropdownMenuSections.map((dropdownSection, sectionIndex) => {
					const isLastSection = dropdownMenuSections.length - 1 === sectionIndex;

					return (
						<React.Fragment key={dropdownSection.dropdownSectionId}>
							{dropdownSection.dropdownMenuItems.map((dropdownMenuItem) => (
								<Dropdown.Item
									key={dropdownMenuItem.dropdownItemId}
									onClick={() => {
										handleDropdownItemClick(dropdownMenuItem);
									}}
								>
									{dropdownMenuItem.title}
								</Dropdown.Item>
							))}
							{!isLastSection && <Dropdown.Divider />}
						</React.Fragment>
					);
				})}
			</Dropdown.Menu>
		</Dropdown>
	);
};
