import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Admin home" },
  { href: "/admin/blog", label: "Blog management" },
  { href: "/admin/products", label: "Products management" },
];

type AdminSectionNavProps = {
  currentPath: string;
};

const isActivePath = (currentPath: string, href: string) =>
  currentPath === href || currentPath.startsWith(`${href}/`);

export function AdminSectionNav({ currentPath }: AdminSectionNavProps) {
  return (
    <nav aria-label="Admin sections" className="panel admin-section-nav">
      {navItems.map((item) => (
        <Link
          className={`admin-section-link ${
            isActivePath(currentPath, item.href) ? "admin-section-link-active" : ""
          }`}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
