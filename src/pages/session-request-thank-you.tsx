import React, { FC } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import useHeaderTitle from '@/hooks/use-header-title';
import colors from '@/jss/colors';

const useStyles = createUseStyles({
	card: {
		border: 0,
		borderRadius: 0,
		borderTop: `20px solid ${colors.success}`,
	},
});

const SessionRequestThankYou: FC = () => {
	const classes = useStyles();
	const history = useHistory<{ groupSessionName: string }>();

	useHeaderTitle('Request Studio Session');

	return (
		<Container className="pt-16">
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<Card className={classNames('mb-5 pt-10 pb-20 pl-6 pr-6', { [classes.card]: true })}>
						<h1 className="mb-5 font-size-xxl text-center">thank you for your interest</h1>
						<p className="mb-0 font-size-xxs text-center">
							Your request for {history.location.state?.groupSessionName} has been submitted, and a session manager will be contacting you soon.
						</p>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default SessionRequestThankYou;
