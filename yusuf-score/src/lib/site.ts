export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Build a trackable campaign link, e.g. for the Instagram bio, stories or ads. */
export function campaignUrl(path: string, utm: { source: string; medium: string; campaign: string; content?: string }) {
  const u = new URL(path, siteUrl());
  u.searchParams.set("utm_source", utm.source);
  u.searchParams.set("utm_medium", utm.medium);
  u.searchParams.set("utm_campaign", utm.campaign);
  if (utm.content) u.searchParams.set("utm_content", utm.content);
  return u.toString();
}
