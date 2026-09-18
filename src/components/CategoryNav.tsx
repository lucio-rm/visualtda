import React from 'react';
import { Category } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t, dict } = useLanguage();

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
            {t(dict.allCategoriesTab)}
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
              {t(cat.title)}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
