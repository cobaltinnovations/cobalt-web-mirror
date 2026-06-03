import React, { useCallback, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useAccount from '@/hooks/use-account';

import InputHelper from '@/components/input-helper';
import { PreviewCanvas } from '@/components/preview-canvas';
import ProviderSearchResult from '@/components/provider-search-result';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import ProviderScheduleModal from '@/components/provider-schedule-modal';
import ProviderInfoDetail from '@/components/provider-info-detail';
import { SCHEDULE_TYPE_ID } from '@/components/provider-next-appointment-card';
import { InstitutionLocation, Provider } from '@/lib/models';
import { institutionService, providerService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { useSearchParams } from 'react-router-dom';

export const loader = () => {
	return null;
};

export const Component = () => {
	/* -------------------------------- */
	/* General */
	/* -------------------------------- */
	const { institution } = useAccount();
	const placeholderImage = useRandomPlaceholderImage();

	/* -------------------------------- */
	/* Search Params */
	/* -------------------------------- */
	const [searchParams, setSearchParams] = useSearchParams();
	const featureId = useMemo(() => searchParams.get('featureId') ?? '', [searchParams]);
	const institutionLocationId = useMemo(() => searchParams.get('institutionLocationId') ?? '', [searchParams]);

	/* -------------------------------- */
	/* Filters */
	/* -------------------------------- */
	const institutionFeatures = institution.features;
	const [institutionLocations, setInstitutionLocations] = useState<InstitutionLocation[]>([]);
	const selectedInstitutionLocation = useMemo(
		() => institutionLocations.find((i) => i.institutionLocationId === institutionLocationId),
		[institutionLocationId, institutionLocations]
	);
	const selectedInstitutionFeature = useMemo(
		() => institutionFeatures.find((i) => i.featureId === featureId),
		[featureId, institutionFeatures]
	);

	/* -------------------------------- */
	/* List */
	/* -------------------------------- */
	const [providers, setProviders] = useState<Provider[]>([]);

	/* -------------------------------- */
	/* Modals */
	/* -------------------------------- */
	const [showProviderCanvas, setShowProviderCanvas] = useState(false);
	const [showProviderScheduleModal, setShowProviderScheduleModal] = useState(false);

	const fetchFilters = useCallback(async () => {
		const institutionLocationsResponse = await institutionService.getInstitutionLocations().fetch();
		setInstitutionLocations(institutionLocationsResponse.locations);
	}, []);

	const fetchProviders = useCallback(async () => {
		const response = await providerService
			.searchProviders({
				...(featureId && { featureId }),
				...(institutionLocationId && { institutionLocationId }),
			})
			.fetch();

		setProviders(response.providers);
	}, [featureId, institutionLocationId]);

	const handleCareTypeSelectChange = useCallback(
		async ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			if (currentTarget.value) {
				searchParams.set('featureId', currentTarget.value);
			} else {
				searchParams.delete('featureId');
			}

			setSearchParams(searchParams, { replace: true });
		},
		[searchParams, setSearchParams]
	);

	const handleEmployerSelectChange = useCallback(
		async ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
			if (currentTarget.value) {
				searchParams.set('institutionLocationId', currentTarget.value);
			} else {
				searchParams.delete('institutionLocationId');
			}

			setSearchParams(searchParams, { replace: true });
		},
		[searchParams, setSearchParams]
	);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Providers</title>
			</Helmet>

			<PreviewCanvas
				title={'Provider title'}
				show={showProviderCanvas}
				onHide={() => {
					setShowProviderCanvas(false);
				}}
			>
				<ProviderInfoDetail
					scheduleAppointmentDescription="Your first appointment is a {30 minute} {phone call} with a clinician to assess your needs and discuss potential resources."
					scheduleTypeId={SCHEDULE_TYPE_ID.APPOINTMENT_PREDETERMINED}
				/>
			</PreviewCanvas>

			<ProviderScheduleModal
				show={showProviderScheduleModal}
				onHide={() => {
					setShowProviderScheduleModal(false);
				}}
			/>

			<Container className="pt-10 pb-16">
				<Row className="mb-6">
					<Col>
						<h2 className="mb-2">Providers</h2>
						<p className="mb-6">
							Provider offerings may vary. Select your employer to see available providers and
							appointments.
						</p>
						<hr />
					</Col>
				</Row>
				<Row className="mb-6 mb-lg-8">
					<Col>
						<AsyncWrapper fetchData={fetchFilters}>
							<div className="d-flex">
								<InputHelper
									className="me-6"
									as="select"
									label="Care Type"
									value={featureId}
									onChange={handleCareTypeSelectChange}
								>
									<option value="" disabled>
										Select...
									</option>
									{institutionFeatures.map((institutionFeature) => (
										<option key={institutionFeature.featureId} value={institutionFeature.featureId}>
											{institutionFeature.name}
										</option>
									))}
								</InputHelper>
								<InputHelper
									as="select"
									label="Employer"
									value={institutionLocationId}
									onChange={handleEmployerSelectChange}
								>
									<option value="" disabled>
										Select...
									</option>
									<option value="N/A">I'm not sure / I'd rather not say</option>
									{institutionLocations.map((institutionLocation) => (
										<option
											key={institutionLocation.institutionLocationId}
											value={institutionLocation.institutionLocationId}
										>
											{institutionLocation.name}
										</option>
									))}
								</InputHelper>
							</div>
						</AsyncWrapper>
					</Col>
				</Row>
				<AsyncWrapper fetchData={fetchProviders}>
					<Row>
						<Col>
							<p className="mb-6 mb-lg-10">
								<strong>
									{providers.length} available {selectedInstitutionFeature?.name.toLocaleLowerCase()}{' '}
									provider{providers.length === 1 ? '' : 's'} for {selectedInstitutionLocation?.name}{' '}
									employees
								</strong>
							</p>
							{providers.map((provider) => (
								<ProviderSearchResult
									key={provider.providerId}
									className="mb-6"
									imageUrl={provider.imageUrl ?? placeholderImage}
									title={provider.name}
									description="The Employee Assistance Program (EAP) offers up to 8 sessions of free, confidential, solution-focused counseling per issue. An 'issue' is the reason for seeking support, such as relationship challenges or grief."
									scheduleAppointmentDescription="Your first appointment is a 30 minute phone call with a clinician to assess your needs and discuss potential resources."
									scheduleTypeId={SCHEDULE_TYPE_ID.APPOINTMENT_PREDETERMINED}
									onTitleButtonClick={() => {
										setShowProviderCanvas(true);
									}}
									onViewAppointmentsButtonClick={() => {
										setShowProviderScheduleModal(true);
									}}
								/>
							))}
						</Col>
					</Row>
				</AsyncWrapper>
			</Container>
		</>
	);
};
