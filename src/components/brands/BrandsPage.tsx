import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrands } from '../../hooks/useBrands';
import type { BrandUpdate } from '../../types';
import BrandForm from './BrandForm';
import BrandCard from './BrandCard';
import Pagination from '../ui/Pagination';
import { ApiError } from '../../api/client';

const BrandsPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        brands,
        isLoading,
        error,
        refresh,
        setPage,
        createBrand,
        updateBrand,
        removeBrand,
        currentPage,
        pageSize,
        meta,
    } = useBrands();

    const [actionError, setActionError] = React.useState<string | null>(null);

    const getErrorMessage = React.useCallback((errorInstance: unknown, fallback: string) => {
        if (errorInstance instanceof ApiError) {
            return errorInstance.message;
        }
        if (errorInstance instanceof Error) {
            return errorInstance.message;
        }
        return fallback;
    }, []);

    const totalBrands = meta?.total ?? brands.length;
    const handleCreateBrand = async (payload: { title: string; description?: string }) => {
        setActionError(null);
        try {
            await createBrand(payload);
        } catch (errorInstance) {
            setActionError(getErrorMessage(errorInstance, 'Не удалось создать бренд'));
            throw errorInstance;
        }
    };

    const handleUpdateBrand = async (id: number, payload: BrandUpdate) => {
        setActionError(null);
        try {
            await updateBrand(id, payload);
        } catch (errorInstance) {
            setActionError(getErrorMessage(errorInstance, 'Не удалось обновить бренд'));
            throw errorInstance;
        }
    };

    const handleDeleteBrand = async (id: number) => {
        setActionError(null);
        try {
            await removeBrand(id);
        } catch (errorInstance) {
            setActionError(getErrorMessage(errorInstance, 'Не удалось удалить бренд'));
        }
    };

    return (
        <div className="page-section">
            <div className="section-head">
                <div>
                    <p className="eyebrow">Рабочее пространство</p>
                    <h2>Гараж</h2>
                    <p className="muted">Бренды и модели.</p>
                </div>
                <div className="section-actions">
                    <button className="button button_ghost" type="button" onClick={() => refresh()}>
                        Обновить данные
                    </button>
                </div>
            </div>

            <div className="panel panel_form">
                <div className="panel__header">
                    <p className="eyebrow">Создание</p>
                    <h3>Новый бренд</h3>
                    <p className="muted">Добавьте описание.</p>
                </div>
                <BrandForm onSubmit={handleCreateBrand} />
            </div>

            {actionError && (
                <div className="callout callout_error" role="alert">
                    {actionError}
                </div>
            )}

            <section className="panel panel_list">
                <div className="panel__header">
                    <p className="eyebrow">Списки</p>
                    <h3>Бренды</h3>
                </div>

                {isLoading && brands.length === 0 && (
                    <div className="empty-block">Загружаем бренды…</div>
                )}

                {!isLoading && error && (
                    <div className="empty-block">
                        <p>{error}</p>
                        <button className="button button_link" type="button" onClick={() => refresh()}>
                            Повторить запрос
                        </button>
                    </div>
                )}

                {brands.length === 0 && !isLoading && !error && (
                    <div className="empty-block">
                        <p>Брендов пока нет. Добавьте первый..</p>
                    </div>
                )}

                {brands.length > 0 && (
                    <>
                        <div className="tile-grid">
                            {brands.map(brand => (
                                <BrandCard
                                    key={brand.id}
                                    brand={brand}
                                    onUpdateBrand={handleUpdateBrand}
                                    onDeleteBrand={handleDeleteBrand}
                                    onOpen={() => navigate(`/brands/${brand.id}`)}
                                />
                            ))}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalBrands}
                            pageSize={pageSize}
                            onPageChange={page => {
                                void setPage(page);
                            }}
                        />
                    </>
                )}
            </section>
        </div>
    );
};

export default BrandsPage;
