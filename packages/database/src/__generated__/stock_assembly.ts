/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: +1JxIzPDXtM0DrvWN4w5APwLGqnqNZa4uYMzC+D6iU9tPaBjaz55bapwAFUlmW1kqUgKJt3cCWJFY4sqgl89tA==
 */

/* eslint-disable */
// tslint:disable

import AttachmentPoint from './attachment_point'
import BrandedPart from './branded_part'

interface StockAssembly {
  attachment_point_id: AttachmentPoint['attachment_point_id']
  child_branded_part_id: BrandedPart['branded_part_id']
  config_default: number
  parent_branded_part_id: BrandedPart['branded_part_id']
  physics_default: number
}
export default StockAssembly;

interface StockAssembly_InsertParameters {
  attachment_point_id: AttachmentPoint['attachment_point_id']
  child_branded_part_id: BrandedPart['branded_part_id']
  config_default: number
  parent_branded_part_id: BrandedPart['branded_part_id']
  physics_default: number
}
export type {StockAssembly_InsertParameters}
