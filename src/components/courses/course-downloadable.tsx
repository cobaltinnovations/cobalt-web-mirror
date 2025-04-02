import React from 'react';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as DownloadIcon } from '@/assets/icons/icon-download.svg';
import { ReactComponent as PdfIcon } from '@/assets/icons/filetype-pdf.svg';
import { CourseUnitDownloadableFile } from '@/lib/models';

const useStyles = createUseThemedStyles((theme) => ({
	courseDownloadable: {
		padding: 24,
		display: 'flex',
		borderRadius: 8,
		alignItems: 'center',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
	},
	downloadTypeIconOuter: {
		width: 32,
		height: 32,
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	downloadInfoOuter: {
		flex: 1,
		paddingLeft: 16,
	},
	downloadIconOuter: {
		width: 40,
		height: 40,
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
}));

interface CourseDownloadableProps {
	courseUnitDownloadableFile: CourseUnitDownloadableFile;
}

export const CourseDownloadable = ({ courseUnitDownloadableFile }: CourseDownloadableProps) => {
	const classes = useStyles();

	return (
		<div className={classes.courseDownloadable}>
			<div className={classes.downloadTypeIconOuter}>
				<PdfIcon />
			</div>
			<div className={classes.downloadInfoOuter}>
				<p className="m-0">attending-basics.pdf</p>
				<p className="m-0 text-n500">125 KB</p>
			</div>
			<div className={classes.downloadIconOuter}>
				<DownloadIcon className="text-primary" />
			</div>
		</div>
	);
};
