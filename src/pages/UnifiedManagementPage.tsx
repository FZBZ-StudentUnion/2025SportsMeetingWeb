import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, DatePicker, TimePicker, Space, message, Tabs, Row, Col, Statistic, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { unifiedService } from '../services/unifiedService';
import { UnifiedSystemData } from '../types/unifiedSystem';


const { TabPane } = Tabs;
const { Option } = Select;

type SystemData = UnifiedSystemData;

const UnifiedManagementPage: React.FC = () => {
  const [systemData, setSystemData] = useState<SystemData>({ 
    events: [], 
    athletes: [], 
    schedules: [], 
    statistics: {
      totalEvents: 0,
      totalAthletes: 0,
      totalScheduled: 0,
      completedEvents: 0,
      byGrade: {},
      byType: {},
      byGender: {},
      byStatus: {}
    }, 
    timeConflicts: [] 
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'event' | 'athlete' | 'schedule'>('event');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const response = await unifiedService.getSystemData();
      setSystemData(response.data || { 
        events: [], 
        athletes: [], 
        schedules: [], 
        statistics: {
          totalEvents: 0,
          totalAthletes: 0,
          totalScheduled: 0,
          completedEvents: 0,
          byGrade: {},
          byType: {},
          byGender: {},
          byStatus: {}
        }, 
        timeConflicts: [] 
      });
    } catch (error) {
      message.error('获取系统数据失败');
      setSystemData({ 
        events: [], 
        athletes: [], 
        schedules: [], 
        statistics: {
          totalEvents: 0,
          totalAthletes: 0,
          totalScheduled: 0,
          completedEvents: 0,
          byGrade: {},
          byType: {},
          byGender: {},
          byStatus: {}
        }, 
        timeConflicts: [] 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  const handleCreate = (type: 'event' | 'athlete' | 'schedule') => {
    setModalType(type);
    setEditingItem(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (type: 'event' | 'athlete' | 'schedule', item: any) => {
    setModalType(type);
    setEditingItem(item);
    setModalVisible(true);
    form.setFieldsValue(item);
  };

  const handleDelete = async (type: 'event' | 'athlete' | 'schedule', id: string) => {
    try {
      switch (type) {
        case 'event':
          await unifiedService.deleteEvent(id);
          break;
        case 'athlete':
          await unifiedService.deleteAthlete(id);
          break;
        case 'schedule':
          await unifiedService.deleteSchedule(id);
          break;
      }
      message.success('删除成功');
      fetchSystemData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingItem) {
        // 更新
        switch (modalType) {
          case 'event':
            await unifiedService.updateEvent(editingItem.id, values);
            break;
          case 'athlete':
            await unifiedService.updateAthlete(editingItem.id, values);
            break;
          case 'schedule':
            await unifiedService.updateSchedule(editingItem.id, values);
            break;
        }
        message.success('更新成功');
      } else {
        // 创建
        switch (modalType) {
          case 'event':
            await unifiedService.createEvent(values);
            break;
          case 'athlete':
            await unifiedService.createAthlete(values);
            break;
          case 'schedule':
            await unifiedService.createSchedule(values);
            break;
        }
        message.success('创建成功');
      }
      
      setModalVisible(false);
      fetchSystemData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleExport = async () => {
    try {
      const data = await unifiedService.getSystemData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `运动会数据_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  const handleBackup = async () => {
    try {
      const data = await unifiedService.getSystemData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `运动会数据备份_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('备份成功');
    } catch (error) {
      message.error('备份失败');
    }
  };

  const eventColumns = [
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    { title: '年级', dataIndex: 'grade', key: 'grade' },
    { title: '性别', dataIndex: 'gender', key: 'gender' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '人数', dataIndex: 'participantsCount', key: 'participantsCount' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => (
      <Tag color={status === 'completed' ? 'green' : status === 'in_progress' ? 'blue' : 'orange'}>
        {status}
      </Tag>
    )},
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit('event', record)} />
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete('event', record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const athleteColumns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '学号', dataIndex: 'studentId', key: 'studentId' },
    { title: '班级', dataIndex: 'className', key: 'className' },
    { title: '年级', dataIndex: 'grade', key: 'grade' },
    { title: '性别', dataIndex: 'gender', key: 'gender' },
    {
      title: '参赛项目',
      key: 'events',
      render: (_: any, record: any) => record.events.length
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit('athlete', record)} />
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete('athlete', record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const scheduleColumns = [
    { title: '项目名称', dataIndex: 'eventName', key: 'eventName' },
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
    { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
    { title: '地点', dataIndex: 'location', key: 'location' },
    { title: '轮次', dataIndex: 'round', key: 'round' },
    {
      title: '冲突检查',
      key: 'conflict',
      render: (_: any, record: any) => (
        <Tag color={record.conflictCheck.hasConflict ? 'red' : 'green'}>
          {record.conflictCheck.hasConflict ? '有冲突' : '无冲突'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit('schedule', record)} />
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete('schedule', record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const renderModalContent = () => {
    switch (modalType) {
      case 'event':
        return (
          <>
            <Form.Item name="name" label="项目名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="grade" label="年级" rules={[{ required: true }]}>
              <Select>
                <Option value="高一">高一</Option>
                <Option value="高二">高二</Option>
                <Option value="高三">高三</Option>
              </Select>
            </Form.Item>
            <Form.Item name="gender" label="性别" rules={[{ required: true }]}>
              <Select>
                <Option value="男子">男子</Option>
                <Option value="女子">女子</Option>
              </Select>
            </Form.Item>
            <Form.Item name="type" label="类型" rules={[{ required: true }]}>
              <Select>
                <Option value="径赛">径赛</Option>
                <Option value="田赛">田赛</Option>
              </Select>
            </Form.Item>
            <Form.Item name="participantsCount" label="参赛人数" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
          </>
        );
      case 'athlete':
        return (
          <>
            <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="studentId" label="学号" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="className" label="班级" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="grade" label="年级" rules={[{ required: true }]}>
              <Select>
                <Option value="高一">高一</Option>
                <Option value="高二">高二</Option>
                <Option value="高三">高三</Option>
              </Select>
            </Form.Item>
            <Form.Item name="gender" label="性别" rules={[{ required: true }]}>
              <Select>
                <Option value="男">男</Option>
                <Option value="女">女</Option>
              </Select>
            </Form.Item>
            <Form.Item name="contact" label="联系方式">
              <Input />
            </Form.Item>
          </>
        );
      case 'schedule':
        return (
          <>
            <Form.Item name="eventName" label="项目名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="date" label="日期" rules={[{ required: true }]}>
              <DatePicker />
            </Form.Item>
            <Form.Item name="startTime" label="开始时间" rules={[{ required: true }]}>
              <TimePicker format="HH:mm" />
            </Form.Item>
            <Form.Item name="endTime" label="结束时间" rules={[{ required: true }]}>
              <TimePicker format="HH:mm" />
            </Form.Item>
            <Form.Item name="location" label="地点" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="round" label="轮次" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </>
        );
    }
  };

  if (!systemData) return <div>加载中...</div>;

  return (
    <div style={{ padding: 24 }}>
      <Card title="运动会统一管理系统" extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchSystemData} />
          <Button icon={<ExportOutlined />} onClick={handleExport}>导出数据</Button>
          <Button icon={<SaveOutlined />} onClick={handleBackup}>创建备份</Button>
        </Space>
      }>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic title="总项目数" value={systemData.statistics?.totalEvents || 0} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="总运动员数" value={systemData.statistics?.totalAthletes || 0} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="已安排项目" value={systemData.statistics?.totalScheduled || 0} />
        </Card>
      </Col>
          <Col span={6}>
            <Card>
              <Statistic title="时间冲突" value={systemData.timeConflicts.length} />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="events">
          <TabPane tab="比赛项目" key="events">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreate('event')} style={{ marginBottom: 16 }}>
              新建项目
            </Button>
            <Table
              columns={eventColumns}
              dataSource={systemData.events}
              rowKey="id"
              loading={loading}
            />
          </TabPane>
          <TabPane tab="运动员" key="athletes">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreate('athlete')} style={{ marginBottom: 16 }}>
              新建运动员
            </Button>
            <Table
              columns={athleteColumns}
              dataSource={systemData.athletes}
              rowKey="id"
              loading={loading}
            />
          </TabPane>
          <TabPane tab="时间安排" key="schedules">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreate('schedule')} style={{ marginBottom: 16 }}>
              新建安排
            </Button>
            <Table
              columns={scheduleColumns}
              dataSource={systemData.schedules}
              rowKey="id"
              loading={loading}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={`${editingItem ? '编辑' : '创建'}${modalType === 'event' ? '项目' : modalType === 'athlete' ? '运动员' : '安排'}`}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          {renderModalContent()}
        </Form>
      </Modal>
    </div>
  );
};

export default UnifiedManagementPage;