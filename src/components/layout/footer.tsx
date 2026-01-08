export function Footer() {
  return (
    <footer className="fixed bottom-0 z-10 flex h-20 w-full flex-col items-center justify-center border-t bg-card/80 px-4 backdrop-blur-md shadow-sm">
      <p className="text-sm font-semibold text-foreground">Atlas Manager</p>
      <p className="text-xs text-muted-foreground">by Atlas Insights Digital</p>
      <div className="flex gap-2 text-xs text-muted-foreground/80">
        <span>v1.0.0</span>
        <span>© 2025</span>
      </div>
    </footer>
  );
}
