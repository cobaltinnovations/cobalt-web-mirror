import React, { useCallback, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { CARE_RESOURCE_TAG_GROUP_ID, CareResourceTag, PlaceModel } from '@/lib/models';
import { careResourceService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import { MhicCareResourceFormHeader } from '@/components/integrated-care/mhic';
import { AdminBadgeSelectControl, AdminFormSection } from '@/components/admin';
import InputHelper from '@/components/input-helper';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import WysiwygBasic from '@/components/wysiwyg-basic';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { careResourceId, careResourceLocationId } = params;

	const [
		payorsResponse,
		specialtiesResponse,
		therapyTypesResponse,
		populationServedResponse,
		gendersResponse,
		ethnicitiesResponse,
		languagesResponse,
		careResourceLocationResponse,
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
				careResourceTagGroupId: CARE_RESOURCE_TAG_GROUP_ID.GENDERS,
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
		...(careResourceLocationId
			? [careResourceService.getCareResourceLocation(careResourceLocationId).fetch()]
			: []),
	]);

	return {
		careResourceId,
		payors: payorsResponse.careResourceTags,
		specialties: specialtiesResponse.careResourceTags,
		therapyTypes: therapyTypesResponse.careResourceTags,
		populationsServed: populationServedResponse.careResourceTags,
		genders: gendersResponse.careResourceTags,
		ethnicities: ethnicitiesResponse.careResourceTags,
		languages: languagesResponse.careResourceTags,
		...(careResourceLocationResponse && {
			careResourceLocation: careResourceLocationResponse.careResourceLocation,
		}),
	};
};

export const Component = () => {
	const {
		careResourceId,
		payors,
		specialties,
		therapyTypes,
		populationsServed,
		genders,
		ethnicities,
		languages,
		careResourceLocation,
	} = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const navigate = useNavigate();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [placesOptions, setPlacesOptions] = useState<PlaceModel[]>([]);
	const [formValues, setFormValues] = useState({
		careResourceId: careResourceId ?? careResourceLocation?.careResourceId ?? '',
		locationName: careResourceLocation?.name ?? '',
		status: careResourceLocation?.acceptingNewPatients ? 'AVAILABLE' : 'UNAVAILABLE',
		phoneNumber: careResourceLocation?.phoneNumber ?? '',
		emailAddress: '',
		website: careResourceLocation?.websiteUrl ?? '',
		address: undefined as undefined | PlaceModel,
		address2: '',
		insurance: careResourceLocation ? careResourceLocation.payors : [],
		specialties: careResourceLocation ? careResourceLocation.specialties : [],
		therapyTypes: careResourceLocation ? careResourceLocation.therapyTypes : [],
		ages: careResourceLocation ? careResourceLocation.populationServed : [],
		genders: careResourceLocation ? careResourceLocation.genders : [],
		ethnicities: careResourceLocation ? careResourceLocation.ethnicities : [],
		languages: careResourceLocation ? careResourceLocation.languages : [],
		notes: careResourceLocation?.notes ?? '',
	});

	const handleFormSubmit = useCallback(async () => {
		try {
			await careResourceService
				.createCareResourceLocation({
					careResourceId: formValues.careResourceId,
					googlePlaceId: formValues.address?.placeId ?? '',
					name: formValues.locationName,
					notes: formValues.notes,
					emailAddress: formValues.emailAddress,
					streetAddress2: formValues.address2,
					insuranceNotes: '',
					phoneNumber: formValues.phoneNumber,
					websiteUrl: formValues.website,
					acceptingNewPatients: formValues.status === 'AVAILABLE',
					wheelchairAccess: false,
					payorIds: formValues.insurance.map((i) => i.careResourceTagId),
					specialtyIds: formValues.specialties.map((i) => i.careResourceTagId),
					therapyTypeIds: formValues.therapyTypes.map((i) => i.careResourceTagId),
					populationServedIds: formValues.ages.map((i) => i.careResourceTagId),
					genderIds: formValues.genders.map((i) => i.careResourceTagId),
					ethnicityIds: formValues.ethnicities.map((i) => i.careResourceTagId),
					languageIds: formValues.languages.map((i) => i.careResourceTagId),
				})
				.fetch();

			addFlag({
				variant: 'success',
				title: 'Resource Location Created',
				description: 'This resource location can now be used to create Resource Packets.',
				actions: [],
			});

			navigate(-1);
		} catch (error) {
			handleError(error);
		}
	}, [addFlag, formValues, handleError, navigate]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Add Resource Location</title>
			</Helmet>

			{/* path matching logic in mhic-header.tsx hides the default header */}
			<MhicCareResourceFormHeader onAddLocationButtonClick={handleFormSubmit} />

			<Container fluid className="border-bottom">
				<Container className="py-10">
					<Row>
						<Col>
							<h2 className="mb-2">Add Resource Location</h2>
							<p className="mb-0 fs-large">
								Complete all <span className="text-danger">*required fields</span> before publishing.
							</p>
						</Col>
					</Row>
				</Container>
			</Container>

			<Form className="pb-11">
				<Container className="pb-10">
					<AdminFormSection
						title="Associated Resource"
						description="If there is no relevant resource, then contact an Admin."
						alignHorizontally
					>
						<InputHelper
							as="select"
							label="Resource"
							name="resource"
							value={formValues.careResourceId}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									careResourceId: currentTarget.value,
								}));
							}}
							disabled={!!careResourceId}
							required
						>
							<option value="">TODO</option>
						</InputHelper>
					</AdminFormSection>
					<hr />
					<AdminFormSection
						title="Location Name (optional)"
						description="Add a secondary name to distinguish this location in the list."
						alignHorizontally
					>
						<InputHelper
							className="mb-3"
							type="text"
							label="Location Name"
							name="location-name"
							value={formValues.locationName}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									locationName: currentTarget.value,
								}));
							}}
						/>
					</AdminFormSection>
					<hr />
					<AdminFormSection
						title="Status"
						description="Is this location accepting new patients?"
						alignHorizontally
					>
						<InputHelper
							as="select"
							label="Status"
							name="status"
							value={formValues.status}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									status: currentTarget.value,
								}));
							}}
							required
						>
							<option value="AVAILABLE">Available</option>
							<option value="UNAVAILABLE">Unavailable</option>
						</InputHelper>
					</AdminFormSection>
					<hr />
					<AdminFormSection title="Contact" description="Provide contact information for this resource.">
						<InputHelper
							className="mb-3"
							type="tel"
							label="Phone Number"
							name="phone-number"
							value={formValues.phoneNumber}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									phoneNumber: currentTarget.value,
								}));
							}}
							required
						/>
						<InputHelper
							className="mb-3"
							type="email"
							label="Email"
							name="email"
							value={formValues.emailAddress}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									emailAddress: currentTarget.value,
								}));
							}}
						/>
						<InputHelper
							type="url"
							label="Website"
							name="website"
							value={formValues.website}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									website: currentTarget.value,
								}));
							}}
						/>
					</AdminFormSection>
					<hr />
					<AdminFormSection title="Address">
						<TypeaheadHelper
							className="mb-3"
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
						<InputHelper
							type="text"
							label="Address 2"
							name="address-2"
							value={formValues.address2}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									address2: currentTarget.value,
								}));
							}}
							helperText="Use address 2 to specify a suite or floor #"
						/>
					</AdminFormSection>
					<hr />
					<AdminFormSection
						title="Insurance"
						description="Add insurance carriers that are accepted."
						alignHorizontally
					>
						<TypeaheadHelper
							id="typeahead--insurance"
							label="Insurance"
							multiple
							labelKey="name"
							options={payors}
							selected={formValues.insurance}
							onChange={(selected) => {
								setFormValues((previousValues) => ({
									...previousValues,
									insurance: selected as CareResourceTag[],
								}));
							}}
						/>
					</AdminFormSection>
					<hr />
					<AdminFormSection title="Specialties" description="Select all issues treated." alignHorizontally>
						<TypeaheadHelper
							id="typeahead--specialties"
							label="Specialties"
							multiple
							labelKey="name"
							options={specialties}
							selected={formValues.specialties}
							onChange={(selected) => {
								setFormValues((previousValues) => ({
									...previousValues,
									specialties: selected as CareResourceTag[],
								}));
							}}
						/>
					</AdminFormSection>
					<hr />
					<AdminFormSection
						title="Therapy Types"
						description="Select therapy types offered."
						alignHorizontally
					>
						<TypeaheadHelper
							id="typeahead--therapy-types"
							label="Therapy Types"
							multiple
							labelKey="name"
							options={therapyTypes}
							selected={formValues.therapyTypes}
							onChange={(selected) => {
								setFormValues((previousValues) => ({
									...previousValues,
									therapyTypes: selected as CareResourceTag[],
								}));
							}}
						/>
					</AdminFormSection>
					<hr />
					<AdminFormSection
						title="Population Served"
						description="What type of patients does this location serve?"
					>
						<Form.Group className="mb-0">
							<Form.Label>Age</Form.Label>
							<AdminBadgeSelectControl
								idKey="careResourceTagId"
								labelKey="name"
								options={populationsServed}
								selections={formValues.ages}
								onChange={(selections) => {
									setFormValues((previousValue) => ({
										...previousValue,
										ages: selections,
									}));
								}}
							/>
						</Form.Group>
					</AdminFormSection>
					<hr />
					<AdminFormSection
						title="Provider Details"
						description="Enter details about providers at this location"
					>
						<Form.Group className="mb-6">
							<Form.Label className="mb-2">Gender</Form.Label>
							<AdminBadgeSelectControl
								idKey="careResourceTagId"
								labelKey="name"
								options={genders}
								selections={formValues.genders}
								onChange={(selections) => {
									setFormValues((previousValue) => ({
										...previousValue,
										genders: selections,
									}));
								}}
							/>
						</Form.Group>
						<Form.Group className="mb-6">
							<Form.Label className="mb-2">Ethnicity</Form.Label>
							<AdminBadgeSelectControl
								idKey="careResourceTagId"
								labelKey="name"
								options={ethnicities}
								selections={formValues.ethnicities}
								onChange={(selections) => {
									setFormValues((previousValue) => ({
										...previousValue,
										ethnicities: selections,
									}));
								}}
							/>
						</Form.Group>
						<Form.Group className="mb-0">
							<Form.Label className="mb-2">Languages Spoken</Form.Label>
							<AdminBadgeSelectControl
								idKey="careResourceTagId"
								labelKey="name"
								options={languages}
								selections={formValues.languages}
								onChange={(selections) => {
									setFormValues((previousValue) => ({
										...previousValue,
										languages: selections,
									}));
								}}
							/>
						</Form.Group>
					</AdminFormSection>
					<hr />
					<AdminFormSection
						title="Location Notes"
						description="Add more details about this location and include what patients can expect when they schedule or attend an appointment here."
					>
						<WysiwygBasic
							value={formValues.notes}
							onChange={(htmlContent) => {
								setFormValues((previousValue) => ({
									...previousValue,
									notes: htmlContent,
								}));
							}}
						/>
					</AdminFormSection>
				</Container>
			</Form>
		</>
	);
};
