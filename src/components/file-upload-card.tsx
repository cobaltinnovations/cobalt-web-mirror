import { ReactComponent as UploadIcon } from '@/assets/icons/icon-upload.svg';
import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';
import { ReactComponent as TrashIcon } from '@/assets/icons/icon-trash.svg';
import FileInputButton from '@/components/file-input-button';
import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React, { FC } from 'react';
import { Button, Card, Dropdown } from 'react-bootstrap';
import { DropdownMenu, DropdownToggle } from './dropdown';

const useStyles = createUseThemedStyles((theme) => ({
	uploadIcon: {
		width: 44,
		height: 44,
		display: 'flex',
		cursor: 'pointer',
		alignItems: 'center',
		justifyContent: 'center',
		'& svg path': {
			fill: theme.colors.n500,
		},
	},
	progressBar: {
		flex: 1,
		height: 13,
		borderRadius: 7,
		overflow: 'hidden',
		backgroundColor: theme.colors.n300,
	},
	progressBarFill: ({ percentage }: { percentage: number }) => ({
		height: '100%',
		width: `${percentage}%`,
		transition: '0.3s width',
		backgroundColor: theme.colors.s500,
	}),
}));

interface FileUploadCardProps {
	fileName?: string;
	fileSize?: number;
	imagePreview?: string;
	isUploading: boolean;
	onChange(file: File): void;
	onRemove(): void;
	progress?: number;
	className?: string;
	disabled?: boolean;
	accept?: string;
}

const FileUploadCard: FC<FileUploadCardProps> = ({
	fileName,
	fileSize,
	imagePreview,
	isUploading,
	progress,
	onChange,
	onRemove,
	disabled = false,
	accept,
}) => {
	const classes = useStyles({
		percentage: progress || 0,
	});

	return (
		<Card bsPrefix="form-card">
			<Card.Body className="no-header">
				{imagePreview && (
					<div className="d-flex">
						<img src={imagePreview} height={40} width={40} className="" alt="" />
						<div className="ps-3 flex-grow-1">
							<p className="mb-0">{fileName}</p>
							<p className="mb-0 text-muted">{fileSize ? `${fileSize / 1000} MB` : 0}</p>
						</div>

						{imagePreview && (
							<Dropdown>
								<Dropdown.Toggle
									as={DropdownToggle}
									id={'file-upload-card-' + imagePreview}
									className="p-2"
								>
									<MoreIcon className="d-flex" />
								</Dropdown.Toggle>
								<Dropdown.Menu
									compact
									as={DropdownMenu}
									align="end"
									popperConfig={{ strategy: 'fixed' }}
									renderOnMount
								>
									<Dropdown.Item className="d-flex align-items-center" onClick={onRemove}>
										<TrashIcon className="me-2 text-n500" width={24} height={24} />
										Delete
									</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						)}
					</div>
				)}

				<div className="text-center">
					{!imagePreview && (
						<FileInputButton
							accept={accept ?? 'image/*'}
							onChange={onChange}
							disabled={isUploading || disabled}
						>
							<Button
								as="div"
								className={classNames(classes.uploadIcon, 'mx-auto mb-2 p-0')}
								variant="light"
								size="sm"
							>
								<UploadIcon />
							</Button>

							<p className="mb-2">
								Drop a file here or{' '}
								<Button
									className="d-inline p-0 text-decoration-none"
									as="span"
									variant="link"
									size="sm"
								>
									select a file
								</Button>
							</p>

							<p className="mb-0 text-muted">File must be a PDF, PPT, or DOC no larger than 200 MB</p>
						</FileInputButton>
					)}

					{isUploading && (
						<div className={classNames(classes.progressBar, 'mt-3')}>
							<div className={classes.progressBarFill} />
						</div>
					)}
				</div>
			</Card.Body>
		</Card>
	);
};

export default FileUploadCard;
