import React, { FC, PropsWithChildren } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseStyles } from 'react-jss';
import colors from '@/jss/colors';
import mediaQueries from '@/jss/media-queries';

const useDayContainerStyles = createUseStyles({
	dayContainer: {
		backgroundColor: 'transparent',
		[mediaQueries.md]: {
			backgroundColor: colors.white,
		},
	},
	dayContainerInner: {
		paddingTop: 15,
		[mediaQueries.md]: {
			padding: '5px 0',
		},
	},
});

interface DayContainerProps extends PropsWithChildren {
	className?: string;
}

const DayContainer: FC<DayContainerProps> = (props) => {
	const classes = useDayContainerStyles();

	return (
		<Container fluid className={classNames(props.className, classes.dayContainer)}>
			<Container className={classes.dayContainerInner}>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{props.children}
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default DayContainer;
