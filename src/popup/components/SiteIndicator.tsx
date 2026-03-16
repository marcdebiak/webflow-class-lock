type Status = "active" | "inactive" | "loading";

interface Props {
  siteSlug: string | null;
  status: Status;
}

export function SiteIndicator({ siteSlug, status }: Props) {
  const label = {
    active: "Designer connected",
    inactive: "Not in Designer",
    loading: "Connecting…",
  }[status];

  return (
    <div className="site-indicator">
      <span className={`site-indicator__dot site-indicator__dot--${status}`} />
      <span className="site-indicator__site">
        {siteSlug ? siteSlug : "—"}
      </span>
      <span className="site-indicator__status">{label}</span>
    </div>
  );
}
