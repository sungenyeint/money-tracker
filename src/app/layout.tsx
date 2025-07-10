import { ReactNode } from "react";
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';

interface RootLayoutProps {
    children: ReactNode;
}


const RootLayout = ({ children }: RootLayoutProps) => {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <div className="container bg-gradient-to-b from-green-100 to-blue-100">{children}</div>
                </AuthProvider>
            </body>
        </html>
    )
}

export default RootLayout
