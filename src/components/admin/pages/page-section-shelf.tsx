import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { PageSectionModel } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme/create-use-themed-styles';

const PAGE_SECTION_SHELF_HEADER_HEIGHT = 57;
const PAGE_TRANSITION_DURATION_MS = 600;

const useStyles = createUseThemedStyles((theme) => ({
	page: {
		height: '100%',
		position: 'relative',
	},
	header: {
		display: 'flex',
		padding: '0 24px',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: PAGE_SECTION_SHELF_HEADER_HEIGHT,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	body: {
		padding: 24,
		overflowY: 'auto',
		height: `calc(100% - ${PAGE_SECTION_SHELF_HEADER_HEIGHT}px)`,
	},
	'@global': {
		'.right-to-left-enter, .right-to-left-enter-active, .right-to-left-exit, .right-to-left-exit-active, .left-to-right-enter, .left-to-right-enter-active, .left-to-right-exit, .left-to-right-exit-active':
			{
				top: 0,
				left: 0,
				right: 0,
				position: 'absolute',
			},
		'.right-to-left-enter': {
			opacity: 0,
			transform: 'translateX(100%)',
		},
		'.right-to-left-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.32,.99,.32,.99)`,
		},
		'.right-to-left-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.right-to-left-exit-active': {
			opacity: 0,
			transform: 'translateX(-100%)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.32,.99,.32,.99)`,
		},
		'.left-to-right-enter ': {
			opacity: 0,
			transform: 'translateX(-100%)',
		},
		'.left-to-right-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.32,.99,.32,.99)`,
		},
		'.left-to-right-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.left-to-right-exit-active': {
			opacity: 0,
			transform: 'translateX(100%)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.32,.99,.32,.99)`,
		},
	},
}));

interface SectionShelfProps {
	pageSection: PageSectionModel;
	onClose(): void;
	onDelete(): void;
}

enum PAGE_STATES {
	SETTINGS = 'SETTINGS',
	ADD_ROW = 'ADD_ROW',
}

export const PageSectionShelf = ({ pageSection, onDelete, onClose }: SectionShelfProps) => {
	const classes = useStyles();
	const [pageState, setPageState] = useState(PAGE_STATES.SETTINGS);
	const [isNext, setIsNext] = useState(true);

	return (
		<TransitionGroup
			component={null}
			childFactory={(child) =>
				React.cloneElement(child, {
					classNames: isNext ? 'right-to-left' : 'left-to-right',
					timeout: PAGE_TRANSITION_DURATION_MS,
				})
			}
		>
			<CSSTransition key={pageState} timeout={PAGE_TRANSITION_DURATION_MS} classNames="item">
				<>
					{pageState === PAGE_STATES.SETTINGS && (
						<div className={classes.page}>
							<div className={classes.header}>
								<div>
									<h5 className="mb-0">{pageSection.name}</h5>
									<span className="small text-gray">{pageSection.pageSectionId}</span>
								</div>
								<div className="d-flex align-items-center justify-end">
									<Button className="me-2" variant="danger" onClick={onDelete}>
										Delete
									</Button>
									<Button onClick={onClose}>Close</Button>
								</div>
							</div>
							<div className={classes.body}>
								<Button
									onClick={() => {
										setIsNext(true);
										setPageState(PAGE_STATES.ADD_ROW);
									}}
								>
									Add Row
								</Button>
							</div>
						</div>
					)}
					{pageState === PAGE_STATES.ADD_ROW && (
						<div className={classes.page}>
							<div className={classes.header}>
								<div className="d-flex align-items-center justify-start">
									<Button
										onClick={() => {
											setIsNext(false);
											setPageState(PAGE_STATES.SETTINGS);
										}}
									>
										Back
									</Button>
									<h5 className="mb-0">Select row type to add</h5>
								</div>
							</div>
							<div className={classes.body}>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
							</div>
						</div>
					)}
				</>
			</CSSTransition>
		</TransitionGroup>
	);
};
