import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
                                                   currentPage,
                                                   totalItems,
                                                   pageSize,
                                                   onPageChange
                                               }) => {
    const totalPages = Math.ceil(totalItems / pageSize);

    if (totalPages <= 1) {
        return null;
    }

    const pages: number[] = [];
    for (let page = 1; page <= totalPages; page++) {
        pages.push(page);
    }

    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="pagination">
            <button
                type="button"
                className="pagination__control pagination__control--prev"
                onClick={handlePrev}
                disabled={currentPage === 1}
            >
                Назад
            </button>

            <div className="pagination__pages">
                {pages.map((page) => {
                    const isActive = page === currentPage;
                    return (
                        <button
                            key={page}
                            type="button"
                            className={`pagination__page ${
                                isActive ? 'pagination__page--active' : ''
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                            onClick={() => {
                                if (!isActive) {
                                    onPageChange(page);
                                }
                            }}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                className="pagination__control pagination__control--next"
                onClick={handleNext}
                disabled={currentPage === totalPages}
            >
                Вперёд
            </button>
        </div>
    );
};

export default Pagination;
