import React from 'react';
import classNames from 'classnames';
import { CourseUnitDownloadableFile } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as DocxIcon } from '@/assets/icons/filetype-docx.svg';
import { ReactComponent as DocIcon } from '@/assets/icons/filetype-doc.svg';
import { ReactComponent as PdfIcon } from '@/assets/icons/filetype-pdf.svg';
import SvgIcon from '../svg-icon';

const useStyles = createUseThemedStyles((theme) => ({
	courseDownloadable: {
		padding: 24,
		display: 'flex',
		borderRadius: 8,
		alignItems: 'center',
		textDecoration: 'none',
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
		'&:hover': {
			backgroundColor: theme.colors.n50,
		},
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

const iconMap: Record<string, JSX.Element> = {
	'application/pdf': <SvgIcon kit="far" icon="file-pdf" size={32} className="text-n500" />,
	'application/msword': <SvgIcon kit="far" icon="file-doc" size={32} className="text-n500" />,
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (
		<SvgIcon kit="far" icon="file-doc" size={32} className="text-n500" />
	),
	'application/vnd.openxmlformats-officedocument.wordprocessingml.template': (
		<SvgIcon kit="far" icon="file-doc" size={32} className="text-n500" />
	),
	'application/vnd.ms-word.document.macroEnabled.12': (
		<SvgIcon kit="far" icon="file-doc" size={32} className="text-n500" />
	),
	'text/csv': <SvgIcon kit="far" icon="file-csv" size={32} className="text-n500" />,
};

interface CourseDownloadableProps {
	courseUnitDownloadableFile: CourseUnitDownloadableFile;
	className?: string;
	trackEvent?(): void;
}

export const CourseDownloadable = ({ courseUnitDownloadableFile, className, trackEvent }: CourseDownloadableProps) => {
	const classes = useStyles();

	return (
		<a
			className={classNames(classes.courseDownloadable, className)}
			href={courseUnitDownloadableFile.url}
			target="_blank"
			rel="noreferrer"
			onClick={trackEvent}
		>
			<div className={classes.downloadTypeIconOuter}>{iconMap[courseUnitDownloadableFile.contentType]}</div>
			<div className={classes.downloadInfoOuter}>
				<p className="m-0 text-dark">{courseUnitDownloadableFile.filename}</p>
				<p className="m-0 text-n500">{courseUnitDownloadableFile.filesizeDescription}</p>
			</div>
			<div className={classes.downloadIconOuter}>
				<SvgIcon kit="far" icon="download" size={20} className="text-primary" />
			</div>
		</a>
	);
};
