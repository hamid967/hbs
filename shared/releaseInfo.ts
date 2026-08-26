export type ReleaseInfo = {
  version: string;
  revision: string;
  builtAt: string;
  environment: "development" | "production" | string;
};

export function releaseLabel(info: Pick<ReleaseInfo, "version" | "revision">) {
  return `v${info.version} · ${info.revision}`;
}

export function releaseEnvironmentLabel(environment: ReleaseInfo["environment"]) {
  return environment === "production" ? "إنتاج" : environment === "development" ? "تطوير" : environment;
}
