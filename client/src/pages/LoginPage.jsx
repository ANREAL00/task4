import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './LoginPage.scss';

const { Title, Text } = Typography;

function LoginPage() {
    const navigate = useNavigate();

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('reason') === 'auth_error') {
            message.warning('Your session has ended because your account was blocked, deleted, or the session expired.');
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const onFinish = async (values) => {
        try {
            const response = await api.post('/auth/login', values);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                message.success('Login successful!');
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            if (error.response) {
                message.error(error.response.data.message || 'Login failed');
            } else {
                message.error('Server error');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-image-section">
            </div>

            <div className="login-form-section">
                <div className="login-form-wrapper">
                    <div className="login-header">
                        <Title level={2}>Sign In</Title>
                        <Text type="secondary">Welcome back to the admin panel</Text>
                    </div>

                    <Form
                        name="login_form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your Email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your Password!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block className="login-btn">
                                Log in
                            </Button>
                        </Form.Item>

                        <div className="login-footer">
                            Don't have an account? <Link to="/register">Register now</Link>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;