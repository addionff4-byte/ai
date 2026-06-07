export const metadata = {
  title: 'CREX.AI - Live Cricket Dashboard',
  description: 'AI-Powered Live Cricket Scores and Statistics Directory',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Loading standard utility styling that works with all custom text classes */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" 
        />
        <style>{`
          /* Custom fallback to guarantee text visibility against the dark background */
          body { background-color: #020617 !important; color: #f8fafc !important; }
          h1, h2, h3, h4 { color: #f8fafc !important; }
          p, span { color: #94a3b8; }
          input { color: #020617 !important; }
        `}</style>
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

