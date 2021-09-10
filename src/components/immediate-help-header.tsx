import React, { FC } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const ImmediateHelpHeader: FC = () => {
	const { t } = useTranslation();
	return (
		<Container>
			<Col
				md={{ span: 10, offset: 1 }}
				lg={{ span: 8, offset: 2 }}
				xl={{ span: 6, offset: 3 }}
				style={{ marginTop: '1.75em' }}
			>
				<p className="pb-4 m-0">{t('immediateHelpHeader.subheader')}</p>
			</Col>
		</Container>
	);
};

export default ImmediateHelpHeader;
