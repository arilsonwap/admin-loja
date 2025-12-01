interface StatusTagProps {
  active: boolean;
  activeColor: string;
  inactiveColor: string;
  children: React.ReactNode;
}

export default function StatusTag({
  active,
  activeColor,
  inactiveColor,
  children,
}: StatusTagProps) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        active ? activeColor : inactiveColor
      }`}
    >
      {children}
    </span>
  );
}
