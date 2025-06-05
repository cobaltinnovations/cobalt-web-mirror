import React, { PropsWithChildren } from 'react';
import { Button } from 'react-bootstrap';
import MultiCarousel, { CarouselProps as MultiCarouselProps, ButtonGroupProps } from 'react-multi-carousel';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import { ReactComponent as LeftChevron } from '@/assets/icons/icon-chevron-left.svg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { createUseThemedStyles } from '@/jss/theme';

const gutterWidth = 30;

export const responsiveDefaults = {
	externalMonitor: {
		breakpoint: { max: 3000, min: 1201 },
		items: 3,
		partialVisibilityGutter: 0,
	},
	desktopExtraLarge: {
		breakpoint: { max: 1200, min: 993 },
		items: 3,
		partialVisibilityGutter: 0,
	},
	desktop: {
		breakpoint: { max: 992, min: 769 },
		items: 2,
		partialVisibilityGutter: 0,
	},
	tablet: {
		breakpoint: { max: 768, min: 575 },
		items: 1,
		partialVisibilityGutter: 0,
	},
	mobile: {
		breakpoint: { max: 575, min: 0 },
		items: 1,
		partialVisibilityGutter: 72,
	},
};

/* -------------------------------------------------------------------- */
/* Button Group */
/* -------------------------------------------------------------------- */
const useCustomButtonGroupStyles = createUseThemedStyles((theme) => ({
	carouselButton: {
		top: '50%',
		width: 48,
		height: 48,
		padding: 0,
		position: 'absolute',
		transform: 'translateY(-50%)',
		boxShadow: theme.elevation.e200,
	},
	carouselButtonPrevious: {
		left: gutterWidth / 2,
		transform: 'translate(-50%, -50%)',
	},
	carouselButtonNext: {
		right: gutterWidth / 2,
		transform: 'translate(50%, -50%)',
	},
}));

const CustomButtonGroup = ({ next, previous, carouselState }: ButtonGroupProps) => {
	const classes = useCustomButtonGroupStyles();

	let noMorePreviousSlides = true;
	let noMoreNextSlides = true;

	if (carouselState) {
		noMorePreviousSlides = carouselState.currentSlide === 0;

		if (carouselState.totalItems - carouselState.slidesToShow < 0) {
			noMoreNextSlides = true;
		} else {
			noMoreNextSlides = carouselState.currentSlide === carouselState.totalItems - carouselState.slidesToShow;
		}
	}

	return (
		<>
			<Button
				className={classNames(classes.carouselButton, classes.carouselButtonPrevious)}
				variant="light"
				disabled={noMorePreviousSlides}
				onClick={previous}
			>
				<LeftChevron />
			</Button>
			<Button
				className={classNames(classes.carouselButton, classes.carouselButtonNext)}
				variant="light"
				disabled={noMoreNextSlides}
				onClick={next}
			>
				<RightChevron />
			</Button>
		</>
	);
};

/* -------------------------------------------------------------------- */
/* Carousel */
/* -------------------------------------------------------------------- */
interface UseCarouselStylesProps {
	trackStyles?: React.CSSProperties;
}

const useCarouselStyles = createUseStyles({
	carouselOuter: ({ trackStyles }: UseCarouselStylesProps) => ({
		position: 'relative',
		marginLeft: -gutterWidth / 2,
		marginRight: -gutterWidth / 2,
		'& .react-multi-carousel-track': {
			paddingTop: 16,
			paddingBottom: 24,
		},
		...(trackStyles
			? {
					'& .react-multi-carousel-track': {
						...trackStyles,
					},
			  }
			: {}),
	}),
	carouselItem: {
		paddingLeft: gutterWidth / 2,
		paddingRight: gutterWidth / 2,
	},
});

interface CarouselProps extends MultiCarouselProps {
	trackStyles?: React.CSSProperties;
}

const Carousel = ({ children, trackStyles, ...rest }: PropsWithChildren<CarouselProps>) => {
	const { hasTouchScreen } = useTouchScreenCheck();
	const classes = useCarouselStyles({ trackStyles });

	return (
		<div className={classes.carouselOuter}>
			<MultiCarousel
				partialVisible={true}
				// disable swipe/touch until fix with page overscrolling
				swipeable={!hasTouchScreen}
				draggable={false}
				arrows={false}
				customButtonGroup={<CustomButtonGroup />}
				renderButtonGroupOutside={true}
				itemClass={classes.carouselItem}
				{...rest}
			>
				{children}
			</MultiCarousel>
		</div>
	);
};

export default Carousel;
