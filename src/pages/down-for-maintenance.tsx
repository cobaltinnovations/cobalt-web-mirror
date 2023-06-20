import React, { ReactElement } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import InCrisisTemplate from '@/components/in-crisis-template';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as LogoIconText } from '@/assets/logos/logo-icon-and-text.svg';

const useStyles = createUseThemedStyles((theme) => ({
	logoIconText: {
		'& path': {
			fill: theme.colors.p500,
		},
	},
}));

const DownForMaintenance = (): ReactElement => {
	const classes = useStyles();

	return (
		<>
			<Helmet>
				<title>Cobalt | Maintenance</title>
			</Helmet>

			<Container className="pt-20">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<div className="d-flex justify-content-center mb-12">
							<LogoIconText className={classes.logoIconText} />
						</div>

						<p className="mb-2 text-center">
							We're sorry for the inconvenience, but Cobalt is temporarily offline for maintenance and
							will be back online shortly.
						</p>
						<p className="mb-8 text-center">
							If you need immediate help, please contact one of the following numbers:
						</p>

						<InCrisisTemplate />
						<div className="mb-8" />

						<h5 className="text-center">or go to your nearest emergency department or crisis center</h5>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default DownForMaintenance;
