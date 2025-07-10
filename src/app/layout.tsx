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
                    <div className="container">{children}</div>
                </AuthProvider>
            </body>
        </html>
    )
}

export default RootLayout
