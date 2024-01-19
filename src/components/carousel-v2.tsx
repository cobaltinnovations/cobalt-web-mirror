import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React, { FC, PropsWithChildren, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Carousel, { ButtonGroupProps } from 'react-multi-carousel';

import { ReactComponent as LeftChevron } from '@/assets/icons/icon-chevron-left.svg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';

const gutterWidth = 30;
const responsiveConfig = {
	superLargeDesktop: {
		// the naming can be any, depends on you.
		breakpoint: { max: 4000, min: 3000 },
		items: 5,
	},
	desktop: {
		breakpoint: { max: 3000, min: 1024 },
		items: 3,
	},
	tablet: {
		breakpoint: { max: 1024, min: 464 },
		items: 2,
	},
	mobile: {
		breakpoint: { max: 464, min: 0 },
		items: 1,
	},
};

const useButtonStyles = createUseThemedStyles(() => ({
	button: {
		top: '50%',
		padding: 8,
		position: 'absolute',
		transform: 'translate(-50%, -50%)',
	},
	previousButton: {
		left: 0,
		transform: 'translate(-50%, -50%)',
	},
	nextButton: {
		right: 0,
		transform: 'translate(50%, -50%)',
	},
}));

const ButtonGroup = ({ next, previous, carouselState }: ButtonGroupProps) => {
	const classes = useButtonStyles();

	const [showPreviousButton, setShowPreviousButton] = useState(false);
	const [showNextButton, setShowNextButton] = useState(false);

	useEffect(() => {
		if (!carouselState) {
			return;
		}

		setShowPreviousButton(carouselState.currentSlide > 0);
		setShowNextButton(carouselState.currentSlide !== carouselState.totalItems - carouselState.slidesToShow);
	}, [carouselState]);

	return (
		<>
			{showPreviousButton && (
				<Button
					variant="light"
					className={classNames(classes.button, classes.previousButton)}
					onClick={previous}
				>
					<LeftChevron />
				</Button>
			)}
			{showNextButton && (
				<Button variant="light" className={classNames(classes.button, classes.nextButton)} onClick={next}>
					<RightChevron />
				</Button>
			)}
		</>
	);
};

const useCarouselStyles = createUseThemedStyles(() => ({
	carousel: {
		position: 'relative',
	},
	carouselContainer: {
		overflow: 'visible',
		overflowX: 'clip',
		margin: `0 -${gutterWidth / 2}px`,
	},
	carouselItem: {
		padding: `0 ${gutterWidth / 2}px`,
	},
}));

interface CarouselV2Props {
	className?: string;
}

const CarouselV2: FC<PropsWithChildren<CarouselV2Props>> = ({ className, children }) => {
	const classes = useCarouselStyles();
	return (
		<div className={classNames(classes.carousel, className)}>
			<Carousel
				responsive={responsiveConfig}
				arrows={false}
				renderButtonGroupOutside={true}
				customButtonGroup={<ButtonGroup />}
				containerClass={classes.carouselContainer}
				itemClass={classes.carouselItem}
			>
				{children}
			</Carousel>
		</div>
	);
};

export default CarouselV2;
