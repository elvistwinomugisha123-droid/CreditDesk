export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-brand-green rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">CD</span>
          </div>
          <span className="text-gray-900 font-bold text-2xl">CreditDesk</span>
        </div>
        {children}
      </div>
    </div>
  );
}
