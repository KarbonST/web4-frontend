import React from 'react';
import type { ModelInput } from '../../types';

type ModelFormProps = {
    initialValue?: ModelInput;
    submitLabel?: string;
    onSubmit: (payload: ModelInput) => Promise<void> | void;
    onCancel?: () => void;
};

const ModelForm: React.FC<ModelFormProps> = ({
                                               initialValue,
                                               submitLabel = 'Добавить модель',
                                               onSubmit,
                                               onCancel,
                                           }) => {
    const [title, setTitle] = React.useState(initialValue?.title ?? '');
    const [vin, setVin] = React.useState(initialValue?.vin ?? '');
    const [reserved, setReserved] = React.useState(Boolean(initialValue?.reserved));
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        setTitle(initialValue?.title ?? '');
        setVin(initialValue?.vin ?? '');
        setReserved(Boolean(initialValue?.reserved));
    }, [initialValue]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!title.trim() || !vin.trim()) {
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({
                title: title.trim(),
                vin: vin.trim(),
                reserved,
            });
            if (!initialValue) {
                setTitle('');
                setVin('');
                setReserved(false);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="model-form" onSubmit={handleSubmit}>
            <div className="model-form__grid">
                <label className="input-label">
                    <span className="input-label__text">
                        Название модели
                        <span className="input-label__required">*</span>
                    </span>
                    <input
                        className="input"
                        value={title}
                        onChange={event => setTitle(event.target.value)}
                        placeholder="Например: Rio"
                        required
                    />
                </label>
                <label className="input-label">
                    <span className="input-label__text">
                        VIN номер
                        <span className="input-label__required">*</span>
                    </span>
                    <input
                        className="input"
                        value={vin}
                        onChange={event => setVin(event.target.value)}
                        placeholder="JHMCM56557C404453"
                        required
                    />
                </label>
                <label className="checkbox">
                    <input
                        type="checkbox"
                        checked={reserved}
                        onChange={event => setReserved(event.target.checked)}
                    />
                    <span>Зарезервирована</span>
                </label>
            </div>

            <div className="model-form__actions">
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

export default ModelForm;
