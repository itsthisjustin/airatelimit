import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('usage_counters')
@Index(['projectId', 'identity', 'periodStart', 'model', 'session'], {
  unique: true,
})
@Index(['projectId', 'periodStart'])
@Index(['projectId', 'model'])
@Index(['projectId', 'session'])
export class UsageCounter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  projectId: string;

  @Column()
  identity: string;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ default: '' })
  model: string;

  // Session identifier for session-based rate limiting
  @Column({ default: '' })
  session: string;

  @Column({ default: 0 })
  requestsUsed: number;

  @Column({ default: 0 })
  tokensUsed: number;

  @Column({ type: 'int', default: 0 })
  inputTokens: number;

  @Column({ type: 'int', default: 0 })
  outputTokens: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  costUsd: number;

  @Column({ type: 'int', default: 0 })
  blockedRequests: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  savedUsd: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
