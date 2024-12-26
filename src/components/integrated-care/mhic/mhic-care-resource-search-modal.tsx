import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Row, Col, OffcanvasProps } from 'react-bootstrap';

import { MhicPageHeader } from './mhic-page-header';
import InputHelperSearch from '@/components/input-helper-search';
import { SORT_DIRECTION, Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import { CARE_RESOURCE_TAG_GROUP_ID, CareResourceLocationModel, PatientOrderModel, PlaceModel } from '@/lib/models';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { PreviewCanvas } from '@/components/preview-canvas';
import { careResourceService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import { PreviewCanvasInternalShelf } from '@/components/preview-canvas-internal-shelf';
import { MhicCareResourceLocationDetails } from './mhic-care-resource-location-details';
import MegaFilter, { Filter, FILTER_TYPE, FilterOption, megaFilterValueAsSearchParams } from '@/components/mega-filter';

interface Props extends OffcanvasProps {
	patientOrder: PatientOrderModel;
}

interface FormValues {
	searchName: string;
	address?: PlaceModel;
	distance: Filter[];
	insurance: Filter[];
	megaFilter: Filter[];
	orderBy: string;
}

const distanceOptions: FilterOption[] = [
	{
		title: '5 miles',
		value: '5',
	},
	{
		title: '10 miles',
		value: '10',
	},
	{
		title: '15 miles',
		value: '15',
	},
	{
		title: '20 miles',
		value: '20',
	},
	{
		title: '25 miles',
		value: '25',
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
		distance: [],
		insurance: [],
		megaFilter: [],
		orderBy: '',
	});
	const [placesOptions, setPlacesOptions] = useState<PlaceModel[]>([]);
	const [showResourceLocation, setShowResourceLocation] = useState<string | undefined>(undefined);

	const fetchFilterData = useCallback(async () => {
		try {
			const [
				payorsResponse,
				specialtiesResponse,
				therapyTypesResponse,
				populationServedResponse,
				ethnicitiesResponse,
				languagesResponse,
				facilityTypesResponse,
			] = await Promise.all([
				careResourceService
					.getCareResourceTags({
						careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID.PAYORS,
					})
					.fetch(),
				careResourceService
					.getCareResourceTags({
						careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID.SPECIALTIES,
					})
					.fetch(),
				careResourceService
					.getCareResourceTags({
						careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID.THERAPY_TYPES,
					})
					.fetch(),
				careResourceService
					.getCareResourceTags({
						careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID.POPULATION_SERVED,
					})
					.fetch(),
				careResourceService
					.getCareResourceTags({
						careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID.ETHNICITIES,
					})
					.fetch(),
				careResourceService
					.getCareResourceTags({
						careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID.LANGUAGES,
					})
					.fetch(),
				careResourceService
					.getCareResourceTags({
						careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID.FACILITY_TYPES,
					})
					.fetch(),
			]);

			return {
				payorsResponse,
				specialtiesResponse,
				therapyTypesResponse,
				populationServedResponse,
				ethnicitiesResponse,
				languagesResponse,
				facilityTypesResponse,
			};
		} catch (error) {
			throw error;
		}
	}, []);

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);

			const response = await careResourceService
				.getCareResourceLocations({
					...(formValues.searchName && { searchQuery: formValues.searchName }),
					...megaFilterValueAsSearchParams(formValues.distance),
					...megaFilterValueAsSearchParams(formValues.insurance),
					...megaFilterValueAsSearchParams(formValues.megaFilter),
					...(formValues.orderBy && { orderBy: formValues.orderBy as 'NAME_ASC' }),
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

	const handleOnEnter = useCallback(async () => {
		const targetDistanceOption = distanceOptions.find((d) => d.value === `${patientOrder.inPersonCareRadius}`);

		try {
			const filterData = await fetchFilterData();

			setFormValues({
				searchName: '',
				address: patientOrder.patientAddress
					? {
							placeId: patientOrder.patientAddress.addressId,
							text: `${patientOrder.patientAddress.streetAddress1}, ${patientOrder.patientAddress.locality}, ${patientOrder.patientAddress.region}`,
					  }
					: undefined,
				orderBy: '',
				distance: [
					{
						id: 'searchRadiusMiles',
						filterType: FILTER_TYPE.RADIO,
						title: 'Distance',
						value: targetDistanceOption ? [targetDistanceOption.value] : [],
						options: distanceOptions,
					},
				],
				insurance: [
					{
						id: 'payorIds',
						filterType: FILTER_TYPE.RADIO,
						title: 'Specialties',
						value: [],
						options: filterData.payorsResponse.careResourceTags.map((tag) => ({
							value: tag.careResourceTagId,
							title: tag.name,
						})),
					},
				],
				megaFilter: [
					{
						id: 'specialtyIds',
						filterType: FILTER_TYPE.CHECKBOX,
						title: 'Specialties',
						value: [],
						options: filterData.specialtiesResponse.careResourceTags.map((tag) => ({
							value: tag.careResourceTagId,
							title: tag.name,
						})),
					},
					{
						id: 'therapyTypeIds',
						filterType: FILTER_TYPE.CHECKBOX,
						title: 'Therapy Types',
						value: [],
						options: filterData.therapyTypesResponse.careResourceTags.map((tag) => ({
							value: tag.careResourceTagId,
							title: tag.name,
						})),
					},
					{
						id: 'facilityType',
						filterType: FILTER_TYPE.CHECKBOX,
						title: 'Facility Type',
						value: [],
						options: filterData.facilityTypesResponse.careResourceTags.map((tag) => ({
							value: tag.careResourceTagId,
							title: tag.name,
						})),
					},
					{
						id: 'wheelchairAccess',
						filterType: FILTER_TYPE.CHECKBOX,
						title: 'Accessibility',
						value: [],
						options: [],
					},
					{
						id: 'populationServedIds',
						filterType: FILTER_TYPE.CHECKBOX,
						title: 'Population Served',
						value: [],
						options: filterData.populationServedResponse.careResourceTags.map((tag) => ({
							value: tag.careResourceTagId,
							title: tag.name,
						})),
					},
					{
						id: 'languageIds',
						filterType: FILTER_TYPE.CHECKBOX,
						title: 'Languages Spoken',
						value: [],
						options: filterData.languagesResponse.careResourceTags.map((tag) => ({
							value: tag.careResourceTagId,
							title: tag.name,
						})),
					},
					{
						id: 'ethnicityIds',
						filterType: FILTER_TYPE.CHECKBOX,
						title: 'Provider Ethnicity',
						value: [],
						options: filterData.ethnicitiesResponse.careResourceTags.map((tag) => ({
							value: tag.careResourceTagId,
							title: tag.name,
						})),
					},
					{
						id: 'mega-filter--provider-faith',
						filterType: FILTER_TYPE.CHECKBOX,
						title: 'Provider Faith',
						value: [],
						options: [],
					},
				],
			});
		} catch (error) {
			handleError(error);
		}
	}, [fetchFilterData, handleError, patientOrder.inPersonCareRadius, patientOrder.patientAddress]);

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
							<MegaFilter
								className="me-2"
								allowCollapse={false}
								displaySingleColumn={true}
								buttonTitle="Distance"
								modalTitle="Select Distance"
								value={formValues.distance}
								onChange={(value) => {
									setFormValues((previousValue) => ({
										...previousValue,
										distance: value,
									}));
								}}
							/>
							<MegaFilter
								className="me-2"
								allowCollapse={false}
								buttonTitle="Insurance"
								modalTitle="Select Insurance"
								value={formValues.insurance}
								onChange={(value) => {
									setFormValues((previousValue) => ({
										...previousValue,
										insurance: value,
									}));
								}}
							/>
							<MegaFilter
								displayFilterIcon
								displayDownArrow={false}
								buttonTitle="More Filters"
								modalTitle="Select Filters"
								value={formValues.megaFilter}
								onChange={(value) => {
									setFormValues((previousValue) => ({
										...previousValue,
										megaFilter: value,
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
												className="p-0 text-left text-decoration-none"
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
