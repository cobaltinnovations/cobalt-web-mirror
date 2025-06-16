import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as Logo } from '@/assets/logos/logo-cobalt-horizontal.svg';
import useAccount from '@/hooks/use-account';
import { Button } from 'react-bootstrap';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';

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
			padding: '56px 0',
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
		marginBottom: 46,
		textAlign: 'center',
	},
	brandingLogo: {
		width: '100%',
		maxWidth: 140,
		marginTop: 30,
	},
	form: {
		width: '80%',
		maxWidth: 380,
		margin: '0 auto',
	},
	illustration: {
		width: '80%',
		maxWidth: 548,
		margin: '0 auto',
		display: 'block',
	},
	inCrisisButtonOuter: {
		top: 40,
		right: 40,
		position: 'absolute',
	},
}));

interface HalfLayoutProps {
	leftColChildren(className: string): JSX.Element;
	rightColChildren(className: string): JSX.Element;
}

const HalfLayout = ({ leftColChildren, rightColChildren }: HalfLayoutProps) => {
	const { institution } = useAccount();
	const { openInCrisisModal } = useInCrisisModal();
	const classes = useStyles({
		backgroundImage: institution.signInLargeLogoBackgroundUrl ?? '',
	});

	return (
		<div className={classes.halfLayout}>
			<div className={classes.col}>
				<div className={classes.leftColInner}>
					<div className={classes.logoOuter}>
						<Link to="/" className="d-flex align-items-center flex-column">
							{institution.signInLogoUrl ? (
								<img src={institution.signInLogoUrl} alt={institution.name} />
							) : (
								<Logo />
							)}
							{institution.signInBrandingLogoUrl && (
								<img src={institution.signInBrandingLogoUrl} className={classes.brandingLogo} alt="" />
							)}
						</Link>
					</div>
					{leftColChildren(classes.form)}
				</div>
			</div>
			<div className={classNames(classes.col, classes.rightCol)}>
				{institution.signInCrisisButtonVisible && (
					<div className={classes.inCrisisButtonOuter}>
						<Button variant="light" onClick={() => openInCrisisModal()}>
							Crisis support
						</Button>
					</div>
				)}
				<div className="w-100">{rightColChildren(classes.illustration)}</div>
			</div>
		</div>
	);
};

export default HalfLayout;
