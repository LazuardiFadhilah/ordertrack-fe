import './globals.css';

export const metadata = {
  title: 'OrderTrack | Operations workspace',
  description: 'OrderTrack operational workspace scaffold',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
