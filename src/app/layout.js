import "./globals.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>
      <body className="antialiased bg-gray-100">
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar className="fixed left-0 top-0 w-64 h-screen bg-white shadow-lg z-50" />
          <div className="flex-1 flex flex-col">
            <Topbar className="fixed top-0 left-64 right-0 h-16 bg-white shadow-md z-40" />
            <main className="flex-1 transition-all duration-300 ease-in-out ml-52 mt-16 p-4">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
