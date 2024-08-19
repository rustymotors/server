/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: akkPgI94W/iY1RjP32yAxWZpasspO4ENv+U3xZIsQPr6rrdcY53EQhVW3N31GehKX5BabfVeIYvzAPQvRbIQ5Q==
 */

/* eslint-disable */
// tslint:disable

import AbstractPartType from './abstract_part_type'
import PartGrade from './part_grade'

interface PartType {
  abstract_part_type_id: AbstractPartType['abstract_part_type_id']
  part_filename: (string) | null
  part_grade_id: (PartGrade['part_grade_id']) | null
  part_type: string
  part_type_id: number & {readonly __brand?: 'part_type_part_type_id'}
}
export default PartType;

interface PartType_InsertParameters {
  abstract_part_type_id: AbstractPartType['abstract_part_type_id']
  part_filename?: (string) | null
  part_grade_id?: (PartGrade['part_grade_id']) | null
  part_type: string
  part_type_id: number & {readonly __brand?: 'part_type_part_type_id'}
}
export type {PartType_InsertParameters}
