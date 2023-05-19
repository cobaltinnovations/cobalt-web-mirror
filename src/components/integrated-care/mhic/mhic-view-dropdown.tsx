import { v4 as uuidv4 } from 'uuid';
import React, { RefObject, useCallback, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Button, Dropdown } from 'react-bootstrap';
import { AlignType } from 'react-bootstrap/esm/types';
import { DropdownToggleProps } from 'react-bootstrap/esm/DropdownToggle';
import classNames from 'classnames';
import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down-v2.svg';

import { DropdownMenu } from '@/components/dropdown';
import {
	PatientOrderConsentStatusId,
	PatientOrderOutreachStatusId,
	PatientOrderSafetyPlanningStatusId,
	PatientOrderTriageStatusId,
} from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';

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
				title: 'Not Triaged',
				apiParameters: {
					patientOrderTriageStatusId: PatientOrderTriageStatusId.NOT_TRIAGED,
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
	const { pathname, search } = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const [show, setShow] = useState(false);

	const dropdownToggleTitle = useMemo(() => {
		const url = new URL(`${window.location.origin}${pathname}${search}`);
		const selectedQueryParams = parseMhicViewDropdownQueryParamsFromURL(url);
		const selectedQueryParamValues = Object.values(selectedQueryParams).flat();

		if (selectedQueryParamValues.length <= 0) {
			return 'All';
		}

		if (selectedQueryParamValues.length === 1) {
			const matchingItem = flattenedDropdownMenuItems.find((item) =>
				Object.values(item.apiParameters).find((p) => p === selectedQueryParamValues[0])
			);
			return matchingItem?.title ?? 'Unknown';
		}

		if (selectedQueryParamValues.length > 1) {
			return `${selectedQueryParamValues.length} Selections`;
		}

		return 'View';
	}, [pathname, search]);

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
		<div className="d-flex align-items-center">
			<span className="me-2">View:</span>
			<Dropdown
				className={classNames('d-flex align-items-center', className)}
				autoClose="outside"
				show={show}
				onToggle={setShow}
			>
				<Dropdown.Toggle
					as={MhicViewDropdownToggle}
					id="mhic-view-dropdown-toggle"
					className="d-flex align-items-center justify-content-between"
				>
					<span>{dropdownToggleTitle}</span>
					<DownChevron className="text-n500" />
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
		</div>
	);
};

const useMhicViewDropdownToggleStyles = createUseThemedStyles((theme) => ({
	useMhicViewDropdownToggle: {
		width: 240,
		height: 40,
		borderRadius: 5,
		textAlign: 'left',
		appearance: 'none',
		padding: '10px 12px',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
		'&:hover': {
			border: `1px solid ${theme.colors.n300}`,
		},
	},
}));

const MhicViewDropdownToggle = React.forwardRef(
	(
		{ className, children, style, onClick, disabled }: DropdownToggleProps,
		ref: ((instance: HTMLButtonElement | null) => void) | RefObject<HTMLButtonElement> | null | undefined
	) => {
		const classes = useMhicViewDropdownToggleStyles();
		const classNameProp = useMemo(() => (className ?? '').replace('dropdown-toggle', ''), [className]);

		return (
			<Button
				bsPrefix="mhic-view-dropdown-toggle"
				ref={ref}
				className={classNames(classes.useMhicViewDropdownToggle, classNameProp)}
				style={style}
				onClick={onClick}
				disabled={disabled}
			>
				{children}
			</Button>
		);
	}
);
