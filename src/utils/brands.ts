import type {
    Brand,
    BrandInput,
    Model,
    ModelInput,
    ModelUpdate,
} from '../types';

const generateId = () => Date.now() + Math.floor(Math.random() * 10000);

const normalizeString = (value: unknown) => (typeof value === 'string' ? value : '');

export const normalizeModel = (model: Partial<Model>): Model => {
    const id = typeof model.id === 'number'
        ? model.id
        : Number(model.id ?? generateId());

    return {
        id: Number.isFinite(id) ? id : generateId(),
        title: normalizeString(model.title),
        vin: normalizeString(model.vin),
        reserved: Boolean(model.reserved),
        createdAt: normalizeString(model.createdAt),
        updatedAt: normalizeString(model.updatedAt),
    };
};

export const normalizeBrand = (brand: Partial<Brand>): Brand => {
    const id = typeof brand.id === 'number'
        ? brand.id
        : Number(brand.id ?? generateId());

    return {
        id: Number.isFinite(id) ? id : generateId(),
        title: normalizeString(brand.title),
        description: normalizeString(brand.description),
        createdAt: normalizeString(brand.createdAt),
        updatedAt: normalizeString(brand.updatedAt),
        models: Array.isArray(brand.models)
            ? brand.models.map(normalizeModel)
            : [],
    };
};

export const serializeBrandInput = (input: BrandInput) => ({
    title: input.title.trim(),
    description: (input.description ?? '').trim(),
});

export const serializeBrandUpdate = (input: Partial<BrandInput>) => ({
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.description !== undefined ? { description: input.description.trim() } : {}),
});

export const serializeModelInput = (input: ModelInput | ModelUpdate) => {
    const payload: Record<string, unknown> = {};

    if (input.title !== undefined) {
        payload.title = input.title.trim();
    }
    if (input.vin !== undefined) {
        payload.vin = input.vin.trim();
    }
    if (input.reserved !== undefined) {
        payload.reserved = Boolean(input.reserved);
    }

    return payload;
};
