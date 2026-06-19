import { BaseHandler, OutputFormat } from './base.handler';
import type { AuthConfig } from '../types/auth';
import { PolyVValidationError } from '../utils/errors';
import { confirmWrite, parseJsonArray, type ApiServiceConfig } from '../utils/api-command';
import { CustomFieldServiceSdk } from '../services/custom-field-service';

export class CustomFieldHandler extends BaseHandler {
  private readonly service: CustomFieldServiceSdk;

  constructor(authConfig: AuthConfig, serviceConfig: ApiServiceConfig) {
    super();
    this.service = new CustomFieldServiceSdk(authConfig, serviceConfig);
  }

  async list(options: any): Promise<void> {
    this.show(await this.service.listCustomFields(), options.output);
  }

  async add(options: any): Promise<void> {
    this.requireFields(options, ['customFieldId', 'customFieldName', 'customFieldType']);
    await confirmWrite(options.force, `Create custom field ${options.customFieldId}?`);
    this.show({
      success: true,
      result: await this.service.addCustomField({
        customFieldId: options.customFieldId,
        customFieldName: options.customFieldName,
        customFieldType: options.customFieldType,
      }),
    }, options.output);
  }

  async saveValues(options: any): Promise<void> {
    const values = this.buildValues(options);
    await confirmWrite(options.force, `Save ${values.length} custom field viewer value(s)?`);
    this.show({ success: true, result: await this.service.addCustomFieldValue(values) }, options.output);
  }

  private buildValues(options: any): Array<{ viewerId: string; customFieldId: string; customFieldValue: string }> {
    if (options.values) {
      const parsed = parseJsonArray(options.values);
      if (parsed.length === 0) {
        throw new PolyVValidationError('values must not be empty', 'values', options.values, 'not_empty');
      }
      return parsed.map((item, index) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          throw new PolyVValidationError(`values[${index}] must be an object`, 'values', options.values, 'object_array');
        }
        const value = item as Record<string, unknown>;
        this.requireFields(value, ['viewerId', 'customFieldId', 'customFieldValue']);
        return {
          viewerId: String(value['viewerId']),
          customFieldId: String(value['customFieldId']),
          customFieldValue: String(value['customFieldValue']),
        };
      });
    }

    this.requireFields(options, ['viewerId', 'customFieldId', 'customFieldValue']);
    return [{
      viewerId: options.viewerId,
      customFieldId: options.customFieldId,
      customFieldValue: options.customFieldValue,
    }];
  }

  private requireFields(options: Record<string, unknown>, fields: string[]): void {
    const missing = fields.filter((field) => {
      const value = options[field];
      return value === undefined || value === null || value === '';
    });
    if (missing.length > 0) {
      throw new PolyVValidationError(`Missing required option(s): ${missing.join(', ')}`, 'options', options, 'required');
    }
  }

  private show(data: unknown, output: OutputFormat = 'table'): void {
    this.displayData(data, output);
  }
}
