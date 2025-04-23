// src/components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  const navItems = [
    { href: '/', label: 'Overview' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/topics', label: 'Topics' },
    { href: '/alerts', label: 'Alerts' },
    { href: '/reports', label: 'Reports' },
  ];

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          ReviewInsight Pro
        </Link>
        <ul className="flex space-x-4">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="hover:text-gray-300 transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
