import React, { useCallback, useState } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { AdminBadgeSelectControl, AdminFormFooter, AdminFormSection } from '@/components/admin';
import InputHelper from '@/components/input-helper';
import Wysiwyg from '@/components/wysiwyg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import { careResourceService } from '@/lib/services';

export const loader = async () => {
	const [{ payors }, { supportRoles }] = await Promise.all([
		careResourceService.getPayors().fetch(),
		careResourceService.getSupportRoles().fetch(),
	]);

	return {
		payors,
		supportRoles,
	};
};

export const Component = () => {
	const { payors, supportRoles } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const navigate = useNavigate();
	const [formValues, setFormValues] = useState({
		availability: '',
		clinicName: '',
		phoneNumber: '',
		website: '',
		locations: [] as string[],
		insurance: '',
		specialties: '',
		therapyTypes: [] as string[],
		notes: '',
	});

	const handleFormSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
	}, []);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Add Resource</title>
			</Helmet>

			<Container fluid className="border-bottom">
				<Container className="py-10">
					<Row>
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h2 className="mb-1">
									<Link to="/ic/mhic/resources" className="text-decoration-none">
										Resources
									</Link>
									<RightChevron className="text-gray" />
									Add Resource
								</h2>
							</div>
							<p className="mb-0 fs-large">
								Complete all <span className="text-danger">*required fields</span> before publishing.
							</p>
						</Col>
					</Row>
				</Container>
			</Container>

			<Form className="pb-11" onSubmit={handleFormSubmit}>
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
							<option value="">TODO: Availability Options</option>
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
							required
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
							required
						/>
					</AdminFormSection>
					<hr />
					<AdminFormSection
						title="Location"
						description="Enter the location(s) where this resource is located."
						alignHorizontally
					>
						<Button>Add Location</Button>
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
							required
						>
							<option value="" disabled>
								Select...
							</option>
							{payors.map((payor) => (
								<option key={payor.payorId} value={payor.payorId}>
									{payor.name}
								</option>
							))}
						</InputHelper>
					</AdminFormSection>
					<hr />
					<AdminFormSection title="Specialties" description="Select all issues treated." alignHorizontally>
						<InputHelper
							as="select"
							label="Specialties"
							name="specialties"
							value={formValues.specialties}
							onChange={({ currentTarget }) => {
								setFormValues((previousValue) => ({
									...previousValue,
									specialties: currentTarget.value,
								}));
							}}
							required
						>
							<option value="">TODO: Specialties Options</option>
						</InputHelper>
					</AdminFormSection>
					<hr />
					<AdminFormSection title="Therapy Types" description="Select therapy types offered.">
						<AdminBadgeSelectControl
							idKey="supportRoleId"
							labelKey="description"
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
					<AdminFormFooter
						exitButtonType="button"
						onExit={() => {
							navigate('/ic/mhic/resources');
						}}
						exitLabel="Exit"
						nextButtonType="submit"
						onNext={() => {
							return;
						}}
						nextLabel="Add Resource"
					/>
				</Container>
			</Form>
		</>
	);
};
