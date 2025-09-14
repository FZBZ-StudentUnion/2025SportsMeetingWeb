import React from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import OnlineEditor from '../../components/admin/OnlineEditor';
import EditModal from '../../components/admin/EditModal';
import { OnlineEditorProvider, useOnlineEditor } from '../../contexts/OnlineEditorContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

const AdminContent: React.FC = () => {
  const { state } = useAuth();
  const { state: editorState, dispatch } = useOnlineEditor();
  const navigate = useNavigate();

  const handleCloseModal = () => {
    dispatch({ type: 'SET_MODAL_OPEN', payload: false });
    dispatch({ type: 'SET_EDITING_ITEM', payload: null });
  };

  const handleGoToUnified = () => {
    navigate('/unified-management');
  };

  return (
    <div className="admin-page">
      <Header />
      <main className="main-content">
        <div className="admin-container">
          <div className="admin-header">
            <h1>🏃‍♂️ 运动会在线管理系统</h1>
            <div className="admin-info">
              <span>当前用户: {state.user?.username}</span>
              <span className="user-role">({state.user?.role === 'admin' ? '管理员' : '教师'})</span>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button 
              onClick={handleGoToUnified}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              🚀 进入统一管理系统
            </button>
          </div>
          
          <OnlineEditor />
        </div>
      </main>
      <Footer />

      <EditModal
        isOpen={editorState.isModalOpen}
        onClose={handleCloseModal}
        item={editorState.editingItem}
        type={editorState.activeTab}
      />
    </div>
  );
};

const AdminPage: React.FC = () => {
  return (
    <OnlineEditorProvider>
      <AdminContent />
    </OnlineEditorProvider>
  );
};

export default AdminPage;