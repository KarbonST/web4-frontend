import React from 'react';
import type { Brand, BrandUpdate } from '../../types';
import { EditIcon, TrashIcon } from '../ui/Icons';

type BrandCardProps = {
    brand: Brand;
    onUpdateBrand: (id: number, payload: BrandUpdate) => Promise<void>;
    onDeleteBrand: (id: number) => Promise<void>;
    onOpen: () => void;
};

const formatDate = (value: string) => {
    if (!value) return '';
    try {
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'short',
        }).format(new Date(value));
    } catch {
        return value;
    }
};

const BrandCard: React.FC<BrandCardProps> = ({
                                                           brand,
                                                           onUpdateBrand,
                                                           onDeleteBrand,
                                                           onOpen,
                                                       }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [editTitle, setEditTitle] = React.useState(brand.title);
    const [editDescription, setEditDescription] = React.useState(brand.description ?? '');

    React.useEffect(() => {
        setEditTitle(brand.title);
        setEditDescription(brand.description ?? '');
    }, [brand.title, brand.description]);

    const handleUpdate = async (payload: BrandUpdate) => {
        setIsSubmitting(true);
        try {
            await onUpdateBrand(brand.id, payload);
            setIsEditing(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitInline = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editTitle.trim()) {
            return;
        }
        await handleUpdate({
            title: editTitle.trim(),
            description: editDescription.trim(),
        });
    };

    return (
        <article
            className="brand-tile"
            role="button"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpen();
                }
            }}
        >
            <div className="brand-tile__top">
                <div>
                    <p className="eyebrow">Моделей: {brand.models?.length ?? 0}</p>
                    <h3 className="brand-tile__title">{brand.title || 'Без названия'}</h3>
                    {brand.description && (
                        <p className="brand-tile__description">{brand.description}</p>
                    )}
                </div>
                <div className="brand-tile__meta">
                    {brand.updatedAt && <span>обновлено {formatDate(brand.updatedAt)}</span>}
                </div>
            </div>

            <div className="brand-tile__footer" onClick={(event) => event.stopPropagation()}>
                <button
                    type="button"
                    className="button button_link"
                    onClick={() => setIsEditing(prev => !prev)}
                >
                    <EditIcon /> {isEditing ? 'Отмена' : 'Редактировать'}
                </button>
                <button
                    type="button"
                    className="button button_danger brand-tile__delete"
                    onClick={() => {
                        void onDeleteBrand(brand.id);
                    }}
                >
                    <TrashIcon /> Удалить
                </button>
            </div>

            {isEditing && (
                <form
                    className="inline-edit inline-edit_overlay"
                    onClick={(event) => event.stopPropagation()}
                    onSubmit={handleSubmitInline}
                >
                    <label className="input-label">
                        <span className="input-label__text">
                            Название
                        </span>
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
                        <button type="button" className="button button_ghost" onClick={() => setIsEditing(false)}>
                            Отмена
                        </button>
                        <button type="submit" className="button button_primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Сохраняем…' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            )}
        </article>
    );
};

export default BrandCard;
