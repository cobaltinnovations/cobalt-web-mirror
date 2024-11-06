import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Row, Col, OffcanvasProps } from 'react-bootstrap';

import { MhicPageHeader } from './mhic-page-header';
import InputHelperSearch from '@/components/input-helper-search';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import { CARE_RESOURCE_TAG_GROUP_ID, CareResourceLocationModel, CareResourceTag } from '@/lib/models';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { Link } from 'react-router-dom';
import FilterDropdownV2 from '@/components/filter-dropdown-v2';
import InputHelper from '@/components/input-helper';
import { PreviewCanvas } from '@/components/preview-canvas';

interface FormValues {
	searchName: string;
	zipCode: string;
	distance?: {
		distanceId: string;
		title: string;
	};
	insurance: CareResourceTag[];
}

export const MhicCareResourceSearchModal: FC<OffcanvasProps> = ({ ...props }) => {
	const [isLoading] = useState(false);
	const [careResourceLocations] = useState<CareResourceLocationModel[]>([]);
	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchInputValue, setSearchInputValue] = useState('');

	const [formValues, setFormValues] = useState<FormValues>({
		searchName: '',
		zipCode: '',
		distance: undefined,
		insurance: [],
	});

	const handleOnEnter = useCallback(() => {
		setFormValues({
			searchName: '',
			zipCode: '',
			distance: undefined,
			insurance: [],
		});
	}, []);

	const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (searchInputValue) {
			setFormValues((previousValue) => ({
				...previousValue,
				searchName: searchInputValue,
			}));
		} else {
			setFormValues((previousValue) => ({
				...previousValue,
				searchName: '',
			}));
		}

		if (hasTouchScreen) {
			searchInputRef.current?.blur();
		}
	};

	const clearSearch = useCallback(() => {
		setSearchInputValue('');

		setFormValues((previousValue) => ({
			...previousValue,
			searchName: '',
		}));

		if (!hasTouchScreen) {
			searchInputRef.current?.focus();
		}
	}, [hasTouchScreen]);

	const handleKeydown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key !== 'Escape') {
				return;
			}

			clearSearch();
		},
		[clearSearch]
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeydown, false);

		return () => {
			document.removeEventListener('keydown', handleKeydown, false);
		};
	}, [handleKeydown]);

	return (
		<PreviewCanvas title="Available Resources" onEnter={handleOnEnter} {...props}>
			<Row className="mb-6">
				<Col>
					<MhicPageHeader title="Available Resources">
						<Form onSubmit={handleSearchFormSubmit}>
							<InputHelperSearch
								ref={searchInputRef}
								placeholder="Search name"
								value={searchInputValue}
								onChange={({ currentTarget }) => {
									setSearchInputValue(currentTarget.value);
								}}
								onClear={clearSearch}
							/>
						</Form>
					</MhicPageHeader>
				</Col>
			</Row>
			<Row className="mb-8">
				<Col>
					<hr />
				</Col>
			</Row>
			<Row className="mb-8">
				<Col>
					<div className="d-flex align-items-center">
						<Form.Label className="m-0 me-2">Location: </Form.Label>
						<InputHelper
							className="me-2"
							type="number"
							label="Zip Code"
							value={formValues.zipCode}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									zipCode: currentTarget.value,
								}));
							}}
						/>
						<FilterDropdownV2
							id="distance-filter"
							title="Distance"
							optionIdKey="distanceId"
							optionLabelKey="title"
							options={[
								{
									distanceId: '5_MILES',
									title: '5 miles',
								},
							]}
							value={formValues.distance}
							onChange={(newValue) => {
								setFormValues((previousValue) => ({
									...previousValue,
									distance: newValue,
								}));
							}}
						/>

						<FilterDropdownV2
							id="insurance-filter"
							title="Insurance"
							optionIdKey="careResourceTagId"
							optionLabelKey="name"
							options={[
								{
									careResourceTagId: 'AETNA',
									name: 'Aetna',
									careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID.PAYORS,
								},
							]}
							value={formValues.insurance[0]}
							onChange={(newValue) => {
								setFormValues((previousValue) => ({
									...previousValue,
									insurance: newValue ? [newValue] : [],
								}));
							}}
						/>
					</div>
				</Col>
			</Row>
			<Row className="mb-8">
				<Col>
					<Table isLoading={isLoading}>
						<TableHead>
							<TableRow>
								<TableCell
									className="flex-row align-items-center justify-content-start"
									header
									sortable
									// sortDirection={orderBy.split('_')[1] as SORT_DIRECTION}
									// onSort={(sortDirection) => {
									// 	searchParams.set('pageNumber', '0');
									// 	searchParams.set('orderBy', `NAME_${sortDirection}`);
									// 	setSearchParams(searchParams, { replace: true });
									// }}
								>
									Resource Name
								</TableCell>
								<TableCell header>Insurance</TableCell>
								<TableCell header>Specialties</TableCell>
								<TableCell header>Distance from zip</TableCell>
								<TableCell></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{careResourceLocations.map((careResourceLocation) => (
								<TableRow key={careResourceLocation.careResourceLocationId}>
									<TableCell>
										<Link to="/#">{careResourceLocation.name}</Link>
									</TableCell>
									<TableCell>{careResourceLocation.payors.map((p) => p.name).join(', ')}</TableCell>
									<TableCell>
										{careResourceLocation.specialties.map((p) => p.name).join(', ')}
									</TableCell>
									<TableCell className="flex-row align-items-center justify-content-start">
										5 miles
									</TableCell>
									<TableCell className="flex-row align-items-center justify-content-end">
										<Button variant="outline-primary" className="p-2 me-2">
											Add
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Col>
			</Row>
		</PreviewCanvas>
	);
};
