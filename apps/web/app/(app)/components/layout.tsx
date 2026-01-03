export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-wrapper flex flex-1 flex-col px-2">
      <div className="3xl:fixed:container flex flex-1 flex-col">{children}</div>
    </div>
  );
}
