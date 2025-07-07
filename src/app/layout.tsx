import { ReactNode } from "react";
import './globals.css';

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({children}: RootLayoutProps) => {
  return (
    <html lang="en">
        <body>
            <div className="container">{children}</div>
        </body>
    </html>
  )
}

export default RootLayout
