import React from 'react';
import type {
    Brand,
    BrandInput,
    BrandUpdate,
    PaginationMeta,
    ModelInput,
    ModelUpdate,
} from '../types';

export interface BrandsContextValue {
    brands: Brand[];
    meta: PaginationMeta | null;
    currentPage: number;
    pageSize: number;
    isLoading: boolean;
    error: string | null;
    refresh: (page?: number) => Promise<void>;
    setPage: (page: number) => Promise<void>;
    createBrand: (brand: BrandInput) => Promise<void>;
    updateBrand: (id: number, brand: BrandUpdate) => Promise<void>;
    removeBrand: (id: number) => Promise<void>;
    reloadBrand: (id: number) => Promise<void>;
    createModel: (brandId: number, model: ModelInput) => Promise<void>;
    updateModel: (brandId: number, modelId: number, model: ModelUpdate) => Promise<void>;
    removeModel: (brandId: number, modelId: number) => Promise<void>;
}

export const BrandsContext = React.createContext<BrandsContextValue | null>(null);
