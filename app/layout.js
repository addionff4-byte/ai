export const metadata = {
  title: 'CREX.AI - Live Cricket Dashboard',
  description: 'AI-Powered Live Cricket Scores and Statistics Directory',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Injecting Tailwind CSS cleanly since we are compiling entirely via Git */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" 
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
