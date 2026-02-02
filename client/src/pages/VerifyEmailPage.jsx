import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Result, Button, Spin, message } from 'antd';

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('info');
    const [title, setTitle] = useState('Verifying your email...');

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                setTitle('Invalid verification link');
                setLoading(false);
                return;
            }

            try {
                await axios.post(import.meta.env.VITE_API_URL + '/auth/verify-email', { token });
                setStatus('success');
                setTitle('Email Verified Successfully!');
                message.success('Email verified!');
            } catch (error) {
                console.error(error);
                setStatus('error');
                setTitle(error.response?.data?.message || 'Verification failed');
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [searchParams]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                <Spin size="large" tip="Verifying..." />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <Result
                status={status}
                title={title}
                extra={[
                    <Button type="primary" key="login" onClick={() => navigate('/login')}>
                        Go to Login
                    </Button>
                ]}
            />
        </div>
    );
}

export default VerifyEmailPage;
