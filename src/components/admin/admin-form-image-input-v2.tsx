import React, { FC, useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';

import ImageRepository from '@/components/image-repository/image-repository';
import type { ImageRepositorySelectableCropFileUploadTypeId } from '@/components/image-repository/image-repository-ratios';
import type { ImageModel } from '@/lib/models';

export interface AdminFormImageInputV2Props {
	value?: ImageModel;
	className?: string;
	buttonClassName?: string;
	disabled?: boolean;
	acceptableCropSizes?: ImageRepositorySelectableCropFileUploadTypeId[];
	onChange(image?: ImageModel): void;
}

export const AdminFormImageInputV2: FC<AdminFormImageInputV2Props> = ({
	value,
	className,
	buttonClassName,
	disabled = false,
	acceptableCropSizes,
	onChange,
}) => {
	const [showImageRepository, setShowImageRepository] = useState(false);

	const handleImageSelect = useCallback(
		(image: ImageModel) => {
			onChange(image);
		},
		[onChange]
	);

	const handleClearImage = useCallback(() => {
		onChange(undefined);
	}, [onChange]);

	return (
		<>
			<div className={className}>
				{value ? (
					<>
						<img
							src={value.url}
							className="mb-3 w-100 d-block"
							alt={value.imageAltText ?? value.filename}
						/>
						<div className="d-flex align-items-center justify-content-between">
							<p className="m-0 text-muted">{value.imageAltText ?? value.filename}</p>
							<Button
								size="sm"
								type="button"
								variant="light"
								className="ms-2 flex-shrink-0"
								onClick={handleClearImage}
								disabled={disabled}
							>
								Clear Image
							</Button>
						</div>
					</>
				) : (
					<Button
						type="button"
						variant="primary"
						className={buttonClassName}
						onClick={() => {
							setShowImageRepository(true);
						}}
						disabled={disabled}
					>
						Add Image
					</Button>
				)}
			</div>

			<ImageRepository
				show={showImageRepository}
				onHide={() => {
					setShowImageRepository(false);
				}}
				acceptableCropSizes={acceptableCropSizes}
				onImageSelect={handleImageSelect}
			/>
		</>
	);
};
