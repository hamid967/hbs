import { releaseEnvironmentLabel, releaseLabel, type ReleaseInfo } from "@shared/releaseInfo";

export { releaseEnvironmentLabel, releaseLabel, type ReleaseInfo };

declare const __HBS_RELEASE_INFO__: ReleaseInfo;

export const releaseInfo: ReleaseInfo = __HBS_RELEASE_INFO__;
