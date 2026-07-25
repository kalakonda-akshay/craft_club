/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admins from "../admins.js";
import type * as announcements from "../announcements.js";
import type * as attendance from "../attendance.js";
import type * as auth from "../auth.js";
import type * as authApi from "../authApi.js";
import type * as authHelpers from "../authHelpers.js";
import type * as bulkEmail from "../bulkEmail.js";
import type * as certificateGenerator from "../certificateGenerator.js";
import type * as certificateHelpers from "../certificateHelpers.js";
import type * as certificateTemplates from "../certificateTemplates.js";
import type * as certificates from "../certificates.js";
import type * as clearDb from "../clearDb.js";
import type * as content from "../content.js";
import type * as cronHelpers from "../cronHelpers.js";
import type * as crons from "../crons.js";
import type * as csvExport from "../csvExport.js";
import type * as dashboard from "../dashboard.js";
import type * as deletionRequests from "../deletionRequests.js";
import type * as emailHelpers from "../emailHelpers.js";
import type * as emailHtml from "../emailHtml.js";
import type * as emailService from "../emailService.js";
import type * as emailTemplates from "../emailTemplates.js";
import type * as errors from "../errors.js";
import type * as eventRegistrations from "../eventRegistrations.js";
import type * as events from "../events.js";
import type * as gallery from "../gallery.js";
import type * as joinRequests from "../joinRequests.js";
import type * as logger from "../logger.js";
import type * as loginHistory from "../loginHistory.js";
import type * as memberDashboard from "../memberDashboard.js";
import type * as members from "../members.js";
import type * as membersAuth from "../membersAuth.js";
import type * as newsletters from "../newsletters.js";
import type * as passwordManagement from "../passwordManagement.js";
import type * as seed from "../seed.js";
import type * as seedAdmin from "../seedAdmin.js";
import type * as seedEmail from "../seedEmail.js";
import type * as seedEvent from "../seedEvent.js";
import type * as settings from "../settings.js";
import type * as simpleCertificates from "../simpleCertificates.js";
import type * as system from "../system.js";
import type * as templateEngine from "../templateEngine.js";
import type * as validators from "../validators.js";
import type * as verification from "../verification.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admins: typeof admins;
  announcements: typeof announcements;
  attendance: typeof attendance;
  auth: typeof auth;
  authApi: typeof authApi;
  authHelpers: typeof authHelpers;
  bulkEmail: typeof bulkEmail;
  certificateGenerator: typeof certificateGenerator;
  certificateHelpers: typeof certificateHelpers;
  certificateTemplates: typeof certificateTemplates;
  certificates: typeof certificates;
  clearDb: typeof clearDb;
  content: typeof content;
  cronHelpers: typeof cronHelpers;
  crons: typeof crons;
  csvExport: typeof csvExport;
  dashboard: typeof dashboard;
  deletionRequests: typeof deletionRequests;
  emailHelpers: typeof emailHelpers;
  emailHtml: typeof emailHtml;
  emailService: typeof emailService;
  emailTemplates: typeof emailTemplates;
  errors: typeof errors;
  eventRegistrations: typeof eventRegistrations;
  events: typeof events;
  gallery: typeof gallery;
  joinRequests: typeof joinRequests;
  logger: typeof logger;
  loginHistory: typeof loginHistory;
  memberDashboard: typeof memberDashboard;
  members: typeof members;
  membersAuth: typeof membersAuth;
  newsletters: typeof newsletters;
  passwordManagement: typeof passwordManagement;
  seed: typeof seed;
  seedAdmin: typeof seedAdmin;
  seedEmail: typeof seedEmail;
  seedEvent: typeof seedEvent;
  settings: typeof settings;
  simpleCertificates: typeof simpleCertificates;
  system: typeof system;
  templateEngine: typeof templateEngine;
  validators: typeof validators;
  verification: typeof verification;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
