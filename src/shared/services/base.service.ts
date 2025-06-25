import { PrismaService } from '@core/prisma/prisma.service';

export abstract class BaseService<T> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly modelName: string,
  ) {}

  /**
   * Find all active records (not soft deleted)
   */
  async findAll(): Promise<T[]> {
    return this.prisma[this.modelName].findMany({
      where: { deletedAt: null },
    });
  }

  /**
   * Find one active record by ID
   */
  async findOne(id: number): Promise<T | null> {
    const record = await this.prisma[this.modelName].findUnique({
      where: { id },
    });

    if (!record || record.deletedAt) {
      return null;
    }

    return record;
  }

  /**
   * Soft delete a record
   */
  async softDelete(id: number): Promise<T | null> {
    return this.prisma[this.modelName].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Restore a soft deleted record
   */
  async restore(id: number): Promise<T | null> {
    return this.prisma[this.modelName].update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Find all records including soft deleted ones
   */
  async findAllWithDeleted(): Promise<T[]> {
    return this.prisma[this.modelName].findMany({
      where: { withDeleted: true },
    });
  }

  /**
   * Find one record including soft deleted ones
   */
  async findOneWithDeleted(id: number): Promise<T | null> {
    return this.prisma[this.modelName].findUnique({
      where: { id },
      withDeleted: true,
    });
  }

  /**
   * Permanently delete a record
   */
  async hardDelete(id: number): Promise<T | null> {
    return this.prisma[this.modelName].delete({
      where: { id },
    });
  }
} 