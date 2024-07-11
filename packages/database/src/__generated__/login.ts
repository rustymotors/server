/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: 2QhRIF5QcEQfsA954WH4A1F9qsXfxKnVpal+9mll0E4ca+DRjMppDopDbnwBmEv8SkKT0nnQXWrLw6pvis4gUQ==
 */

/* eslint-disable */
// tslint:disable

import Player from './player'

interface Login {
  customer_id: Player['customer_id']
  /**
   * @default 0
   */
  login_level: number
  login_name: string & {readonly __brand?: 'login_login_name'}
  password: string
}
export default Login;

interface Login_InsertParameters {
  customer_id: Player['customer_id']
  /**
   * @default 0
   */
  login_level?: number
  login_name: string & {readonly __brand?: 'login_login_name'}
  password: string
}
export type {Login_InsertParameters}