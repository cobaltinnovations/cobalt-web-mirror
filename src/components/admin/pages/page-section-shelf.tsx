import React, { useState } from 'react';
import { PageSectionModel } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme/create-use-themed-styles';
import { Button } from 'react-bootstrap';

const PAGE_SECTION_SHELF_HEADER_HEIGHT = 57;

const useStyles = createUseThemedStyles((theme) => ({
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
}));

interface SectionShelfProps {
	pageSection: PageSectionModel;
	onClose(): void;
}

enum PAGE_STATES {}

export const PageSectionShelf = ({ pageSection, onClose }: SectionShelfProps) => {
	const classes = useStyles();
	const [pageState, setPageState] = useState();

	return (
		<>
			<div className={classes.header}>
				<div>
					<h5 className="mb-0">{pageSection.name}</h5>
					<h6>{pageSection.pageSectionId}</h6>
				</div>
				<Button onClick={onClose}>Close</Button>
			</div>
			<div className={classes.body}>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non consequat nulla, id pellentesque
					nunc. Integer tempus eleifend augue et vestibulum. Phasellus dapibus libero massa, ut venenatis
					turpis porttitor et. Nulla rutrum leo vel rhoncus interdum. Sed sed lectus leo. Pellentesque a
					commodo dui. Phasellus tincidunt ipsum vitae turpis tristique vulputate ut ut turpis. Mauris porta
					facilisis ante non tempus. Pellentesque interdum maximus pulvinar. Quisque egestas ac lacus id
					finibus. Ut ultrices mauris odio, ac euismod leo euismod nec.
				</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non consequat nulla, id pellentesque
					nunc. Integer tempus eleifend augue et vestibulum. Phasellus dapibus libero massa, ut venenatis
					turpis porttitor et. Nulla rutrum leo vel rhoncus interdum. Sed sed lectus leo. Pellentesque a
					commodo dui. Phasellus tincidunt ipsum vitae turpis tristique vulputate ut ut turpis. Mauris porta
					facilisis ante non tempus. Pellentesque interdum maximus pulvinar. Quisque egestas ac lacus id
					finibus. Ut ultrices mauris odio, ac euismod leo euismod nec.
				</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non consequat nulla, id pellentesque
					nunc. Integer tempus eleifend augue et vestibulum. Phasellus dapibus libero massa, ut venenatis
					turpis porttitor et. Nulla rutrum leo vel rhoncus interdum. Sed sed lectus leo. Pellentesque a
					commodo dui. Phasellus tincidunt ipsum vitae turpis tristique vulputate ut ut turpis. Mauris porta
					facilisis ante non tempus. Pellentesque interdum maximus pulvinar. Quisque egestas ac lacus id
					finibus. Ut ultrices mauris odio, ac euismod leo euismod nec.
				</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non consequat nulla, id pellentesque
					nunc. Integer tempus eleifend augue et vestibulum. Phasellus dapibus libero massa, ut venenatis
					turpis porttitor et. Nulla rutrum leo vel rhoncus interdum. Sed sed lectus leo. Pellentesque a
					commodo dui. Phasellus tincidunt ipsum vitae turpis tristique vulputate ut ut turpis. Mauris porta
					facilisis ante non tempus. Pellentesque interdum maximus pulvinar. Quisque egestas ac lacus id
					finibus. Ut ultrices mauris odio, ac euismod leo euismod nec.
				</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non consequat nulla, id pellentesque
					nunc. Integer tempus eleifend augue et vestibulum. Phasellus dapibus libero massa, ut venenatis
					turpis porttitor et. Nulla rutrum leo vel rhoncus interdum. Sed sed lectus leo. Pellentesque a
					commodo dui. Phasellus tincidunt ipsum vitae turpis tristique vulputate ut ut turpis. Mauris porta
					facilisis ante non tempus. Pellentesque interdum maximus pulvinar. Quisque egestas ac lacus id
					finibus. Ut ultrices mauris odio, ac euismod leo euismod nec.
				</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non consequat nulla, id pellentesque
					nunc. Integer tempus eleifend augue et vestibulum. Phasellus dapibus libero massa, ut venenatis
					turpis porttitor et. Nulla rutrum leo vel rhoncus interdum. Sed sed lectus leo. Pellentesque a
					commodo dui. Phasellus tincidunt ipsum vitae turpis tristique vulputate ut ut turpis. Mauris porta
					facilisis ante non tempus. Pellentesque interdum maximus pulvinar. Quisque egestas ac lacus id
					finibus. Ut ultrices mauris odio, ac euismod leo euismod nec.
				</p>
			</div>
		</>
	);
};
