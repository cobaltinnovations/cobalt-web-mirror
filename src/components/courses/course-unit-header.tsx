import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { CourseModel } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as BackArrowIcon } from '@/assets/icons/icon-back-arrow.svg';
import { ReactComponent as QuestionMarkIcon } from '@/assets/icons/icon-help-fill.svg';

interface UseStylesProps {
	height: number;
}

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		top: 0,
		left: 0,
		right: 0,
		height: ({ height }: UseStylesProps) => height,
		zIndex: 3,
		display: 'flex',
		padding: '0 24px',
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.n100}`,
		[mediaQueries.lg]: {
			padding: '0 20px',
		},
	},
	exitButtonOuter: {
		flexShrink: 0,
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		padding: '8px 0 8px 4px',
		borderRight: `1px solid ${theme.colors.n100}`,
		[mediaQueries.lg]: {
			border: 0,
			padding: '8px 0',
		},
	},
	exitButton: {
		display: 'flex',
		alignItems: 'center',
		textDecoration: 'none',
		color: theme.colors.n500,
		...theme.fonts.bodyNormal,
		[mediaQueries.lg]: {
			padding: '12px 12px 12px 0',
		},
	},
	headerLeft: {
		flex: 1,
		height: '100%',
		display: 'flex',
		overflow: 'hidden',
		alignItems: 'center',
	},
}));

interface CourseUnitHeaderProps {
	height: number;
	course: CourseModel;
}

export const CourseUnitHeader = ({ height, course }: CourseUnitHeaderProps) => {
	const classes = useStyles({ height });
	const navigate = useNavigate();

	return (
		<div className={classes.header}>
			<div className={classes.headerLeft}>
				<div className={classes.exitButtonOuter}>
					<Button
						type="button"
						variant="link"
						className={classes.exitButton}
						onClick={() => {
							navigate(-1);
						}}
					>
						<BackArrowIcon className="me-lg-1" />
						<span className="d-none d-lg-inline">Exit</span>
					</Button>
				</div>
				<span className="ps-lg-6 text-n700 fs-large fw-semibold text-nowrap text-truncate">{course.title}</span>
			</div>
			<Button
				type="button"
				variant="link"
				className="d-none d-lg-inline d-flex align-items-center text-decoration-none text-nowrap"
				onClick={() => {
					navigate('/feedback');
				}}
			>
				<QuestionMarkIcon className="flex-shrink-0 me-1" width={20} height={20} />
				Need Help?
			</Button>
		</div>
	);
};
