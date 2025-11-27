import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from '../projects/projects.entity';

@Entity('security_events')
@Index(['projectId'])
@Index(['createdAt'])
@Index(['severity'])
export class SecurityEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @Column()
  identity: string;

  @Column()
  pattern: string;

  @Column()
  severity: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ default: true })
  blocked: boolean;

  @Column({ type: 'text', nullable: true })
  messagePreview: string;

  @CreateDateColumn()
  createdAt: Date;
}
