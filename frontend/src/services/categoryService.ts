import { BaseService } from './baseService';
import categories, { Category } from '../data/categories';

// Create category service using the base service with fallback data
const categoryBaseService = new BaseService<Category>('categories', categories);

// Category service object that wraps all API functions
export const categoryService = {
    getAll: () => categoryBaseService.getAll(),
    create: (categoryData: Partial<Category>) => categoryBaseService.create(categoryData),
    update: (id: number, categoryData: Partial<Category>) => categoryBaseService.update(id, categoryData),
    delete: (id: number) => categoryBaseService.delete(id)
};
