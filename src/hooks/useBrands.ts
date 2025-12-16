import React from 'react';
import { BrandsContext } from '../context/BrandsContext';

export const useBrands = () => {
    const ctx = React.useContext(BrandsContext);
    if (!ctx) {
        throw new Error('useBrands must be used within BrandsProvider');
    }
    return ctx;
};
