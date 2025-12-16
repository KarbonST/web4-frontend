import React from 'react';
import type { Model } from '../../types';
import { EditIcon, TrashIcon } from '../ui/Icons';

type ModelItemProps = {
    model: Model;
    onToggleReserved: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

const formatDate = (value: string) => {
    if (!value) {
        return '';
    }
    try {
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'short',
        }).format(new Date(value));
    } catch {
        return value;
    }
};

const ModelItem: React.FC<ModelItemProps> = ({ model, onToggleReserved, onEdit, onDelete }) => {
    const handleCardClick = () => {
        onToggleReserved();
    };

    const stopAnd = (callback: () => void) => (event: React.MouseEvent) => {
        event.stopPropagation();
        callback();
    };

    return (
        <div
            className={`model-row ${model.reserved ? 'model-row_reserved' : ''}`}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleCardClick();
                }
            }}
        >
            <div className="model-row__info">
                <div className="model-row__titles">
                    <p className="model-row__title">{model.title}</p>
                    <p className="model-row__vin">{model.vin}</p>
                </div>
                <div className="model-row__meta">
                    <span className="model-row__chip">
                        {model.reserved ? 'Зарезервировано' : 'Не зарезервировано'}
                    </span>
                    {model.updatedAt && <span className="model-row__meta-date">обн. {formatDate(model.updatedAt)}</span>}
                </div>
            </div>
            <div className="model-row__actions">
                <button
                    type="button"
                    onClick={stopAnd(onEdit)}
                    aria-label="Редактировать модель"
                    title="Редактировать"
                >
                    <EditIcon />
                </button>
                <button
                    type="button"
                    onClick={stopAnd(onDelete)}
                    aria-label="Удалить модель"
                    title="Удалить"
                >
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
};

export default ModelItem;
