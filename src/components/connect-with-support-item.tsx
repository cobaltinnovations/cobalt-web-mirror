import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, ButtonProps, Modal } from 'react-bootstrap';
import Color from 'color';

import { AvailabilityTimeSlot, Provider } from '@/lib/models';
import { ProviderSection, providerService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';

interface UseStylesProps {
	showLeftGradient: boolean;
	showRightGradient: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	availabilityModal: {
		maxWidth: 720,
		'& .cobalt-modal__header': {
			padding: '56px 40px 24px',
			backgroundColor: theme.colors.n0,
			'& button.btn-close': {
				top: 16,
				transform: 'translateY(0)',
			},
		},
	},
	connectWithSupportItem: {
		padding: '24px 0',
	},
	informationOuter: {
		display: 'flex',
		marginBottom: 16,
		alignItems: 'center',
	},
	imageOuter: {
		width: 72,
		height: 72,
		flexShrink: 0,
		marginRight: 20,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n500,
	},
	information: {
		'& h5': {
			marginBottom: 2,
		},
		'& p': {
			margin: 0,
		},
	},
	descriptionOuter: {
		marginBottom: 28,
	},
	buttonsOuter: {
		position: 'relative',
		'&:before, &:after': {
			top: 0,
			width: 16,
			bottom: 0,
			zIndex: 1,
			content: '""',
			display: 'block',
			position: 'absolute',
			transition: '200ms transform',
		},
		'&:before': {
			left: 0,
			transform: ({ showLeftGradient }: UseStylesProps) =>
				showLeftGradient ? 'translateX(0)' : 'translateX(-16px)',
			background: `linear-gradient(-90deg, ${Color(theme.colors.background).alpha(0).string()} 0%, ${Color(
				theme.colors.background
			)
				.alpha(1)
				.string()} 100%);`,
		},
		'&:after': {
			right: 0,
			transform: ({ showRightGradient }: UseStylesProps) =>
				showRightGradient ? 'translateX(0)' : 'translateX(16px)',
			background: `linear-gradient(90deg, ${Color(theme.colors.background).alpha(0).string()} 0%, ${Color(
				theme.colors.background
			)
				.alpha(1)
				.string()} 100%);`,
		},
	},
	scrollOuter: {
		overflowX: 'auto',
	},
	scrollInner: {
		display: 'inline-flex',
		'& button': {
			marginRight: 4,
			'&:last-child': {
				marginRight: 0,
			},
		},
	},
	linksOuter: {
		paddingTop: 24,
	},
}));

interface ConnectWithSupportItemProps {
	providerId: string;
	imageUrl: string;
	title: string;
	subtitle?: string;
	descriptionHtml: string;
	buttons: ButtonProps[];
	showViewButton: boolean;
	onModalTimeButtonClick(sectionDate: string, availabilityTimeSlot: AvailabilityTimeSlot): void;
}

const ConnectWithSupportItem = ({
	providerId,
	imageUrl,
	title,
	subtitle,
	descriptionHtml,
	buttons,
	showViewButton,
	onModalTimeButtonClick,
}: ConnectWithSupportItemProps) => {
	const handleError = useHandleError();
	const scrollOuterRef = useRef<HTMLDivElement>(null);
	const scrollInnerRef = useRef<HTMLDivElement>(null);
	const [showLeftGradient, setShowLeftGradient] = useState(false);
	const [showRightGradient, setShowRightGradient] = useState(false);
	const [showAllAvailability, setShowAllAvailability] = useState(false);
	const [providerDetails, setProviderDetails] = useState<Provider>();
	const [providerAvailability, setProviderAvailability] = useState<ProviderSection[]>([]);

	const classes = useStyles({
		showLeftGradient,
		showRightGradient,
	});

	const determineGradientDisplayState = useCallback(() => {
		if (!scrollOuterRef.current || !scrollInnerRef.current) {
			return;
		}

		const containerWidth = scrollOuterRef.current.getBoundingClientRect().width;
		const contentWidth = scrollInnerRef.current.getBoundingClientRect().width;
		const scrollLeft = scrollOuterRef.current.scrollLeft;
		const scrollableDistance = contentWidth - containerWidth;

		if (scrollLeft > 0 && !showLeftGradient) {
			setShowLeftGradient(true);
		} else if (scrollLeft <= 0 && showLeftGradient) {
			setShowLeftGradient(false);
		}

		if (scrollLeft < scrollableDistance && !showRightGradient) {
			setShowRightGradient(true);
		} else if (scrollLeft >= scrollableDistance && showRightGradient) {
			setShowRightGradient(false);
		}
	}, [showLeftGradient, showRightGradient]);

	const handleButtonScroll = useCallback(() => {
		determineGradientDisplayState();
	}, [determineGradientDisplayState]);

	useEffect(() => {
		determineGradientDisplayState();
	}, [determineGradientDisplayState]);

	const handleModalEntering = useCallback(async () => {
		try {
			const [providerDetailResponse, findProvidersResponse] = await Promise.all([
				providerService.getProviderById(providerId).fetch(),
				providerService.findProviders({ providerId }).fetch(),
			]);

			setProviderDetails(providerDetailResponse.provider);
			setProviderAvailability(findProvidersResponse.sections);
		} catch (error) {
			handleError(error);
		}
	}, [handleError, providerId]);

	const handleModalExited = useCallback(() => {
		setProviderDetails(undefined);
		setProviderAvailability([]);
	}, []);

	return (
		<>
			<Modal
				centered
				show={showAllAvailability}
				onHide={() => {
					setShowAllAvailability(false);
				}}
				dialogClassName={classes.availabilityModal}
				onEntering={handleModalEntering}
				onExited={handleModalExited}
			>
				<Modal.Header closeButton>
					<div className={classes.informationOuter}>
						<div
							className={classes.imageOuter}
							style={{ backgroundImage: `url(${providerDetails?.imageUrl})` }}
						/>
						<div className={classes.information}>
							<h5>{providerDetails?.name}</h5>
							<p>{providerDetails?.title}</p>
						</div>
					</div>
					<p className="mb-0">Choose a time with {providerDetails?.name} that works for you</p>
				</Modal.Header>
				<Modal.Body>
					{providerAvailability.map((section) => {
						return (
							<React.Fragment key={section.date}>
								<div className="mb-3">
									<p className="mb-0 fw-bold">
										{section.dateDescription}{' '}
										{section.fullyBooked && <span className="text-gray">No Availability</span>}
									</p>
								</div>
								{!section.fullyBooked && (
									<div className="mb-3">
										{section.providers.map((provider, providerIndex) => (
											<React.Fragment key={`${provider.providerId}-${providerIndex}`}>
												{provider.times.map((time, timeIndex) => (
													<Button
														key={timeIndex}
														className="me-1 mb-2"
														onClick={() => {
															onModalTimeButtonClick(section.date, time);
														}}
														disabled={time.status !== 'AVAILABLE'}
													>
														{time.timeDescription}
													</Button>
												))}
											</React.Fragment>
										))}
									</div>
								)}
							</React.Fragment>
						);
					})}
				</Modal.Body>
			</Modal>

			<div className={classes.connectWithSupportItem}>
				<div className={classes.informationOuter}>
					<div className={classes.imageOuter} style={{ backgroundImage: `url(${imageUrl})` }} />
					<div className={classes.information}>
						<h5>{title}</h5>
						{subtitle && <p>{subtitle}</p>}
					</div>
				</div>
				{descriptionHtml && (
					<div className={classes.descriptionOuter}>
						<div
							dangerouslySetInnerHTML={{
								__html: descriptionHtml,
							}}
						/>
					</div>
				)}
				<div className={classes.buttonsOuter}>
					<div ref={scrollOuterRef} className={classes.scrollOuter} onScroll={handleButtonScroll}>
						<div ref={scrollInnerRef} className={classes.scrollInner}>
							{buttons.map(({ title, ...buttonProps }, buttonIndex) => (
								<Button key={buttonIndex} {...buttonProps}>
									{title}
								</Button>
							))}
						</div>
					</div>
				</div>
				{showViewButton && (
					<div className={classes.linksOuter}>
						<Button
							variant="link"
							className="p-0 fw-normal fs-default"
							onClick={() => {
								setShowAllAvailability(true);
							}}
						>
							View all availability
						</Button>
					</div>
				)}
			</div>
		</>
	);
};

export default ConnectWithSupportItem;
