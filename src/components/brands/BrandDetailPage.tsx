import React from 'react';
import { useBrands } from '../../hooks/useBrands';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Model, ModelInput, ModelUpdate } from '../../types';
import ModelItem from './ModelItem';
import ModelForm from './ModelForm';
import Pagination from '../ui/Pagination';
import { brandsApi } from '../../api/brands';
import { ApiError } from '../../api/client';

const BOOKS_PAGE_SIZE = 6;

const BrandDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const params = useParams();
    const brandId = Number(params.brandId);

    React.useEffect(() => {
        if (!brandId || Number.isNaN(brandId)) {
            navigate('/brands', { replace: true });
        }
    }, [brandId, navigate]);

    const { token } = useAuth();
    const {
        brands,
        updateBrand,
        removeBrand,
        createModel,
        updateModel,
        removeModel,
        reloadBrand,
    } = useBrands();

    const brand = brands.find(item => item.id === brandId);

    const [models, setModels] = React.useState<Model[]>([]);
    const [modelsPage, setModelsPage] = React.useState(1);
    const [modelsTotal, setModelsTotal] = React.useState(0);
    const [modelsLoading, setModelsLoading] = React.useState(false);
    const [modelsError, setModelsError] = React.useState<string | null>(null);
    const [actionError, setActionError] = React.useState<string | null>(null);
    const [editingModelId, setEditingModelId] = React.useState<number | null>(null);
    const [isEditingBrand, setIsEditingBrand] = React.useState(false);
    const [editTitle, setEditTitle] = React.useState(brand?.title ?? '');
    const [editDescription, setEditDescription] = React.useState(brand?.description ?? '');

    React.useEffect(() => {
        setEditTitle(brand?.title ?? '');
        setEditDescription(brand?.description ?? '');
    }, [brand?.title, brand?.description]);

    const fetchBrandIfNeeded = React.useCallback(async () => {
        if (!brandId || Number.isNaN(brandId)) {
            return;
        }
        if (!brand) {
            await reloadBrand(brandId);
        }
    }, [brand, brandId, reloadBrand]);

    const fetchModels = React.useCallback(async (page: number) => {
        if (!brandId || Number.isNaN(brandId)) {
            return;
        }
        if (!token) {
            setModelsError('Требуется авторизация');
            return;
        }
        setModelsLoading(true);
        setModelsError(null);
        try {
            const response = await brandsApi.listModels(token, brandId, {
                page,
                pageSize: BOOKS_PAGE_SIZE,
            });
            setModels(response.items);
            setModelsTotal(response.meta?.total ?? response.items.length);
            setModelsPage(response.meta?.page ?? page);
        } catch (errorInstance) {
            if (errorInstance instanceof ApiError || errorInstance instanceof Error) {
                setModelsError(errorInstance.message);
            } else {
                setModelsError('Не удалось загрузить модели');
            }
        } finally {
            setModelsLoading(false);
        }
    }, [brandId, token]);

    React.useEffect(() => {
        void fetchBrandIfNeeded();
    }, [fetchBrandIfNeeded]);

    React.useEffect(() => {
        if (brandId && !Number.isNaN(brandId)) {
            void fetchModels(modelsPage);
        }
    }, [fetchModels, brandId, modelsPage]);

    const handleCreateModel = async (payload: ModelInput) => {
        setActionError(null);
        try {
            await createModel(brandId, payload);
            await fetchModels(modelsPage);
        } catch (errorInstance) {
            setActionError('Не удалось добавить модель');
            throw errorInstance;
        }
    };

    const handleUpdateModel = async (modelId: number, payload: ModelUpdate) => {
        setActionError(null);
        try {
            await updateModel(brandId, modelId, payload);
            await fetchModels(modelsPage);
            setEditingModelId(null);
        } catch (errorInstance) {
            setActionError('Не удалось обновить модель');
            throw errorInstance;
        }
    };

    const handleToggleReserved = async (model: Model) => {
        setActionError(null);
        try {
            await updateModel(brandId, model.id, { reserved: !model.reserved });
            await fetchModels(modelsPage);
        } catch (errorInstance) {
            setActionError('Не удалось обновить статус');
        }
    };

    const handleRemoveModel = async (modelId: number) => {
        setActionError(null);
        try {
            await removeModel(brandId, modelId);
            const nextPage = Math.max(1, Math.min(modelsPage, Math.ceil((modelsTotal - 1) / BOOKS_PAGE_SIZE)));
            await fetchModels(nextPage);
        } catch (errorInstance) {
            setActionError('Не удалось удалить модель');
        }
    };

    const handleUpdateBrand = async (payload: { title?: string; description?: string }) => {
        setActionError(null);
        try {
            await updateBrand(brandId, payload);
            setIsEditingBrand(false);
        } catch (errorInstance) {
            setActionError('Не удалось обновить бренд');
            throw errorInstance;
        }
    };

    const handleDeleteBrand = async () => {
        setActionError(null);
        try {
            await removeBrand(brandId);
            navigate('/brands');
        } catch (errorInstance) {
            setActionError('Не удалось удалить бренд');
        }
    };

    if (!brandId || Number.isNaN(brandId)) {
        return null;
    }

    return (
        <div className="brand-detail">
            <div className="detail-head">
                <button className="button button_link" type="button" onClick={() => navigate('/brands')}>
                    ← К брендам
                </button>
                <div className="detail-meta">
                    <span>{modelsTotal} моделей</span>
                </div>
            </div>

            <div className="panel">
                <div className="detail-head">
                    <div>
                        <p className="eyebrow">Бренд</p>
                        <h2>{brand?.title ?? 'Бренд'}</h2>
                        {brand?.description && <p className="muted">{brand.description}</p>}
                    </div>
                    <div className="section-actions">
                        <button
                            type="button"
                            className="button button_ghost"
                            onClick={() => setIsEditingBrand(prev => !prev)}
                        >
                            {isEditingBrand ? 'Скрыть' : 'Редактировать'}
                        </button>
                        <button type="button" className="button button_danger" onClick={handleDeleteBrand}>
                            Удалить бренд
                        </button>
                    </div>
                </div>
                {isEditingBrand && (
                    <form
                        className="inline-edit"
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (!editTitle.trim()) return;
                            void handleUpdateBrand({
                                title: editTitle.trim(),
                                description: editDescription.trim(),
                            });
                        }}
                    >
                        <label className="input-label">
                            <span className="input-label__text">Название</span>
                            <input
                                className="input"
                                value={editTitle}
                                onChange={(event) => setEditTitle(event.target.value)}
                                required
                            />
                        </label>
                        <label className="input-label">
                            <span className="input-label__text">Описание</span>
                            <textarea
                                className="input textarea"
                                value={editDescription}
                                onChange={(event) => setEditDescription(event.target.value)}
                                rows={3}
                            />
                        </label>
                        <div className="inline-edit__actions">
                            <button type="button" className="button button_ghost" onClick={() => setIsEditingBrand(false)}>
                                Отмена
                            </button>
                            <button type="submit" className="button button_primary">
                                Сохранить
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {actionError && (
                <div className="callout callout_error" role="alert">
                    {actionError}
                </div>
            )}

            <div className="detail-grid">
                <div className="model-panel">
                    {modelsError && (
                        <div className="callout callout_error" role="alert">
                            {modelsError}
                        </div>
                    )}
                    {modelsLoading && models.length === 0 && (
                        <div className="empty-block">Загружаем модели…</div>
                    )}
                    {models.length === 0 && !modelsLoading && !modelsError && (
                        <div className="empty-block">У этого бренда пока нет моделей.</div>
                    )}
                    {models.length > 0 && (
                        <div className="model-stack-wrapper">
                            <div className="model-stack">
                                {models.map(model => (
                                    editingModelId === model.id ? (
                                        <div key={model.id} className="model-edit-inline">
                                            <ModelForm
                                                initialValue={model}
                                                submitLabel="Сохранить"
                                                onSubmit={(payload) => handleUpdateModel(model.id, payload)}
                                                onCancel={() => setEditingModelId(null)}
                                            />
                                        </div>
                                    ) : (
                                        <ModelItem
                                            key={model.id}
                                            model={model}
                                            onToggleReserved={() => {
                                                void handleToggleReserved(model);
                                            }}
                                            onEdit={() => setEditingModelId(model.id)}
                                            onDelete={() => {
                                                void handleRemoveModel(model.id);
                                            }}
                                        />
                                    )
                                ))}
                            </div>
                            <Pagination
                                currentPage={modelsPage}
                                totalItems={modelsTotal}
                                pageSize={BOOKS_PAGE_SIZE}
                                onPageChange={(page) => {
                                    setModelsPage(page);
                                    void fetchModels(page);
                                }}
                            />
                        </div>
                    )}
                </div>
                <div className="side-panel">
                    <div className="panel__header">
                        <p className="eyebrow">Модели</p>
                        <h3>Добавить модель</h3>
                    </div>
                    <ModelForm onSubmit={handleCreateModel} />
                </div>
            </div>
        </div>
    );
};

export default BrandDetailPage;
