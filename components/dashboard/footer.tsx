export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-4 px-6 mt-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-neutral-600">
        <p>© Innovillage 2025 - Tim Ukhuwah</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-neutral-900 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-neutral-900 transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
