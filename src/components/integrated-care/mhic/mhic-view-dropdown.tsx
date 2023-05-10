import React, { useCallback, useMemo, useState } from 'react';
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

interface Props {
	align?: AlignType;
	className?: string;
}

interface DropdownItem {
	optionId: string;
	title: string;
	apiParameters: {
		patientOrderOutreachStatusId?: PatientOrderOutreachStatusId;
		patientOrderConsentStatusId?: PatientOrderConsentStatusId;
		patientOrderTriageStatusId?: PatientOrderTriageStatusId;
		patientOrderSafetyPlanningStatusId?: PatientOrderSafetyPlanningStatusId;
	};
}

const dropdownMenuSections: { sectionId: string; options: DropdownItem[] }[] = [
	{
		sectionId: 'FIRST',
		options: [
			{
				optionId: 'ALL',
				title: 'All',
				apiParameters: {},
			},
		],
	},
	{
		sectionId: 'SECOND',
		options: [
			{
				optionId: PatientOrderOutreachStatusId.NO_OUTREACH,
				title: 'New Review',
				apiParameters: {
					patientOrderOutreachStatusId: PatientOrderOutreachStatusId.NO_OUTREACH,
				},
			},
			{
				optionId: PatientOrderConsentStatusId.UNKNOWN,
				title: 'Waiting for Consent',
				apiParameters: {
					patientOrderConsentStatusId: PatientOrderConsentStatusId.UNKNOWN,
				},
			},
			{
				optionId: PatientOrderTriageStatusId.NEEDS_ASSESSMENT,
				title: 'Need Assessment',
				apiParameters: {
					patientOrderTriageStatusId: PatientOrderTriageStatusId.NEEDS_ASSESSMENT,
				},
			},
		],
	},
	{
		sectionId: 'THIRD',
		options: [
			{
				optionId: PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
				title: 'Safety Planning',
				apiParameters: {
					patientOrderSafetyPlanningStatusId: PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
				},
			},
			{
				optionId: PatientOrderTriageStatusId.SPECIALTY_CARE,
				title: 'Specialty Care',
				apiParameters: {
					patientOrderTriageStatusId: PatientOrderTriageStatusId.SPECIALTY_CARE,
				},
			},
			{
				optionId: PatientOrderTriageStatusId.MHP,
				title: 'MHP',
				apiParameters: {
					patientOrderTriageStatusId: PatientOrderTriageStatusId.MHP,
				},
			},
			{
				optionId: PatientOrderTriageStatusId.SUBCLINICAL,
				title: 'Subclinical',
				apiParameters: {
					patientOrderTriageStatusId: PatientOrderTriageStatusId.SUBCLINICAL,
				},
			},
		],
	},
];

const flattendOptions = dropdownMenuSections.reduce((accumulator, currentValue) => {
	return [...accumulator, ...currentValue.options];
}, [] as DropdownItem[]);

export const MhicViewDropdown = ({ align, className }: Props) => {
	const [show, setShow] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();

	const handleDropdownItemClick = useCallback(
		(option: DropdownItem) => {
			const unselectedOptions = flattendOptions.filter((flatOption) => flatOption.optionId !== option.optionId);

			unselectedOptions.forEach((unselectedOption) => {
				Object.keys(unselectedOption.apiParameters).forEach((key) => {
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
				{dropdownMenuSections.map((section, sectionIndex) => {
					const isLastSection = dropdownMenuSections.length - 1 === sectionIndex;

					return (
						<React.Fragment key={section.sectionId}>
							{section.options.map((option) => (
								<Dropdown.Item
									key={option.title}
									onClick={() => {
										handleDropdownItemClick(option);
									}}
								>
									{option.title}
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
