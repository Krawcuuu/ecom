// ecom-frontend/src/components/Footer.tsx

import React from 'react';
import type { FC } from 'react';

const Footer: FC = () => {
    return (
        <footer style={styles.footer}>
            <p>&copy; {new Date().getFullYear()} Sklep E-Commerce TS. Wszelkie prawa zastrzeżone.</p>
        </footer>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    footer: {
        backgroundColor: '#333',
        color: 'white',
        textAlign: 'center',
        padding: '15px 0',
        position: 'fixed', // Użyte dla celów demonstracyjnych/testowych
        bottom: 0,
        width: '100%',
    }
};

export default Footer;