import React, { useEffect, useState } from 'react';
import { Table, Button, Layout, Typography, Space, Tooltip, Tag, message } from 'antd';
import { UnlockOutlined, StopOutlined, DeleteOutlined, LogoutOutlined, ClearOutlined } from '@ant-design/icons';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title } = Typography;

const AdminPage = () => {
    // IMPORTANT: This specific function is a mandatory requirement for Task 5.
    // NOTE: It returns the unique identifier for a given user record.
    const getUniqIdValue = (record) => record.id;

    const [users, setUsers] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            const data = response.data.map(user => ({ ...user, key: user.id }));
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAction = async (action) => {
        if (selectedRowKeys.length === 0 && action !== 'clean_unverified') return;

        try {
            let endpoint = '';
            let method = 'put';

            if (action === 'block') {
                endpoint = '/users/block';
            } else if (action === 'unblock') {
                endpoint = '/users/unblock';
            } else if (action === 'delete') {
                endpoint = '/users';
                method = 'delete';
            } else if (action === 'clean_unverified') {
                endpoint = '/users/unverified';
                method = 'delete';
            }

            const config = action !== 'clean_unverified' ? { data: { userIds: selectedRowKeys } } : {};
            const payload = { userIds: selectedRowKeys };

            if (method === 'delete') {
                await api.delete(endpoint, config);
            } else {
                await api.put(endpoint, payload);
            }

            message.success(`Start ${action} action...`);

            await fetchUsers();
            setSelectedRowKeys([]);

        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: 'Last Login',
            dataIndex: 'last_login',
            render: (text) => text ? new Date(text).toLocaleString() : 'Never',
            sorter: (a, b) => new Date(a.last_login || 0) - new Date(b.last_login || 0),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => {
                let color = 'green';
                if (status === 'blocked') color = 'red';
                if (status === 'unverified') color = 'orange';

                return (
                    <Tag color={color}>
                        {status ? status.toUpperCase() : 'UNKNOWN'}
                    </Tag>
                );
            },
            sorter: (a, b) => a.status.localeCompare(b.status),
        },
        {
            title: 'Registered At',
            dataIndex: 'registration_time',
            render: (text) => text ? new Date(text).toLocaleString() : 'N/A',
            sorter: (a, b) => new Date(a.registration_time || 0) - new Date(b.registration_time || 0),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh', minWidth: '100vw' }}>
            <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px #f0f1f2' }}>
                <Title level={4} style={{ margin: 0 }}>Admin Panel</Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Button icon={<LogoutOutlined />} onClick={handleLogout}>Logout</Button>
                </div>
            </Header>
            <Content style={{ padding: '24px', flex: 1 }}>
                <div style={{ background: '#fff', padding: 24, borderRadius: '8px', height: '100%' }}>
                    <Space style={{ marginBottom: 16 }}>
                        <Button
                            type="primary"
                            danger
                            icon={<StopOutlined />}
                            onClick={() => handleAction('block')}
                            disabled={selectedRowKeys.length === 0}
                        >
                            Block
                        </Button>
                        <Tooltip title="Unblock Users">
                            <Button
                                icon={<UnlockOutlined />}
                                onClick={() => handleAction('unblock')}
                                disabled={selectedRowKeys.length === 0}
                            />
                        </Tooltip>
                        <Tooltip title="Delete Users">
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() => handleAction('delete')}
                                disabled={selectedRowKeys.length === 0}
                            />
                        </Tooltip>
                        <Tooltip title="Delete All Unverified">
                            <Button
                                icon={<ClearOutlined />}
                                onClick={() => handleAction('clean_unverified')}
                                type="dashed"
                            />
                        </Tooltip>
                    </Space>

                    <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={users}
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            </Content>
        </Layout>
    );
};

export default AdminPage;
