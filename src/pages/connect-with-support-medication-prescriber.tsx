import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';

import useAccount from '@/hooks/use-account';
import HeroContainer from '@/components/hero-container';
import ConnectWithSupportItem from '@/components/connect-with-support-item';

const ConnectWithSupportMedicationPrescriber = () => {
	const { pathname } = useLocation();
	const { institution } = useAccount();

	const featureDetails = useMemo(
		() => (institution?.features ?? []).find((feature) => pathname === feature.urlName),
		[institution?.features, pathname]
	);

	return (
		<>
			{featureDetails && (
				<HeroContainer className="bg-n75">
					<h1 className="mb-4 text-center">{featureDetails.name}</h1>
					<p className="mb-0 text-center fs-large">{featureDetails.description}</p>
				</HeroContainer>
			)}
			<Container>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<ConnectWithSupportItem
							providerId="MEDICATION_PRESCRIBER"
							imageUrl="/#"
							title="Penn Medicine TEAM Clinic"
							descriptionHtml="<p>
                                Based in Penn Psychiatry, the Time Efficient, Accessible, Multidisciplinary (TEAM) Clinic uses an
                                evidence-based and collaborative approach to diagnose and treat mental health conditions as part of
                                a 4-month long, outpatient program.
                            </p>
                            <p>
                                The TEAM clinic bills your insurance for visits and based on your specific plan you may have a small
                                co-pay. Any medication prescriptions would be sent to your pharmacy where you would be responsible
                                for any uncovered part of the prescription cost. You can use an HSA/FSA to cover these costs.
                            </p>
                            <p>Currently the TEAM clinic works with the following insurers:</p>
                            <ul>
                                <li>Quest Behavioral Health for Penn Medicine Employees</li>
                                <li>Aetna Student Health Plans for Penn and Drexel Students</li>
                                <li>Medicare A & B</li>
                                <li>Most Blue Cross/Blue Shield Plans</li>
                                <li>Most Aetna Plans</li>
                            </ul>
                            <p><strong>Available Mon-Fri, 8:30AM-2:00PM & 2:30-5:00PM<br/>Call to Schedule an Appointment</strong></p>"
							buttons={[
								{
									as: 'a',
									className: 'text-decoration-none',
									href: `tel:+12157466701`,
									title: 'Call (215) 746-6701',
								},
							]}
							showViewButton={false}
							onModalTimeButtonClick={() => {
								return;
							}}
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default ConnectWithSupportMedicationPrescriber;
