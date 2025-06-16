import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as Logo } from '@/assets/logos/logo-cobalt-horizontal.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { ReactComponent as Illustration } from '@/assets/illustrations/sign-in.svg';

interface UseStylesProps {
	backgroundImage?: string;
}

const useStyles = createUseThemedStyles((theme) => ({
	halfLayout: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 0,
		display: 'flex',
		position: 'fixed',
		[mediaQueries.lg]: {
			display: 'block',
			position: 'static',
		},
	},
	col: {
		flex: 1,
		flexShrink: 0,
		display: 'flex',
		position: 'relative',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
		[mediaQueries.lg]: {
			position: 'static',
		},
	},
	leftColInner: {
		width: '100%',
		overflowY: 'auto',
		padding: '64px 0',
		position: 'relative',
		[mediaQueries.lg]: {
			padding: 0,
			overflowY: 'visible',
		},
	},
	rightCol: {
		flex: 1,
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
		background: ({ backgroundImage }: UseStylesProps) =>
			backgroundImage
				? `url(${backgroundImage}) center / cover no-repeat`
				: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
		[mediaQueries.lg]: {
			display: 'none',
		},
	},
	logoOuter: {
		marginBottom: 30,
		textAlign: 'center',
		[mediaQueries.lg]: {
			display: 'none',
		},
	},
	brandingOuter: {
		maxWidth: 140,
		margin: '0 auto 30px auto',
		'& img': {
			width: '100%',
		},
	},
	form: {
		width: '80%',
		maxWidth: 380,
		margin: '0 auto',
	},
	illustration: {
		maxWidth: 548,
		margin: '0 auto',
		display: 'block',
		maxHeight: '80vh',
	},
	inCrisisButtonOuter: {
		top: 40,
		right: 40,
		position: 'absolute',
	},
	mobileHeader: {
		top: 0,
		display: 'none',
		position: 'sticky',
		alignItems: 'center',
		padding: '8px 24px',
		backgroundColor: theme.colors.n50,
		[mediaQueries.lg]: {
			display: 'flex',
		},
	},
}));

interface HalfLayoutProps {
	leftColChildren(className: string): JSX.Element;
}

const HalfLayout = ({ leftColChildren }: HalfLayoutProps) => {
	const { institution } = useAccount();
	const { openInCrisisModal } = useInCrisisModal();
	const classes = useStyles({
		backgroundImage: institution.signInLargeLogoBackgroundUrl ?? '',
	});

	return (
		<div className={classes.halfLayout}>
			<div className={classes.col}>
				<div className={classes.leftColInner}>
					<div
						className={classNames(classes.mobileHeader, 'mb-6', {
							'justify-content-between': institution.signInCrisisButtonVisible,
							'justify-content-center': !institution.signInCrisisButtonVisible,
						})}
					>
						<Link to="/">
							{institution.signInLogoUrl ? (
								<img src={institution.signInLogoUrl} alt={institution.name} />
							) : (
								<Logo />
							)}
						</Link>
						{institution.signInCrisisButtonVisible && (
							<Button
								variant="light"
								className="d-flex align-items-center"
								onClick={() => openInCrisisModal()}
							>
								<PhoneIcon className="me-2" />
								Crisis support
							</Button>
						)}
					</div>
					<div className={classes.logoOuter}>
						<Link to="/">
							{institution.signInLogoUrl ? (
								<img src={institution.signInLogoUrl} alt={institution.name} />
							) : (
								<Logo />
							)}
						</Link>
					</div>
					{institution.signInBrandingLogoUrl && (
						<div className={classes.brandingOuter}>
							<Link to="/">
								<img src={institution.signInBrandingLogoUrl} alt="" />
							</Link>
						</div>
					)}
					{leftColChildren(classes.form)}
				</div>
			</div>
			<div className={classNames(classes.col, classes.rightCol)}>
				{institution.signInCrisisButtonVisible && (
					<div className={classes.inCrisisButtonOuter}>
						<Button
							variant="light"
							className="d-flex align-items-center"
							onClick={() => openInCrisisModal()}
						>
							<PhoneIcon className="me-2" />
							Crisis support
						</Button>
					</div>
				)}
				<div className="w-100">
					{institution.signInLargeLogoUrl ? (
						<img src={institution.signInLargeLogoUrl} alt="" className={classes.illustration} />
					) : (
						<Illustration className={classes.illustration} />
					)}
				</div>
			</div>
		</div>
	);
};

export default HalfLayout;
