import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IdentityLimitsService, CreateIdentityLimitDto, UpdateIdentityLimitDto } from './identity-limits.service';
import { ProjectsService } from '../projects/projects.service';

@Controller('api/projects/:projectKey/identities')
@UseGuards(JwtAuthGuard)
export class IdentityLimitsController {
  constructor(
    private readonly identityLimitsService: IdentityLimitsService,
    private readonly projectsService: ProjectsService,
  ) {}

  /**
   * List all identity limits for a project
   * GET /api/projects/:projectKey/identities
   */
  @Get()
  async list(
    @Param('projectKey') projectKey: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const project = await this.projectsService.findByProjectKey(projectKey);
    
    const result = await this.identityLimitsService.listForProject(project.id, {
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return {
      items: result.items.map(this.formatIdentityLimit),
      total: result.total,
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0,
    };
  }

  /**
   * Get limits for a specific identity
   * GET /api/projects/:projectKey/identities/:identity
   */
  @Get(':identity')
  async get(
    @Param('projectKey') projectKey: string,
    @Param('identity') identity: string,
  ) {
    const project = await this.projectsService.findByProjectKey(projectKey);
    const identityLimit = await this.identityLimitsService.getForIdentity(
      project.id,
      identity,
    );

    if (!identityLimit) {
      return {
        identity,
        limits: null,
        message: 'No custom limits set. Using project/tier defaults.',
      };
    }

    return this.formatIdentityLimit(identityLimit);
  }

  /**
   * Create or update limits for an identity (upsert)
   * POST /api/projects/:projectKey/identities
   */
  @Post()
  async create(
    @Param('projectKey') projectKey: string,
    @Body() dto: CreateIdentityLimitDto,
  ) {
    const project = await this.projectsService.findByProjectKey(projectKey);
    const identityLimit = await this.identityLimitsService.upsert(
      project.id,
      dto,
    );

    return this.formatIdentityLimit(identityLimit);
  }

  /**
   * Update limits for an identity
   * PUT /api/projects/:projectKey/identities/:identity
   */
  @Put(':identity')
  async update(
    @Param('projectKey') projectKey: string,
    @Param('identity') identity: string,
    @Body() dto: UpdateIdentityLimitDto,
  ) {
    const project = await this.projectsService.findByProjectKey(projectKey);
    const identityLimit = await this.identityLimitsService.update(
      project.id,
      identity,
      dto,
    );

    return this.formatIdentityLimit(identityLimit);
  }

  /**
   * Delete limits for an identity (reverts to defaults)
   * DELETE /api/projects/:projectKey/identities/:identity
   */
  @Delete(':identity')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('projectKey') projectKey: string,
    @Param('identity') identity: string,
  ) {
    const project = await this.projectsService.findByProjectKey(projectKey);
    await this.identityLimitsService.delete(project.id, identity);
  }

  /**
   * Bulk create/update identity limits
   * POST /api/projects/:projectKey/identities/bulk
   */
  @Post('bulk')
  async bulkUpsert(
    @Param('projectKey') projectKey: string,
    @Body() body: { items: CreateIdentityLimitDto[] },
  ) {
    const project = await this.projectsService.findByProjectKey(projectKey);
    const results = await this.identityLimitsService.bulkUpsert(
      project.id,
      body.items,
    );

    return {
      items: results.map(this.formatIdentityLimit),
      count: results.length,
    };
  }

  private formatIdentityLimit(limit: any) {
    return {
      identity: limit.identity,
      requestLimit: limit.requestLimit,
      tokenLimit: limit.tokenLimit,
      customResponse: limit.customResponse,
      metadata: limit.metadata,
      enabled: limit.enabled,
      createdAt: limit.createdAt,
      updatedAt: limit.updatedAt,
    };
  }
}

