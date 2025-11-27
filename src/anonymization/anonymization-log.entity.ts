import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../projects/projects.entity';

/**
 * Anonymization Log Entity
 *
 * Tracks PII detection events for audit and analytics.
 */
@Entity('anonymization_logs')
@Index(['projectId', 'createdAt'])
export class AnonymizationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column('uuid')
  @Index()
  projectId: string;

  @Column()
  identity: string;

  @Column({ default: '' })
  session: string;

  @Column('text', { array: true })
  piiTypesDetected: string[];

  @Column({ type: 'int', default: 0 })
  replacementCount: number;

  @Column({ length: 100 })
  endpoint: string;

  @CreateDateColumn()
  createdAt: Date;
}
