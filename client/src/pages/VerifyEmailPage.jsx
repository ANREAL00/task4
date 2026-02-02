import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Spin, Card } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined, MailOutlined } from '@ant-design/icons';
import api from '../api/axios';
import './VerifyEmailPage.scss';

const { Title, Paragraph } = Typography;

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
        <div className="verify-page">
            <div className="verify-background">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            <Card className={`verify-card ${status}`}>
                <div className="verify-content">
                    {loading ? (
                        <div className="verify-step">
                            <Spin indicator={<LoadingOutlined style={{ fontSize: 64, color: '#1890ff' }} spin />} />
                            <Title level={3} className="mt-20">Securing your account...</Title>
                            <Paragraph type="secondary">Please wait while we validate your credentials.</Paragraph>
                        </div>
                    ) : status === 'success' ? (
                        <div className="verify-step anim-fade-in">
                            <div className="icon-wrapper success">
                                <CheckCircleFilled />
                            </div>
                            <Title level={2}>Welcome Aboard!</Title>
                            <Paragraph className="verify-desc">{message}</Paragraph>
                            <Button
                                type="primary"
                                size="large"
                                block
                                className="action-btn"
                                onClick={() => navigate('/login')}
                            >
                                Continue to Dashboard
                            </Button>
                        </div>
                    ) : (
                        <div className="verify-step anim-fade-in">
                            <div className="icon-wrapper error">
                                <CloseCircleFilled />
                            </div>
                            <Title level={2}>Verification Failed</Title>
                            <Paragraph className="verify-desc">{message}</Paragraph>
                            <Button
                                type="primary"
                                size="large"
                                block
                                danger
                                className="action-btn"
                                onClick={() => navigate('/register')}
                            >
                                Back to Registration
                            </Button>
                        </div>
                    )}
                </div>

                <div className="verify-footer">
                    <MailOutlined /> <Text type="secondary">Task 4 Secure Authentication</Text>
                </div>
            </Card>
        </div>
    );
}

const { Text } = Typography;

export default VerifyEmailPage;
