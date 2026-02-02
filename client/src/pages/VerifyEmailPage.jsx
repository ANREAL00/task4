import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from '@ant-design/icons';
import api from '../api/axios';
import './VerifyEmailPage.scss';

const { Title, Text, Paragraph } = Typography;

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                setMessage('Verification token is missing.');
                setLoading(false);
                return;
            }

            try {
                await api.post('/auth/verify-email', { token });
                setStatus('success');
                setMessage('Your account has been successfully verified. You can now access all features.');
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'The verification link is invalid or has expired.');
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(verify, 1500);
        return () => clearTimeout(timer);
    }, [searchParams]);

    return (
        <div className="login-container">
            <div className="login-image-section">
                <div className="overlay-text">
                    <Title level={1} style={{ color: 'white' }}>Security First</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>
                        Ensuring every account is verified and secure.
                    </Text>
                </div>
            </div>

            <div className="login-form-section">
                <div className="login-form-wrapper">
                    <div className="login-header">
                        <Title level={2}>Account Verification</Title>
                        <Text type="secondary">Verification status for your account</Text>
                    </div>

                    <div className="verify-result-content">
                        {loading ? (
                            <div className="status-container">
                                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                                <Paragraph style={{ marginTop: 24 }}>Validating your token...</Paragraph>
                            </div>
                        ) : status === 'success' ? (
                            <div className="status-container">
                                <CheckCircleFilled style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
                                <Title level={4}>Email Verified!</Title>
                                <Paragraph type="secondary">{message}</Paragraph>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    className="login-btn"
                                    onClick={() => navigate('/login')}
                                    style={{ marginTop: 16 }}
                                >
                                    Go to Sign In
                                </Button>
                            </div>
                        ) : (
                            <div className="status-container">
                                <CloseCircleFilled style={{ fontSize: 64, color: '#ff4d4f', marginBottom: 24 }} />
                                <Title level={4}>Verification Failed</Title>
                                <Paragraph type="secondary">{message}</Paragraph>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    danger
                                    className="login-btn"
                                    onClick={() => navigate('/register')}
                                    style={{ marginTop: 16 }}
                                >
                                    Try Registering Again
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="login-footer" style={{ marginTop: 40, opacity: 0.6 }}>
                        <Text size="small">© 2026 Admin Panel Security</Text>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmailPage;
