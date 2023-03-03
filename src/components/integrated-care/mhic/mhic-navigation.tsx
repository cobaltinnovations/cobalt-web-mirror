import React, { PropsWithChildren, useState } from 'react';
import { Button, Collapse } from 'react-bootstrap';
import classNames from 'classnames';

import config from '@/lib/config';
import useAccount from '@/hooks/use-account';
import { MhicGenerateOrdersModal } from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';

import { ReactComponent as AvatarIcon } from '@/assets/icons/icon-avatar.svg';
import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down-v2.svg';
import FileInputButton from '@/components/file-input-button';

const headerHeight = 56;
const sideNavWidth = 280;

const useStyles = createUseThemedStyles((theme) => ({
	sideNav: {
		left: 0,
		bottom: 0,
		padding: 16,
		position: 'fixed',
		overflowY: 'auto',
		top: headerHeight,
		width: sideNavWidth,
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	navigation: {
		'& button': {
			border: 0,
			padding: 8,
			width: '100%',
			borderRadius: 4,
			display: 'flex',
			alignItems: 'center',
			textDecoration: 'none',
			color: theme.colors.n900,
			...theme.fonts.bodyNormal,
			backgroundColor: 'transparent',
			justifyContent: 'space-between',
			'&:hover': {
				backgroundColor: theme.colors.n50,
			},
			'&:active': {
				backgroundColor: theme.colors.n75,
			},
			'&.active': {
				backgroundColor: theme.colors.n50,
			},
			'& .chevron-icon': {
				transition: '200ms transform',
				'&--is-expanded': {
					transform: 'rotate(180deg)',
				},
			},
		},
	},
	iconOuter: {
		width: 24,
		height: 24,
		marginRight: 8,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	body: {
		right: 0,
		bottom: 0,
		position: 'fixed',
		overflowY: 'auto',
		padding: '0 40px',
		top: headerHeight,
		left: sideNavWidth,
	},
}));

interface MhicNavigationItemModel {
	title: string;
	description?: string;
	icon(): JSX.Element;
	onClick?(): void;
	navigationItems?: MhicNavigationItemModel[];
}

interface MhicNavigationProps {
	navigationItems: MhicNavigationItemModel[];
	onImportPatientsInputChange(file: File): void;
}

export const MhicNavigation = ({
	navigationItems,
	onImportPatientsInputChange,
	children,
}: PropsWithChildren<MhicNavigationProps>) => {
	const classes = useStyles();
	const { account } = useAccount();
	const [showGenerateOrdersModal, setShowGenerateOrdersModal] = useState(false);

	return (
		<>
			<MhicGenerateOrdersModal
				show={showGenerateOrdersModal}
				onHide={() => {
					setShowGenerateOrdersModal(false);
				}}
				onSave={() => {
					setShowGenerateOrdersModal(false);
				}}
			/>

			<div className={classes.sideNav}>
				<div className="mb-3 px-2 pt-1 pb-5 d-flex align-items-center border-bottom">
					<AvatarIcon className="me-3" />
					<div>
						<span className="d-block">{account?.displayName}</span>
						<span className="d-block text-gray">MHIC</span>
					</div>
				</div>
				<nav className={classes.navigation}>
					{navigationItems.map((ni, index) => (
						<MhicNavigationItem key={`${ni.title.replace(/\s+/g, '')}-${index}`} navigationItem={ni} />
					))}
				</nav>
				<hr className="mt-3 mb-6" />
				<FileInputButton
					className="d-flex justify-content-center w-100"
					accept=".csv"
					onChange={onImportPatientsInputChange}
				>
					Import Patients
				</FileInputButton>
				{config.COBALT_WEB_SHOW_DEBUG === 'true' && (
					<Button
						className="mt-2 w-100"
						variant="outline-primary"
						onClick={() => {
							setShowGenerateOrdersModal(true);
						}}
					>
						Generate Patient Orders
					</Button>
				)}
			</div>
			<div className={classes.body}>{children}</div>
		</>
	);
};

interface MhicNavigationItemProps {
	navigationItem: MhicNavigationItemModel;
}

const MhicNavigationItem = ({ navigationItem }: MhicNavigationItemProps) => {
	const classes = useStyles();
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<>
			<button
				onClick={
					navigationItem.navigationItems
						? () => {
								setIsExpanded(!isExpanded);
						  }
						: navigationItem.onClick
				}
			>
				<div className="d-flex align-items-center">
					<div className={classes.iconOuter}>{<navigationItem.icon />}</div>
					<span className="d-block">{navigationItem.title}</span>
				</div>
				{navigationItem.navigationItems ? (
					<div>
						<DownChevron
							className={classNames('text-n300 chevron-icon', {
								'chevron-icon--is-expanded': isExpanded,
							})}
						/>
					</div>
				) : (
					<>
						{navigationItem.description && (
							<span className="d-block text-gray">{navigationItem.description}</span>
						)}
					</>
				)}
			</button>
			{navigationItem.navigationItems && (
				<Collapse in={isExpanded}>
					<div>
						{navigationItem.navigationItems.map((ni, index) => (
							<MhicNavigationItem key={`${ni.title.replace(/\s+/g, '')}-${index}`} navigationItem={ni} />
						))}
					</div>
				</Collapse>
			)}
		</>
	);
};
