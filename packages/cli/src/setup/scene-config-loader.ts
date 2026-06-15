/**
 * @fileoverview Scene configuration loader (Story 8-4)
 * Loads and validates scene configuration from YAML files
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';
import { YAMLException } from 'js-yaml';

/**
 * Scene resource definition
 */
export interface SceneResource {
  /** Resource identifier (unique within scene) */
  id: string;
  /** Resource type (channel, product, coupon, etc.) */
  type: string;
  /** Human-readable description */
  description?: string;
  /** Dependencies on other resources */
  dependsOn?: string | string[];
  /** Resource creation parameters (may contain variables) */
  params: Record<string, any>;
  /** Output field mapping */
  output: Record<string, string>;
}

/**
 * Scene configuration
 */
export interface SceneConfig {
  /** Scene name (unique identifier) */
  name: string;
  /** Configuration version */
  version: string;
  /** Human-readable description */
  description?: string;
  /** Metadata (icon, category, tags) */
  metadata?: {
    icon?: string;
    category?: string;
    tags?: string[];
  };
  /** Resources to create */
  resources: SceneResource[];
  /** Output template for display */
  outputTemplate?: string;
  /** Next steps guidance */
  nextSteps?: Array<{
    command: string;
    description: string;
  }>;
}

/**
 * Scene information for listing
 */
export interface SceneInfo {
  name: string;
  description?: string | undefined;
  icon?: string | undefined;
  category?: string | undefined;
  tags?: string[] | undefined;
  resources?: number | undefined;
}

/** Supported resource types */
const SUPPORTED_RESOURCE_TYPES = ['channel', 'product', 'coupon', 'watchCondition', 'productEnabled', 'couponEnabled', 'couponChannel'];

/**
 * Scene configuration loader
 * Handles loading and validation of scene configurations
 */
export class SceneConfigLoader {
  private builtinScenesPath: string;
  private userScenesPath: string;

  constructor() {
    // Built-in scenes are in src/setup-scenes/
    this.builtinScenesPath = path.join(__dirname, '..', 'setup-scenes');
    // User scenes are in ~/.polyv/scenes/
    this.userScenesPath = path.join(os.homedir(), '.polyv', 'scenes');
  }

  /**
   * Load a scene configuration by name
   * Prefers builtin scenes over user scenes with same name
   * @param name Scene name
   * @returns Scene configuration
   */
  async loadScene(name: string): Promise<SceneConfig> {
    // Try builtin first
    try {
      return await this.loadBuiltinScene(name);
    } catch (builtinError) {
      // If builtin not found, try user scene
      try {
        return await this.loadUserScene(name);
      } catch (userError) {
        throw new Error(`Scene "${name}" not found. Use 'setup --list' to see available scenes.`);
      }
    }
  }

  /**
   * Load a built-in scene configuration
   * @param name Scene name
   * @returns Scene configuration
   */
  async loadBuiltinScene(name: string): Promise<SceneConfig> {
    const scenePath = path.join(this.builtinScenesPath, `${name}.yaml`);

    if (!fs.existsSync(scenePath)) {
      throw new Error(`Builtin scene "${name}" not found`);
    }

    const content = fs.readFileSync(scenePath, 'utf-8');
    let config: SceneConfig;
    try {
      config = yaml.load(content) as SceneConfig;
    } catch (e) {
      if (e instanceof YAMLException) {
        throw new Error(`Invalid YAML in builtin scene "${name}": ${e.message}`);
      }
      throw e;
    }

    // Validate configuration
    const errors = this.validateConfig(config);
    if (errors.length > 0) {
      throw new Error(`Invalid scene config: ${errors.join(', ')}`);
    }

    return config;
  }

  /**
   * Load a user-defined scene configuration
   * @param name Scene name
   * @returns Scene configuration
   */
  async loadUserScene(name: string): Promise<SceneConfig> {
    const scenePath = path.join(this.userScenesPath, `${name}.yaml`);

    if (!fs.existsSync(scenePath)) {
      throw new Error(`User scene "${name}" not found`);
    }

    const content = fs.readFileSync(scenePath, 'utf-8');
    let config: SceneConfig;
    try {
      config = yaml.load(content) as SceneConfig;
    } catch (e) {
      if (e instanceof YAMLException) {
        throw new Error(`Invalid YAML in user scene "${name}": ${e.message}`);
      }
      throw e;
    }

    // Validate configuration
    const errors = this.validateConfig(config);
    if (errors.length > 0) {
      throw new Error(`Invalid scene config: ${errors.join(', ')}`);
    }

    return config;
  }

  /**
   * List all built-in scenes
   * @returns Array of scene names
   */
  listBuiltinScenes(): string[] {
    if (!fs.existsSync(this.builtinScenesPath)) {
      return [];
    }

    const files = fs.readdirSync(this.builtinScenesPath);
    return files
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map(file => path.basename(file, path.extname(file)));
  }

  /**
   * List all user scenes
   * @returns Array of scene names
   */
  listUserScenes(): string[] {
    if (!fs.existsSync(this.userScenesPath)) {
      return [];
    }

    const files = fs.readdirSync(this.userScenesPath);
    return files
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map(file => path.basename(file, path.extname(file)));
  }

  /**
   * List all available scenes (builtin + user)
   * @returns Object with builtin and user scene names
   */
  listAllScenes(): { builtin: string[]; user: string[] } {
    return {
      builtin: this.listBuiltinScenes(),
      user: this.listUserScenes(),
    };
  }

  /**
   * Get scene information for display
   * @param name Scene name
   * @returns Scene information
   */
  getSceneInfo(name: string): SceneInfo {
    try {
      // Try to load the config to get details
      const config = this.loadSceneSync(name);
      const info: SceneInfo = {
        name: config.name,
        resources: config.resources.length,
      };
      if (config.description) info.description = config.description;
      if (config.metadata?.icon) info.icon = config.metadata.icon;
      if (config.metadata?.category) info.category = config.metadata.category;
      if (config.metadata?.tags) info.tags = config.metadata.tags;
      return info;
    } catch {
      return { name };
    }
  }

  /**
   * Synchronously load a scene (for listing purposes)
   */
  private loadSceneSync(name: string): SceneConfig {
    let scenePath = path.join(this.builtinScenesPath, `${name}.yaml`);

    if (!fs.existsSync(scenePath)) {
      scenePath = path.join(this.userScenesPath, `${name}.yaml`);
    }

    if (!fs.existsSync(scenePath)) {
      throw new Error(`Scene "${name}" not found`);
    }

    const content = fs.readFileSync(scenePath, 'utf-8');
    return yaml.load(content) as SceneConfig;
  }

  /**
   * Get execution order based on dependencies
   * @param config Scene configuration
   * @returns Array of resource IDs in execution order
   */
  getExecutionOrder(config: SceneConfig): string[] {
    const resources = config.resources;
    const ordered: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (resource: SceneResource) => {
      if (visited.has(resource.id)) {
        return;
      }

      if (visiting.has(resource.id)) {
        throw new Error(`Circular dependency detected at resource "${resource.id}"`);
      }

      visiting.add(resource.id);

      // Visit dependencies first
      if (resource.dependsOn) {
        const deps = Array.isArray(resource.dependsOn)
          ? resource.dependsOn
          : [resource.dependsOn];

        for (const depId of deps) {
          const depResource = resources.find(r => r.id === depId);
          if (!depResource) {
            throw new Error(`Dependency "${depId}" not found for resource "${resource.id}"`);
          }
          visit(depResource);
        }
      }

      visiting.delete(resource.id);
      visited.add(resource.id);
      ordered.push(resource.id);
    };

    // Visit all resources
    for (const resource of resources) {
      visit(resource);
    }

    return ordered;
  }

  /**
   * Validate scene configuration
   * @param config Configuration to validate
   * @returns Array of validation errors (empty if valid)
   */
  validateConfig(config: any): string[] {
    const errors: string[] = [];

    // Check required fields
    if (!config.name || config.name.trim() === '') {
      errors.push('name is required');
    }

    if (!config.version || config.version.trim() === '') {
      errors.push('version is required');
    }

    if (!Array.isArray(config.resources) || config.resources.length === 0) {
      errors.push('resources must not be empty');
      return errors; // No point checking resources if there are none
    }

    // Check for duplicate resource IDs
    const resourceIds = config.resources.map((r: SceneResource) => r.id).filter((id: unknown): id is string => typeof id === 'string');
    const uniqueIds = new Set<string>(resourceIds);
    if (resourceIds.length !== uniqueIds.size) {
      const duplicates = resourceIds.filter((id: string, index: number) => resourceIds.indexOf(id) !== index);
      errors.push(`duplicate resource IDs detected: ${[...new Set(duplicates)].join(', ')}`);
    }

    // Collect all resource IDs for dependency validation
    const resourceIdSet: Set<string> = uniqueIds;

    // Validate each resource
    for (const resource of config.resources) {
      if (!resource.id || resource.id.trim() === '') {
        errors.push('resource id is required');
      }

      if (!resource.type) {
        errors.push(`resource type is required for "${resource.id || 'unknown'}"`);
      } else if (!SUPPORTED_RESOURCE_TYPES.includes(resource.type)) {
        errors.push(`invalid resource type: ${resource.type}`);
      }

      // Validate dependsOn references
      if (resource.dependsOn) {
        const deps = Array.isArray(resource.dependsOn)
          ? resource.dependsOn
          : [resource.dependsOn];

        for (const dep of deps) {
          if (!resourceIdSet.has(dep as string)) {
            errors.push(`dependsOn references nonexistent resource "${dep}" in "${resource.id}"`);
          }
        }
      }

      // Validate output field references in params
      if (resource.params && typeof resource.params === 'object') {
        this.validateOutputFieldRefs(resource.params, resourceIdSet, resource.id, errors);
      }
    }

    // Check for circular dependencies
    try {
      this.getExecutionOrder(config);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Circular dependency')) {
        errors.push('circular dependency detected');
      }
    }

    return errors;
  }

  /**
   * Validate output field references in params
   */
  private validateOutputFieldRefs(
    obj: any,
    resourceIds: Set<string>,
    resourceId: string,
    errors: string[]
  ): void {
    if (typeof obj === 'string') {
      // Check for resource.field pattern
      const refPattern = /\{([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)\}/g;
      let match;
      while ((match = refPattern.exec(obj)) !== null) {
        const refPath = match[1];
        if (refPath) {
          const [refResourceId] = refPath.split('.');
          if (refResourceId && !resourceIds.has(refResourceId)) {
            errors.push(`reference to undefined resource "${refResourceId}" in "${resourceId}"`);
          }
        }
      }
    } else if (Array.isArray(obj)) {
      for (const item of obj) {
        this.validateOutputFieldRefs(item, resourceIds, resourceId, errors);
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const value of Object.values(obj)) {
        this.validateOutputFieldRefs(value, resourceIds, resourceId, errors);
      }
    }
  }
}
