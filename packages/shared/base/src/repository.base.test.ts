/**
 * RepositoryBase Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RepositoryBase, RepositoryError, type QueryOptions } from './repository.base.js';
import type { SupabaseClient } from '@supabase/supabase-js';

interface TestEntity {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Create a concrete implementation for testing
class TestRepository extends RepositoryBase<TestEntity> {
  protected readonly tableName = 'test_entities';

  constructor(db: SupabaseClient) {
    super(db, 'TestEntity');
  }
}

// Helper to create mock Supabase client
function createMockSupabaseClient() {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  };

  return {
    from: vi.fn().mockReturnValue(mockChain),
    _chain: mockChain,
  } as unknown as SupabaseClient;
}

describe('RepositoryBase', () => {
  let mockDb: SupabaseClient;
  let repository: TestRepository;
  let mockChain: any;

  beforeEach(() => {
    mockDb = createMockSupabaseClient();
    mockChain = (mockDb as any)._chain;
    repository = new TestRepository(mockDb);
  });

  describe('findById()', () => {
    it('should find entity by ID', async () => {
      const testEntity: TestEntity = {
        id: 'test-id',
        name: 'Test Entity',
        email: 'test@example.com',
        createdAt: new Date(),
      };

      mockChain.single.mockResolvedValue({ data: testEntity, error: null });

      const result = await repository.findById('test-id');

      expect(result).toEqual(testEntity);
      expect(mockDb.from).toHaveBeenCalledWith('test_entities');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'test-id');
      expect(mockChain.single).toHaveBeenCalled();
    });

    it('should return null when entity not found', async () => {
      mockChain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should throw RepositoryError on database error', async () => {
      mockChain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST000', message: 'Database error' },
      });

      await expect(repository.findById('test-id')).rejects.toThrow(RepositoryError);
      await expect(repository.findById('test-id')).rejects.toThrow('Failed to find test_entities');
    });
  });

  describe('findAll()', () => {
    it('should find all entities', async () => {
      const entities: TestEntity[] = [
        { id: '1', name: 'Entity 1', email: 'test1@example.com', createdAt: new Date() },
        { id: '2', name: 'Entity 2', email: 'test2@example.com', createdAt: new Date() },
      ];

      // Reset the mock chain for this test
      mockChain.select.mockReturnValue({ data: entities, error: null });

      const result = await repository.findAll();

      expect(result).toEqual(entities);
      expect(mockDb.from).toHaveBeenCalledWith('test_entities');
      expect(mockChain.select).toHaveBeenCalledWith('*');
    });

    it('should apply limit option', async () => {
      mockChain.limit.mockReturnValue({ data: [], error: null });

      await repository.findAll({ limit: 10 });

      expect(mockChain.limit).toHaveBeenCalledWith(10);
    });

    it('should apply offset and limit with range', async () => {
      mockChain.range.mockReturnValue({ data: [], error: null });

      await repository.findAll({ offset: 20, limit: 10 });

      expect(mockChain.range).toHaveBeenCalledWith(20, 29);
    });

    it('should apply orderBy option', async () => {
      mockChain.order.mockReturnValue({ data: [], error: null });

      await repository.findAll({ orderBy: 'createdAt', orderDirection: 'desc' });

      expect(mockChain.order).toHaveBeenCalledWith('createdAt', { ascending: false });
    });

    it('should throw RepositoryError on database error', async () => {
      mockChain.select.mockReturnValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(repository.findAll()).rejects.toThrow(RepositoryError);
    });
  });

  describe('create()', () => {
    it('should create new entity', async () => {
      const newEntity = { name: 'New Entity', email: 'new@example.com' };
      const createdEntity: TestEntity = {
        id: 'new-id',
        ...newEntity,
        createdAt: new Date(),
      };

      mockChain.single.mockResolvedValue({ data: createdEntity, error: null });

      const result = await repository.create(newEntity);

      expect(result).toEqual(createdEntity);
      expect(mockDb.from).toHaveBeenCalledWith('test_entities');
      expect(mockChain.insert).toHaveBeenCalledWith(newEntity);
      expect(mockChain.select).toHaveBeenCalled();
      expect(mockChain.single).toHaveBeenCalled();
    });

    it('should throw RepositoryError on creation failure', async () => {
      mockChain.single.mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' },
      });

      await expect(repository.create({ name: 'Test' })).rejects.toThrow(RepositoryError);
      await expect(repository.create({ name: 'Test' })).rejects.toThrow('Failed to create test_entities');
    });
  });

  describe('update()', () => {
    it('should update existing entity', async () => {
      const updates = { name: 'Updated Name' };
      const updatedEntity: TestEntity = {
        id: 'test-id',
        name: 'Updated Name',
        email: 'test@example.com',
        createdAt: new Date(),
      };

      mockChain.single.mockResolvedValue({ data: updatedEntity, error: null });

      const result = await repository.update('test-id', updates);

      expect(result).toEqual(updatedEntity);
      expect(mockDb.from).toHaveBeenCalledWith('test_entities');
      expect(mockChain.update).toHaveBeenCalledWith(updates);
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'test-id');
      expect(mockChain.select).toHaveBeenCalled();
      expect(mockChain.single).toHaveBeenCalled();
    });

    it('should throw RepositoryError on update failure', async () => {
      mockChain.single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(repository.update('test-id', { name: 'Test' })).rejects.toThrow(RepositoryError);
    });
  });

  describe('delete()', () => {
    it('should delete entity', async () => {
      mockChain.eq.mockResolvedValue({ error: null });

      await expect(repository.delete('test-id')).resolves.not.toThrow();

      expect(mockDb.from).toHaveBeenCalledWith('test_entities');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'test-id');
    });

    it('should throw RepositoryError on deletion failure', async () => {
      mockChain.eq.mockResolvedValue({ error: { message: 'Deletion failed' } });

      await expect(repository.delete('test-id')).rejects.toThrow(RepositoryError);
      await expect(repository.delete('test-id')).rejects.toThrow('Failed to delete test_entities');
    });
  });

  describe('executeQuery()', () => {
    it('should execute custom query successfully', async () => {
      const testData = { id: 'test', value: 42 };
      const queryFn = vi.fn().mockResolvedValue({ data: testData, error: null });

      // Access protected method via subclass
      class TestRepositoryWithQuery extends TestRepository {
        async testExecuteQuery() {
          return this.executeQuery(queryFn, 'test operation');
        }
      }

      const repo = new TestRepositoryWithQuery(mockDb);
      const result = await repo.testExecuteQuery();

      expect(result).toEqual(testData);
      expect(queryFn).toHaveBeenCalled();
    });

    it('should throw RepositoryError on query error', async () => {
      const queryFn = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Query failed' },
      });

      class TestRepositoryWithQuery extends TestRepository {
        async testExecuteQuery() {
          return this.executeQuery(queryFn, 'test operation');
        }
      }

      const repo = new TestRepositoryWithQuery(mockDb);

      await expect(repo.testExecuteQuery()).rejects.toThrow(RepositoryError);
      await expect(repo.testExecuteQuery()).rejects.toThrow('Failed to execute test operation');
    });

    it('should throw error if no data returned', async () => {
      const queryFn = vi.fn().mockResolvedValue({ data: null, error: null });

      class TestRepositoryWithQuery extends TestRepository {
        async testExecuteQuery() {
          return this.executeQuery(queryFn, 'test operation');
        }
      }

      const repo = new TestRepositoryWithQuery(mockDb);

      await expect(repo.testExecuteQuery()).rejects.toThrow(RepositoryError);
      await expect(repo.testExecuteQuery()).rejects.toThrow('Failed to execute test operation');
    });
  });
});

describe('RepositoryError', () => {
  it('should create error with message and cause', () => {
    const cause = new Error('Original error');
    const error = new RepositoryError('Test error', cause);

    expect(error.message).toBe('Test error');
    expect(error.cause).toBe(cause);
    expect(error.name).toBe('RepositoryError');
  });

  it('should create error without cause', () => {
    const error = new RepositoryError('Test error');

    expect(error.message).toBe('Test error');
    expect(error.cause).toBeUndefined();
  });
});
