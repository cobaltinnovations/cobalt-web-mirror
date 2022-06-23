import React, { FC, PropsWithChildren } from 'react';

export const TableBody: FC<PropsWithChildren> = React.memo(({ children }) => {
	return <tbody>{children}</tbody>;
});
