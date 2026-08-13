import { BaseService } from './baseService';
import publishers, { Publisher } from '../data/publishers';

// Create publisher service using the base service with fallback data
const publisherBaseService = new BaseService<Publisher>('publishers', publishers);

// Publisher service object that wraps all API functions
export const publisherService = {
    getAll: () => publisherBaseService.getAll(),
    create: (publisherData: Partial<Publisher>) => publisherBaseService.create(publisherData),
    update: (id: number, publisherData: Partial<Publisher>) => publisherBaseService.update(id, publisherData),
    delete: (id: number) => publisherBaseService.delete(id)
};
