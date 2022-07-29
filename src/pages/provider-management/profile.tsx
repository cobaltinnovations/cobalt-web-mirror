import React, { ReactElement, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';

import { Provider } from '@/lib/models';
import { providerService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncPage from '@/components/async-page';
import BackgroundImageContainer from '@/components/background-image-container';

export const ProviderManagementProfile = (): ReactElement => {
	const navigate = useNavigate();
	const { account } = useAccount();
	const [provider, setProvider] = useState<Provider>();

	const fetchData = useCallback(async () => {
		if (!account) {
			throw new Error('account not found.');
		}

		if (!account.providerId) {
			throw new Error('account.providerId not found.');
		}

		const response = await providerService.getProviderById(account.providerId).fetch();
		setProvider(response.provider);
	}, [account]);

	return (
		<AsyncPage fetchData={fetchData}>
			<Container className="py-8">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<section className="mb-6">
							<div className="mb-4 d-flex align-items-center justify-content-between">
								<h4 className="m-0">the basics</h4>
								<Button
									className="p-0"
									variant="link"
									size="sm"
									onClick={() => {
										navigate(`/providers/${provider?.providerId}/basics`);
									}}
								>
									edit
								</Button>
							</div>

							<div className="mb-4">
								<h6>Name</h6>
								<p>{provider?.name}</p>
							</div>

							<div className="mb-4">
								<h6>Email</h6>
								<p>{provider?.emailAddress}</p>
							</div>

							<div className="mb-4">
								<h6>Title</h6>
								<p>{provider?.title}</p>
							</div>

							<div>
								<h6>Cobalt roles</h6>
								<p>{provider?.supportRolesDescription}</p>
							</div>
						</section>

						<section className="mb-6">
							<div className="mb-4 d-flex align-items-center justify-content-between">
								<h4 className="m-0">clinical background</h4>
								<Button
									className="p-0"
									variant="link"
									size="sm"
									onClick={() => {
										navigate(`/providers/${provider?.providerId}/clinical-background`);
									}}
								>
									edit
								</Button>
							</div>

							<div className="mb-4">
								<h6>Degree</h6>
								<p>[TODO]</p>
							</div>

							<div className="mb-4">
								<h6>Specialty</h6>
								<p>[TODO]</p>
							</div>

							<div className="mb-4">
								<h6>Works for...</h6>
								<p>[TODO]</p>
							</div>

							<div className="mb-4">
								<h6>at...</h6>
								<p>[TODO]</p>
							</div>

							<div>
								<h6>in the...</h6>
								<p>[TODO]</p>
							</div>
						</section>

						<section className="mb-6">
							<div className="mb-4 d-flex align-items-center justify-content-between">
								<h4 className="m-0">communication</h4>
								<Button
									className="p-0"
									variant="link"
									size="sm"
									onClick={() => {
										navigate(`/providers/${provider?.providerId}/communication`);
									}}
								>
									edit
								</Button>
							</div>

							<div className="mb-4">
								<h6>Send reservation confirmations to...</h6>
								<p>
									[TODO]
									<br />
									[TODO]
								</p>
							</div>

							<div className="mb-4">
								<h6>Patients should call...</h6>
								<p>[TODO]</p>
							</div>

							<div className="mb-4">
								<h6>My clock is set to...</h6>
								<p>[TODO]</p>
							</div>

							<div>
								<h6>They want to host calls on...</h6>
								<p>[TODO]</p>
							</div>
						</section>

						<section className="mb-6">
							<div className="mb-4 d-flex align-items-center justify-content-between">
								<h4 className="m-0">Bluejeans connection</h4>
								<Button
									className="p-0"
									variant="link"
									size="sm"
									onClick={() => {
										navigate(`/providers/${provider?.providerId}/bluejeans-connection`);
									}}
								>
									edit
								</Button>
							</div>

							<div className="mb-4">
								<h6>Do you have a Bluejeans account?</h6>
								<p>[TODO]</p>
							</div>

							<div>
								<h6>What email do you want to use?</h6>
								<p>[TODO]</p>
							</div>
						</section>

						<section className="mb-6">
							<div className="mb-2 d-flex align-items-center justify-content-between">
								<h4 className="m-0">payment types accepted</h4>
								<Button
									className="p-0"
									variant="link"
									size="sm"
									onClick={() => {
										navigate(`/providers/${provider?.providerId}/payment-types-accepted`);
									}}
								>
									edit
								</Button>
							</div>

							<div>
								<p>[TODO]</p>
							</div>
						</section>

						<section className="mb-6">
							<div className="mb-4 d-flex align-items-center justify-content-between">
								<h4 className="m-0">personal details</h4>
								<Button
									className="p-0"
									variant="link"
									size="sm"
									onClick={() => {
										navigate(`/providers/${provider?.providerId}/personal-details`);
									}}
								>
									edit
								</Button>
							</div>

							<div className="mb-4">
								<h6>Profile photo</h6>
								<div className="d-flex align-items-center">
									{provider?.imageUrl && (
										<BackgroundImageContainer
											className="me-4"
											size={90}
											imageUrl={provider.imageUrl}
										/>
									)}
									<div>
										<Button className="d-block p-0 mb-3" variant="link" size="sm">
											upload a new photo
										</Button>
										<Button className="d-block p-0" variant="link" size="sm">
											remove photo
										</Button>
									</div>
								</div>
							</div>
						</section>

						<section>
							<div>
								<div className="mb-2 d-flex align-items-center justify-content-between">
									<h4 className="m-0">cobalt bio</h4>
									<Button
										className="p-0"
										variant="link"
										size="sm"
										onClick={() => {
											navigate(`/providers/${provider?.providerId}/cobalt-bio`);
										}}
									>
										edit
									</Button>
								</div>
								<p>[TODO]</p>
							</div>
						</section>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};
