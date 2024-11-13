import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Row, Col, OffcanvasProps } from 'react-bootstrap';

import { MhicPageHeader } from './mhic-page-header';
import InputHelperSearch from '@/components/input-helper-search';
import { SORT_DIRECTION, Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import {
	CARE_RESOURCE_TAG_GROUP_ID,
	CareResourceLocationModel,
	CareResourceTag,
	PatientOrderModel,
	PlaceModel,
} from '@/lib/models';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import FilterDropdownV2 from '@/components/filter-dropdown-v2';
import { PreviewCanvas } from '@/components/preview-canvas';
import { careResourceService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import { PreviewCanvasInternalShelf } from '@/components/preview-canvas-internal-shelf';
import { MhicCareResourceLocationDetails } from './mhic-care-resource-location-details';

interface Props extends OffcanvasProps {
	patientOrder: PatientOrderModel;
}

interface FormValues {
	searchName: string;
	address?: PlaceModel;
	orderBy: string;
	distance?: DistanceOption;
	insurance: CareResourceTag[];
}

interface DistanceOption {
	distanceId: string;
	title: string;
	value: number;
}

const distanceOptions: DistanceOption[] = [
	{
		distanceId: '5',
		title: '5 miles',
		value: 5,
	},
	{
		distanceId: '10',
		title: '10 miles',
		value: 10,
	},
	{
		distanceId: '15',
		title: '15 miles',
		value: 15,
	},
	{
		distanceId: '20',
		title: '20 miles',
		value: 20,
	},
	{
		distanceId: '25',
		title: '25 miles',
		value: 25,
	},
];

export const MhicCareResourceSearchModal: FC<Props> = ({ patientOrder, ...props }) => {
	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [careResourceLocations, setCareResourceLocations] = useState<CareResourceLocationModel[]>([]);
	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchInputValue, setSearchInputValue] = useState('');
	const [formValues, setFormValues] = useState<FormValues>({
		searchName: '',
		address: undefined,
		orderBy: '',
		distance: undefined,
		insurance: [],
	});
	const [placesOptions, setPlacesOptions] = useState<PlaceModel[]>([]);
	const [insuranceOptions, setInsuranceOptions] = useState<CareResourceTag[]>([]);

	const [showResourceLocation, setShowResourceLocation] = useState<string | undefined>(undefined);

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
			setCareResourceLocations([]);
		} finally {
			setIsLoading(false);
		}
	}, [formValues, handleError]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleOnEnter = useCallback(() => {
		const targetDistanceOption = distanceOptions.find((d) => d.value === patientOrder.inPersonCareRadius);

		setFormValues({
			searchName: '',
			address: patientOrder.patientAddress
				? {
						placeId: patientOrder.patientAddress.addressId,
						text: `${patientOrder.patientAddress.streetAddress1}, ${patientOrder.patientAddress.locality}, ${patientOrder.patientAddress.region}`,
				  }
				: undefined,
			orderBy: '',
			distance: targetDistanceOption ? targetDistanceOption : undefined,
			insurance: [],
		});

		fetchFilterData();
	}, [fetchFilterData, patientOrder.inPersonCareRadius, patientOrder.patientAddress]);

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
		<>
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
							<TypeaheadHelper
								style={{ width: 350 }}
								className="me-2"
								id="typeahead--address"
								label="Address"
								labelKey="text"
								fetchData={(query) =>
									careResourceService
										.getPlaces({
											searchText: query,
										})
										.fetch()
								}
								onFetchResolve={({ places }) => setPlacesOptions(places)}
								options={placesOptions}
								selected={formValues.address ? [formValues.address] : []}
								onChange={([selected]) => {
									setFormValues((previousValues) => ({
										...previousValues,
										address: selected as PlaceModel,
									}));
								}}
							/>
							<FilterDropdownV2
								className="me-2"
								id="distance-filter"
								title="Distance"
								optionIdKey="distanceId"
								optionLabelKey="title"
								options={distanceOptions}
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
											<Button
												variant="link"
												className="text-left text-decoration-none"
												onClick={() => {
													setShowResourceLocation(
														careResourceLocation.careResourceLocationId
													);
												}}
											>
												{careResourceLocation.name}
											</Button>
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

			<PreviewCanvasInternalShelf
				show={showResourceLocation}
				placement="end"
				onHide={() => {
					setShowResourceLocation(undefined);
				}}
			>
				<MhicCareResourceLocationDetails
					careResourceLocationId={showResourceLocation ?? ''}
					onClose={() => {
						setShowResourceLocation(undefined);
					}}
				/>
			</PreviewCanvasInternalShelf>
		</>
	);
};
