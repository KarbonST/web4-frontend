import { apiRequest } from './client';
import type {
    Brand,
    BrandInput,
    BrandUpdate,
    PaginationMeta,
    Model,
    ModelInput,
    ModelUpdate,
} from '../types';
import {
    normalizeBrand,
    normalizeModel,
    serializeBrandInput,
    serializeBrandUpdate,
    serializeModelInput,
} from '../utils/brands';

type ListParams = {
    page?: number;
    pageSize?: number;
};

type RawBrandList =
    | Brand[]
    | {
    items?: Brand[];
    data?: Brand[];
    results?: Brand[];
    meta?: Partial<PaginationMeta>;
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
};

type RawModelList =
    | Model[]
    | {
    items?: Model[];
    data?: Model[];
    results?: Model[];
    meta?: Partial<PaginationMeta>;
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
};

const buildPathWithPagination = (base: string, params?: ListParams) => {
    if (!params) {
        return base;
    }
    const searchParams = new URLSearchParams();
    if (params.page) {
        searchParams.set('page', String(params.page));
    }
    if (params.pageSize) {
        searchParams.set('pageSize', String(params.pageSize));
    }
    const query = searchParams.toString();
    return query ? `${base}?${query}` : base;
};

const extractMeta = (payload: RawBrandList | RawModelList): PaginationMeta | undefined => {
    if (Array.isArray(payload)) {
        return undefined;
    }
    const meta = payload.meta ?? {};
    const page = meta.page ?? payload.page;
    const pageSize = meta.pageSize ?? payload.pageSize;
    const total = meta.total ?? payload.total;
    const totalPages = meta.totalPages ?? payload.totalPages;

    if (
        page !== undefined &&
        pageSize !== undefined &&
        total !== undefined &&
        totalPages !== undefined
    ) {
        return {
            page: Number(page),
            pageSize: Number(pageSize),
            total: Number(total),
            totalPages: Number(totalPages),
        };
    }
    return undefined;
};

const extractBrands = (payload: RawBrandList) => {
    const items = Array.isArray(payload)
        ? payload
        : payload.items ?? payload.data ?? payload.results ?? [];

    return {
        items: items.map(normalizeBrand),
        meta: extractMeta(payload),
    };
};

const extractModels = (payload: RawModelList) => {
    const items = Array.isArray(payload)
        ? payload
        : payload.items ?? payload.data ?? payload.results ?? [];

    return {
        items: items.map(normalizeModel),
        meta: extractMeta(payload),
    };
};

export const brandsApi = {
    list: async (token: string, params?: ListParams) => {
        const response = await apiRequest<RawBrandList>(buildPathWithPagination('/brands', params), { token });
        return extractBrands(response);
    },
    get: async (token: string, id: number) => {
        const response = await apiRequest<Brand>(`/brands/${id}`, { token });
        return normalizeBrand(response);
    },
    create: async (token: string, payload: BrandInput) => {
        const response = await apiRequest<Brand>('/brands', {
            method: 'POST',
            token,
            body: JSON.stringify(serializeBrandInput(payload)),
        });
        return normalizeBrand(response);
    },
    update: async (token: string, id: number, payload: BrandUpdate) => {
        const response = await apiRequest<Brand>(`/brands/${id}`, {
            method: 'PUT',
            token,
            body: JSON.stringify(serializeBrandUpdate(payload)),
        });
        return normalizeBrand(response);
    },
    remove: async (token: string, id: number) => {
        await apiRequest<void>(`/brands/${id}`, {
            method: 'DELETE',
            token,
        });
        return id;
    },
    listModels: async (token: string, brandId: number, params?: ListParams) => {
        const response = await apiRequest<RawModelList>(
            buildPathWithPagination(`/brands/${brandId}/models`, params),
            { token }
        );
        return extractModels(response);
    },
    createModel: async (token: string, brandId: number, payload: ModelInput) => {
        const response = await apiRequest<Model>(`/brands/${brandId}/models`, {
            method: 'POST',
            token,
            body: JSON.stringify(serializeModelInput(payload)),
        });
        return normalizeModel(response);
    },
    updateModel: async (token: string, brandId: number, modelId: number, payload: ModelUpdate) => {
        const response = await apiRequest<Model>(`/brands/${brandId}/models/${modelId}`, {
            method: 'PUT',
            token,
            body: JSON.stringify(serializeModelInput(payload)),
        });
        return normalizeModel(response);
    },
    getModel: async (token: string, brandId: number, modelId: number) => {
        const response = await apiRequest<Model>(`/brands/${brandId}/models/${modelId}`, { token });
        return normalizeModel(response);
    },
    removeModel: async (token: string, brandId: number, modelId: number) => {
        await apiRequest<void>(`/brands/${brandId}/models/${modelId}`, {
            method: 'DELETE',
            token,
        });
        return modelId;
    },
};
