/**
 * V4 Global Types
 *
 * Type definitions for V4 Global APIs.
 *
 * @module types/v4-global
 */

// ============================================
// AC1: Auth Setting Types
// ============================================

/**
 * Info field for auth setting
 */
export interface InfoField {
  /** Field name */
  name: string;
  /** Field placeholder */
  placeholder?: string;
  /** Whether required */
  required?: string;
  /** Field type */
  type?: string;
  /** Field options (for select type) */
  options?: string[];
}

/**
 * Privacy param for auth setting
 */
export interface PrivacyParam {
  /** Privacy title */
  title?: string;
  /** Privacy content */
  content?: string;
  /** Whether enabled */
  enabled?: string;
}

/**
 * Auth setting entity
 */
export interface AuthSetting {
  /** Auth enabled (Y/N) */
  authEnabled: string;
  /** Auth type (none, code, pay, phone, info, custom, external, direct) */
  authType: string;
  /** Sub auth type (public, wx for none type) */
  subAuthType?: string;
  /** Custom auth key */
  customKey?: string;
  /** Custom auth URI */
  customUri?: string;
  /** Whitelist entry text */
  whiteListEntryText?: string;
  /** Auth welcome title */
  authTips?: string;
  /** Info collection fields */
  infoFields?: InfoField[];
  /** Privacy declaration params */
  privacyParam?: PrivacyParam[];
}

/**
 * Parameters for updating auth settings
 */
export interface UpdateAuthParams {
  /** Array of auth settings (exactly 2 items - primary and secondary) */
  authSettings: AuthSetting[];
}

// ============================================
// AC2: Page Setting Types
// ============================================

/**
 * Page setting entity
 */
export interface PageSetting {
  /** Auto play enabled (Y/N) */
  autoPlayEnabled?: string;
  /** Barrage enabled (Y/N) */
  barrageEnabled?: string;
  /** Barrage speed (340/270/200/130/60) */
  barrageSpeed?: string;
  /** WeChat booking enabled (Y/N) */
  bookingEnabled?: string;
  /** Hide watch page enabled (Y/N) */
  closePreviewEnabled?: string;
  /** Flash player enabled (Y/N) */
  flashPlayerEnabled?: string;
  /** Forbid Firefox enabled (Y/N) */
  forbidFirefoxEnabled?: string;
  /** Mobile audio enabled (Y/N) */
  mobileAudioEnabled?: string;
  /** Mobile PV show location (player/desc) */
  mobilePvShowLocation?: string;
  /** Mobile watch enabled (Y/N) */
  mobileWatchEnabled?: string;
  /** Show view count enabled (Y/N) */
  pvShowEnabled?: string;
  /** Recording protect enabled (Y/N) */
  recordingProtectEnabled?: string;
  /** Show countdown enabled (Y/N) */
  showCountdownEnabled?: string;
  /** Switch player enabled (Y/N) */
  switchPlayerEnabled?: string;
  /** Viewer verification enabled (Y/N) */
  viewerVerificationEnabled?: string;
  /** Watch feedback enabled (Y/N) */
  watchFeedbackEnabled?: string;
  /** Watch language type (zh_CN/en/follow_browser) */
  watchLangType?: string;
  /** Watch layout (ppt/video/only-video/followTeacher) */
  watchLayout?: string;
  /** Picture in picture enabled (Y/N) */
  pictureInPictureEnabled?: string;
}

/**
 * Parameters for updating page settings
 */
export interface UpdatePageSettingParams {
  /** Auto play enabled (Y/N) */
  autoPlayEnabled?: string;
  /** Barrage enabled (Y/N) */
  barrageEnabled?: string;
  /** Barrage speed (340/270/200/130/60) */
  barrageSpeed?: string;
  /** WeChat booking enabled (Y/N) */
  bookingEnabled?: string;
  /** Hide watch page enabled (Y/N) */
  closePreviewEnabled?: string;
  /** Flash player enabled (Y/N) */
  flashPlayerEnabled?: string;
  /** Forbid Firefox enabled (Y/N) */
  forbidFirefoxEnabled?: string;
  /** Mobile audio enabled (Y/N) */
  mobileAudioEnabled?: string;
  /** Mobile PV show location (player/desc) */
  mobilePvShowLocation?: string;
  /** Mobile watch enabled (Y/N) */
  mobileWatchEnabled?: string;
  /** Show view count enabled (Y/N) */
  pvShowEnabled?: string;
  /** Recording protect enabled (Y/N) */
  recordingProtectEnabled?: string;
  /** Show countdown enabled (Y/N) */
  showCountdownEnabled?: string;
  /** Switch player enabled (Y/N) */
  switchPlayerEnabled?: string;
  /** Viewer verification enabled (Y/N) */
  viewerVerificationEnabled?: string;
  /** Watch feedback enabled (Y/N) */
  watchFeedbackEnabled?: string;
  /** Watch language type (zh_CN/en/follow_browser) */
  watchLangType?: string;
  /** Watch layout (ppt/video/only-video/followTeacher) */
  watchLayout?: string;
  /** Picture in picture enabled (Y/N) */
  pictureInPictureEnabled?: string;
}
