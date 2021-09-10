import React, { FC } from 'react';
import { Col, Container } from 'react-bootstrap';
import Accordion from '@/components/accordion';
import { useTranslation } from 'react-i18next';

interface ConnectWithSupportHeaderProps {
	open: boolean;
	setOpenFunction: any; // setPaymentDisclaimerOpen
	handleCloseFunction: any; // handlePaymentDisclaimerDidClose
}
const ConnectWithSupportHeader: FC<ConnectWithSupportHeaderProps> = (props) => {
	const { t } = useTranslation();
	return (
		<Container className={'border-bottom'}>
			<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
				<Accordion
					open={props.open}
					onToggle={() => {
						props.setOpenFunction(!props.open);
					}}
					onDidClose={() => {
						props.handleCloseFunction();
					}}
					title="payment options vary by provider"
				>
					<p className="pb-4 m-0">{t('connectWithSupportHeader.paymentOptionsDisclaimer')}</p>
				</Accordion>
			</Col>
		</Container>
	);
};

export default ConnectWithSupportHeader;
