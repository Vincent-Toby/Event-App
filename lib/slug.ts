export function slugify(text: string) {
    return (
      text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 60) || "event"
    );
  }
  
  export function slugWithSuffix(title: string) {
    const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6);
    return `${slugify(title)}-${suffix}`;
  }