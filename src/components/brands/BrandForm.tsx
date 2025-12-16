import React from 'react';
import type { BrandInput } from '../../types';

type BrandFormProps = {
    initialValue?: BrandInput;
    submitLabel?: string;
    onSubmit: (payload: BrandInput) => Promise<void> | void;
    onCancel?: () => void;
};

const BrandForm: React.FC<BrandFormProps> = ({
                                                           initialValue,
                                                           submitLabel = 'Создать бренд',
                                                           onSubmit,
                                                           onCancel,
                                                       }) => {
    const [title, setTitle] = React.useState(initialValue?.title ?? '');
    const [description, setDescription] = React.useState(initialValue?.description ?? '');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        setTitle(initialValue?.title ?? '');
        setDescription(initialValue?.description ?? '');
    }, [initialValue]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!title.trim()) {
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({
                title: title.trim(),
                description: description.trim(),
            });
            if (!initialValue) {
                setTitle('');
                setDescription('');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="brand-form" onSubmit={handleSubmit}>
            <div className="brand-form__grid">
                <label className="input-label">
                    <span className="input-label__text">
                        Название
                        <span className="input-label__required">*</span>
                    </span>
                    <input
                        className="input"
                        value={title}
                        onChange={event => setTitle(event.target.value)}
                        placeholder="Например: Kia"
                        required
                    />
                </label>
                <label className="input-label">
                    <span className="input-label__text">Описание</span>
                    <textarea
                        className="input textarea"
                        value={description}
                        onChange={event => setDescription(event.target.value)}
                        placeholder="Корейский автомобильный бренд."
                        rows={4}
                    />
                </label>
            </div>

            <div className="brand-form__actions">
                {onCancel && (
                    <button type="button" className="button button_link" onClick={onCancel}>
                        Отмена
                    </button>
                )}
                <button type="submit" className="button button_primary" disabled={isSubmitting}>
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};

export default BrandForm;
