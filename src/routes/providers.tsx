import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import useAccount from '@/hooks/use-account';

import InputHelper from '@/components/input-helper';
import { PreviewCanvas } from '@/components/preview-canvas';
import ProviderSearchResult from '@/components/provider-search-result';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import ProviderScheduleModal from '@/components/provider-schedule-modal';
import ProviderInfoDetail from '@/components/provider-info-detail';
import {
	InstitutionFeature,
	InstitutionLocation,
	ProviderSearchResultModel,
	ProviderAppointmentSelectionTypeId,
} from '@/lib/models';
import { institutionService, providerService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NoData from '@/components/no-data';

export const loader = () => {
	return null;
};

export const Component = () => {
	/* -------------------------------- */
	/* General */
	/* -------------------------------- */
	const { institution } = useAccount();
	const placeholderImage = useRandomPlaceholderImage();
	const employerRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	/* -------------------------------- */
	/* Search Params */
	/* -------------------------------- */
	const [searchParams, setSearchParams] = useSearchParams();
	const featureId = useMemo(() => searchParams.get('featureId') ?? '', [searchParams]);
	const institutionLocationId = useMemo(() => searchParams.get('institutionLocationId') ?? '', [searchParams]);

	/* -------------------------------- */
	/* Filters */
	/* -------------------------------- */
	const [careTypes, setCareTypes] = useState<InstitutionFeature[]>([]);
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
	const [providers, setProviders] = useState<ProviderSearchResultModel[]>([]);

	/* -------------------------------- */
	/* Modals */
	/* -------------------------------- */
	const [selectedProvider, setSelectedProvider] = useState<ProviderSearchResultModel>();
	const [showProviderCanvas, setShowProviderCanvas] = useState(false);
	const [selectedProviderId, setSelectedProviderId] = useState('');

	const fetchFilters = useCallback(async () => {
		const [careTypesResponse, institutionLocationsResponse] = await Promise.all([
			institutionService.getCareTypes().fetch(),
			institutionService.getInstitutionLocations().fetch(),
		]);
		setCareTypes(careTypesResponse.careTypes);
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
				{selectedProvider && (
					<ProviderInfoDetail
						urlName={selectedProvider.imageUrl ?? '/#'}
						scheduleAppointmentDescription="Your first appointment is a {30 minute} {phone call} with a clinician to assess your needs and discuss potential resources."
						scheduleTypeId={ProviderAppointmentSelectionTypeId.APPOINTMENT_PREDETERMINED}
					/>
				)}
			</PreviewCanvas>

			<ProviderScheduleModal
				providerId={selectedProviderId}
				show={!!selectedProviderId}
				onHide={() => {
					setSelectedProviderId('');
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
									{careTypes.map((institutionFeature) => (
										<option key={institutionFeature.featureId} value={institutionFeature.featureId}>
											{institutionFeature.name}
										</option>
									))}
								</InputHelper>
								<InputHelper
									ref={employerRef}
									as="select"
									label="Employer"
									value={institutionLocationId}
									onChange={handleEmployerSelectChange}
								>
									<option value="" disabled>
										Select...
									</option>
									<option value="na">I'm not sure / I'd rather not say</option>
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
							{providers.length <= 0 && (
								<NoData
									title="Select your employer to see available providers"
									description="Your employment information will not be shared."
									actions={[
										{
											variant: 'primary',
											title: 'Select Employer',
											onClick: () => {
												employerRef.current?.focus();
											},
										},
									]}
								/>
							)}
							{providers.map((provider) => (
								<ProviderSearchResult
									key={provider.providerId}
									className="mb-6"
									imageUrl={provider.imageUrl ?? placeholderImage}
									title={provider.name ?? ''}
									description={provider.description ?? ''}
									scheduleAppointmentDescription={provider.appointmentDescription ?? ''}
									scheduleTypeId={ProviderAppointmentSelectionTypeId.APPOINTMENT_PREDETERMINED}
									firstAvailableAppointment={provider.firstAvailableAppointment ?? undefined}
									showMoreAppointmentsButton={true} //provider.hasMoreAppointments
									onTitleButtonClick={() => {
										setSelectedProvider(provider);
										setShowProviderCanvas(true);
									}}
									onViewAppointmentsButtonClick={() => {
										setSelectedProviderId(provider.providerId ?? '');
									}}
									onScheduleAppointmentButtonClick={() => {
										navigate('/provider-confirm-appointment-time');
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
