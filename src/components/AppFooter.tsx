export default function AppFooter() {
  return (
    <footer className="bg-card border-t border-border py-6 text-center text-sm text-muted-foreground mt-auto">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} Tell-a-Tale. Weave your words, share your world.</p>
        <p className="mt-1">Images by <a href="https://placehold.co" target="_blank" rel="noopener noreferrer" className="hover:text-primary">placehold.co</a></p>
      </div>
    </footer>
  );
}
