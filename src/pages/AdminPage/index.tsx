import React from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import OnlineEditor from '../../components/admin/OnlineEditor';
import EditModal from '../../components/admin/EditModal';
import { OnlineEditorProvider, useOnlineEditor } from '../../contexts/OnlineEditorContext';
import { useAuth } from '../../contexts/AuthContext';
import './AdminPage.css';

const AdminContent: React.FC = () => {
  const { state } = useAuth();
  const { state: editorState, dispatch } = useOnlineEditor();

  const handleCloseModal = () => {
    dispatch({ type: 'SET_MODAL_OPEN', payload: false });
    dispatch({ type: 'SET_EDITING_ITEM', payload: null });
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