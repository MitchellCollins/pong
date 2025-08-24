import "./global.css";

export const metadata = {
  title: "Pong",
  description: "Recreation of the pong game.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
