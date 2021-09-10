import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import colors from '@/jss/colors';

const useHeroContainerStyles = createUseStyles({
	heroContainer: {
		padding: 0,
		backgroundColor: colors.primary,
	},
});

interface HeroContainerProps {
	className?: string;
}

const HeroContainer: FC<HeroContainerProps> = (props) => {
	const classes = useHeroContainerStyles();

	return (
		<Container className={classNames(props.className, classes.heroContainer)} fluid>
			<Container className="pt-4 pb-5">
				<section>
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							{props.children}
						</Col>
					</Row>
				</section>
			</Container>
		</Container>
	);
};

export default HeroContainer;
