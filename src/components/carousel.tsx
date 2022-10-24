import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import MultiCarousel, { CarouselProps as MultiCarouselProps, ButtonGroupProps } from 'react-multi-carousel';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import mediaQueries from '@/jss/media-queries';

import { ReactComponent as LeftChevron } from '@/assets/icons/icon-chevron-left.svg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';

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
const useCustomButtonGroupStyles = createUseStyles({
	customButtonGroupOuter: {
		top: 0,
		left: 0,
		right: 0,
		position: 'absolute',
		paddingLeft: gutterWidth / 2,
		paddingRight: gutterWidth / 2,
	},
	customButtonGroup: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		[mediaQueries.lg]: {
			display: 'block',
		},
	},
	descriptionText: {
		marginBottom: 0,
		[mediaQueries.lg]: {
			marginBottom: 16,
		},
	},
	carouselButtons: {
		width: 32,
		height: 32,
		padding: 0,
	},
});

interface CustomButtonGroupProps extends ButtonGroupProps {
	description?: string;
	calloutTitle?: string;
	calloutOnClick?(): void;
	onElementHeightChange(height: number): void;
}

const CustomButtonGroup = ({
	next,
	previous,
	carouselState,
	description,
	calloutTitle,
	calloutOnClick,
	onElementHeightChange,
}: CustomButtonGroupProps) => {
	const classes = useCustomButtonGroupStyles();
	const customButtonGroupRef = useRef<HTMLDivElement>(null);

	const getElementHeight = useCallback(() => {
		if (!customButtonGroupRef.current) {
			onElementHeightChange(0);
			return;
		}

		onElementHeightChange(customButtonGroupRef.current.clientHeight);
	}, [onElementHeightChange]);

	const handleWindowResize = useCallback(() => {
		getElementHeight();
	}, [getElementHeight]);

	useEffect(() => {
		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [handleWindowResize]);

	useEffect(() => {
		getElementHeight();
	}, [getElementHeight]);

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
		<div ref={customButtonGroupRef} className={classes.customButtonGroupOuter}>
			<div className={classes.customButtonGroup}>
				<div>{description && <p className={classes.descriptionText}>{description}</p>}</div>
				<div className="d-flex align-items-center justify-content-between">
					<div className="d-flex align-items-center">
						<Button
							className={classNames(classes.carouselButtons, 'me-4')}
							variant="light"
							size="sm"
							disabled={noMorePreviousSlides}
							onClick={previous}
						>
							<LeftChevron />
						</Button>
						<Button
							className={classes.carouselButtons}
							variant="light"
							size="sm"
							disabled={noMoreNextSlides}
							onClick={next}
						>
							<RightChevron />
						</Button>
					</div>
					{calloutTitle && (
						<Button
							className="ms-6 d-flex align-items-center"
							variant="light"
							size="sm"
							onClick={calloutOnClick}
						>
							{calloutTitle} <RightChevron />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

/* -------------------------------------------------------------------- */
/* Carousel */
/* -------------------------------------------------------------------- */
interface UseCarouselStylesProps {
	customButtonGroupHeight: number;
	trackStyles?: React.CSSProperties;
}

const useCarouselStyles = createUseStyles({
	carouselOuter: ({ customButtonGroupHeight, trackStyles }: UseCarouselStylesProps) => ({
		paddingTop: customButtonGroupHeight,
		position: 'relative',
		marginLeft: -gutterWidth / 2,
		marginRight: -gutterWidth / 2,
		'& .react-multi-carousel-track': {
			paddingTop: 16,
			paddingBottom: 24,
			...(trackStyles ? trackStyles : {}),
		},
	}),
	carouselItem: {
		paddingLeft: gutterWidth / 2,
		paddingRight: gutterWidth / 2,
	},
});

interface CarouselProps extends MultiCarouselProps {
	description?: string;
	calloutTitle?: string;
	calloutOnClick?(): void;
	trackStyles?: React.CSSProperties;
}

const Carousel = ({
	description,
	children,
	calloutTitle,
	calloutOnClick,
	trackStyles,
	...rest
}: PropsWithChildren<CarouselProps>) => {
	const [customButtonGroupHeight, setCustomButtonGroupHeight] = useState(0);
	const classes = useCarouselStyles({
		customButtonGroupHeight,
		trackStyles,
	});

	return (
		<div className={classes.carouselOuter}>
			<MultiCarousel
				partialVisible={true}
				draggable={false}
				arrows={false}
				customButtonGroup={
					<CustomButtonGroup
						description={description}
						calloutTitle={calloutTitle}
						calloutOnClick={calloutOnClick}
						onElementHeightChange={setCustomButtonGroupHeight}
					/>
				}
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
