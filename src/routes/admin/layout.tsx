import { ADMIN_HEADER_HEIGHT, AdminHeader } from '@/components/admin';
import Loader from '@/components/loader';
import React, { Dispatch, SetStateAction, Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';

export interface AdminLayoutContext {
	isGroupSessionPreview: boolean;
	setIsGroupSessionPreview: Dispatch<SetStateAction<boolean>>;
}

export async function loader() {
	return null;
}

export const Component = () => {
	const [isGroupSessionPreview, setIsGroupSessionPreview] = useState(false);

	return (
		<>
			<AdminHeader isGroupSessionPreview={isGroupSessionPreview} />
			<div style={{ paddingTop: ADMIN_HEADER_HEIGHT }}>
				<Suspense fallback={<Loader />}>
					<Outlet
						context={{
							isGroupSessionPreview,
							setIsGroupSessionPreview,
						}}
					/>
				</Suspense>
			</div>
		</>
	);
};
