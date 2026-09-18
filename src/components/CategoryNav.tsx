import React from 'react';
import { Category } from '../types';

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory
}) => {
  return (
    <nav className="category-nav" aria-label="Categorías de algoritmos">
      <ul className="category-list" role="tablist">
        <li role="presentation">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategoryId === null}
            className={`category-tab ${activeCategoryId === null ? 'active' : ''}`}
            onClick={() => onSelectCategory(null)}
          >
            Todos
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat.id} role="presentation">
            <button
              type="button"
              role="tab"
              aria-selected={activeCategoryId === cat.id}
              className={`category-tab ${activeCategoryId === cat.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              {cat.title.es}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
