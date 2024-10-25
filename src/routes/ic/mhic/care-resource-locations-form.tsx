import { v4 as uuidv4 } from 'uuid';
import React, { useCallback, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { CARE_RESOURCE_TAG_GROUP_ID, CareResourceSpecialtyModel } from '@/lib/models';
import { careResourceService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import { AdminBadgeSelectControl, AdminFormSection } from '@/components/admin';
import InputHelper from '@/components/input-helper';
import Wysiwyg from '@/components/wysiwyg';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import {
	CareResourceLocationCardValueModel,
	MhicCareResourceFormHeader,
	MhicCareResourceLocationCard,
} from '@/components/integrated-care/mhic';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { careResourceId, careResourceLocationId } = params;

	const [payorsResponse, specialtiesResponse, careResourceLocationResponse] = await Promise.all([
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
		...(careResourceLocationId
			? [careResourceService.getCareResourceLocation(careResourceLocationId).fetch()]
			: []),
	]);

	return {
		careResourceId,
		payors: payorsResponse.careResourceTags,
		supportRoles: specialtiesResponse.careResourceTags,
		...(careResourceLocationResponse && {
			careResourceLocation: careResourceLocationResponse.careResourceLocation,
		}),
	};
};

export const Component = () => {
	const { payors, supportRoles, careResourceLocation } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const navigate = useNavigate();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [formValues, setFormValues] = useState({
		availability: careResourceLocation ? 'AVAILABLE' : 'AVAILABLE',
		clinicName: careResourceLocation ? careResourceLocation.name : '',
		phoneNumber: careResourceLocation ? careResourceLocation.phoneNumber : '',
		website: careResourceLocation ? careResourceLocation.websiteUrl : '',
		locations: (careResourceLocation ? [] : []) as CareResourceLocationCardValueModel[],
		insurance: careResourceLocation ? careResourceLocation.payors[0].payorId : '',
		specialties: careResourceLocation ? careResourceLocation.specialties : [],
		therapyTypes: careResourceLocation ? careResourceLocation.supportRoles.map((sr) => sr.supportRoleId) : [],
		notes: careResourceLocation ? '' : '',
	});

	const handleAddLocationButtonClick = useCallback(() => {
		const tempLocation = {
			id: uuidv4(),
			location: '',
			wheelchairAccessible: false,
			languages: [],
			uniquePhoneNumber: false,
			phoneNumber: '',
			notes: '',
		};

		setFormValues((previousValue) => ({
			...previousValue,
			locations: [...previousValue.locations, tempLocation],
		}));
	}, []);

	const handleFormSubmit = useCallback(async () => {
		try {
			// await careResourceService
			// 	.createCareResource({
			// 		name: formValues.clinicName,
			// 		notes: formValues.notes,
			// 		phoneNumber: formValues.phoneNumber,
			// 		websiteUrl: formValues.website,
			// 		resourceAvailable: formValues.availability === 'AVAILABLE',
			// 		specialtyIds: formValues.specialties.map((s) => s.careResourceSpecialtyId),
			// 		supportRoleIds: formValues.therapyTypes,
			// 		payorIds: [formValues.insurance],
			// 	})
			// 	.fetch();

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
	}, [addFlag, handleError, navigate]);

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
						title="Availability"
						description="Available resources are those currently accepting patients."
						alignHorizontally
					>
						<InputHelper
							as="select"
							label="Availability"
							name="availability"
							value={formValues.availability}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									availability: currentTarget.value,
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
							type="text"
							label="Clinic Name"
							name="clinic-name"
							value={formValues.clinicName}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									clinicName: currentTarget.value,
								}));
							}}
							required
						/>
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
							helperText="Primary phone number for patient inquiries and appointments"
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
					<AdminFormSection
						title="Location"
						description="Enter the location(s) where this resource is located."
					>
						{formValues.locations.map((location) => (
							<MhicCareResourceLocationCard
								key={location.id}
								className="mb-5"
								value={location}
								onChange={(newLocation) => {
									setFormValues((previousValue) => ({
										...previousValue,
										locations: previousValue.locations.map((l) =>
											l.id === newLocation.id ? newLocation : l
										),
									}));
								}}
								onDelete={() => {
									setFormValues((previousValue) => ({
										...previousValue,
										locations: previousValue.locations.filter((l) => l.id !== location.id),
									}));
								}}
							/>
						))}
						<Button
							type="button"
							className="d-flex align-items-center justify-content-center w-100"
							onClick={handleAddLocationButtonClick}
						>
							<PlusIcon className="me-2" />
							Add {formValues.locations.length > 0 ? 'Another ' : ''}Location
						</Button>
					</AdminFormSection>
					<hr />
					<AdminFormSection
						title="Insurance"
						description="Add insurance carriers that are accepted."
						alignHorizontally
					>
						<InputHelper
							as="select"
							label="Insurance"
							name="insurance"
							value={formValues.insurance}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									insurance: currentTarget.value,
								}));
							}}
						>
							<option value="" disabled>
								Select...
							</option>
							{payors.map((payor) => (
								<option key={payor.careResourceTagId} value={payor.careResourceTagId}>
									{payor.name}
								</option>
							))}
						</InputHelper>
					</AdminFormSection>
					<hr />
					<AdminFormSection title="Specialties" description="Select all issues treated." alignHorizontally>
						<TypeaheadHelper
							id="typeahead--specialties"
							label="Specialties"
							multiple
							labelKey="name"
							options={[]}
							selected={formValues.specialties}
							onChange={(selected) => {
								setFormValues((previousValues) => ({
									...previousValues,
									specialties: selected as CareResourceSpecialtyModel[],
								}));
							}}
						/>
					</AdminFormSection>
					<hr />
					<AdminFormSection title="Therapy Types" description="Select therapy types offered.">
						<AdminBadgeSelectControl
							idKey="careResourceTagId"
							labelKey="name"
							options={supportRoles}
							selections={formValues.therapyTypes}
							onChange={(selections) => {
								setFormValues((previousValue) => ({
									...previousValue,
									therapyTypes: selections,
								}));
							}}
						/>
					</AdminFormSection>
					<hr />
					<AdminFormSection title="Notes" description="Select therapy types offered.">
						<Wysiwyg
							className="bg-white"
							initialValue={formValues.notes}
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
