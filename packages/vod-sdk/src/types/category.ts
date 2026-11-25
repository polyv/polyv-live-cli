/**
 * Category (分类) types.
 *
 * @module types/category
 */

export interface CategoryNode {
  /** Display label: name plus the video count. */
  text: string;
  cataname: string;
  /** Category ids from the root to this node, comma-separated. */
  catatree: string;
  /** `1` is the root category. */
  cataid: number;
  parentid: number;
  cataProfile?: string;
  /** Videos in this category and all of its sub-categories. */
  videos: number;
  nodes?: CategoryNode[];
}

export interface AddCategoryParams {
  /** At most 40 characters. */
  cataname: string;
  /** Parent category id; `1` for the root. */
  parentid: string | number;
}

export interface AddCategoryResult {
  catatree: string;
  cataid: number;
}

export interface UpdateCategorySettingParams {
  cataid: string | number;
  /** Enable the settings below. Default true. */
  isSettings?: boolean;
  /** Play the source file instead of a transcoded one. Default false. */
  keepSource?: boolean;
  encrypt?: boolean;
  /** Mobile authorization level. Default `open`. */
  hlslevel?: 'open' | 'web' | 'app' | 'wxa_app';
  /** Video optimisation for screen recordings. Default false. */
  isEdu?: boolean;
  encodeAac?: boolean;
  playerId?: string;
}

export interface MoveCategoryParams {
  cataid: string | number;
  destCataid: string | number;
}
