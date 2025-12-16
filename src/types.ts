export type Model = {
    id: number;
    title: string;
    vin: string;
    reserved: boolean;
    createdAt: string;
    updatedAt: string;
}

export type ModelInput = {
    title: string;
    vin: string;
    reserved?: boolean;
}

export type ModelUpdate = Partial<ModelInput>;

export type Brand = {
    id: number;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    models: Model[];
}

export type BrandInput = {
    title: string;
    description?: string;
}

export type BrandUpdate = Partial<BrandInput>;

export type PaginationMeta = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

export type User = {
    id: number;
    email: string;
    name?: string | null;
};

export type AuthResponse = {
    token: string;
    user?: User;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = LoginPayload & {
    name: string;
};
