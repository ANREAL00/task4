import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, SmileOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './LoginPage.scss';

const { Title, Text } = Typography;

function RegisterPage() {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            await api.post('/auth/register', values);
            message.success('Registration successful! Check your email to verify account.');
            navigate('/login');
        } catch (error) {
            console.error(error);
            if (error.response) {
                message.error(error.response.data.message || 'Registration failed');
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
                        <Title level={2}>Sign Up</Title>
                        <Text type="secondary">Create your account to get started</Text>
                    </div>

                    <Form
                        name="register_form"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="name"
                            rules={[{ required: true, message: 'Please input your Name!' }]}
                        >
                            <Input prefix={<SmileOutlined />} placeholder="Full Name" />
                        </Form.Item>

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
                                Register
                            </Button>
                        </Form.Item>

                        <div className="login-footer">
                            Already have an account? <Link to="/login">Sign In</Link>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
