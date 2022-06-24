import React, { FC } from 'react';
import classNames from 'classnames';

import useAlert from '@/hooks/use-alert';

import { CSSTransition } from 'react-transition-group';
import { createUseThemedStyles } from '@/jss/theme';

const animationDuration = 200;

const useAlertStyles = createUseThemedStyles((theme) => ({
	alert: {
		top: 54,
		left: 0,
		right: 0,
		zIndex: 2,
		position: 'fixed',
		padding: '16px 25px',
		'&.success': {
			backgroundColor: theme.colors.success,
		},
		'&.warning': {
			backgroundColor: theme.colors.warning,
		},
		'&.danger': {
			backgroundColor: theme.colors.danger,
		},
	},
	'@global': {
		'.alert-animation-enter': {
			opacity: 0,
		},
		'.alert-animation-enter-active': {
			opacity: 1,
			transition: `opacity ${animationDuration}ms`,
		},
		'.alert-animation-exit': {
			opacity: 1,
		},
		'.alert-animation-exit-active': {
			opacity: 0,
			transition: `opacity ${animationDuration}ms`,
		},
	},
}));

const Alert: FC = () => {
	const { alertIsShowing, alertText, alertVariant } = useAlert();
	const classes = useAlertStyles();

	return (
		<CSSTransition
			in={alertIsShowing}
			timeout={animationDuration}
			mountOnEnter={true}
			unmountOnExit={true}
			classNames="alert-animation"
		>
			<div className={classNames([classes.alert, alertVariant])}>
				<h5 className="mb-0 text-center text-white">{alertText}</h5>
			</div>
		</CSSTransition>
	);
};

export default Alert;
