import React from 'react';
import { BrandsContext } from './BrandsContext';
import type {
    Brand,
    BrandInput,
    BrandUpdate,
    PaginationMeta,
    Model,
    ModelInput,
    ModelUpdate,
} from '../types';
import { useAuth } from '../hooks/useAuth';
import { brandsApi } from '../api/brands';
import { ApiError } from '../api/client';

const COLLECTIONS_PAGE_SIZE = 6;

type BrandsState = {
    brands: Brand[];
    status: 'idle' | 'loading' | 'ready' | 'error';
    error: string | null;
    meta: PaginationMeta | null;
    currentPage: number;
    pageSize: number;
};

type BrandsAction =
    | { type: 'load/start' }
    | { type: 'load/success'; payload: { items: Brand[]; meta?: PaginationMeta; page: number } }
    | { type: 'load/error'; payload: string }
    | { type: 'brand/added'; payload: Brand }
    | { type: 'brand/updated'; payload: Brand }
    | { type: 'brand/removed'; payload: number }
    | { type: 'brand/reloaded'; payload: Brand }
    | { type: 'model/added'; payload: { brandId: number; model: Model } }
    | { type: 'model/updated'; payload: { brandId: number; model: Model } }
    | { type: 'model/removed'; payload: { brandId: number; modelId: number } }
    | { type: 'reset' };

const initialState: BrandsState = {
    brands: [],
    status: 'idle',
    error: null,
    meta: null,
    currentPage: 1,
    pageSize: COLLECTIONS_PAGE_SIZE,
};

const withUpdatedBrand = (
    state: BrandsState,
    brandId: number,
    updater: (brand: Brand) => Brand
) => {
    let didUpdate = false;
    const nextBrands = state.brands.map(brand => {
        if (brand.id !== brandId) {
            return brand;
        }
        didUpdate = true;
        return updater(brand);
    });
    return { brands: nextBrands, didUpdate };
};

const reducer = (state: BrandsState, action: BrandsAction): BrandsState => {
    switch (action.type) {
        case 'load/start':
            return { ...state, status: 'loading', error: null };
        case 'load/success': {
            const meta = action.payload.meta ?? {
                page: action.payload.page,
                pageSize: state.pageSize,
                total: action.payload.items.length,
                totalPages: 1,
            };
            return {
                ...state,
                brands: action.payload.items,
                status: 'ready',
                error: null,
                meta,
                currentPage: action.payload.page,
            };
        }
        case 'load/error':
            return { ...state, status: 'error', error: action.payload };
        case 'brand/added': {
            const meta = state.meta
                ? {
                    ...state.meta,
                    total: state.meta.total + 1,
                    totalPages: Math.max(
                        state.meta.totalPages,
                        Math.ceil((state.meta.total + 1) / state.pageSize)
                    ),
                }
                : null;
            return {
                ...state,
                brands: [action.payload, ...state.brands],
                meta,
            };
        }
        case 'brand/updated': {
            const nextBrands = state.brands.map(brand =>
                brand.id === action.payload.id ? action.payload : brand
            );
            return { ...state, brands: nextBrands };
        }
        case 'brand/reloaded': {
            const { brands, didUpdate } = withUpdatedBrand(
                state,
                action.payload.id,
                () => action.payload
            );
            return {
                ...state,
                brands: didUpdate ? brands : [action.payload, ...state.brands],
            };
        }
        case 'brand/removed': {
            const filtered = state.brands.filter(brand => brand.id !== action.payload);
            const meta = state.meta
                ? {
                    ...state.meta,
                    total: Math.max(0, state.meta.total - 1),
                    totalPages: Math.max(1, Math.ceil(Math.max(0, state.meta.total - 1) / state.pageSize)),
                }
                : null;
            return { ...state, brands: filtered, meta };
        }
        case 'model/added': {
            const { brands } = withUpdatedBrand(
                state,
                action.payload.brandId,
                brand => ({
                    ...brand,
                    models: [...(brand.models ?? []), action.payload.model],
                    updatedAt: new Date().toISOString(),
                })
            );
            return { ...state, brands };
        }
        case 'model/updated': {
            const { brands } = withUpdatedBrand(
                state,
                action.payload.brandId,
                brand => ({
                    ...brand,
                    models: (brand.models ?? []).map(model =>
                        model.id === action.payload.model.id ? action.payload.model : model
                    ),
                    updatedAt: new Date().toISOString(),
                })
            );
            return { ...state, brands };
        }
        case 'model/removed': {
            const { brands } = withUpdatedBrand(
                state,
                action.payload.brandId,
                brand => ({
                    ...brand,
                    models: (brand.models ?? []).filter(model => model.id !== action.payload.modelId),
                    updatedAt: new Date().toISOString(),
                })
            );
            return { ...state, brands };
        }
        case 'reset':
            return initialState;
        default:
            return state;
    }
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof ApiError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return fallback;
};

export const BrandsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const [state, dispatch] = React.useReducer(reducer, initialState);

    const fetchBrands = React.useCallback(async (page: number = 1) => {
        if (!token) {
            dispatch({ type: 'reset' });
            return;
        }
        dispatch({ type: 'load/start' });
        try {
            const response = await brandsApi.list(token, {
                page,
                pageSize: state.pageSize,
            });
            dispatch({
                type: 'load/success',
                payload: { items: response.items, meta: response.meta, page },
            });
        } catch (errorInstance) {
            dispatch({
                type: 'load/error',
                payload: getErrorMessage(errorInstance, 'Не удалось загрузить коллекции'),
            });
        }
    }, [token, state.pageSize]);

    React.useEffect(() => {
        void fetchBrands(1);
    }, [fetchBrands]);

    const refresh = React.useCallback(async (page?: number) => {
        await fetchBrands(page ?? state.currentPage);
    }, [fetchBrands, state.currentPage]);

    const setPage = React.useCallback(async (page: number) => {
        await fetchBrands(page);
    }, [fetchBrands]);

    const createBrand = React.useCallback(async (payload: BrandInput) => {
        if (!token) {
            throw new Error('Требуется авторизация');
        }
        const created = await brandsApi.create(token, payload);
        dispatch({ type: 'brand/added', payload: created });
    }, [token]);

    const updateBrand = React.useCallback(async (id: number, payload: BrandUpdate) => {
        if (!token) {
            throw new Error('Требуется авторизация');
        }
        const updated = await brandsApi.update(token, id, payload);
        dispatch({ type: 'brand/updated', payload: updated });
    }, [token]);

    const removeBrand = React.useCallback(async (id: number) => {
        if (!token) {
            throw new Error('Требуется авторизация');
        }
        const prevTotal = state.meta?.total ?? state.brands.length;
        const nextTotal = Math.max(0, prevTotal - 1);
        const nextPage = Math.max(
            1,
            Math.min(state.currentPage, Math.ceil(nextTotal / state.pageSize) || 1)
        );
        await brandsApi.remove(token, id);
        dispatch({ type: 'brand/removed', payload: id });
        await fetchBrands(nextPage);
    }, [token, state.meta, state.brands.length, state.pageSize, state.currentPage, fetchBrands]);

    const reloadBrand = React.useCallback(async (id: number) => {
        if (!token) {
            throw new Error('Требуется авторизация');
        }
        const reloaded = await brandsApi.get(token, id);
        dispatch({ type: 'brand/reloaded', payload: reloaded });
    }, [token]);

    const createModel = React.useCallback(async (brandId: number, payload: ModelInput) => {
        if (!token) {
            throw new Error('Требуется авторизация');
        }
        const created = await brandsApi.createModel(token, brandId, payload);
        dispatch({ type: 'model/added', payload: { brandId, model: created } });
    }, [token]);

    const updateModel = React.useCallback(async (brandId: number, modelId: number, payload: ModelUpdate) => {
        if (!token) {
            throw new Error('Требуется авторизация');
        }
        const updated = await brandsApi.updateModel(token, brandId, modelId, payload);
        dispatch({ type: 'model/updated', payload: { brandId, model: updated } });
    }, [token]);

    const removeModel = React.useCallback(async (brandId: number, modelId: number) => {
        if (!token) {
            throw new Error('Требуется авторизация');
        }
        await brandsApi.removeModel(token, brandId, modelId);
        dispatch({ type: 'model/removed', payload: { brandId, modelId } });
    }, [token]);

    const value = React.useMemo(() => ({
        brands: state.brands,
        meta: state.meta,
        currentPage: state.currentPage,
        pageSize: state.pageSize,
        isLoading: state.status === 'loading',
        error: state.error,
        refresh,
        setPage,
        createBrand,
        updateBrand,
        removeBrand,
        reloadBrand,
        createModel,
        updateModel,
        removeModel,
    }), [
        state.brands,
        state.meta,
        state.currentPage,
        state.pageSize,
        state.status,
        state.error,
        refresh,
        setPage,
        createBrand,
        updateBrand,
        removeBrand,
        reloadBrand,
        createModel,
        updateModel,
        removeModel,
    ]);

    return (
        <BrandsContext.Provider value={value}>
            {children}
        </BrandsContext.Provider>
    );
};
