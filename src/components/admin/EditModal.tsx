import React, { useState, useEffect } from 'react';
import { useOnlineEditor } from '../../contexts/OnlineEditorContext';
import './EditModal.css';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: 'games' | 'athletes' | 'schedules';
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, item, type }) => {
  const { dispatch } = useOnlineEditor();
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      // 新建时的默认值
      const defaultData = getDefaultData(type);
      setFormData(defaultData);
    }
  }, [item, type]);

  const getDefaultData = (type: string) => {
    const now = new Date().toISOString();
    switch (type) {
      case 'games':
        return {
          id: Date.now().toString(),
          name: '',
          grade: '高一',
          gender: '男子',
          type: '径赛',
          participants: 20,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };
      case 'athletes':
        return {
          id: Date.now().toString(),
          name: '',
          class: '',
          grade: '高一',
          gender: '男',
          studentId: '',
          phone: '',
          events: [],
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };
      case 'schedules':
        return {
          id: Date.now().toString(),
          eventId: '',
          eventName: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00',
          location: '田径场',
          round: '预赛',
          status: 'scheduled',
          description: '',
          createdAt: now,
          updatedAt: now,
        };
      default:
        return {};
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (type) {
      case 'games':
        if (!formData.name.trim()) newErrors.name = '项目名称不能为空';
        if (!formData.participants || formData.participants < 1) {
          newErrors.participants = '参赛人数必须大于0';
        }
        break;
      case 'athletes':
        if (!formData.name.trim()) newErrors.name = '姓名不能为空';
        if (!formData.class.trim()) newErrors.class = '班级不能为空';
        if (!formData.studentId.trim()) newErrors.studentId = '学号不能为空';
        break;
      case 'schedules':
        if (!formData.eventName.trim()) newErrors.eventName = '项目名称不能为空';
        if (!formData.date) newErrors.date = '日期不能为空';
        if (formData.startTime >= formData.endTime) {
          newErrors.time = '开始时间必须早于结束时间';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const updatedData = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    if (item) {
      // 更新
      switch (type) {
        case 'games':
          dispatch({ type: 'UPDATE_GAME', payload: updatedData });
          break;
        case 'athletes':
          dispatch({ type: 'UPDATE_ATHLETE', payload: updatedData });
          break;
        case 'schedules':
          dispatch({ type: 'UPDATE_SCHEDULE', payload: updatedData });
          break;
      }
    } else {
      // 新建
      switch (type) {
        case 'games':
          dispatch({ type: 'ADD_GAME', payload: updatedData });
          break;
        case 'athletes':
          dispatch({ type: 'ADD_ATHLETE', payload: updatedData });
          break;
        case 'schedules':
          dispatch({ type: 'ADD_SCHEDULE', payload: updatedData });
          break;
      }
    }

    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayChange = (field: string, value: string) => {
    const array = value.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    handleChange(field, array);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? '编辑' : '添加'}{getTitle(type)}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {type === 'games' && (
            <>
              <div className="form-group">
                <label>项目名称 *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>年级</label>
                  <select
                    value={formData.grade || '高一'}
                    onChange={(e) => handleChange('grade', e.target.value)}
                  >
                    <option value="高一">高一</option>
                    <option value="高二">高二</option>
                    <option value="高三">高三</option>
                    <option value="混合">混合</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>性别</label>
                  <select
                    value={formData.gender || '男子'}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  >
                    <option value="男子">男子</option>
                    <option value="女子">女子</option>
                    <option value="混合">混合</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>类型</label>
                  <select
                    value={formData.type || '径赛'}
                    onChange={(e) => handleChange('type', e.target.value)}
                  >
                    <option value="径赛">径赛</option>
                    <option value="田赛">田赛</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>参赛人数 *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.participants || 20}
                  onChange={(e) => handleChange('participants', parseInt(e.target.value))}
                  className={errors.participants ? 'error' : ''}
                />
                {errors.participants && <span className="error-message">{errors.participants}</span>}
              </div>

              <div className="form-group">
                <label>状态</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>
            </>
          )}

          {type === 'athletes' && (
            <>
              <div className="form-group">
                <label>姓名 *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>班级 *</label>
                  <input
                    type="text"
                    placeholder="如：高一1班"
                    value={formData.class || ''}
                    onChange={(e) => handleChange('class', e.target.value)}
                    className={errors.class ? 'error' : ''}
                  />
                  {errors.class && <span className="error-message">{errors.class}</span>}
                </div>

                <div className="form-group">
                  <label>学号 *</label>
                  <input
                    type="text"
                    value={formData.studentId || ''}
                    onChange={(e) => handleChange('studentId', e.target.value)}
                    className={errors.studentId ? 'error' : ''}
                  />
                  {errors.studentId && <span className="error-message">{errors.studentId}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>年级</label>
                  <select
                    value={formData.grade || '高一'}
                    onChange={(e) => handleChange('grade', e.target.value)}
                  >
                    <option value="高一">高一</option>
                    <option value="高二">高二</option>
                    <option value="高三">高三</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>性别</label>
                  <select
                    value={formData.gender || '男'}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>联系电话</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>参赛项目（用逗号分隔）</label>
                <input
                  type="text"
                  placeholder="如：100米,跳远,铅球"
                  value={(formData.events || []).join(', ')}
                  onChange={(e) => handleArrayChange('events', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>状态</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>
            </>
          )}

          {type === 'schedules' && (
            <>
              <div className="form-group">
                <label>项目名称 *</label>
                <input
                  type="text"
                  value={formData.eventName || ''}
                  onChange={(e) => handleChange('eventName', e.target.value)}
                  className={errors.eventName ? 'error' : ''}
                />
                {errors.eventName && <span className="error-message">{errors.eventName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>日期 *</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className={errors.date ? 'error' : ''}
                  />
                  {errors.date && <span className="error-message">{errors.date}</span>}
                </div>

                <div className="form-group">
                  <label>地点</label>
                  <select
                    value={formData.location || '田径场'}
                    onChange={(e) => handleChange('location', e.target.value)}
                  >
                    <option value="田径场">田径场</option>
                    <option value="跳高场地">跳高场地</option>
                    <option value="跳远场地">跳远场地</option>
                    <option value="铅球场地">铅球场地</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>开始时间</label>
                  <input
                    type="time"
                    value={formData.startTime || '09:00'}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>结束时间</label>
                  <input
                    type="time"
                    value={formData.endTime || '10:00'}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                  />
                </div>
              </div>
              {errors.time && <span className="error-message">{errors.time}</span>}

              <div className="form-row">
                <div className="form-group">
                  <label>轮次</label>
                  <select
                    value={formData.round || '预赛'}
                    onChange={(e) => handleChange('round', e.target.value)}
                  >
                    <option value="预赛">预赛</option>
                    <option value="决赛">决赛</option>
                    <option value="预决赛">预决赛</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>状态</label>
                  <select
                    value={formData.status || 'scheduled'}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="scheduled">已安排</option>
                    <option value="in_progress">进行中</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>备注</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  placeholder="可选：分组信息、特殊说明等"
                />
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="submit" className="save-btn">
              {item ? '更新' : '添加'}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getTitle = (type: string): string => {
  switch (type) {
    case 'games': return '比赛项目';
    case 'athletes': return '运动员';
    case 'schedules': return '时间安排';
    default: return '项目';
  }
};

export default EditModal;