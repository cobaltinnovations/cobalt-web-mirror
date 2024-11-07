import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Row, Col, OffcanvasProps } from 'react-bootstrap';

import { MhicPageHeader } from './mhic-page-header';
import InputHelperSearch from '@/components/input-helper-search';
import { SORT_DIRECTION, Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import { CARE_RESOURCE_TAG_GROUP_ID, CareResourceLocationModel, CareResourceTag } from '@/lib/models';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { Link } from 'react-router-dom';
import FilterDropdownV2 from '@/components/filter-dropdown-v2';
import InputHelper from '@/components/input-helper';
import { PreviewCanvas } from '@/components/preview-canvas';
import { careResourceService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

interface FormValues {
	searchName: string;
	zipCode: string;
	orderBy: string;
	distance?: {
		distanceId: string;
		title: string;
		value: number;
	};
	insurance: CareResourceTag[];
}

export const MhicCareResourceSearchModal: FC<OffcanvasProps> = ({ ...props }) => {
	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [careResourceLocations, setCareResourceLocations] = useState<CareResourceLocationModel[]>([]);
	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchInputValue, setSearchInputValue] = useState('');
	const [formValues, setFormValues] = useState<FormValues>({
		searchName: '',
		zipCode: '',
		orderBy: '',
		distance: undefined,
		insurance: [],
	});
	const [insuranceOptions, setInsuranceOptions] = useState<CareResourceTag[]>([]);

	const fetchFilterData = useCallback(async () => {
		try {
			const response = await careResourceService
				.getCareResourceTags({
					careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID.PAYORS,
				})
				.fetch();

			setInsuranceOptions(response.careResourceTags);
		} catch (error) {
			handleError(error);
		}
	}, [handleError]);

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);

			const distanceValue = formValues.distance?.value ?? 0;
			const response = await careResourceService
				.getCareResourceLocations({
					...(formValues.orderBy && { orderBy: formValues.orderBy as 'NAME_ASC' }),
					...(formValues.searchName && { searchQuery: formValues.searchName }),
					...(distanceValue > 0 && { searchRadiusMiles: distanceValue }),
					...(formValues.insurance.length > 0 && {
						payorIds: formValues.insurance.map((i) => i.careResourceTagId),
					}),
				})
				.fetch();

			setCareResourceLocations(response.careResourceLocations);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [formValues, handleError]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleOnEnter = useCallback(() => {
		setFormValues({
			searchName: '',
			zipCode: '',
			orderBy: '',
			distance: undefined,
			insurance: [],
		});

		fetchFilterData();
	}, [fetchFilterData]);

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
							className="me-2"
							id="distance-filter"
							title="Distance"
							optionIdKey="distanceId"
							optionLabelKey="title"
							options={[
								{
									distanceId: '5_MILES',
									title: '5 miles',
									value: 5,
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
							options={insuranceOptions}
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
									sortDirection={formValues.orderBy.split('_')[1] as SORT_DIRECTION}
									onSort={(sortDirection) => {
										setFormValues((previousValue) => ({
											...previousValue,
											orderBy: `NAME_${sortDirection}`,
										}));
									}}
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
									<TableCell>
										{careResourceLocation.payors.length > 0
											? careResourceLocation.payors.map((p) => p.name).join(', ')
											: 'Not provided'}
									</TableCell>
									<TableCell>
										{careResourceLocation.specialties.length > 0
											? careResourceLocation.specialties.map((p) => p.name).join(', ')
											: 'Not provided'}
									</TableCell>
									<TableCell className="flex-row align-items-center justify-content-start">
										[TODO]
									</TableCell>
									<TableCell className="flex-row align-items-center justify-content-end">
										<Button variant="outline-primary">Add</Button>
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
