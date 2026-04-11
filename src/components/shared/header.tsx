type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  return (
    <header className="border-b bg-white px-6 py-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}
