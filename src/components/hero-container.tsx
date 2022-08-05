import React, { FC, PropsWithChildren } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

const useHeroContainerStyles = createUseThemedStyles((theme) => ({
	heroContainer: {
		padding: 0,
		backgroundColor: theme.colors.p50,
	},
}));

interface HeroContainerProps extends PropsWithChildren {
	className?: string;
}

const HeroContainer: FC<HeroContainerProps> = (props) => {
	const classes = useHeroContainerStyles();

	return (
		<Container className={classNames(props.className, classes.heroContainer)} fluid>
			<Container className="py-20">
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
