import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateUserProjectDto } from './dto/create-user-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SecurityEvent } from '../security/security-event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    @InjectRepository(SecurityEvent)
    private readonly securityEventRepository: Repository<SecurityEvent>,
  ) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateUserProjectDto) {
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;
    return this.projectsService.createForUser(userId, organizationId, dto);
  }

  @Get()
  async findAll(@Request() req) {
    const userId = req.user.userId;
    return this.projectsService.findByOwner(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.projectsService.delete(id);
    return { message: 'Project deleted successfully' };
  }

  @Get(':id/security/events')
  async getSecurityEvents(
    @Param('id') projectId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    
    const events = await this.securityEventRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
      take: limitNum,
    });

    return events;
  }
}
